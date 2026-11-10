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
  // 10 Media Berita Kepercayaan Publik RI (GoodStats / Reuters Institute Digital News Report) — kanal Teknologi
  { url: 'https://www.cnnindonesia.com/teknologi/rss', name: 'CNN Indonesia', category: 'cybersecurity' },
];

// 10 Media Berita Kepercayaan Publik RI (GoodStats Data: https://data.goodstats.id/statistic/10-media-berita-kepercayaan-publik-ri-ada-apa-saja-KYRRS)
const TRUSTED_ID_MEDIA = [
  { id: 'kompas', name: 'Kompas', trust: '62%', domains: ['kompas.com', 'kompas.id', 'kompas.tv'] },
  { id: 'cnn', name: 'CNN Indonesia', trust: '61%', domains: ['cnnindonesia.com'] },
  { id: 'tvone', name: 'tvOne', trust: '60%', domains: ['tvonenews.com'] },
  { id: 'detik', name: 'Detik.com', trust: '59%', domains: ['detik.com'] },
  { id: 'sctv', name: 'SCTV / Liputan6', trust: '59%', domains: ['liputan6.com'] },
  { id: 'tvri', name: 'TVRI', trust: '58%', domains: ['tvrinews.com', 'tvri.go.id'] },
  { id: 'rcti', name: 'RCTI / iNews', trust: '57%', domains: ['rctiplus.com', 'inews.id', 'sindonews.com'] },
  { id: 'tempo', name: 'Tempo', trust: '53%', domains: ['tempo.co'] },
  { id: 'tribun', name: 'Tribunnews', trust: '53%', domains: ['tribunnews.com'] },
  { id: 'jawapos', name: 'Jawa Pos', trust: '50%', domains: ['jawapos.com'] },
];

const GOODSTATS_REFERENCE_URL = 'https://data.goodstats.id/statistic/10-media-berita-kepercayaan-publik-ri-ada-apa-saja-KYRRS';

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

/**
 * Live search across the Top 10 Indonesian Trusted Media Sources
 * (GoodStats / Reuters Institute Digital News Report: https://data.goodstats.id/statistic/10-media-berita-kepercayaan-publik-ri-ada-apa-saja-KYRRS)
 * Searches Google News Indonesia RSS filtered by the 10 trusted domains (or a selected outlet),
 * optionally summarizes via BytePlus ModelArk, and persists matching articles into news_updates.
 */
