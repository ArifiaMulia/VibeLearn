/**
 * BytePlus SealSuite Security Resolution & Advisory Engine
 * Maps cybersecurity / Vibe Coding / AI-agent news articles to concrete BytePlus SealSuite
 * protection & remediation controls based on the official SealSuite documentation & Release Notes:
 * https://docs.byteplus.com/en/docs/sealsuite/docs-sealsuite-update-log
 */

const SEALSUITE_RELEASE_NOTES_URL = 'https://docs.byteplus.com/en/docs/sealsuite/docs-sealsuite-update-log';
const SEALSUITE_DOCS_URL = 'https://docs.byteplus.com/en/docs/sealsuite/docs-what-is-sealsuite';

const PROFILES = [
  {
    id: 'interception_wiretapping_insider_lims',
    match: /penyadapan|sadap|wiretap|interception|lawful interception|\blims\b|spyware|pegasus|espionage|spionase|insider threat|ss7|imsi/i,
    modules: [
      'Zero Trust Encrypted Tunnel (SealSuite VPN / ZTNA)',
      'Privileged Insider & Admin Audit Log (Immutable Telemetry)',
      'Endpoint Security (Anti-Spyware / Mobile & Desktop Baseline)',
      'Data Loss Prevention (DLP v3.3.2+ Anti-Deletion & Exfiltration)',
    ],
    headline_id:
      'Enkripsi Komunikasi End-to-End (Zero Trust Tunnel), Kontrol Akses Privileged (Zero Standing Privilege) & Pencegahan Penghapusan Jejak Log (DLP)',
    headline_en:
      'End-to-End Encrypted Zero Trust Tunneling, Privileged Insider Governance & Immutable Audit/DLP Protection',
    summary_id:
      'Menghadapi ancaman penyadapan ilegal (seperti penyalahgunaan sistem monitoring/LIMS oleh orang dalam maupun intersepsi jaringan telekomunikasi terhadap pejabat tinggi/VIP), BytePlus SealSuite mengamankan jalur komunikasi dengan enkripsi terowongan Zero Trust (ZTNA), memblokir spyware di perangkat seluler/kerja, mewajibkan otorisasi multi-faktor (MFA) untuk setiap akses sistem sensitif, serta mencegah penghapusan barang bukti/berkas secara ilegal melalui kebijakan DLP dan log audit terpusat.',
    summary_en:
      'To counter illegal wiretapping, abuse of lawful interception (LIMS) systems by privileged insiders, and targeted VIP mobile/network surveillance, BytePlus SealSuite enforces encrypted Zero Trust tunnels (ZTNA), detects mobile/endpoint spyware via Device Baselines, enforces step-up MFA on sensitive monitoring consoles, and blocks unauthorized log/file deletion via Endpoint DLP.',
    actions_id: [
      '**Enkripsi Jalur Komunikasi & Anti-Intersepsi (SealSuite ZTNA / Enterprise VPN)**: Alihkan seluruh lalu lintas data, panggilan kerja, dan akses aplikasi VIP/eksekutif melalui terowongan terenkripsi *SealSuite Zero Trust Network Access (ZTNA)* sehingga penyadapan di tingkat operator seluler/jaringan publik tidak dapat membaca isi paket data.',
      '**Kontrol Ketat Akses Admin & Pencegahan Penyalahgunaan Wewenang (IAM OneId & Dynamic Control)**: Terapkan prinsip *Least Privilege* dan *Step-Up MFA* (Google Authenticator / Hardware Token) setiap kali operator hendak mengakses server sensitif (seperti sistem monitoring/LIMS), serta batasi akses hanya dari perangkat dinas resmi yang terdaftar (*Device-Bound Certificate*).',
      '**Pencegahan Penghapusan Barang Bukti & Eksfiltrasi Data (Endpoint DLP V3.3.2+)**: Aktifkan kebijakan *Data Loss Prevention (DLP)* untuk memblokir penyalinan rekaman/log ke *flashdisk* (USB), melarang pengiriman data sadapan ke luar jaringan, dan mencatat seluruh upaya penghapusan berkas (*File Deletion Audit*) ke server log terpusat yang tidak bisa dihapus oleh operator lokal.',
      '**Deteksi Spyware & Kepatuhan Perangkat VIP (Mobile & Endpoint Baseline)**: Gunakan agen SealSuite di perangkat Android, iOS, Windows, dan macOS untuk mendeteksi *root/jailbreak*, aplikasi perekam liar (*stalkerware/spyware*), atau konfigurasi profil mencurigakan secara real-time sesuai *SealSuite Release Notes*.',
    ],
    actions_en: [
      '**End-to-End Encrypted Communications (SealSuite ZTNA / Enterprise VPN)**: Route all executive and corporate traffic through encrypted *SealSuite Zero Trust Network Access* tunnels so carrier-level or network-layer interception cannot inspect payloads.',
      '**Privileged Access Governance & Step-Up MFA (IAM OneId & Dynamic Control)**: Enforce strict *Least Privilege* and mandatory *Step-Up MFA* before any administrator can query sensitive monitoring systems (such as LIMS), bound strictly to authorized corporate hardware certificates.',
      '**Anti-Tampering & Evidence Preservation (Endpoint DLP V3.3.2+)**: Configure *SealSuite DLP* to block unauthorized USB/flash-drive transfers of sensitive recordings and stream immutable file-access/deletion audit logs to a centralized SIEM so insiders cannot wipe forensic evidence.',
      '**VIP Mobile & Endpoint Spyware Posture Check**: Continuously verify iOS, Android, macOS, and Windows devices against *Device Baselines* to detect jailbreaks/rooting, unauthorized recording processes, or rogue configuration profiles.',
    ],
  },
  {
    id: 'ransomware_malware_edr',
    match: /ransomware|malware|trojan|backdoor|wiper|botnet|loader|rootkit|lockbit|cobalt strike/i,
    modules: ['Endpoint Security (EDR & Anti-Virus)', 'Device Baseline & Patch Management', 'Zero Trust Network Access (ZTNA)'],
    headline_id: 'Isolasi Endpoint Otomatis, Proteksi Anti-Ransomware & Pembatasan Pergerakan Lateral (ZTNA)',
    headline_en: 'Automated Endpoint Isolation, Anti-Ransomware EDR & Zero Trust Lateral Movement Blocking',
    summary_id:
      'BytePlus SealSuite menghentikan eksekusi malware/ransomware di level endpoint melalui pemindaian perilaku real-time, memutus koneksi perangkat terinfeksi dari jaringan internal secara otomatis via Dynamic Control Engine, serta mendistribusikan hotfix tanpa perlu instal ulang penuh.',
    summary_en:
      'BytePlus SealSuite halts malware and ransomware execution at the endpoint layer with behavioral EDR scanning, automatically isolates compromised hosts from corporate networks via the Dynamic Control Engine, and pushes incremental security hotfixes.',
    actions_id: [
      '**Endpoint Security & Anti-Virus Terpadu**: Aktifkan pemindaian real-time dan proteksi direktori sensitif di SealSuite Admin Console untuk memblokir enkripsi massal oleh ransomware.',
      '**Dynamic Control & Isolasi Otomatis**: Konfigurasikan *Device Baseline* agar perangkat yang terdeteksi memiliki proses mencurigakan langsung dicabut akses VPN/ZTNA-nya sebelum menyebar ke server lain (*Lateral Movement*).',
      '**Manajemen Patch & Incremental Hotfix (Release Notes V3.3+)**: Dorong pembaruan agen dan patch OS secara terpusat (*Full Installer* atau *Incremental Patch*) menggunakan mode *Canary / Grayscale Release* di menu `Enterprise Settings > Versions`.',
    ],
    actions_en: [
      '**Integrated Endpoint Security & Anti-Virus**: Enable real-time behavioral protection in the SealSuite Admin Console to block unauthorized file encryption and malicious binaries.',
      '**Dynamic Control & Instant Quarantine**: Configure *Device Baselines* so any endpoint exhibiting anomalous processes immediately loses ZTNA/VPN access before lateral movement occurs.',
      '**Patch Lifecycle & Incremental Hotfixes (Release Notes V3.3+)**: Push emergency OS/software patches and lightweight incremental client updates via `Enterprise Settings > Versions` with canary rollout.',
    ],
  },
  {
    id: 'session_identity_phishing',
    match: /infostealer|session hijacking|pass-the-cookie|cookie theft|phishing|credential theft|password leak|oauth|sso|token theft|account takeover|brute[- ]?force|mfa|2fa|zero[- ]?trust|unauthorized access|peretasan akun/i,
    modules: ['IAM (OneId SSO & Multi-Factor Authentication)', 'Device-Bound ZTNA & Application Gateway', 'Dynamic Control Risk Engine'],
    headline_id: 'Pengikatan Sesi ke Perangkat Terdaftar (Device-Bound Zero Trust) & Verifikasi MFA Kontekstual',
    headline_en: 'Device-Bound Zero Trust Session Enforcement & Adaptive Multi-Factor Authentication (IAM)',
    summary_id:
      'Meskipun kredensial atau session cookie pengguna dicuri oleh malware Infostealer/Phishing, penyerang tetap tidak dapat mengakses aplikasi internal karena SealSuite Application Gateway memverifikasi sertifikat perangkat keras (Device Trust) dan postur keamanan di setiap request.',
    summary_en:
      'Even if an attacker steals a password or active browser session cookie via phishing or infostealers, SealSuite blocks unauthorized access by binding sessions to verified corporate device certificates and enforcing continuous posture checks.',
    actions_id: [
      '**Device-Bound Access (ZTNA & Application Gateway)**: Wajibkan akses aplikasi melalui *SealSuite Application Gateway* sehingga token sesi yang dicuri tidak dapat digunakan dari perangkat asing yang tidak memiliki sertifikat agen SealSuite.',
      '**IAM OneId & Adaptive MFA**: Terapkan autentikasi multi-faktor (TOTP/Lark/Biometrik) berbasis risiko yang secara otomatis meminta verifikasi ulang saat mendeteksi login dari IP, lokasi, atau perangkat baru.',
      '**Pencabutan Sesi Terpusat (Zero Trust Continuous Check)**: Gunakan *Dynamic Control Engine* untuk mencabut seluruh token SSO dan memutus sesi aktif secara instan begitu terdeteksi anomali identitas.',
    ],
    actions_en: [
      '**Device-Bound Access (ZTNA & Application Gateway)**: Route internal apps through the *SealSuite Application Gateway* so stolen session cookies are rejected when replayed from unmanaged devices.',
      '**IAM OneId & Adaptive MFA**: Enforce risk-based Multi-Factor Authentication that triggers step-up verification on anomalous IP addresses, geolocations, or device changes.',
      '**Centralized Session Revocation**: Use the *Dynamic Control Engine* to immediately revoke SSO tokens and terminate active sessions across all connected SaaS and internal apps.',
    ],
  },
  {
    id: 'zeroday_cve_vuln_patch',
    match: /cve-\d{4}|zero[- ]?day|\brce\b|remote code execution|php2shell|vulnerabilit|exploit|unpatched|privilege escalation|buffer overflow|sql injection|kerentanan siber|celah keamanan/i,
    modules: ['Endpoint Vulnerability & Patch Management', 'Application Gateway (Layer-7 Reverse Proxy)', 'Device Baseline Compliance'],
    headline_id: 'Mitigasi Celah Zero-Day/CVE dengan Isolasi Application Gateway & Distribusi Patch Terpusat',
    headline_en: 'Zero-Day / CVE Containment via Layer-7 Application Gateway & Centralized Patch Rollout',
    summary_id:
      'Saat celah kritis (Zero-Day / RCE seperti PHP2Shell) diumumkan, SealSuite menyembunyikan permukaan serangan (attack surface) aplikasi internal di balik Zero Trust Application Gateway sehingga tidak terekspos ke internet publik, sambil mengaudit dan menambal versi software yang rentan di seluruh perangkat.',
    summary_en:
      'When critical zero-day or RCE vulnerabilities emerge, SealSuite eliminates public attack surfaces by placing internal services behind its Layer-7 Zero Trust Application Gateway while automating software inventory and emergency patch deployment.',
    actions_id: [
      '**Sembunyikan Attack Surface dengan Application Gateway**: Tutup port publik server internal dan wajibkan akses melalui *SealSuite Layer-7 Application Gateway* agar bot pemindai eksploitasi otomatis tidak dapat menjangkau layanan yang belum di-patch.',
      '**Inventaris Aset & Deteksi Software Rentan**: Gunakan modul *Endpoint Asset & Software Management* untuk memindai seluruh laptop/server karyawan yang masih menjalankan versi software terdampak CVE dalam hitungan menit.',
      '**Distribusi Patch Darurat & Pemblokiran Versi Lama**: Gunakan fitur *Software Distribution* dan *Device Baseline* untuk mendorong update secara paksa serta memblokir akses jaringan bagi perangkat yang belum memperbarui software rentan.',
    ],
    actions_en: [
      '**Eliminate Public Exposure via Application Gateway**: Hide internal web services behind the *SealSuite Layer-7 Application Gateway* so automated internet exploit scanners cannot reach unpatched endpoints.',
      '**Real-Time Asset & CVE Software Inventory**: Use *Endpoint Asset Management* to immediately identify every workstation running vulnerable software versions across Windows, macOS, and Linux.',
      '**Mandatory Patch Rollout & Baseline Gatekeeping**: Push silent security updates via SealSuite and configure *Device Baselines* to quarantine endpoints until the required patch level is verified.',
    ],
  },
  {
    id: 'supply_chain_ai_dlp_secrets',
    match: /supply[- ]?chain|slopsquatting|api[- ]?key|secret leak|data leak|kebocoran data|data breach|exfiltrat|\bdlp\b|data loss prevention|litellm|prompt injection|shadow ai/i,
    modules: ['Data Loss Prevention (DLP v3.3.2+)', 'Endpoint Software Blacklist & Baseline', 'BYOD Secure Workspace & Watermarking'],
    headline_id: 'Pencegahan Kebocoran Source Code / API Key (Endpoint DLP) & Kontrol Paket/Aplikasi Terlarang',
    headline_en: 'Source Code & API Key Data Loss Prevention (Endpoint DLP) & Unauthorized Software Blocking',
    summary_id:
      'Untuk mengatasi risiko serangan rantai pasok (Supply Chain), halusinasi paket AI (Slopsquatting), dan pencurian kredensial `.env`/API Key, modul DLP SealSuite (pembaruan kebijakan keamanan data V3.3.2+) memantau dan memblokir pengiriman kode sumber maupun kunci rahasia ke luar perusahaan.',
    summary_en:
      'To counter supply-chain compromises, AI package hallucinations ("slopsquatting"), and `.env` secret theft, SealSuite’s Data Loss Prevention (DLP V3.3.2+ policy engine) inspects and blocks unauthorized exfiltration of source code and API keys.',
    actions_id: [
      '**Kebijakan Data Loss Prevention (DLP V3.3.2+) & Sensitive Thesaurus**: Aktifkan deteksi pola sensitif (*Sensitive Data Dictionary*) untuk memblokir unggahan file `.env`, API Key (`OPENAI_API_KEY`, `BYTEPLUS_API_KEY`), dan kode sumber ke situs eksternal, GenAI tidak resmi, atau penyimpanan pribadi.',
      '**Kontrol Transfer File, Clipboard & USB**: Batasi penyalinan kode sensitif antar-aplikasi, blokir penyimpanan USB yang tidak terdaftar, dan terapkan *Screen & Print Watermarking* dinamis berisi identitas pengguna.',
      '**Daftar Hitam Software (Prohibited Software Baseline)**: Cegah eksekusi binary berbahaya hasil *supply-chain poisoning* atau ekstensi IDE ilegal menggunakan kebijakan *Required & Prohibited Software* pada Endpoint SealSuite.',
    ],
    actions_en: [
      '**DLP Policy Engine (V3.3.2+) & Sensitive Thesaurus**: Configure sensitive keyword/regex dictionaries to block uploads of `.env` files, cloud credentials, and proprietary source code to unapproved web domains or shadow AI tools.',
      '**Clipboard, File Transfer & Peripheral Controls**: Restrict unauthorized copy/paste, USB mass-storage transfers, and enforce dynamic *Screen & Print Watermarking* for full audit traceability.',
      '**Prohibited Software & Binary Baseline**: Block untrusted binaries, trojanized developer tools, or unverified extensions using SealSuite’s endpoint software allow/deny lists.',
    ],
  },
];

