/**
 * Live news ingestion: pulls public cybersecurity / vibe-coding / AI-agent RSS+Atom feeds,
 * de-duplicates by source link and stores them in news_updates. Optionally asks the configured
 * BytePlus ModelArk connector for a short Indonesian executive summary.
 * No external dependencies (tiny RSS/Atom parser). Failure of any feed never breaks the API.
 */
const crypto = require('crypto');
const pool = require('../db');

const FEEDS = [
  { url: 'https://feeds.feedburner.com/TheHackersNews', name: 'The Hacker News', category: 'cybersecurity' },
  { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer', category: 'cybersecurity' },
  { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security', category: 'cybersecurity' },
  { url: 'https://www.securityweek.com/feed/', name: 'SecurityWeek', category: 'cybersecurity' },
  { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', name: 'CISA Advisories', category: 'cybersecurity', severity: 'high' },
  { url: 'https://simonwillison.net/atom/everything/', name: 'Simon Willison', category: 'vibe-coding' },
  { url: 'https://github.blog/ai-and-ml/feed/', name: 'GitHub Blog (AI & ML)', category: 'ai-agents' },
];

const MAX_PER_FEED = 6;
const MAX_AGE_DAYS = 21;
const MAX_AI_PER_RUN = 6;
const FETCH_TIMEOUT_MS = 12000;
const DEFAULT_SYNC_MINUTES = 30;

const status = { running: false, lastRunAt: null, nextRunAt: null, syncIntervalMinutes: DEFAULT_SYNC_MINUTES, lastAdded: 0, lastErrors: [], totalAdded: 0 };

/* ───────────── tiny RSS / Atom parsing ───────────── */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', ndash: '-', mdash: '-', hellip: '...' };
function decodeEntities(str) {
  return String(str || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch { return ' '; } })
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCodePoint(parseInt(d, 10)); } catch { return ' '; } })
    .replace(/&([a-z]+);/gi, (m, n) => (ENTITIES[n.toLowerCase()] !== undefined ? ENTITIES[n.toLowerCase()] : m));
}
function stripHtml(html) {
  return decodeEntities(
    String(html || '')
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}
function tagText(block, names) {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'));
    if (m) return m[1];
  }
  return '';
}
function parseFeed(xml) {
  const out = [];
  const re = /<(item|entry)[\s>][\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[0];
    const title = stripHtml(tagText(b, ['title']));
    let link = stripHtml(tagText(b, ['link']));
    if (!link) {
      const alt = b.match(/<link[^>]+rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) || b.match(/<link[^>]+href=["']([^"']+)["']/i);
      link = alt ? decodeEntities(alt[1]) : '';
    }
    const dateRaw = stripHtml(tagText(b, ['pubDate', 'published', 'updated', 'dc:date']));
    const body = tagText(b, ['content:encoded', 'description', 'summary', 'content']);
    const cats = [...b.matchAll(/<category[^>]*?(?:term=["']([^"']+)["'][^>]*\/?>|>([\s\S]*?)<\/category>)/gi)]
      .map(c => stripHtml(c[1] || c[2] || '')).filter(Boolean);
    const published = dateRaw ? new Date(dateRaw) : new Date();
    if (!title || !/^https?:\/\//i.test(link)) continue;
    out.push({ title, link, published: isNaN(published) ? new Date() : published, text: stripHtml(body), categories: cats });
  }
  return out;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'PromptaraNewsBot/1.0 (+https://vibe.virtuenet.space)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/* ───────────── classification helpers ───────────── */
function severityOf(item, feed) {
  const t = `${item.title} ${item.text}`.toLowerCase();
  if (/zero-day|actively exploited|critical vulnerabilit|remote code execution|supply[- ]chain attack|black october/.test(t)) return 'critical';
  if (/ransomware|data breach|breach|exploit|vulnerabilit|malware|backdoor|cve-\d{4}/.test(t)) return feed.severity === 'high' ? 'high' : 'high';
  return feed.severity || 'info';
}
function tagsOf(item, feed) {
  const t = `${item.title} ${item.text}`;
  const tags = new Set([feed.name]);
  item.categories.slice(0, 4).forEach(c => tags.add(c));
  if (/black october/i.test(t)) tags.add('Black October');
  if (/\bMCP\b|model context protocol/i.test(t)) tags.add('MCP');
  if (/vibe coding/i.test(t)) tags.add('Vibe Coding');
  if (/ransomware/i.test(t)) tags.add('Ransomware');
  if (/zero-day/i.test(t)) tags.add('Zero-Day');
  if (/\bAI\b|LLM|agent/i.test(t) && feed.category !== 'cybersecurity') tags.add('AI');
  return [...tags].slice(0, 8);
}
function categoryOf(item, feed) {
  const t = `${item.title} ${item.text}`;
  if (feed.category === 'cybersecurity' && /vibe coding|AI[- ]generated code|copilot|cursor|prompt injection|MCP\b/i.test(t)) return 'vibe-coding';
  return feed.category;
}

/* ───────────── optional AI summary (BytePlus ModelArk) ───────────── */
async function loadAiConfig() {
  try {
    const r = await pool.query("SELECT key, value FROM system_settings WHERE key IN ('ai_byteplus_api_key','ai_byteplus_endpoint','ai_default_model','news_ai_summary')");
    const m = {}; r.rows.forEach(x => { m[x.key] = x.value; });
    if (m.news_ai_summary === 'off') return null;
    const key = (m.ai_byteplus_api_key || process.env.BYTEPLUS_API_KEY || '').trim();
    const ep = (m.ai_byteplus_endpoint || '').trim();
    const model = /^ep-/.test(ep) ? ep : (m.ai_default_model || '').trim();
    if (!key || !model) return null;
    return { key, model, url: /^https?:\/\//i.test(ep) ? ep : 'https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions' };
  } catch { return null; }
}
async function aiSummarize(cfg, item) {
  const prompt = `Anda editor berita keamanan siber & AI coding. Ringkas artikel berikut. Balas HANYA JSON valid: {"title_id":"judul Bahasa Indonesia","summary_id":"ringkasan eksekutif 2-3 kalimat Bahasa Indonesia","summary_en":"2-3 sentence executive summary in English"}.\n\nJudul: ${item.title}\nIsi: ${item.text.slice(0, 1800)}`;
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({ model: cfg.model, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 500 }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
  const data = await res.json();
  const txt = data?.choices?.[0]?.message?.content || '';
  const j = txt.match(/\{[\s\S]*\}/);
  if (!j) throw new Error('AI returned no JSON');
  const parsed = JSON.parse(j[0]);
  if (!parsed.summary_id || !parsed.summary_en) throw new Error('AI JSON incomplete');
  return parsed;
}

/* ───────────── main run ───────────── */
async function runOnce() {
  if (status.running) return { ...status, skipped: true };
  status.running = true;
  status.lastErrors = [];
  let added = 0;
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  const aiCfg = await loadAiConfig();
  let aiUsed = 0;

  try {
    for (const feed of FEEDS) {
      let items = [];
      try {
        items = parseFeed(await fetchText(feed.url));
      } catch (err) {
        status.lastErrors.push(`${feed.name}: ${err.message}`);
        continue;
      }
      items = items.filter(i => i.published.getTime() >= cutoff).sort((a, b) => b.published - a.published).slice(0, MAX_PER_FEED);

      for (const it of items) {
        const slug = `auto-${crypto.createHash('sha1').update(it.link).digest('hex').slice(0, 20)}`;
        try {
          const exists = await pool.query('SELECT 1 FROM news_updates WHERE slug = $1 OR source_url = $2 LIMIT 1', [slug, it.link]);
          if (exists.rows.length) continue;

          const excerpt = (it.text || it.title).slice(0, 360).replace(/\s+\S*$/, '') + (it.text.length > 360 ? '...' : '');
          let titleId = it.title, summaryId = excerpt, summaryEn = excerpt;
          if (aiCfg && aiUsed < MAX_AI_PER_RUN) {
            aiUsed++;
            try {
              const ai = await aiSummarize(aiCfg, it);
              titleId = ai.title_id || titleId; summaryId = ai.summary_id; summaryEn = ai.summary_en;
            } catch (e) { status.lastErrors.push(`AI: ${e.message}`); }
          }
          const readTime = Math.max(2, Math.min(12, Math.round((it.text.length || 600) / 900)));
          const sev = severityOf(it, feed);
          const content = (text) => `${text}\n\n---\n\n**Sumber / Source:** [${feed.name}](${it.link})`;

          await pool.query(
            `INSERT INTO news_updates (
              slug, category, severity, is_pinned, published_at, read_time_min,
              badge_en, badge_id, title_en, title_id, summary_en, summary_id,
              content_en, content_id, tags, sources, source_url, is_auto
            ) VALUES ($1,$2,$3,false,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true)
            ON CONFLICT (slug) DO NOTHING`,
            [
              slug, categoryOf(it, feed), sev, it.published.toISOString(), readTime,
              '📡 LIVE FEED', '📡 FEED LANGSUNG', it.title, titleId, summaryEn, summaryId,
              content(summaryEn), content(summaryId),
              JSON.stringify(tagsOf(it, feed)),
              JSON.stringify([{ title: it.title, publisher: feed.name, url: it.link }]),
              it.link,
            ]
          );
          added++;
        } catch (err) {
          status.lastErrors.push(`insert ${feed.name}: ${err.message}`);
        }
      }
    }
  } finally {
    status.running = false;
    status.lastRunAt = new Date().toISOString();
    status.nextRunAt = new Date(Date.now() + status.syncIntervalMinutes * 60 * 1000).toISOString();
    status.lastAdded = added;
    status.totalAdded += added;
    status.lastErrors = status.lastErrors.slice(0, 10);
  }
  if (added) console.log(`📰 News ingest: +${added} new article(s)`);
  return { ...status };
}

let timer = null;
let ensureTableFn = null;

async function loadSyncIntervalMinutes() {
  try {
    const r = await pool.query("SELECT value FROM system_settings WHERE key = 'news_sync_interval_minutes'");
    const val = parseInt(r.rows[0]?.value, 10);
    if (!isNaN(val) && val >= 5 && val <= 1440) {
      return val;
    }
  } catch {}
  return Math.max(5, parseInt(process.env.NEWS_INGEST_MINUTES || String(DEFAULT_SYNC_MINUTES), 10));
}

function scheduleTimer(minutes) {
  if (timer) clearInterval(timer);
  const everyMin = Math.max(5, Math.min(1440, parseInt(minutes, 10) || DEFAULT_SYNC_MINUTES));
  status.syncIntervalMinutes = everyMin;
  status.nextRunAt = new Date(Date.now() + everyMin * 60 * 1000).toISOString();
  const tick = async () => {
    try {
      if (ensureTableFn) await ensureTableFn();
      await runOnce();
    } catch (e) {
      console.warn('news ingest tick:', e.message);
    }
  };
  timer = setInterval(tick, everyMin * 60 * 1000);
  if (timer.unref) timer.unref();
}

async function setSyncIntervalMinutes(minutes) {
  const clean = Math.max(5, Math.min(1440, parseInt(minutes, 10) || DEFAULT_SYNC_MINUTES));
  try {
    await pool.query(
      `INSERT INTO system_settings (key, value) VALUES ('news_sync_interval_minutes', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [String(clean)]
    );
  } catch {}
  scheduleTimer(clean);
  return getStatus();
}

function getStatus() {
  return { ...status, feeds: FEEDS.length };
}

function start(ensureTable) {
  ensureTableFn = ensureTable;
  if (process.env.NEWS_INGEST === 'off' || timer) return;
  loadSyncIntervalMinutes().then((everyMin) => {
    scheduleTimer(everyMin);
    const initialTick = async () => {
      try {
        if (ensureTableFn) await ensureTableFn();
        await runOnce();
      } catch (e) {
        console.warn('news ingest initial tick:', e.message);
      }
    };
    setTimeout(initialTick, 25000).unref();
  });
}

module.exports = { start, runOnce, getStatus, setSyncIntervalMinutes, DEFAULT_SYNC_MINUTES, parseFeed };