async function searchTrustedIndonesianMedia(query, mediaId = 'all') {
  const cleanQuery = String(query || '').trim().slice(0, 140);
  if (!cleanQuery) return { added: 0, items: [], trustedMedia: TRUSTED_ID_MEDIA, referenceUrl: GOODSTATS_REFERENCE_URL };

  const selectedOutlets = mediaId && mediaId !== 'all'
    ? TRUSTED_ID_MEDIA.filter(m => m.id === mediaId || m.name.toLowerCase().includes(String(mediaId).toLowerCase()))
    : TRUSTED_ID_MEDIA;

  const targetDomains = (selectedOutlets.length ? selectedOutlets : TRUSTED_ID_MEDIA).flatMap(m => m.domains);
  const siteFilter = targetDomains.map(d => `site:${d}`).join(' OR ');
  const fullQuery = `${cleanQuery} (${siteFilter})`;
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(fullQuery)}&hl=id&gl=ID&ceid=ID:id`;

  let parsed = [];
  try {
    const xml = await fetchText(rssUrl);
    parsed = parseFeed(xml).slice(0, 8);
  } catch (err) {
    console.warn('[searchTrustedIndonesianMedia] RSS fetch warning:', err.message);
  }

  const aiCfg = await loadAiConfig();
  let aiCount = 0;
  let added = 0;
  const insertedOrFound = [];

  for (const it of parsed) {
    // Extract publisher from title if formatted like "Judul Berita - CNN Indonesia"
    let cleanTitle = it.title;
    let publisherName = 'Media Terpercaya RI';
    const dashIdx = it.title.lastIndexOf(' - ');
    if (dashIdx > 15) {
      publisherName = it.title.slice(dashIdx + 3).trim();
      cleanTitle = it.title.slice(0, dashIdx).trim();
    }
    const matchedOutlet = TRUSTED_ID_MEDIA.find(
      m => m.name.toLowerCase().includes(publisherName.toLowerCase()) ||
           publisherName.toLowerCase().includes(m.id) ||
           m.domains.some(d => it.link.toLowerCase().includes(d) || publisherName.toLowerCase().includes(d))
    );
    if (matchedOutlet) {
      publisherName = `${matchedOutlet.name} (Trust ${matchedOutlet.trust})`;
    }

    const slug = `idmedia-${crypto.createHash('sha1').update(cleanTitle + '|' + publisherName).digest('hex').slice(0, 20)}`;
    try {
      const existing = await pool.query('SELECT * FROM news_updates WHERE slug = $1 OR source_url = $2 LIMIT 1', [slug, it.link]);
      if (existing.rows.length > 0) {
        insertedOrFound.push(existing.rows[0]);
        continue;
      }

      const rawSummary = stripHtml(it.text || cleanTitle).slice(0, 420);
      let titleId = cleanTitle;
      let summaryId = rawSummary || `${cleanTitle} — dilaporkan oleh ${publisherName}.`;
      let summaryEn = rawSummary || `${cleanTitle} — reported by ${publisherName}.`;

      if (aiCfg && aiCount < 3) {
        aiCount++;
        try {
          const ai = await aiSummarize(aiCfg, { title: cleanTitle, text: `${cleanTitle}. ${rawSummary}` });
          titleId = ai.title_id || titleId;
          summaryId = ai.summary_id || summaryId;
          summaryEn = ai.summary_en || summaryEn;
        } catch {}
      }

      const sev = /penyadapan|sadap|makar|darurat|kritis|bocor|ransomware|zero-day|tersangka/i.test(`${cleanTitle} ${rawSummary}`)
        ? 'critical'
        : 'high';

      const tags = [
        matchedOutlet ? matchedOutlet.name : publisherName,
        'Top 10 Media Kepercayaan Publik RI',
        'GoodStats Reference',
        ...tagsOf({ title: cleanTitle, text: rawSummary, categories: it.categories || [] }, { name: publisherName, category: 'cybersecurity' }),
      ].slice(0, 8);

      const isSecurityRelevant = /penyadapan|sadap|wiretap|interception|\blims\b|spyware|pegasus|ransomware|malware|trojan|backdoor|infostealer|phishing|credential|hijack|cve-\d{4}|zero[- ]?day|vulnerabilit|exploit|sql injection|supply[- ]?chain|slopsquatting|data leak|kebocoran data|data breach|\bdlp\b|keamanan siber|cybersecurity|serangan siber|peretasan|hacker|peretas|bssn|cisa|owasp/i.test(`${cleanTitle} ${rawSummary}`);

      const contentId = isSecurityRelevant
        ? `### Rangkuman Pemberitaan (${publisherName})\n${summaryId}\n\n### Konteks Keamanan Siber & Kedaulatan Data\nBerita terkait **"${cleanQuery}"** ini dihimpun dari daftar **10 Media Berita Kepercayaan Publik Tertinggi di Indonesia** ([GoodStats / Reuters Institute Digital News Report](${GOODSTATS_REFERENCE_URL})). Anda dapat membuka panel **Mitigasi & Solusi BytePlus SealSuite** pada kartu berita untuk melihat langkah pencegahan berbasis Zero Trust.`
        : `### Rangkuman Pemberitaan (${publisherName})\n${summaryId}\n\n---\n*Dihimpun dari daftar [10 Media Berita Kepercayaan Publik RI - GoodStats Data](${GOODSTATS_REFERENCE_URL}).*`;
      const contentEn = isSecurityRelevant
        ? `### Executive News Summary (${publisherName})\n${summaryEn}\n\n### Cybersecurity & Sovereign Data Context\nThis report on **"${cleanQuery}"** is sourced from **Indonesia's Top 10 Most Trusted News Media** ([GoodStats / Reuters Institute Digital News Report](${GOODSTATS_REFERENCE_URL})). You can expand the **BytePlus SealSuite Solution** section on this card to view relevant Zero Trust mitigations.`
        : `### Executive News Summary (${publisherName})\n${summaryEn}\n\n---\n*Sourced from [Indonesia's Top 10 Most Trusted News Media - GoodStats Data](${GOODSTATS_REFERENCE_URL}).*`;

      const sourcesJson = [
        { title: cleanTitle, publisher: publisherName, url: it.link },
        { title: '10 Media Berita Kepercayaan Publik RI, Ada Apa Saja? - GoodStats Data', publisher: 'GoodStats.id (Reuters Institute)', url: GOODSTATS_REFERENCE_URL },
      ];

      const ins = await pool.query(
        `INSERT INTO news_updates (
          slug, category, severity, is_pinned, published_at, read_time_min,
          badge_en, badge_id, title_en, title_id, summary_en, summary_id,
          content_en, content_id, tags, sources, source_url, is_auto
        ) VALUES ($1,'cybersecurity',$2,false,$3,4,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true)
        ON CONFLICT (slug) DO NOTHING
        RETURNING *`,
        [
          slug,
          sev,
          it.published.toISOString(),
          `🇮🇩 ${matchedOutlet ? matchedOutlet.name.toUpperCase() : 'INDONESIA TRUSTED MEDIA'}`,
          `🇮🇩 ${matchedOutlet ? matchedOutlet.name.toUpperCase() : 'MEDIA TERPERCAYA RI'}`,
          cleanTitle,
          titleId,
          summaryEn,
          summaryId,
          contentEn,
          contentId,
          JSON.stringify(tags),
          JSON.stringify(sourcesJson),
          it.link,
        ]
      );
      if (ins.rows.length > 0) {
        added++;
        insertedOrFound.push(ins.rows[0]);
      }
    } catch (err) {
      console.warn('[searchTrustedIndonesianMedia] insert warning:', err.message);
    }
  }

  return {
    added,
    items: insertedOrFound,
    trustedMedia: TRUSTED_ID_MEDIA,
    referenceUrl: GOODSTATS_REFERENCE_URL,
  };
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

module.exports = {
  start,
  runOnce,
  getStatus,
  setSyncIntervalMinutes,
  DEFAULT_SYNC_MINUTES,
  parseFeed,
  searchTrustedIndonesianMedia,
  TRUSTED_ID_MEDIA,
  GOODSTATS_REFERENCE_URL,
};