// Exclude pure AI model benchmarks, general developer tutorials, or non-security news unless they explicitly address a security/privacy/threat topic
const SECURITY_RELEVANCE_CHECK = /penyadapan|sadap|wiretap|interception|\blims\b|spyware|pegasus|ransomware|malware|trojan|backdoor|wiper|botnet|infostealer|phishing|credential|hijack|brute[- ]?force|cve-\d{4}|zero[- ]?day|\brce\b|php2shell|vulnerabilit|exploit|sql injection|supply[- ]?chain|slopsquatting|secret leak|data leak|kebocoran data|data breach|exfiltrat|\bdlp\b|data loss|prompt injection|sealsuite|zero[- ]?trust|keamanan siber|cybersecurity|serangan siber|peretasan|hacker|peretas|bssn|cisa|owasp/i;

function buildSealSuiteResolution(article = {}) {
  // Never force SealSuite onto pure AI model benchmark or general AI agent workflow articles unless they have concrete security/threat content
  if (article.category === 'ai-models') {
    return null;
  }

  const haystack = [
    article.slug || '',
    article.title_en || '',
    article.title_id || '',
    article.summary_en || '',
    article.summary_id || '',
    article.content_en || '',
    article.content_id || '',
    Array.isArray(article.tags) ? article.tags.join(' ') : String(article.tags || ''),
  ].join(' ');

  if (!SECURITY_RELEVANCE_CHECK.test(haystack)) {
    return null;
  }

  const matched = PROFILES.filter((p) => p.match.test(haystack));
  if (matched.length === 0) {
    return null;
  }
  const primary = matched[0];

  // Combine modules and actions if multiple threat vectors match (e.g., Black October has CVE + Supply Chain + Session theft)
  const modulesSet = new Set(primary.modules);
  const actionsId = [...primary.actions_id];
  const actionsEn = [...primary.actions_en];

  for (let i = 1; i < matched.length && i < 3; i++) {
    matched[i].modules.forEach((m) => modulesSet.add(m));
    if (matched[i].actions_id[0] && !actionsId.includes(matched[i].actions_id[0])) {
      actionsId.push(matched[i].actions_id[0]);
    }
    if (matched[i].actions_en[0] && !actionsEn.includes(matched[i].actions_en[0])) {
      actionsEn.push(matched[i].actions_en[0]);
    }
  }

  return {
    profile_id: primary.id,
    modules: [...modulesSet].slice(0, 5),
    headline_id: primary.headline_id,
    headline_en: primary.headline_en,
    summary_id: primary.summary_id,
    summary_en: primary.summary_en,
    actions_id: actionsId.slice(0, 4),
    actions_en: actionsEn.slice(0, 4),
    reference_label_id: 'Release Notes — SealSuite BytePlus (Dokumentasi Resmi)',
    reference_label_en: 'Release Notes — SealSuite BytePlus (Official Docs)',
    reference_url: SEALSUITE_RELEASE_NOTES_URL,
    docs_url: SEALSUITE_DOCS_URL,
  };
}

module.exports = {
  SEALSUITE_RELEASE_NOTES_URL,
  SEALSUITE_DOCS_URL,
  buildSealSuiteResolution,
};
