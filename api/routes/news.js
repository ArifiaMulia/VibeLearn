const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// Curated authoritative intelligence feed on Vibe Coding & Cybersecurity (including "Black October")
const DEFAULT_NEWS_ITEMS = [
  {
    slug: 'black-october-2026-ai-vulnpocalypse-cybersecurity',
    category: 'cybersecurity',
    severity: 'critical',
    is_pinned: true,
    published_at: '2026-10-28',
    read_time_min: 6,
    badge_en: '🔥 SPECIAL REPORT · BLACK OCTOBER',
    badge_id: '🔥 LAPORAN KHUSUS · BLACK OCTOBER',
    title_en: '"Black October" 2026: How Autonomous AI Agents & PHP2Shell Reshaped Global Cybersecurity',
    title_id: '"Black October" 2026: Gelombang Serangan AI Otonom, Celah PHP2Shell, dan Krisis Supply Chain Global',
    summary_en: 'October 2026—dubbed "Black October" by global security researchers—marked a historic turning point where autonomous AI agents began discovering and exploiting zero-day vulnerabilities faster than human teams could patch them, alongside the critical PHP2Shell RCE tsunami and supply-chain breaches across developer cloud platforms.',
    summary_id: 'Oktober 2026—yang dijuluki "Black October" oleh para peneliti keamanan siber dunia—menandai titik balik bersejarah di mana agen AI otonom digunakan secara masif oleh peretas untuk menemukan dan mengeksploitasi celah keamanan (Zero-Day) lebih cepat dari siklus patching manusia, disertai gelombang celah kritis PHP2Shell dan serangan rantai pasok (Supply Chain) pada platform cloud developer.',
    content_en: `### 1. What Was "Black October"?
**"Black October"** refers to the historic wave of critical vulnerability disclosures, supply-chain intrusions, and automated cyberattacks that struck global infrastructure in **October 2026**. Security leaders from Cloudflare, Wiz, Anthropic, and CISA described the period as a *"Code Red"* moment—the first time **autonomous AI hacking agents** operated at internet scale with "infinite patience."

### 2. The 3 Major Incidents Defining Black October
- **The PHP "Vulnerability Tsunami" (PHP2Shell — CVE-2026-109618 / CVE-2026-109619)**:
  On October 21, 2026, critical memory-safety and Remote Code Execution (RCE) flaws were disclosed in PHP. Because PHP powers over 75% of the web, Cloudflare recorded millions of automated exploit attempts within hours of disclosure, forcing emergency CISA directives.
- **LiteLLM & AI Supply Chain Poisoning**:
  Attackers compromised open-source AI orchestration dependencies (including a malicious release in the LiteLLM ecosystem) to inject credential stealers specifically designed to harvest \`OPENAI_API_KEY\`, \`ANTHROPIC_API_KEY\`, \`BYTEPLUS_API_KEY\`, and cloud environment variables.
- **Developer PaaS & Cloud Credential Harvesting (Railway / Zeabur / M365)**:
  Targeted intrusions against developer hosting platforms forced temporary deployment freezes and mandatory rotation of millions of production secrets, database URLs, and CI/CD tokens.

### 3. Key Takeaways for Vibe Coders & Enterprise Security Teams
1. **Never Hardcode API Keys or Secrets**: Always store LLM keys and database credentials in isolated Kubernetes Secrets or encrypted vaults, and rotate them immediately after any dependency update.
2. **Pin & Audit Dependencies**: When AI coding assistants generate \`package.json\` or \`requirements.txt\`, verify package versions and run \`npm audit\` to prevent supply-chain poisoning.
3. **Enforce Zero Trust & DLP (SealSuite)**: Traditional perimeter firewalls cannot stop stolen developer tokens. Enforce Multi-Factor Authentication (MFA), device posture checks, and Data Loss Prevention (DLP) on every engineer workstation.`,
    content_id: `### 1. Apa Itu Fenomena "Black October"?
**"Black October"** merujuk pada gelombang bersejarah insiden keamanan siber, kebocoran data masif, dan eksploitasi kerentanan kritis yang mengguncang infrastruktur digital global sepanjang **Oktober 2026**. Para pemimpin industri dari Cloudflare, Wiz, Anthropic, hingga badan keamanan CISA menyebut peristiwa ini sebagai titik balik (*"Vulnpocalypse"*), di mana **agen AI otonom** mulai digunakan secara operasional untuk memindai, membedah patch, dan menyerang server lebih cepat daripada kemampuan tim IT manusia melakukan *patching*.

### 2. Tiga Insiden Utama dalam "Black October"
- **Tsunami Kerentanan PHP ("PHP2Shell" — CVE-2026-109618 & CVE-2026-109619)**:
  Pada 21 Oktober 2026, celah keamanan *Remote Code Execution (RCE)* kritis ditemukan pada inti PHP. Karena mayoritas situs web dunia berjalan di atas PHP, Cloudflare mencatat jutaan percobaan eksploitasi otomatis hanya dalam hitungan jam setelah celah diumumkan, memaksa CISA mengeluarkan peringatan darurat.
- **Serangan Supply Chain pada Pustaka AI (Insiden LiteLLM)**:
  Peretas menyusupkan kode pencuri kredensial (*credential stealer*) ke dalam paket open-source populer yang menghubungkan aplikasi dengan model AI. Malware ini secara spesifik memanen variabel lingkungan (\`.env\`) yang berisi API Key AI, kunci AWS/Cloud, dan token database.
- **Kompromi Platform Cloud Developer (Railway, Zeabur & Integrasi Pihak Ketiga)**:
  Serangan terarah pada infrastruktur hosting pengembang memaksa pembekuan deployment sementara dan rotasi massal jutaan token CI/CD serta kredensial produksi di seluruh dunia.

### 3. Pelajaran Penting bagi Praktisi Vibe Coding & Tim Security
1. **Rotasi & Isolasi Kredensial**: Jangan pernah menaruh API Key atau token di dalam kode sumber. Gunakan *Kubernetes Secrets* dan batasi izin API Key (*Least Privilege*).
2. **Waspada Halusinasi Paket & Supply Chain**: Saat menggunakan AI untuk menulis kode, selalu periksa paket yang diinstal (\`npm install\`) agar tidak terjebak serangan *typosquatting* atau rantai pasok berbahaya.
3. **Terapkan Zero Trust & SealSuite DLP**: Karena peretas kini mengincar *Session Token* dan laptop developer, pastikan setiap perangkat dilindungi oleh **SealSuite Zero Trust (ZTNA)**, **EDR**, dan **Data Loss Prevention (DLP)**.`,
    tags: ['Black October', 'PHP2Shell', 'AI Security', 'Supply Chain', 'Zero Trust'],
    sources: [
      { title: 'CISA Known Exploited Vulnerabilities Catalog & Directives', publisher: 'CISA.gov', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog' },
      { title: 'Cloudflare Radar — Global DDoS & Automated Exploit Telemetry', publisher: 'Cloudflare', url: 'https://radar.cloudflare.com' },
      { title: 'Wiz Cloud Threat Research — AI-Assisted Vulnerability Discovery', publisher: 'Wiz Security', url: 'https://www.wiz.io/blog' },
      { title: 'The Hacker News — Critical Infrastructure & Supply Chain Advisories', publisher: 'The Hacker News', url: 'https://thehackernews.com' }
    ]
  },
  {
    slug: 'owasp-top-10-for-llm-and-vibe-coding-security-2026',
    category: 'vibe-coding',
    severity: 'high',
    is_pinned: true,
    published_at: '2026-11-02',
    read_time_min: 5,
    badge_en: '⚡ VIBE CODING SECURITY',
    badge_id: '⚡ KEAMANAN VIBE CODING',
    title_en: 'Securing AI-Generated Code: Preventing Prompt Injection, Slopsquatting & Secret Leaks',
    title_id: 'Mengamankan Kode Hasil AI (Vibe Coding): Cegah Prompt Injection, Slopsquatting & Kebocoran Token',
    summary_en: 'While Vibe Coding accelerates software delivery by 5x–10x, studies show that unreviewed AI-generated code can introduce subtle SQL injections, missing auth middleware, and hallucinated npm packages ("Slopsquatting"). Here is the mandatory security checklist.',
    summary_id: 'Meskipun Vibe Coding mempercepat pembuatan aplikasi hingga 10x lipat, riset terbaru menunjukkan kode hasil generasi AI yang tidak ditinjau ulang rawan meninggalkan celah SQL Injection, lupa memasang middleware autentikasi, hingga menginstal paket palsu ("Slopsquatting"). Simak panduan pencegahannya.',
    content_en: `### Why Vibe Coding Needs Security Guardrails
AI coding assistants excel at making features work quickly, but they optimize for **functional completion** unless explicitly instructed to optimize for **security**.

### Top 3 Risks in AI-Assisted Development
1. **Slopsquatting (Package Hallucination)**:
   LLMs occasionally invent plausible-sounding package names (e.g., \`react-secure-jwt-helper\`). Attackers register these hallucinated names on npm/PyPI with malware inside.
2. **Broken Object Level Authorization (BOLA / IDOR)**:
   When asked to *"build an endpoint to update user profiles,"* an AI may write \`UPDATE users WHERE id = req.body.id\` without checking if \`req.user.id === req.body.id\`.
3. **Indirect Prompt Injection in AI Agents**:
   When an AI agent reads untrusted external web pages, emails, or database rows, hidden instructions inside that data can hijack the agent's tool-calling permissions.

### How to Vibe Code Securely
- **Include Security Constraints in Every Prompt**: Explicitly ask for parameterized SQL queries (\`$1, $2\`), Helmet CSP headers, and RBAC role checks.
- **Automated Pre-Deploy Audits**: Always run static analysis and verify authentication boundaries before pushing to production.`,
    content_id: `### Mengapa Vibe Coding Membutuhkan Guardrail Keamanan?
Asisten coding AI sangat mahir membuat fitur berjalan dalam hitungan detik, namun secara bawaan model AI mengutamakan **kemudahan fungsi** kecuali Anda secara tegas memerintahkannya menerapkan **standar keamanan produksi**.

### 3 Risiko Terbesar dalam Pengembangan Berbasis AI
1. **Slopsquatting (Halusinasi Nama Paket)**:
   Model AI terkadang mengarang nama library yang terdengar meyakinkan (misalnya \`express-jwt-safe-auth\`). Peretas sengaja mendaftarkan nama-nama paket hasil halusinasi tersebut di npm/PyPI dan menyisipkan malware di dalamnya.
2. **Broken Access Control (Lupa Cek Otorisasi Role)**:
   Saat diminta *"buatkan API hapus data"*, AI bisa saja membuat endpoint yang langsung menghapus data tanpa memverifikasi apakah pemanggilnya adalah \`super_admin\` atau pemilik sah data tersebut.
3. **Indirect Prompt Injection pada Agen AI**:
   Jika aplikasi AI Anda membaca dokumen eksternal atau email yang tidak tepercaya, peretas dapat menyembunyikan instruksi tersembunyi untuk membajak fungsi *Tool Calling* agen AI Anda.

### Checklist Wajib Sebelum Deploy
- **Sertakan Aturan Keamanan di Dalam Prompt**: Selalu minta AI menggunakan *Parameterized Query* (\`$1, $2\`), validasi input, dan *Rate Limiting*.
- **Audit Diff Sebelum Commit**: Luangkan 2 menit untuk memeriksa setiap file yang diubah AI sebelum menjalankan \`git push\`.`,
    tags: ['Vibe Coding', 'OWASP LLM', 'Slopsquatting', 'Prompt Injection', 'AppSec'],
    sources: [
      { title: 'OWASP Top 10 for Large Language Model Applications', publisher: 'OWASP Foundation', url: 'https://genai.owasp.org' },
      { title: 'NIST AI Risk Management Framework (AI RMF)', publisher: 'NIST.gov', url: 'https://www.nist.gov/itl/ai-risk-management-framework' }
    ]
  },
  {
    slug: 'mcp-2-0-and-multi-agent-orchestration-standard-2026',
    category: 'ai-agents',
    severity: 'info',
    is_pinned: false,
    published_at: '2026-11-04',
    read_time_min: 4,
    badge_en: '🚀 VIBE CODING & AI AGENTS',
    badge_id: '🚀 TREN VIBE CODING & AGEN AI',
    title_en: 'The Rise of Multi-Agent Orchestration & Model Context Protocol (MCP) in Enterprise IDEs',
    title_id: 'Evolusi Vibe Coding 2026: Orkestrasi Multi-Agen & Standarisasi Model Context Protocol (MCP)',
    summary_en: 'Modern Vibe Coding has evolved beyond single-file autocomplete. Today’s engineering teams orchestrate specialized subagents—Researcher, Builder, Security Auditor, and K3s Deployer—connected via standardized MCP servers.',
    summary_id: 'Vibe Coding di tahun 2026 telah melampaui sekadar fitur auto-complete kode. Tim engineering modern kini mengorkestrasi beberapa sub-agen spesialis sekaligus—mulai dari Researcher, Builder, Security Auditor, hingga DevOps Deployer—yang terhubung secara aman melalui protokol MCP.',
    content_en: `### From Autocomplete to Autonomous Agent Teams
In early AI coding tools, developers copied and pasted snippets from a chat window. Today, **Agentic IDEs** (like Antigravity, Cursor, and Windsurf) operate as coordinated engineering teams:

- **Planner / Architect Agent**: Analyzes the repository structure and designs the implementation plan.
- **Builder Agent**: Executes targeted multi-file edits and runs build verification.
- **Security & QA Subagent**: Audits CORS, CSP headers, SQL queries, and runs end-to-end smoke tests.

### Best Practices for Orchestrating AI Agents
1. **Keep Context Focused**: Break massive epics into clear, verifiable milestones.
2. **Use Spec-Driven Prompts**: Define the API contract, database schema, and edge cases upfront.
3. **Human-in-the-Loop Governance**: Keep human approval gates on production database migrations and secret changes.`,
    content_id: `### Dari Sekadar Chat Menuju Tim Agen Otonom
Pada generasi awal, developer harus menyalin-tempel (*copy-paste*) potongan kode dari jendela chat. Kini, **Agentic IDE** modern bekerja layaknya tim engineering terpadu:

- **Agen Arsitek / Perencana**: Memetakan struktur repositori dan menyusun rencana perubahan.
- **Agen Builder**: Mengeksekusi pengeditan lintas file dan memvalidasi hasil kompilasi (\`npm run build\`).
- **Agen Security & QA**: Memeriksa keamanan header CSP, CORS, kueri database, dan menjalankan pengujian otomatis ke cluster Kubernetes (K3s).

### Kunci Sukses Mengelola Agen AI
1. **Berikan Konteks yang Terukur**: Pecah fitur besar menjadi tahapan vertikal yang mudah diverifikasi.
2. **Gunakan Spesifikasi Tertulis (Spec-Driven)**: Jelaskan skema data dan skenario error sejak awal.
3. **Kendali Manusia (Human-in-the-Loop)**: Pastikan keputusan kritis seperti migrasi database produksi tetap melalui persetujuan engineer.`,
    tags: ['MCP', 'Multi-Agent', 'Vibe Coding', 'Antigravity', 'BytePlus ModelArk'],
    sources: [
      { title: 'Model Context Protocol (MCP) Official Specification', publisher: 'ModelContextProtocol.io', url: 'https://modelcontextprotocol.io' },
      { title: 'BytePlus ModelArk Documentation — Enterprise LLM Endpoints', publisher: 'BytePlus', url: 'https://docs.byteplus.com/en/docs/ModelArk' }
    ]
  },
  {
    slug: 'infostealer-session-hijacking-zero-trust-defense-2026',
    category: 'cybersecurity',
    severity: 'high',
    is_pinned: false,
    published_at: '2026-10-30',
    read_time_min: 5,
    badge_en: '🛡️ ZERO TRUST & ENDPOINT DEFENSE',
    badge_id: '🛡️ PERTAHANAN ZERO TRUST & DLP',
    title_en: 'Why Session-Cookie Stealers Bypass Traditional Passwords — And How Zero Trust Stops Them',
    title_id: 'Waspada Malware Infostealer Pencuri Session Cookie: Mengapa Password Saja Tidak Lagi Cukup',
    summary_en: 'Modern infostealer malware (such as Lumma, RedLine variants, and trojanized developer tools) no longer just steals passwords—it exfiltrates active browser session cookies to bypass 2FA. Learn how device-bound Zero Trust and short idle timeouts neutralize this threat.',
    summary_id: 'Malware Infostealer modern tidak lagi sekadar mengincar password, melainkan mencuri "Session Cookie" aktif dari browser untuk melompati verifikasi 2FA/MFA. Pelajari bagaimana arsitektur Zero Trust SealSuite dan kebijakan Auto-Logout melindungi akun perusahaan.',
    content_en: `### How Session Hijacking (Pass-the-Cookie) Works
When you log into a web application and check *"Remember Me"*, the server issues a session token or cookie. If a user downloads a trojanized utility or pirated software, an **Infostealer** silently copies the browser's cookie database and sends it to the attacker—allowing them to impersonate the user without knowing their password or OTP.

### 4 Layers of Defense Against Session Theft
1. **Device-Bound Zero Trust (SealSuite ZTNA)**: Even if an attacker steals a session token, they cannot use it from an unmanaged laptop that lacks a valid SealSuite EDR certificate.
2. **Automatic Idle Session Timeout**: Enforcing a strict **30-minute idle auto-logout** ensures sessions do not remain open indefinitely on unattended machines.
3. **Server-Side Token Revocation**: Logging out must immediately invalidate the session token on the backend, not just clear local browser storage.
4. **Strict Content Security Policy (CSP)**: Prevents Cross-Site Scripting (XSS) from reading sensitive tokens in the browser.`,
    content_id: `### Bagaimana Pencurian Session Cookie Bekerja?
Saat Anda login ke sebuah aplikasi web, server memberikan *Session Token*. Jika perangkat seseorang terinfeksi malware **Infostealer** (sering menyamar sebagai software bajakan/crack, ekstensi browser palsu, atau file lampiran phishing), malware tersebut langsung menyalin token sesi aktif dari browser. Akibatnya, peretas bisa masuk ke akun korban tanpa perlu tahu password maupun kode OTP.

### 4 Lapis Pertahanan Utama yang Wajib Diterapkan
1. **Zero Trust Berbasis Perangkat (SealSuite ZTNA)**: Walaupun token dicuri, akses akan ditolak jika dibuka dari perangkat asing yang tidak memiliki sertifikat keamanan **SealSuite** perusahaan.
2. **Auto-Logout Saat Idle (30 Menit)**: Membatasi sesi yang tidak aktif agar otomatis keluar dalam 30 menit mencegah penyalahgunaan saat komputer ditinggalkan.
3. **pencabutan Token di Sisi Server**: Saat pengguna menekan tombol Keluar (*Logout*), token wajib langsung dinonaktifkan di database server.
4. **Content Security Policy (CSP) Ketat**: Mencegah skrip berbahaya (*XSS*) mencuri data sesi dari halaman aplikasi.`,
    tags: ['Infostealer', 'Session Hijacking', 'SealSuite', 'Zero Trust', 'DLP'],
    sources: [
      { title: 'OWASP Session Management Cheat Sheet', publisher: 'OWASP', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' },
      { title: 'SealSuite Enterprise Zero Trust & Endpoint Security', publisher: 'SealSuite', url: 'https://www.sealsuite.com' }
    ]
  },
  {
    slug: 'byteplus-modelark-dola-seed-and-deepseek-v4-benchmarks-2026',
    category: 'ai-models',
    severity: 'info',
    is_pinned: false,
    published_at: '2026-11-05',
    read_time_min: 4,
    badge_en: '🧠 MODELARK UPDATE',
    badge_id: '🧠 PEMBARUAN MODEL AI',
    title_en: 'Choosing the Right Model for Vibe Coding: Dola-Seed-2.1-Turbo, Seedance 2.0 & DeepSeek-V4.1',
    title_id: 'Panduan Memilih Model AI di BytePlus ModelArk: Dola-Seed-2.1-Turbo, Seedance 2.0 & DeepSeek-V4.1',
    summary_en: 'Not every coding task requires the heaviest model. Learn how to route tasks across Dola-Seed-2.1-Turbo for high-speed reasoning, Dreamina-Seedance-2.0 for creative UI generation, and DeepSeek-V4.1-Flash for cost-efficient repository analysis.',
    summary_id: 'Tidak semua tugas pemrograman membutuhkan satu model yang sama. Pelajari strategi memilih model di BytePlus ModelArk: kapan harus menggunakan Dola-Seed-2.1-Turbo, Dreamina-Seedance-2.0 untuk desain UI interaktif, dan DeepSeek-V4.1-Flash untuk efisiensi biaya.',
    content_en: `### Smart Model Routing for Developers
In production AI engineering, routing every single request to one model wastes latency and token budget. Here is how to match your **BytePlus ModelArk Endpoint Key** to your workload:

| Model / Endpoint Family | Best Used For | Key Strength |
| :--- | :--- | :--- |
| **Dola-Seed-2.1-Turbo** (\`ep-m-...5j5cm\`) | Interactive AI Instructor, API design, debugging | Ultra-fast 128k context reasoning |
| **Dola-Seed-Evolving** (\`ep-m-...9s59c\`) | Complex architectural Q&A & adaptive mentoring | Continual knowledge adaptation |
| **Dreamina-Seedance-2.0** (\`ep-m-...5txln\`) | Frontend UI components, multimodal & creative coding | Visual layout & creative synthesis |
| **DeepSeek-V4.1-Flash-Economy** (\`ep-m-...xj6qh\`) | Bulk code review, log summarization, CI checks | High throughput at minimal token cost |`,
    content_id: `### Strategi Pemilihan Model AI untuk Engineer
Dalam pengembangan aplikasi AI modern, membagi tugas sesuai spesialisasi model akan menghemat biaya token sekaligus mempercepat waktu respons:

| Keluarga Model / Endpoint | Kegunaan Terbaik | Keunggulan Utama |
| :--- | :--- | :--- |
| **Dola-Seed-2.1-Turbo** (\`ep-m-...5j5cm\`) | Instruktur AI interaktif, desain API, debugging cepat | Penalaran berkecepatan tinggi (128k konteks) |
| **Dola-Seed-Evolving** (\`ep-m-...9s59c\`) | Diskusi arsitektur sistem & pemecahan masalah kompleks | Adaptasi konteks dinamis |
| **Dreamina-Seedance-2.0** (\`ep-m-...5txln\`) | Pembuatan komponen UI/UX, multimodal & desain kreatif | Sintesis visual & kreatif |
| **DeepSeek-V4.1-Flash-Economy** (\`ep-m-...xj6qh\`) | Review kode massal, analisis log, dan otomatisasi CI/CD | Sangat hemat biaya token dengan latensi rendah |`,
    tags: ['BytePlus ModelArk', 'Dola-Seed', 'DeepSeek-V4', 'Dreamina Seedance', 'LLM Routing'],
    sources: [
      { title: 'BytePlus ModelArk Console — Online Inference Endpoints (ap-southeast-1)', publisher: 'BytePlus Console', url: 'https://console.byteplus.com' }
    ]
  }
];

let tableInitialized = false;
async function ensureNewsTable() {
  if (tableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_updates (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(180) UNIQUE NOT NULL,
        category VARCHAR(60) NOT NULL DEFAULT 'cybersecurity',
        severity VARCHAR(30) NOT NULL DEFAULT 'info',
        is_pinned BOOLEAN DEFAULT FALSE,
        published_at VARCHAR(30) NOT NULL,
        read_time_min INTEGER DEFAULT 5,
        badge_en VARCHAR(120),
        badge_id VARCHAR(120),
        title_en TEXT NOT NULL,
        title_id TEXT NOT NULL,
        summary_en TEXT NOT NULL,
        summary_id TEXT NOT NULL,
        content_en TEXT NOT NULL,
        content_id TEXT NOT NULL,
        tags JSONB DEFAULT '[]'::jsonb,
        sources JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const item of DEFAULT_NEWS_ITEMS) {
      await pool.query(
        `INSERT INTO news_updates (
          slug, category, severity, is_pinned, published_at, read_time_min,
          badge_en, badge_id, title_en, title_id, summary_en, summary_id,
          content_en, content_id, tags, sources
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (slug) DO UPDATE SET
          category = EXCLUDED.category,
          severity = EXCLUDED.severity,
          is_pinned = EXCLUDED.is_pinned,
          published_at = EXCLUDED.published_at,
          read_time_min = EXCLUDED.read_time_min,
          badge_en = EXCLUDED.badge_en,
          badge_id = EXCLUDED.badge_id,
          title_en = EXCLUDED.title_en,
          title_id = EXCLUDED.title_id,
          summary_en = EXCLUDED.summary_en,
          summary_id = EXCLUDED.summary_id,
          content_en = EXCLUDED.content_en,
          content_id = EXCLUDED.content_id,
          tags = EXCLUDED.tags,
          sources = EXCLUDED.sources`,
        [
          item.slug, item.category, item.severity, item.is_pinned, item.published_at, item.read_time_min,
          item.badge_en, item.badge_id, item.title_en, item.title_id, item.summary_en, item.summary_id,
          item.content_en, item.content_id, JSON.stringify(item.tags), JSON.stringify(item.sources)
        ]
      );
    }
    tableInitialized = true;
  } catch (err) {
    console.warn('ensureNewsTable warning:', err.message);
  }
}

// GET /api/news — list all news & updates
router.get('/', auth, async (req, res) => {
  await ensureNewsTable();
  try {
    const result = await pool.query(
      `SELECT * FROM news_updates ORDER BY is_pinned DESC, published_at DESC, id DESC`
    );
    res.json({ items: result.rows });
  } catch (err) {
    res.json({ items: DEFAULT_NEWS_ITEMS });
  }
});

// POST /api/news — allow super_admin/master to publish a new update
router.post('/', auth, requireRole('super_admin', 'master'), async (req, res) => {
  await ensureNewsTable();
  const {
    category = 'cybersecurity',
    severity = 'info',
    is_pinned = false,
    badge_en = '📢 INDUSTRY UPDATE',
    badge_id = '📢 INFO TERBARU',
    title_en,
    title_id,
    summary_en,
    summary_id,
    content_en,
    content_id,
    tags = [],
    sources = []
  } = req.body;

  const finalTitleEn = (title_en || title_id || '').trim();
  const finalTitleId = (title_id || title_en || '').trim();
  if (!finalTitleEn) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const slug = `${finalTitleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120)}-${Date.now().toString().slice(-5)}`;
  const published_at = new Date().toISOString().slice(0, 10);

  try {
    const result = await pool.query(
      `INSERT INTO news_updates (
        slug, category, severity, is_pinned, published_at, read_time_min,
        badge_en, badge_id, title_en, title_id, summary_en, summary_id,
        content_en, content_id, tags, sources
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        slug,
        category,
        severity,
        Boolean(is_pinned),
        published_at,
        5,
        badge_en,
        badge_id,
        finalTitleEn,
        finalTitleId,
        summary_en || summary_id || finalTitleEn,
        summary_id || summary_en || finalTitleId,
        content_en || content_id || summary_en || finalTitleEn,
        content_id || content_en || summary_id || finalTitleId,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        JSON.stringify(Array.isArray(sources) ? sources : [])
      ]
    );
    res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    console.error('POST /api/news error:', err);
    res.status(500).json({ error: 'Failed to create news item' });
  }
});

// DELETE /api/news/:id — super_admin/master
router.delete('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  await ensureNewsTable();
  try {
    await pool.query('DELETE FROM news_updates WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news item' });
  }
});

module.exports = router;
