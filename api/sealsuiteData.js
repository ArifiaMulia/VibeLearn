// ─────────────────────────────────────────────────────────────────────────────
// SealSuite Training Materials — Lesson Seed Data
// Category: cybersecurity
// Courses: "SealSuite for Administrators" | "SealSuite for End Users"
// Playlist: https://youtube.com/playlist?list=PLfK625JcyPTcnOBbL4lrIYEtdUhYfqzlS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {

  // ═══════════════════════════════════════════════════════════════════════════
  // COURSE 1: SealSuite for Administrators
  // ═══════════════════════════════════════════════════════════════════════════
  "SealSuite for Administrators": [

    // ── Lesson 1: Product Overview ──────────────────────────────────────────
    {
      title: 'Product Overview — What is SealSuite?',
      title_id: 'Gambaran Produk — Apa itu SealSuite?',
      type: 'video',
      difficulty: 'beginner',
      video_url: 'https://www.youtube.com/watch?v=tU-msNVkB5k',
      xp_reward: 75,
      order_index: 1,
      resources: [
        { type: 'docs', label: 'Official SealSuite Documentation', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-what-is-sealsuite' },
        { type: 'article', label: 'SealSuite Product Advantages', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-product-advantages' },
      ],
      transcript: `Welcome to SealSuite for Administrators. In this lesson, we will explore what SealSuite is, why it was built, and how it fundamentally changes how organizations manage digital security. SealSuite is an all-in-one digital office security platform built on a Zero Trust architecture. Instead of relying on a traditional network perimeter — where everyone inside the network is trusted — SealSuite continuously verifies every user, every device, and every access request. This means that even if an attacker gets inside your corporate network, they cannot freely move to sensitive resources without passing through strict identity and device checks. SealSuite unifies five core capability modules into one platform: Identity and Permission Management, Network Security (VPN), Endpoint Security (Assets), Data Loss Prevention (DLP), and the Dynamic Control engine. As an administrator, your job is to configure and monitor all five of these modules from a single Admin Console.`,
      transcript_id: `Selamat datang di SealSuite untuk Administrator. Dalam pelajaran ini, kita akan mempelajari apa itu SealSuite, mengapa dibuat, dan bagaimana ia secara mendasar mengubah cara organisasi mengelola keamanan digital. SealSuite adalah platform keamanan kantor digital all-in-one yang dibangun di atas arsitektur Zero Trust. Alih-alih mengandalkan perimeter jaringan tradisional — di mana semua orang di dalam jaringan dipercaya — SealSuite terus-menerus memverifikasi setiap pengguna, setiap perangkat, dan setiap permintaan akses. Ini berarti bahwa bahkan jika penyerang masuk ke jaringan perusahaan Anda, mereka tidak dapat dengan bebas berpindah ke sumber daya sensitif tanpa melewati pemeriksaan identitas dan perangkat yang ketat. SealSuite menyatukan lima modul kemampuan inti menjadi satu platform: Manajemen Identitas dan Izin, Keamanan Jaringan (VPN), Keamanan Endpoint (Aset), Data Loss Prevention (DLP), dan mesin Dynamic Control.`,
      content: `# What is SealSuite?

SealSuite is a **unified digital office security platform** by BytePlus, built on a **Zero Trust architecture**. It replaces the patchwork of fragmented security tools (separate VPN clients, antivirus software, device managers, SSO portals) with a single, integrated solution.

## The Problem SealSuite Solves

Traditional enterprise security relies on a "castle and moat" model — once inside the network, users are trusted. This is dangerous in the modern era of remote work, BYOD devices, and sophisticated phishing attacks.

\`\`\`mermaid
graph LR
  A[❌ Old Model] -->|"Trust everyone inside the perimeter"| B[Network Boundary]
  B --> C[All internal resources accessible]
  D[✅ Zero Trust Model] -->|"Never trust, always verify"| E[Identity Check]
  E --> F[Device Health Check]
  F --> G[Policy Evaluation]
  G --> H[Access Granted / Denied]
  style A fill:#ef4444,color:#fff
  style D fill:#10b981,color:#fff
  style H fill:#3b82f6,color:#fff
\`\`\`

## The 5 Core Modules

| Module | What It Does | Admin Value |
|--------|-------------|-------------|
| 🔑 **Identity (IAM)** | Single account for all services; MFA; SSO | Centralized user lifecycle management |
| 🌐 **Network (VPN)** | Secure remote access; SD-WAN; NAC | Identity-based fine-grained access control |
| 💻 **Endpoint (Assets)** | Device inventory; OS/software baseline | Real-time device security posture |
| 🛡️ **DLP** | File transfer control; watermarking; eDiscovery | Prevent and trace data leakage |
| ⚡ **Dynamic Control** | AI-driven continuous risk monitoring | Automated threat response |

## The SealSuite Application Workflow

\`\`\`mermaid
flowchart TD
  A([👤 User Login Request]) --> B{Identity Verification}
  B -->|MFA / SSO / LDAP| C{Device Health Check}
  C -->|Device Baseline Scan| D{Authorization Rules}
  D -->|Roles, Departments, Tags| E{Access Decision}
  E -->|Approved| F([✅ Access Granted])
  E -->|Denied| G([🚫 Access Blocked])
  F --> H[Continuous Monitoring - Dynamic Control Engine]
  H -->|Risk Detected| I[Automated Response]
  I --> J[Alert Admin / Block Device / Revoke Access]
  I --> K[Log to Audit Trail]
  style A fill:#7c3aed,color:#fff
  style F fill:#10b981,color:#fff
  style G fill:#ef4444,color:#fff
  style H fill:#f59e0b,color:#fff
  style I fill:#ef4444,color:#fff
\`\`\`

## Key Benefits for Administrators

- **Single Console:** Manage identity, network, endpoints, and data security from one place
- **Automated Enforcement:** Security policies apply automatically — no manual intervention for every user
- **Full Visibility:** Real-time dashboard showing all users, devices, and security events
- **Zero Trust:** Every access request is validated, not assumed safe

> 💡 **Key Insight:** SealSuite turns complex, multi-tool security management into a streamlined, policy-driven workflow. Your role as an administrator shifts from reactive firefighting to proactive policy design.`,

      content_id: `# Apa itu SealSuite?

SealSuite adalah **platform keamanan kantor digital terpadu** dari BytePlus, dibangun di atas **arsitektur Zero Trust**. Ia menggantikan kumpulan alat keamanan yang terfragmentasi (klien VPN terpisah, antivirus, manajer perangkat, portal SSO) dengan satu solusi terintegrasi.

## Masalah yang Diselesaikan SealSuite

Keamanan enterprise tradisional bergantung pada model "kastil dan parit" — begitu berada di dalam jaringan, pengguna dipercaya. Ini berbahaya di era modern kerja jarak jauh, perangkat BYOD, dan serangan phishing yang canggih.

\`\`\`mermaid
graph LR
  A[❌ Model Lama] -->|"Percaya semua orang di dalam perimeter"| B[Batas Jaringan]
  B --> C[Semua sumber daya internal dapat diakses]
  D[✅ Model Zero Trust] -->|"Jangan pernah percaya, selalu verifikasi"| E[Pemeriksaan Identitas]
  E --> F[Pemeriksaan Kesehatan Perangkat]
  F --> G[Evaluasi Kebijakan]
  G --> H[Akses Diberikan / Ditolak]
  style A fill:#ef4444,color:#fff
  style D fill:#10b981,color:#fff
  style H fill:#3b82f6,color:#fff
\`\`\`

## 5 Modul Utama

| Modul | Fungsi | Nilai untuk Admin |
|-------|--------|-------------------|
| 🔑 **Identitas (IAM)** | Satu akun untuk semua layanan; MFA; SSO | Manajemen siklus hidup pengguna terpusat |
| 🌐 **Jaringan (VPN)** | Akses jarak jauh aman; SD-WAN; NAC | Kontrol akses berdasarkan identitas |
| 💻 **Endpoint (Aset)** | Inventaris perangkat; baseline OS/software | Postur keamanan perangkat real-time |
| 🛡️ **DLP** | Kontrol transfer file; watermark; eDiscovery | Mencegah dan melacak kebocoran data |
| ⚡ **Dynamic Control** | Pemantauan risiko berkelanjutan berbasis AI | Respons ancaman otomatis |

## Alur Kerja Aplikasi SealSuite

\`\`\`mermaid
flowchart TD
  A([👤 Permintaan Login Pengguna]) --> B{Verifikasi Identitas}
  B -->|MFA / SSO / LDAP| C{Pemeriksaan Kesehatan Perangkat}
  C -->|Pemindaian Device Baseline| D{Aturan Otorisasi}
  D -->|Peran, Departemen, Tag| E{Keputusan Akses}
  E -->|Disetujui| F([✅ Akses Diberikan])
  E -->|Ditolak| G([🚫 Akses Diblokir])
  F --> H[Pemantauan Berkelanjutan - Mesin Dynamic Control]
  H -->|Risiko Terdeteksi| I[Respons Otomatis]
  I --> J[Peringatkan Admin / Blokir Perangkat / Cabut Akses]
  style A fill:#7c3aed,color:#fff
  style F fill:#10b981,color:#fff
  style G fill:#ef4444,color:#fff
  style H fill:#f59e0b,color:#fff
\`\`\`

## Manfaat Utama bagi Administrator

- **Satu Konsol:** Kelola identitas, jaringan, endpoint, dan keamanan data dari satu tempat
- **Penegakan Otomatis:** Kebijakan keamanan berlaku secara otomatis
- **Visibilitas Penuh:** Dashboard real-time menampilkan semua pengguna, perangkat, dan peristiwa keamanan
- **Zero Trust:** Setiap permintaan akses divalidasi, tidak diasumsikan aman`,

      challenge_text: 'Think about your current organization or a hypothetical company with 200 employees working across 3 offices and remotely. List 3 specific security problems that SealSuite\'s Zero Trust approach would solve compared to a traditional VPN-only setup.',
      challenge_text_id: 'Pikirkan tentang organisasi Anda saat ini atau perusahaan hipotetis dengan 200 karyawan yang bekerja di 3 kantor dan jarak jauh. Sebutkan 3 masalah keamanan spesifik yang akan diselesaikan oleh pendekatan Zero Trust SealSuite dibandingkan dengan pengaturan VPN tradisional saja.',
    },

    // ── Lesson 2: Architecture & Zero Trust ────────────────────────────────
    {
      title: 'SealSuite Architecture & Zero Trust Concepts',
      title_id: 'Arsitektur SealSuite & Konsep Zero Trust',
      type: 'video',
      difficulty: 'beginner',
      video_url: 'https://www.youtube.com/watch?v=QVa7rNFo_ec',
      xp_reward: 75,
      order_index: 2,
      resources: [
        { type: 'docs', label: 'SealSuite Basic Concepts', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-basic-concepts' },
        { type: 'docs', label: 'User Scenarios', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-user-scenario' },
      ],
      transcript: `In this lesson, we dive into the core architectural concepts that power SealSuite. Understanding these concepts is essential for administrators who need to design, configure, and troubleshoot the platform. We will cover Authorization Rules, the Application Gateway, IAM, and Device Baselines — the four pillars that make Zero Trust access decisions possible.`,
      transcript_id: `Dalam pelajaran ini, kita mendalami konsep arsitektur inti yang mendukung SealSuite. Memahami konsep-konsep ini sangat penting bagi administrator yang perlu merancang, mengkonfigurasi, dan memecahkan masalah platform. Kita akan membahas Authorization Rules, Application Gateway, IAM, dan Device Baselines — empat pilar yang membuat keputusan akses Zero Trust menjadi mungkin.`,
      content: `# SealSuite Architecture & Zero Trust Concepts

## Core Architectural Components

### 1. Authorization Rules
The **primary access control mechanism** in SealSuite. Every access request — whether for VPN, Wi-Fi, wired network, business system, or cloud service — passes through authorization rules.

\`\`\`mermaid
graph TD
  A[Access Request] --> B{Authorization Rule Check}
  B -->|Full Usage - Default| C[Access Granted to All]
  B -->|Restricted Usage| D{Who is the user?}
  D -->|Member of allowed Dept/Role| E[Access Granted]
  D -->|Not authorized| F[Access Denied]
  E --> G[Priority-based evaluation if multiple rules]
  style A fill:#7c3aed,color:#fff
  style C fill:#10b981,color:#fff
  style E fill:#10b981,color:#fff
  style F fill:#ef4444,color:#fff
\`\`\`

**Key Settings:**
- **Full Usage:** All users can access the resource (default)
- **Restricted Usage:** Access limited to specific departments, roles, or named members
- **Priority:** When multiple rules apply, the higher-priority rule wins

---

### 2. Application Gateway
A **Zero Trust gateway** that acts as a reverse proxy (Layer 7 HTTP) between users and backend applications.

| Feature | Description |
|---------|-------------|
| **Agentless Access** | Users access backend apps without installing any client agent |
| **Inline Security** | Intercepts every request; enforces authentication before forwarding |
| **DLP Integration** | Can enforce screen watermarking, disable copy/paste/print |
| **Cross-Domain** | Secures internal apps across different network domains |

---

### 3. IAM (Identity and Access Management)
The **foundational identity layer** managing all user accounts, authentication methods, and permissions.

\`\`\`mermaid
graph LR
  A[IAM] --> B[User Accounts]
  A --> C[Authentication Methods]
  A --> D[SSO Applications]
  A --> E[Directory Integration]
  C --> C1[Password]
  C --> C2[MFA - TOTP/SMS]
  C --> C3[LDAP]
  C --> C4[OIDC / SAML]
  C --> C5[RADIUS]
  E --> E1[Active Directory]
  E --> E2[Lark / WeCom]
  E --> E3[Azure AD]
\`\`\`

---

### 4. Device Baseline
A **security compliance policy** that evaluates each device before granting access.

**What a Device Baseline checks:**
- ✅ Antivirus software installed and active
- ✅ OS patches up to date
- ✅ Screen lock enabled
- ✅ Required software installed
- ✅ Prohibited software absent
- ✅ Encryption enabled (BitLocker / FileVault)

**What happens when a device fails baseline:**

\`\`\`mermaid
sequenceDiagram
  participant D as Device
  participant S as SealSuite
  participant A as Admin
  D->>S: Login attempt
  S->>D: Run Device Baseline scan
  D-->>S: Antivirus disabled ❌
  S->>D: Block network access
  S->>A: Alert: Device non-compliant
  D->>D: User fixes issue (enables antivirus)
  D->>S: Re-scan request
  S->>D: ✅ Baseline passed, access restored
\`\`\`

---

## Zero Trust Access Decision Matrix

| Factor | Verified By | Impact on Access |
|--------|-------------|-----------------|
| **Who is the user?** | IAM + MFA | Determines which resources they can access |
| **Is the device healthy?** | Device Baseline | Unhealthy devices are blocked or restricted |
| **What is the context?** | Authorization Rules | Time, location, and risk-based rules |
| **Is behavior normal?** | Dynamic Control Engine | Anomalies trigger automated responses |`,

      content_id: `# Arsitektur SealSuite & Konsep Zero Trust

## Komponen Arsitektur Utama

### 1. Authorization Rules (Aturan Otorisasi)
**Mekanisme kontrol akses utama** di SealSuite. Setiap permintaan akses — untuk VPN, Wi-Fi, jaringan kabel, sistem bisnis, atau layanan cloud — melewati aturan otorisasi.

\`\`\`mermaid
graph TD
  A[Permintaan Akses] --> B{Pemeriksaan Aturan Otorisasi}
  B -->|Full Usage - Default| C[Akses Diberikan ke Semua]
  B -->|Restricted Usage| D{Siapa penggunanya?}
  D -->|Anggota Dept/Peran yang diizinkan| E[Akses Diberikan]
  D -->|Tidak diotorisasi| F[Akses Ditolak]
  style A fill:#7c3aed,color:#fff
  style C fill:#10b981,color:#fff
  style E fill:#10b981,color:#fff
  style F fill:#ef4444,color:#fff
\`\`\`

### 2. Application Gateway
**Gateway Zero Trust** yang bertindak sebagai reverse proxy (Layer 7 HTTP) antara pengguna dan aplikasi backend. Memberikan akses aman tanpa memerlukan agen klien pada perangkat pengguna.

### 3. IAM (Identity and Access Management)
**Lapisan identitas fundamental** yang mengelola semua akun pengguna, metode autentikasi, dan izin. Mendukung integrasi dengan Active Directory, Lark, WeCom, Azure AD, LDAP, OIDC, SAML, dan RADIUS.

### 4. Device Baseline
**Kebijakan kepatuhan keamanan** yang mengevaluasi setiap perangkat sebelum memberikan akses. Memeriksa antivirus, patch OS, screen lock, enkripsi, dan perangkat lunak yang diperlukan.

## Matriks Keputusan Akses Zero Trust

| Faktor | Diverifikasi Oleh | Dampak pada Akses |
|--------|-------------------|-------------------|
| **Siapa penggunanya?** | IAM + MFA | Menentukan sumber daya mana yang dapat diakses |
| **Apakah perangkat sehat?** | Device Baseline | Perangkat tidak sehat diblokir atau dibatasi |
| **Apa konteksnya?** | Authorization Rules | Aturan berbasis waktu, lokasi, dan risiko |
| **Apakah perilakunya normal?** | Dynamic Control Engine | Anomali memicu respons otomatis |`,

      challenge_text: 'Design an authorization rule for a Finance department scenario: Only Finance members should access the company accounting system, but the CFO and Finance Director should also be able to access it from personal devices. How would you structure the rules? List the rule settings you would configure.',
      challenge_text_id: 'Rancang aturan otorisasi untuk skenario departemen Keuangan: Hanya anggota Keuangan yang boleh mengakses sistem akuntansi perusahaan, tetapi CFO dan Direktur Keuangan juga harus dapat mengaksesnya dari perangkat pribadi. Bagaimana Anda akan menyusun aturan tersebut?',
    },

    // ── Lesson 3: Admin Console Setup ──────────────────────────────────────
    {
      title: 'Getting Started: The Admin Console',
      title_id: 'Mulai: Admin Console',
      type: 'video',
      difficulty: 'beginner',
      video_url: 'https://www.youtube.com/watch?v=S0AjZQiS7lc',
      xp_reward: 75,
      order_index: 3,
      resources: [
        { type: 'docs', label: 'Admin Console Homepage Overview', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-viewing-the-home-page-of-the-admin-portal' },
        { type: 'docs', label: 'Using the Admin Console', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-operation-instructions' },
        { type: 'docs', label: 'Quick Start Guide', url: 'https://docs.byteplus.com/en/docs/sealsuite/quickstart' },
      ],
      transcript: `In this lesson, we walk through the Admin Console — the central hub for managing all of SealSuite. When you first log in as an administrator, you are taken to the Admin Console homepage. This page gives you a snapshot of your entire organization's security posture at a glance. We will explore the three main sections: Corporate Overview, Quick Access, and Data Statistics.`,
      transcript_id: `Dalam pelajaran ini, kita menelusuri Admin Console — pusat pengelolaan semua fitur SealSuite. Saat pertama kali masuk sebagai administrator, Anda akan dibawa ke halaman beranda Admin Console. Halaman ini memberi Anda gambaran sekilas tentang postur keamanan seluruh organisasi Anda. Kita akan menjelajahi tiga bagian utama: Corporate Overview, Quick Access, dan Data Statistics.`,
      content: `# The SealSuite Admin Console

The Admin Console is your **command center** for the entire SealSuite platform. Every configuration, policy, and audit log is accessible from here.

## Accessing the Admin Console

1. Log in to the BytePlus SealSuite Console with your admin credentials
2. Navigate to the Admin Console using the access link on the Business Dashboard
3. Use your **Tenant ID** and admin account credentials

> ⚠️ **Important:** There are two types of admin accounts:
> - **Super Admin:** Full access to all modules and settings
> - **Sub-Admin (RBAC):** Scoped access based on assigned roles (e.g., only manage Identity, not DLP)

---

## Homepage Layout

\`\`\`mermaid
graph TD
  A[Admin Console Homepage] --> B[Section 1: Corporate Overview]
  A --> C[Section 2: Quick Access]
  A --> D[Section 3: Data Statistics]
  B --> B1[Company name, logo, Enterprise ID]
  B --> B2[Total Members count]
  B --> B3[Total Assets - devices]
  B --> B4[Software catalog count]
  B --> B5[Admin count - Super / Sub]
  B --> B6[License expiration date]
  C --> C1[Directory - Users & Depts]
  C --> C2[Asset List - Devices]
  C --> C3[Dashboard - Analytics]
  C --> C4[Branding - Logo / Theme]
  C --> C5[Audit Logs]
  D --> D1[DLP investigation charts]
  D --> D2[Sensitive data classification]
  D --> D3[File transfer records]
\`\`\`

---

## The Left Navigation Menu — Module Structure

| Module | Sub-Sections | Purpose |
|--------|-------------|---------|
| **Identity** | Directory, Roles, Account Settings, SSO | User & auth management |
| **Endpoint** | Assets, Baseline, Software, Client Config | Device security |
| **VPN** | VPN Gateways, ACL Policies, Configuration | Network access |
| **Network Admin** | Wi-Fi, Wired, SD-WAN | On-premises connectivity |
| **DLP** | eDiscovery, Strategy Center, Reports | Data protection |
| **Dynamic Control** | Control Policies, Remediation Logs | Automated risk response |
| **Enterprise Settings** | Workflow, Branding, Audit Logs | Platform administration |

---

## Admin Console Quick Start Workflow

\`\`\`mermaid
sequenceDiagram
  participant A as Admin
  participant C as Admin Console
  A->>C: 1. Log in
  C-->>A: Corporate Overview dashboard
  A->>C: 2. Identity > Directory: Add departments & users
  A->>C: 3. Identity > Account Settings: Configure MFA + Auth sources
  A->>C: 4. VPN > VPN Gateway: Add VPN server
  A->>C: 5. VPN > ACL Policy: Grant access by dept/role
  A->>C: 6. Endpoint > Baseline: Create device compliance policy
  A->>C: 7. DLP > Strategy Center: Define data protection rules
  A->>C: 8. Dynamic Control: Set automated threat response policies
  A->>C: 9. Enterprise Settings > Branding: Customize user portal
  C-->>A: Platform is ready for employees!
\`\`\`

> ⏱️ **Note:** Configuration changes may take up to **10 minutes** to synchronize with the SealSuite client on endpoints.`,

      content_id: `# Admin Console SealSuite

Admin Console adalah **pusat komando** Anda untuk seluruh platform SealSuite. Setiap konfigurasi, kebijakan, dan log audit dapat diakses dari sini.

## Mengakses Admin Console

1. Masuk ke BytePlus SealSuite Console dengan kredensial admin Anda
2. Navigasikan ke Admin Console menggunakan tautan akses di Business Dashboard
3. Gunakan **Tenant ID** dan kredensial akun admin Anda

> ⚠️ **Penting:** Ada dua jenis akun admin:
> - **Super Admin:** Akses penuh ke semua modul dan pengaturan
> - **Sub-Admin (RBAC):** Akses terbatas berdasarkan peran yang ditetapkan

## Layout Halaman Beranda

Halaman beranda Admin Console terdiri dari tiga bagian:
1. **Corporate Overview:** Nama perusahaan, total anggota, aset, software, admin, dan tanggal kadaluarsa lisensi
2. **Quick Access:** Tautan cepat ke Directory, Asset List, Dashboard, Branding, dan Audit Logs
3. **Data Statistics:** Grafik DLP, klasifikasi data sensitif, dan catatan transfer file

## Struktur Modul di Menu Navigasi Kiri

| Modul | Tujuan |
|-------|--------|
| **Identity** | Manajemen pengguna & autentikasi |
| **Endpoint** | Keamanan perangkat |
| **VPN** | Akses jaringan |
| **Network Admin** | Konektivitas on-premises |
| **DLP** | Perlindungan data |
| **Dynamic Control** | Respons risiko otomatis |
| **Enterprise Settings** | Administrasi platform |`,

      challenge_text: 'Log in to your organization\'s SealSuite Admin Console and identify: (1) How many total members are registered? (2) How many devices (assets) are managed? (3) When does your license expire? Screenshot the Corporate Overview section.',
      challenge_text_id: 'Masuk ke Admin Console SealSuite organisasi Anda dan identifikasi: (1) Berapa total anggota yang terdaftar? (2) Berapa perangkat (aset) yang dikelola? (3) Kapan lisensi Anda kedaluwarsa? Screenshot bagian Corporate Overview.',
    },

    // ── Lesson 4: Identity Management ──────────────────────────────────────
    {
      title: 'Identity Management — Users, Departments & Roles',
      title_id: 'Manajemen Identitas — Pengguna, Departemen & Peran',
      type: 'video',
      difficulty: 'intermediate',
      video_url: 'https://www.youtube.com/watch?v=i_yP27Xlw9o',
      xp_reward: 100,
      order_index: 4,
      resources: [
        { type: 'docs', label: 'Managing Departments', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-managing-departments' },
        { type: 'docs', label: 'Managing Users', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-managing-members' },
        { type: 'docs', label: 'Managing Roles', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-managing-roles' },
        { type: 'docs', label: 'Managing Resigned Members', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-managing-resigned-members' },
      ],
      transcript: `Identity Management is the foundation of SealSuite. Before you can configure VPN access, endpoint policies, or DLP rules, you need to have a properly structured directory — your organizational hierarchy, your users, and your roles. In this lesson, we cover how to add departments, create and manage users, assign roles, and handle the important but often overlooked topic of managing resigned members.`,
      transcript_id: `Manajemen Identitas adalah fondasi SealSuite. Sebelum Anda dapat mengkonfigurasi akses VPN, kebijakan endpoint, atau aturan DLP, Anda perlu memiliki direktori yang terstruktur dengan baik — hierarki organisasi, pengguna, dan peran Anda. Dalam pelajaran ini, kita membahas cara menambahkan departemen, membuat dan mengelola pengguna, menetapkan peran, dan menangani topik penting manajemen anggota yang mengundurkan diri.`,
      content: `# Identity Management — Users, Departments & Roles

## Step 1: Build Your Organizational Structure (Directory)

Navigate to **Identity > Directory > Departments** to create your org chart.

\`\`\`mermaid
graph TD
  A[🏢 Company Root] --> B[Engineering]
  A --> C[Finance]
  A --> D[Human Resources]
  A --> E[Sales]
  B --> B1[Frontend Team]
  B --> B2[Backend Team]
  B --> B3[DevOps]
  C --> C1[Accounting]
  C --> C2[Treasury]
\`\`\`

**Best Practice:** Mirror your real organizational chart. SealSuite authorization rules use department membership as a key access factor.

---

## Step 2: Add Members (Users)

Navigate to: **Identity > Directory > Members**

### Adding a Single User:
1. Click **Add Member**
2. Fill in: Name, Phone / Email, Department
3. Optionally assign a **Role**
4. Click **Confirm**
5. Share the initial password with the user (they can find it in their portal)

### Bulk Import:
- Download the import template
- Fill in the CSV with user data
- Upload via the import button

### Onboarding Checklist for New Members:
- [ ] Department assigned
- [ ] Role assigned
- [ ] MFA configured
- [ ] VPN access granted (if applicable)
- [ ] SealSuite client installed

---

## Step 3: Configure Roles

Navigate to: **Identity > Roles**

Roles allow you to group permissions and apply them to multiple users at once. Instead of configuring access individually per user, you create roles like "Developer," "Finance Staff," or "Vendor" and assign them.

| Role | Description | Typical Permissions |
|------|-------------|--------------------| 
| Developer | Engineering staff | VPN to dev servers, code repos |
| Finance | Finance team members | Accounting system, restricted file transfers |
| Vendor | Third-party contractors | Limited access, specific app only, time-limited |

---

## Step 4: Managing Resigned Members

⚠️ **Critical Step:** When an employee leaves, you must properly offboard them in SealSuite to prevent unauthorized access.

Navigate to: **Identity > Directory > Resigned Members**

\`\`\`mermaid
sequenceDiagram
  participant HR as HR Team
  participant A as Admin
  participant S as SealSuite
  HR->>A: Employee John has resigned
  A->>S: Mark John as Resigned
  S->>S: Revoke all active sessions
  S->>S: Remove from all access groups
  S->>S: Disable VPN access
  S->>S: Block SSO to all apps
  S->>S: Archive user data for compliance
  A-->>HR: Offboarding complete ✅
\`\`\`

**Offboarding Actions in SealSuite:**
- Immediately revoke all active sessions
- Remove from all authorization rules
- Disable SSO access to all applications
- Archive activity logs for compliance

---

## Identity Lifecycle Summary

\`\`\`mermaid
stateDiagram-v2
  [*] --> Onboarding: Employee joins
  Onboarding --> Active: Account created, MFA set
  Active --> Transfer: Role or department change
  Transfer --> Active: New permissions applied
  Active --> Offboarding: Employee resigns / terminated
  Offboarding --> Archived: Access revoked, logs preserved
  Archived --> [*]
\`\`\``,

      content_id: `# Manajemen Identitas — Pengguna, Departemen & Peran

## Langkah 1: Bangun Struktur Organisasi (Direktori)

Navigasikan ke **Identity > Directory > Departments** untuk membuat bagan org Anda. Cerminkan struktur organisasi nyata Anda karena aturan otorisasi SealSuite menggunakan keanggotaan departemen sebagai faktor akses utama.

## Langkah 2: Tambahkan Anggota (Pengguna)

Navigasikan ke: **Identity > Directory > Members**

Untuk menambahkan satu pengguna: Klik **Add Member**, isi Nama, Telepon/Email, Departemen, tetapkan Peran opsional, klik **Confirm**. Untuk impor massal, gunakan template CSV yang tersedia.

## Langkah 3: Konfigurasi Peran

Peran memungkinkan Anda mengelompokkan izin dan menerapkannya ke beberapa pengguna sekaligus. Contoh: Developer, Staff Keuangan, Vendor/Kontraktor.

## Langkah 4: Mengelola Anggota yang Mengundurkan Diri

⚠️ **Langkah Kritis:** Saat karyawan keluar, Anda harus melakukan offboarding yang benar di SealSuite. Navigasikan ke: **Identity > Directory > Resigned Members**

Tindakan offboarding mencakup:
- Segera mencabut semua sesi aktif
- Menghapus dari semua grup otorisasi
- Menonaktifkan akses VPN
- Memblokir SSO ke semua aplikasi
- Mengarsipkan data aktivitas untuk kepatuhan

## Siklus Hidup Identitas

\`\`\`mermaid
stateDiagram-v2
  [*] --> Onboarding: Karyawan bergabung
  Onboarding --> Aktif: Akun dibuat, MFA diatur
  Aktif --> Transfer: Perubahan peran atau departemen
  Transfer --> Aktif: Izin baru diterapkan
  Aktif --> Offboarding: Karyawan mengundurkan diri
  Offboarding --> Diarsipkan: Akses dicabut, log disimpan
  Diarsipkan --> [*]
\`\`\``,

      challenge_text: 'Create a mock organizational structure for a company called "TechCorp" with 3 departments (Engineering, Finance, HR) and at least 2 roles per department. Write out the department hierarchy and role-to-access mapping in a table format.',
      challenge_text_id: 'Buat struktur organisasi tiruan untuk perusahaan bernama "TechCorp" dengan 3 departemen (Engineering, Keuangan, HR) dan setidaknya 2 peran per departemen. Tuliskan hierarki departemen dan pemetaan peran-ke-akses dalam format tabel.',
    },

    // ── Lesson 5: Authentication & SSO ─────────────────────────────────────
    {
      title: 'Authentication, MFA & Single Sign-On (SSO)',
      title_id: 'Autentikasi, MFA & Single Sign-On (SSO)',
      type: 'video',
      difficulty: 'intermediate',
      video_url: 'https://www.youtube.com/watch?v=4WM_LjvVIbU',
      xp_reward: 100,
      order_index: 5,
      resources: [
        { type: 'docs', label: 'Setting up Account Systems', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-managing-account-settings' },
        { type: 'docs', label: 'Configuring MFA', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-configuring-multi-factor-authentication-mfa-' },
        { type: 'docs', label: 'Configuring LDAP Login', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-configuring-login-by-ldap-account' },
        { type: 'docs', label: 'Adding SSO Applications', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-add-application' },
      ],
      transcript: `Authentication is the gatekeeper of your entire platform. In this lesson, we cover how to configure the authentication layer in SealSuite, from basic username/password, to multi-factor authentication, to integrating enterprise identity providers like LDAP, OIDC, and SAML. We also cover how to configure SSO applications so employees can access all their tools with a single login.`,
      transcript_id: `Autentikasi adalah penjaga gerbang seluruh platform Anda. Dalam pelajaran ini, kita membahas cara mengkonfigurasi lapisan autentikasi di SealSuite, mulai dari username/password dasar, hingga autentikasi multi-faktor, hingga mengintegrasikan penyedia identitas enterprise seperti LDAP, OIDC, dan SAML. Kita juga membahas cara mengkonfigurasi aplikasi SSO agar karyawan dapat mengakses semua alat mereka dengan satu login.`,
      content: `# Authentication, MFA & Single Sign-On (SSO)

## Authentication Architecture

\`\`\`mermaid
graph TD
  A[Employee Login Attempt] --> B{Authentication Method}
  B --> C[Native Account - Username/Password]
  B --> D[LDAP - Active Directory]
  B --> E[OIDC - Google / Azure AD]
  B --> F[SAML - Enterprise IdP]
  B --> G[RADIUS Protocol]
  B --> H[CAS Authentication]
  C & D & E & F & G & H --> I{MFA Required?}
  I -->|Yes| J[TOTP App / SMS OTP / Hardware Key]
  I -->|No| K[Access Portal]
  J --> K
  K --> L[SSO Access to All Authorized Apps]
  style A fill:#7c3aed,color:#fff
  style L fill:#10b981,color:#fff
\`\`\`

---

## Configuring Multi-Factor Authentication (MFA)

Navigate to: **Identity > Account Settings > Configure MFA**

### MFA Methods Supported:
| Method | Security Level | Best For |
|--------|---------------|---------|
| **TOTP App** (Google Authenticator, Authy) | 🔒🔒🔒 High | Most employees |
| **SMS OTP** | 🔒🔒 Medium | Non-tech users |
| **Hardware Key** (FIDO2/WebAuthn) | 🔒🔒🔒🔒 Very High | Admins, executives |

### MFA Policy Settings:
1. Go to **Identity > Account Settings**
2. Enable **MFA Enforcement**
3. Choose: Required for all / Optional / Required for specific roles
4. Set grace period for first-time setup

> 🛡️ **Admin Best Practice:** Always require MFA for Super Admin accounts and for any user accessing sensitive financial or HR systems.

---

## Integrating External Authentication Sources

### LDAP / Active Directory Integration
Navigate to: **Identity > Account Settings > Configuring login by LDAP account**

Steps:
1. Enter your LDAP server hostname and port (default: 389, SSL: 636)
2. Provide the Bind DN and password for the service account
3. Set the User Search Base (e.g., \`ou=users,dc=company,dc=com\`)
4. Map LDAP attributes to SealSuite fields (username, email, display name)
5. Test connection before saving

### OIDC Integration (Google Workspace, Azure AD, Okta)
Navigate to: **Identity > Account Settings > Third-party Authentication > OIDC**

Required information:
- **Client ID** and **Client Secret** from your IdP
- **Discovery URL** / **Authorization Endpoint**
- **Token Endpoint** and **UserInfo Endpoint**
- **Redirect URI:** Your SealSuite tenant URL + /callback

---

## Configuring SSO Applications

SSO allows employees to access all authorized applications without re-entering credentials.

Navigate to: **Identity > SSO > Add Application**

\`\`\`mermaid
sequenceDiagram
  participant E as Employee
  participant S as SealSuite Portal
  participant A as Target App (e.g. Jira)
  E->>S: Opens SealSuite User Portal
  E->>S: Clicks "Jira" icon
  S->>A: Sends SAML/OIDC assertion (user identity token)
  A-->>E: ✅ Logged in automatically - no password needed!
\`\`\`

### Supported SSO Protocols:
- **SAML 2.0** — Standard enterprise SSO (Salesforce, Jira, ServiceNow)
- **OIDC / OAuth 2.0** — Modern apps (Google Workspace, Microsoft 365)
- **Password Autofill** — For apps without SSO support (auto-fills saved credentials)

### Configuring Application Groups:
Navigate to: **Identity > SSO > Application Group**
- Group related apps together (e.g., "Developer Tools," "Finance Suite")
- Assign access groups to entire departments or roles`,

      content_id: `# Autentikasi, MFA & Single Sign-On (SSO)

## Arsitektur Autentikasi

SealSuite mendukung berbagai metode autentikasi: akun native (username/password), LDAP/Active Directory, OIDC (Google/Azure AD), SAML, RADIUS, dan CAS. Semua metode ini dapat dikombinasikan dengan MFA untuk keamanan berlapis.

## Mengkonfigurasi Multi-Factor Authentication (MFA)

Navigasikan ke: **Identity > Account Settings > Configure MFA**

Metode MFA yang didukung:
- **TOTP App** (Google Authenticator, Authy) - Keamanan tinggi untuk sebagian besar karyawan
- **SMS OTP** - Keamanan menengah untuk pengguna non-teknis
- **Hardware Key** (FIDO2/WebAuthn) - Keamanan sangat tinggi untuk admin dan eksekutif

> 🛡️ **Praktik Terbaik Admin:** Selalu wajibkan MFA untuk akun Super Admin dan pengguna yang mengakses sistem keuangan atau HR sensitif.

## Integrasi Sumber Autentikasi Eksternal

### Integrasi LDAP / Active Directory
Navigasikan ke: **Identity > Account Settings > Configuring login by LDAP account**
Masukkan hostname/port server LDAP, Bind DN, password, dan User Search Base. Petakan atribut LDAP ke field SealSuite.

### Integrasi OIDC (Google Workspace, Azure AD, Okta)
Navigasikan ke: **Identity > Account Settings > Third-party Authentication > OIDC**
Diperlukan: Client ID, Client Secret, Discovery URL, dan Redirect URI.

## Mengkonfigurasi Aplikasi SSO

Navigasikan ke: **Identity > SSO > Add Application**
Protokol SSO yang didukung: SAML 2.0, OIDC/OAuth 2.0, dan Password Autofill untuk aplikasi tanpa dukungan SSO.`,

      challenge_text: 'Your company uses Google Workspace as the primary identity provider. Design the configuration plan for integrating Google Workspace OIDC with SealSuite. List: (1) what information you need to collect from Google Cloud Console, (2) what SealSuite settings to configure, (3) how you would test the integration.',
      challenge_text_id: 'Perusahaan Anda menggunakan Google Workspace sebagai penyedia identitas utama. Rancang rencana konfigurasi untuk mengintegrasikan OIDC Google Workspace dengan SealSuite. Sebutkan: (1) informasi apa yang perlu dikumpulkan dari Google Cloud Console, (2) pengaturan SealSuite apa yang perlu dikonfigurasi, (3) bagaimana Anda akan menguji integrasinya.',
    },

    // ── Lesson 6: VPN Configuration ────────────────────────────────────────
    {
      title: 'Network Security — Configuring VPN Access',
      title_id: 'Keamanan Jaringan — Konfigurasi Akses VPN',
      type: 'video',
      difficulty: 'intermediate',
      video_url: 'https://www.youtube.com/watch?v=vStmEniXgWY',
      xp_reward: 100,
      order_index: 6,
      resources: [
        { type: 'docs', label: 'Quick Start — VPN Setup', url: 'https://docs.byteplus.com/en/docs/sealsuite/quickstart' },
        { type: 'article', label: 'VPN Management Guide', url: 'https://www.sealsuite.com/docs/vpn-gateway/' },
      ],
      transcript: `VPN is one of the most critical components for organizations with remote workers. In SealSuite, VPN goes far beyond a traditional IP tunnel — it is identity-aware, fine-grained, and policy-driven. In this lesson, we walk through adding a VPN gateway, configuring server prerequisites, and setting up ACL policies to control exactly which users can access which internal resources.`,
      transcript_id: `VPN adalah salah satu komponen paling kritis bagi organisasi dengan pekerja jarak jauh. Di SealSuite, VPN jauh melampaui tunnel IP tradisional — ia sadar identitas, terperinci, dan berbasis kebijakan. Dalam pelajaran ini, kita menelusuri penambahan VPN gateway, mengkonfigurasi prasyarat server, dan menyiapkan ACL policy untuk mengontrol tepat siapa yang dapat mengakses sumber daya internal mana.`,
      content: `# Network Security — Configuring VPN Access

## VPN Architecture in SealSuite

Unlike traditional VPN (which grants full network access once connected), SealSuite VPN uses **Zero Trust Network Access (ZTNA)** — users only get access to the specific resources they are authorized for.

\`\`\`mermaid
graph LR
  A[Remote Employee] -->|Authenticates with SealSuite| B[SealSuite VPN Client]
  B -->|Identity + Device verified| C[SealSuite VPN Gateway]
  C -->|Only authorized resources| D[Internal App Server]
  C -->|Only authorized resources| E[Database Server]
  C -->|Blocked - not authorized| F[❌ Finance Server]
  style F fill:#ef4444,color:#fff
  style D fill:#10b981,color:#fff
  style E fill:#10b981,color:#fff
\`\`\`

---

## Step 1: Server Prerequisites

Before adding a VPN Gateway, ensure your Linux server meets:

| Requirement | Minimum Spec | Notes |
|-------------|-------------|-------|
| **CPU** | 4 cores | 8+ recommended for > 100 concurrent users |
| **RAM** | 4 GB | 8 GB recommended |
| **OS** | Ubuntu 20.04+ / CentOS 7+ | Must be x86_64 |
| **Port** | 49900 (default) | Must be reachable from SealSuite cloud AND clients |
| **Network** | Static IP or DDNS | Required for gateway registration |

---

## Step 2: Add VPN Gateway

Navigate to: **VPN > VPN Management > VPN Gateway**

1. Click **Add VPN Gateway**
2. Fill in:
   - **Gateway Name:** e.g., "Singapore Office VPN"
   - **Gateway IP:** Public IP of your server
   - **Gateway Port:** 49900 (or custom)
   - **Tunnel Mode:** Full Tunnel (all traffic through VPN) or Split Tunnel (only internal traffic)
3. Download the gateway deployment script
4. Run the script on your Linux server
5. The gateway will appear as **Online** when connected

---

## Step 3: Configure ACL Policies (Access Control)

By default, a new VPN gateway is **not accessible by anyone**. You must explicitly grant access.

Navigate to: **VPN > Zero Trust Access > ACL Policy**

\`\`\`mermaid
flowchart TD
  A[Create ACL Policy] --> B{Define: Who gets access?}
  B --> C[By Department]
  B --> D[By Role]
  B --> E[By Individual User]
  C & D & E --> F{Define: To what?}
  F --> G[VPN Gateway]
  F --> H[Specific Internal IP Range]
  F --> I[Specific Application]
  G & H & I --> J{Define: When?}
  J --> K[Always]
  J --> L[Business hours only]
  J --> M[Specific date range - for vendors]
  K & L & M --> N[✅ Policy Active]
  style A fill:#7c3aed,color:#fff
  style N fill:#10b981,color:#fff
\`\`\`

### Example ACL Policy Scenarios:

| Scenario | Who | What | When |
|----------|-----|------|------|
| Engineering dev access | Engineering Department | Dev Server IP range | Always |
| Remote Finance access | Finance Role | Accounting server | Business hours |
| Vendor audit access | Specific vendor user | Specific server only | 2-week window |

---

## Split Tunnel vs Full Tunnel

| Mode | Description | When to Use |
|------|-------------|-------------|
| **Full Tunnel** | ALL traffic routes through VPN | High-security environments; full visibility |
| **Split Tunnel** | Only internal traffic through VPN | Better performance; internet goes directly |

---

## VPN Troubleshooting Quick Reference

| Problem | Likely Cause | Solution |
|---------|-------------|---------|
| Gateway shows "Offline" | Port 49900 blocked | Open port in firewall rules |
| User can't connect | No ACL policy assigned | Add user/dept to ACL policy |
| Slow VPN performance | Full tunnel with heavy traffic | Consider split tunnel mode |
| Device blocked | Device Baseline failed | User needs to fix device compliance |`,

      content_id: `# Keamanan Jaringan — Konfigurasi Akses VPN

## Arsitektur VPN di SealSuite

Berbeda dengan VPN tradisional (yang memberikan akses jaringan penuh setelah terhubung), SealSuite VPN menggunakan **Zero Trust Network Access (ZTNA)** — pengguna hanya mendapatkan akses ke sumber daya spesifik yang mereka otorisasi.

## Langkah 1: Prasyarat Server

Pastikan server Linux Anda memenuhi: CPU 4 core (min), RAM 4 GB (min), OS Ubuntu 20.04+/CentOS 7+, Port 49900 terbuka.

## Langkah 2: Tambahkan VPN Gateway

Navigasikan ke: **VPN > VPN Management > VPN Gateway**
1. Klik **Add VPN Gateway**
2. Isi nama gateway, IP, port, mode tunnel
3. Unduh dan jalankan skrip deployment di server Linux Anda
4. Gateway akan muncul **Online** ketika terhubung

## Langkah 3: Konfigurasi ACL Policies (Kontrol Akses)

Secara default, VPN gateway baru **tidak dapat diakses oleh siapapun**. Anda harus secara eksplisit memberikan akses.

Navigasikan ke: **VPN > Zero Trust Access > ACL Policy**

Buat kebijakan yang mendefinisikan: Siapa yang mendapat akses (per departemen/peran/individu), Ke apa (gateway/IP range/aplikasi), Kapan (selalu/jam kerja/rentang tanggal).

## Split Tunnel vs Full Tunnel

| Mode | Deskripsi | Kapan Digunakan |
|------|-----------|-----------------|
| **Full Tunnel** | Semua traffic melalui VPN | Lingkungan keamanan tinggi |
| **Split Tunnel** | Hanya traffic internal melalui VPN | Performa lebih baik |`,

      challenge_text: 'Design a VPN access matrix for a company with 4 teams: Engineering (50 people), Finance (15 people), Sales (30 people), and 3 external Vendors. For each team, define: (1) what internal resources they should access via VPN, (2) what tunnel mode is appropriate, (3) what time restrictions (if any) apply.',
      challenge_text_id: 'Rancang matriks akses VPN untuk perusahaan dengan 4 tim: Engineering (50 orang), Keuangan (15 orang), Sales (30 orang), dan 3 Vendor eksternal. Untuk setiap tim, tentukan: (1) sumber daya internal apa yang dapat mereka akses via VPN, (2) mode tunnel yang tepat, (3) pembatasan waktu apa yang berlaku.',
    },

    // ── Lesson 7: Endpoint Security & DLP ──────────────────────────────────
    {
      title: 'Endpoint Security & Data Loss Prevention (DLP)',
      title_id: 'Keamanan Endpoint & Pencegahan Kehilangan Data (DLP)',
      type: 'video',
      difficulty: 'intermediate',
      video_url: 'https://www.youtube.com/watch?v=gPlrcohCglE',
      xp_reward: 100,
      order_index: 7,
      resources: [
        { type: 'docs', label: 'Endpoint Overview', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-product-advantages' },
        { type: 'article', label: 'SealSuite DLP Endpoint Guide', url: 'https://www.sealsuite.com/docs/dlp-overview/' },
        { type: 'article', label: 'Secure File Transfers with SealSuite DLP', url: 'https://www.youtube.com/playlist?list=PLfK625JcyPTcnOBbL4lrIYEtdUhYfqzlS' },
      ],
      transcript: `Endpoint Security and Data Loss Prevention are two of the most important features for organizations dealing with sensitive data — healthcare records, financial data, intellectual property, or personal information. In this lesson, we cover device baseline policies, the asset management system, DLP data collection policies, and outbound control rules. By the end, you will be able to design a comprehensive endpoint and data security strategy.`,
      transcript_id: `Keamanan Endpoint dan Data Loss Prevention adalah dua fitur terpenting bagi organisasi yang menangani data sensitif — catatan kesehatan, data keuangan, kekayaan intelektual, atau informasi pribadi. Dalam pelajaran ini, kita membahas kebijakan device baseline, sistem manajemen aset, kebijakan pengumpulan data DLP, dan aturan kontrol keluar. Di akhir pelajaran, Anda akan dapat merancang strategi keamanan endpoint dan data yang komprehensif.`,
      content: `# Endpoint Security & Data Loss Prevention (DLP)

## Part 1: Endpoint Security — Asset Management

### The Asset Lifecycle in SealSuite
When a user installs the SealSuite client and logs in, their device is automatically registered as an **Asset**.

\`\`\`mermaid
graph LR
  A[User installs SealSuite client] --> B[Device auto-registers as Asset]
  B --> C[System collects device info]
  C --> D[Device Baseline scan runs]
  D --> E{Compliant?}
  E -->|Yes| F[Full access granted]
  E -->|No| G[Restricted or blocked]
  G --> H[User fixes issue]
  H --> D
  style F fill:#10b981,color:#fff
  style G fill:#ef4444,color:#fff
\`\`\`

Navigate to: **Endpoint > Assets > Asset List** to see all registered devices with:
- Device name, OS version, last login time
- Installed software inventory
- Baseline compliance status
- Login history

---

## Part 2: Device Baseline Policy

Navigate to: **Endpoint > Endpoint Control > Endpoint Baseline**

### Creating a Baseline Policy:
1. Click **New Policy**
2. Select target: All devices / Specific department / Specific OS
3. Configure check items:

| Check Category | Examples |
|---------------|---------|
| **Security Software** | Antivirus active, Anti-malware present |
| **OS Security** | Windows Updates enabled, patches current |
| **Access Control** | Screen lock enabled, password complexity |
| **Storage Security** | BitLocker / FileVault encryption ON |
| **Software Compliance** | Required tools installed; prohibited apps absent |

4. Set **Response Action** when non-compliant:
   - Warn user (reminder notification)
   - Restrict network access (partial block)
   - Block access completely

---

## Part 3: Anti-Virus Policy

Navigate to: **Endpoint > Endpoint Control > Anti-Virus Policy**

\`\`\`mermaid
graph TD
  A[Anti-Virus Policy] --> B[Set Threat Risk Levels]
  B --> B1[Low - Log only]
  B --> B2[Medium - Quarantine file]
  B --> B3[High - Isolate device]
  A --> C[Configure Real-time Scanning]
  C --> C1[File system access scan]
  C --> C2[Download scan]
  C --> C3[Email attachment scan]
  A --> D[Define File Isolation Rules]
  D --> D1[Quarantine folder location]
  D --> D2[Auto-delete after X days]
\`\`\`

---

## Part 4: Data Loss Prevention (DLP)

### DLP Architecture

\`\`\`mermaid
graph TD
  A[DLP System] --> B[eDiscovery - Data Collection Policy]
  A --> C[Outbound Control]
  A --> D[Peripheral Control]
  A --> E[Watermarking]
  B --> B1[Scan local drives for sensitive data]
  B --> B2[Classify by content type - PII, Financial, IP]
  B --> B3[Map data distribution]
  C --> C1[Control USB/external drive transfers]
  C --> C2[Control uploads to cloud apps]
  C --> C3[Control email attachments]
  C --> C4[Block screenshot/screen recording]
  D --> D1[Block all USB storage]
  D --> D2[Allow specific approved drives only]
  E --> E1[Dynamic watermark on screen captures]
  E --> E2[Printed document watermarks]
\`\`\`

### Configuring eDiscovery (Data Collection Policy)
Navigate to: **DLP > eDiscovery > Data Collection Policy**

1. Click **Create New Policy**
2. Define **Collection Scope:** All endpoints / Department / Specific users
3. Set **Scan Path:** Which folders/drives to scan (or exclude)
4. Set **Schedule:** Real-time / Daily / Weekly
5. Enable **AI Classification** for automatic sensitive data detection
6. Click **Confirm**

### Configuring Outbound Control
Navigate to: **DLP > Strategy Center > Document Outgoing Control**

1. Create rule or use a built-in template
2. Define **Trigger conditions:** File type, size, content keywords, classification
3. Set **Action:**
   - **Audit only:** Log the event, allow the transfer
   - **Warn:** Notify user but allow with confirmation
   - **Block:** Prevent the transfer entirely
4. Set **Scope:** All users / Department / Role

---

## DLP Monitoring & Reports

Navigate to: **DLP > Reports**

Key reports available:
- **Data Leakage Events:** All detected policy violations
- **Sensitive File Map:** Visual map of where sensitive data lives
- **Transfer History:** All file transfer activities by user
- **Peripheral Activity:** USB connections, print jobs`,

      content_id: `# Keamanan Endpoint & Pencegahan Kehilangan Data (DLP)

## Bagian 1: Manajemen Aset Endpoint

Saat pengguna menginstal klien SealSuite dan masuk, perangkat mereka otomatis terdaftar sebagai **Aset**. Navigasikan ke: **Endpoint > Assets > Asset List** untuk melihat semua perangkat terdaftar dengan informasi sistem, inventaris software, dan status kepatuhan baseline.

## Bagian 2: Kebijakan Device Baseline

Navigasikan ke: **Endpoint > Endpoint Control > Endpoint Baseline**

Buat kebijakan yang memeriksa: Software keamanan (antivirus aktif), keamanan OS (patch terkini), kontrol akses (screen lock), keamanan penyimpanan (enkripsi), dan kepatuhan software.

Tetapkan tindakan respons saat tidak patuh: Peringatkan pengguna, batasi akses jaringan, atau blokir akses sepenuhnya.

## Bagian 3: Data Loss Prevention (DLP)

DLP SealSuite terdiri dari empat komponen utama:
1. **eDiscovery:** Pindai drive lokal untuk data sensitif dan klasifikasikan berdasarkan jenis konten (PII, Keuangan, IP)
2. **Outbound Control:** Kontrol transfer ke USB, upload ke cloud, lampiran email, screenshot
3. **Peripheral Control:** Blokir semua penyimpanan USB atau izinkan hanya drive yang disetujui
4. **Watermarking:** Watermark dinamis pada tangkapan layar dan dokumen yang dicetak

### Mengkonfigurasi eDiscovery
Navigasikan ke: **DLP > eDiscovery > Data Collection Policy**
Buat kebijakan dengan mendefinisikan scope koleksi, jalur pemindaian, jadwal, dan klasifikasi AI.

### Mengkonfigurasi Outbound Control
Navigasikan ke: **DLP > Strategy Center > Document Outgoing Control**
Buat aturan dengan mendefinisikan kondisi pemicu, tindakan (audit/peringatan/blokir), dan scope.`,

      challenge_text: 'A healthcare company needs to prevent patient medical records (PDF files containing names and diagnosis codes) from being copied to USB drives or uploaded to personal cloud storage. Design the DLP policy configuration: (1) eDiscovery scan settings, (2) Outbound control rule for USB, (3) Outbound control rule for cloud uploads.',
      challenge_text_id: 'Sebuah perusahaan healthcare perlu mencegah rekam medis pasien (file PDF berisi nama dan kode diagnosis) disalin ke drive USB atau diunggah ke penyimpanan cloud pribadi. Rancang konfigurasi kebijakan DLP: (1) Pengaturan pemindaian eDiscovery, (2) Aturan kontrol outbound untuk USB, (3) Aturan kontrol outbound untuk upload cloud.',
    },

    // ── Lesson 8: Dynamic Control Engine ───────────────────────────────────
    {
      title: 'Dynamic Control — Automated Risk Response',
      title_id: 'Dynamic Control — Respons Risiko Otomatis',
      type: 'video',
      difficulty: 'advanced',
      video_url: 'https://www.youtube.com/watch?v=KWa7_IwuNKE',
      xp_reward: 125,
      order_index: 8,
      resources: [
        { type: 'docs', label: 'SealSuite Operation Instructions', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-operation-instructions' },
        { type: 'article', label: 'Control Cloud App Access with SealSuite SWG', url: 'https://www.youtube.com/playlist?list=PLfK625JcyPTcnOBbL4lrIYEtdUhYfqzlS' },
      ],
      transcript: `The Dynamic Control Engine is SealSuite's most powerful capability — an AI-native, real-time risk response system that continuously monitors all platform signals and automatically takes action when threats are detected. This is what transforms SealSuite from a passive security product into an active, self-defending security platform. In this lesson, we cover how to create control policies, configure trigger conditions, and set automated response actions.`,
      transcript_id: `Mesin Dynamic Control adalah kemampuan SealSuite yang paling kuat — sistem respons risiko real-time berbasis AI yang terus memantau semua sinyal platform dan secara otomatis mengambil tindakan ketika ancaman terdeteksi. Inilah yang mengubah SealSuite dari produk keamanan pasif menjadi platform keamanan aktif dan self-defending. Dalam pelajaran ini, kita membahas cara membuat control policies, mengkonfigurasi kondisi pemicu, dan menetapkan tindakan respons otomatis.`,
      content: `# Dynamic Control — Automated Risk Response

## How the Dynamic Control Engine Works

The Dynamic Control Engine continuously aggregates data from all SealSuite modules:

\`\`\`mermaid
graph TD
  A[Data Sources] --> E[Dynamic Control Engine]
  A1[Identity Events - Login anomalies] --> A
  A2[Device Health - Baseline failures] --> A
  A3[Network Activity - VPN anomalies] --> A
  A4[DLP Events - Policy violations] --> A
  A5[Endpoint Activity - Software changes] --> A
  E --> F{Risk Score Calculation}
  F -->|Low Risk| G[Log and monitor]
  F -->|Medium Risk| H[Alert admin]
  F -->|High Risk| I[Automated Response]
  I --> I1[Revoke VPN access]
  I --> I2[Block device from network]
  I --> I3[Force re-authentication]
  I --> I4[Send alert to admin + user]
  I --> I5[Log to audit trail]
  style E fill:#7c3aed,color:#fff
  style I fill:#ef4444,color:#fff
\`\`\`

---

## Creating a Control Policy

Navigate to: **Dynamic Control > Control Policies**

1. Click **New Policy**
2. Define **Trigger Conditions (IF):**

| Trigger Type | Example Scenarios |
|-------------|------------------|
| **Identity** | Failed login attempts > 5 in 10 minutes |
| **Device** | Device Baseline suddenly fails |
| **Network** | Unusual large data transfer detected |
| **DLP** | Sensitive file copied to USB |
| **Endpoint** | Security software uninstalled |
| **Geography** | Login from an unexpected country |

3. Set **Response Actions (THEN):**

| Action | Description |
|--------|-------------|
| **Alert Admin** | Push notification + email to specified admins |
| **Alert User** | Notify the user about the detected risk |
| **Block Device** | Prevent device from accessing network |
| **Revoke VPN** | Terminate active VPN sessions |
| **Force Re-auth** | Require user to re-authenticate with MFA |
| **Lock Account** | Temporarily disable the user account |
| **Collect Evidence** | Capture screenshots / activity logs |

4. Set **Priority** (1 = highest)
5. **Enable** the policy

---

## Example Policy Configurations

### Policy 1: Brute Force Attack Detection
- **Trigger:** Failed logins > 10 in 15 minutes from same user
- **Action:** Lock account for 30 minutes + Alert Security Admin
- **Priority:** 1 (highest)

### Policy 2: Device Compromise Response
- **Trigger:** Device Baseline fails for antivirus
- **Action:** Revoke VPN access + Block corporate Wi-Fi + Alert IT Admin + Notify user
- **Priority:** 1

### Policy 3: Data Exfiltration Alert
- **Trigger:** DLP detects > 100 MB transferred to USB in 1 hour
- **Action:** Block further USB transfers + Alert DLP team + Capture screenshot
- **Priority:** 2

### Policy 4: Shadow IT Detection
- **Trigger:** SWG detects access to unapproved cloud storage
- **Action:** Block access + Alert manager + Log activity
- **Priority:** 3

---

## Monitoring & Remediation Logs

Navigate to: **Dynamic Control > Remediation Logs**

The remediation log shows every automated action taken:
- Timestamp of the trigger event
- Which policy was triggered
- What user/device was affected
- What action was taken
- Whether the action was successful

> 💡 **Admin Tip:** Review remediation logs weekly. If policies are triggering too frequently on legitimate activities, adjust the thresholds. Fine-tuning policies based on real-world data is essential for reducing false positives.

---

## AI-Enhanced Security Operations

SealSuite's Dynamic Control Engine uses AI to:
1. **Establish behavioral baselines** for each user and device
2. **Detect anomalies** that deviate from the baseline
3. **Score risk** based on the severity and context of the anomaly
4. **Recommend policies** based on your organization's threat patterns

This means the system gets smarter over time as it learns what is normal for your organization.`,

      content_id: `# Dynamic Control — Respons Risiko Otomatis

## Cara Kerja Mesin Dynamic Control

Mesin Dynamic Control terus mengagregasi data dari semua modul SealSuite: peristiwa identitas, kesehatan perangkat, aktivitas jaringan, peristiwa DLP, dan aktivitas endpoint. Berdasarkan data ini, ia menghitung skor risiko dan mengambil tindakan yang sesuai secara otomatis.

## Membuat Control Policy

Navigasikan ke: **Dynamic Control > Control Policies**

1. Klik **New Policy**
2. Tentukan **Kondisi Pemicu (IF):** Login gagal berulang, baseline perangkat gagal, transfer data tidak biasa, file sensitif disalin ke USB, software keamanan dihapus, login dari negara tidak terduga
3. Tetapkan **Tindakan Respons (THEN):** Peringatan admin/pengguna, blokir perangkat, cabut VPN, paksa re-auth, kunci akun, atau kumpulkan bukti
4. Tetapkan **Prioritas** dan **Aktifkan** kebijakan

## Pemantauan & Log Remediasi

Navigasikan ke: **Dynamic Control > Remediation Logs**

Log remediasi menampilkan setiap tindakan otomatis yang diambil: timestamp, kebijakan yang dipicu, pengguna/perangkat yang terpengaruh, tindakan yang diambil.

> 💡 **Tips Admin:** Tinjau log remediasi setiap minggu. Jika kebijakan terlalu sering dipicu pada aktivitas yang sah, sesuaikan ambang batasnya.`,

      challenge_text: 'Design 3 Dynamic Control policies for a financial services company. For each policy, specify: (1) Trigger condition with specific thresholds, (2) Automated response actions, (3) Which admin team gets alerted, (4) Why this policy is important for financial data protection.',
      challenge_text_id: 'Rancang 3 kebijakan Dynamic Control untuk perusahaan jasa keuangan. Untuk setiap kebijakan, tentukan: (1) Kondisi pemicu dengan ambang batas spesifik, (2) Tindakan respons otomatis, (3) Tim admin mana yang mendapat peringatan, (4) Mengapa kebijakan ini penting untuk perlindungan data keuangan.',
    },

    // ── Lesson 9: Workflows ─────────────────────────────────────────────────
    {
      title: 'Workflow Management — Onboarding, Transfers & Offboarding',
      title_id: 'Manajemen Workflow — Onboarding, Transfer & Offboarding',
      type: 'text',
      difficulty: 'intermediate',
      xp_reward: 75,
      order_index: 9,
      resources: [
        { type: 'docs', label: 'Quick Start Guide - Workflow', url: 'https://docs.byteplus.com/en/docs/sealsuite/quickstart' },
      ],
      content: `# Workflow Management — Onboarding, Transfers & Offboarding

Employee lifecycle management is one of the most operationally critical functions for an IT administrator. SealSuite provides **automated workflow capabilities** through its **Enterprise Settings > Workflow** module.

## The Employee Lifecycle in SealSuite

\`\`\`mermaid
graph LR
  A[🆕 New Hire] -->|HR triggers onboarding| B[Onboarding Workflow]
  B --> B1[Account created]
  B --> B2[Department assigned]
  B --> B3[Role & permissions set]
  B --> B4[VPN access granted]
  B --> B5[Welcome email sent]
  B5 --> C[✅ Active Employee]
  C -->|Role or dept change| D[Transfer Workflow]
  D --> D1[Old permissions revoked]
  D --> D2[New dept/role assigned]
  D --> D3[New permissions applied]
  D3 --> C
  C -->|Employee leaves| E[Offboarding Workflow]
  E --> E1[All sessions terminated]
  E --> E2[VPN access revoked]
  E --> E3[SSO disabled]
  E --> E4[Account archived]
  E --> F[🔒 Offboarded - Archived]
  style A fill:#3b82f6,color:#fff
  style C fill:#10b981,color:#fff
  style F fill:#6b7280,color:#fff
\`\`\`

---

## Onboarding Workflow

Navigate to: **Enterprise Settings > Workflow > Onboarding**

### Standard Onboarding Checklist:

1. **Create User Account**
   - Name, email, phone
   - Department and reporting structure
   - Employee ID (if using custom attributes)

2. **Assign Roles & Permissions**
   - Select appropriate role(s) based on job function
   - Confirm access to required resources (VPN gateways, SSO apps)

3. **Configure Authentication**
   - Send initial login credentials securely
   - Require MFA setup on first login
   - If LDAP-integrated: ensure AD account is synced

4. **Device Registration**
   - Guide employee to install SealSuite client
   - Wait for device to appear in Asset List
   - Verify Device Baseline compliance

5. **Access Verification**
   - Confirm VPN connectivity
   - Test SSO access to authorized applications
   - Verify DLP policies are applied

---

## Transfer Workflow (Role/Department Changes)

When an employee changes roles or departments:

1. **Update Department** in Identity > Directory
2. **Change Role** assignments
3. **Review and adjust** VPN ACL policies
4. **Review and adjust** DLP policies for new data access level
5. **Revoke old permissions** that no longer apply

> ⚠️ **Critical:** The principle of **least privilege** — remove all permissions from the old role before granting new ones. Never accumulate excess permissions over time.

---

## Offboarding Workflow

Navigate to: **Enterprise Settings > Workflow > Offboarding**

### Immediate Actions (Day of departure):
| Action | Location in Admin Console |
|--------|--------------------------|
| Terminate all active sessions | Identity > Members > [User] > Sessions |
| Revoke VPN access | VPN > ACL Policies > Remove user |
| Disable SSO access | Identity > SSO > Remove from apps |
| Change account password | Identity > Members > [User] > Reset |
| Mark as resigned | Identity > Directory > Resigned Members |

### Post-Departure Actions (Within 30 days):
- Export and archive user activity logs
- Review which shared accounts/credentials they had access to
- Rotate passwords for any shared systems
- Delete or reassign owned resources (files, projects)
- Confirm compliance audit trail is preserved

---

## Sync Timing

> ⏱️ **Important:** All permission changes in the Admin Console take up to **10 minutes** to synchronize to the SealSuite client on endpoint devices. Plan accordingly for time-sensitive offboarding.

---

## Automating Workflows with HR System Integration

SealSuite can integrate with HRIS (Human Resources Information Systems) to automate onboarding/offboarding triggers:

- **SCIM Provisioning:** Sync user accounts automatically when HR creates/modifies/deactivates them
- **Webhook Triggers:** Trigger SealSuite workflows from HR system events
- **API Integration:** Custom integration via SealSuite API`,

      content_id: `# Manajemen Workflow — Onboarding, Transfer & Offboarding

SealSuite menyediakan kemampuan **workflow otomatis** melalui modul **Enterprise Settings > Workflow** untuk mengelola siklus hidup karyawan secara efisien.

## Onboarding Workflow

Navigasikan ke: **Enterprise Settings > Workflow > Onboarding**

Checklist onboarding standar:
1. Buat akun pengguna (nama, email, telepon, departemen)
2. Tetapkan peran & izin
3. Konfigurasi autentikasi (kirim kredensial awal, wajibkan MFA)
4. Registrasi perangkat (instal klien SealSuite, verifikasi kepatuhan baseline)
5. Verifikasi akses (konektivitas VPN, akses SSO, kebijakan DLP)

## Workflow Transfer (Perubahan Peran/Departemen)

Saat karyawan berganti peran atau departemen:
1. Perbarui departemen di Identity > Directory
2. Ubah penetapan peran
3. Tinjau dan sesuaikan kebijakan VPN ACL
4. Cabut izin lama yang tidak lagi berlaku

> ⚠️ **Kritis:** Prinsip **least privilege** — hapus semua izin dari peran lama sebelum memberikan yang baru.

## Workflow Offboarding

Tindakan segera (hari keberangkatan): Hentikan semua sesi aktif, cabut akses VPN, nonaktifkan SSO, ganti password, tandai sebagai mengundurkan diri.

Tindakan pasca-keberangkatan: Arsipkan log aktivitas, tinjau akses akun bersama, rotasi password untuk sistem bersama.

> ⏱️ **Penting:** Semua perubahan izin membutuhkan waktu hingga **10 menit** untuk disinkronkan ke klien SealSuite.`,

      challenge_text: 'Create a detailed offboarding SOP (Standard Operating Procedure) for when a senior engineer with admin-level access to 3 internal servers, VPN gateway management rights, and access to the company\'s AWS environment leaves the company. List every step in chronological order with the responsible party (IT Admin, HR, Manager).',
      challenge_text_id: 'Buat SOP (Standard Operating Procedure) offboarding terperinci saat seorang engineer senior dengan akses admin-level ke 3 server internal, hak manajemen VPN gateway, dan akses ke lingkungan AWS perusahaan meninggalkan perusahaan. Sebutkan setiap langkah secara kronologis beserta pihak yang bertanggung jawab (IT Admin, HR, Manager).',
    },

    // ── Lesson 10: Admin Assessment ─────────────────────────────────────────
    {
      title: 'Administrator Certification Assessment',
      title_id: 'Penilaian Sertifikasi Administrator',
      type: 'quiz',
      difficulty: 'intermediate',
      xp_reward: 200,
      order_index: 10,
      content: '### SealSuite Administrator Certification\n\nThis final assessment tests your knowledge across all administrator topics covered in this course. You must demonstrate understanding of Zero Trust concepts, platform configuration, and security best practices.',
      quizzes: [
        {
          question: 'In SealSuite\'s Zero Trust model, which combination of factors is evaluated before granting network access?',
          options: [
            'IP address + Username only',
            'Username + Device health + Authorization rules + Continuous monitoring',
            'Password strength + Department membership only',
            'Time of day + Geographic location only'
          ],
          correct_answer: 1,
          explanation: 'Zero Trust evaluates multiple factors simultaneously: the user\'s verified identity (via MFA/SSO), the device\'s health status (via Device Baseline), authorization rules (who can access what), and then continues monitoring via the Dynamic Control engine after access is granted.'
        },
        {
          question: 'A new VPN gateway has just been deployed. Why can no users connect to it immediately?',
          options: [
            'The gateway needs to restart after installation',
            'SealSuite requires 24 hours for gateway registration',
            'No ACL Policy has been created to grant access — all new gateways have no access by default',
            'Users need to install a separate VPN client first'
          ],
          correct_answer: 2,
          explanation: 'By design, new VPN gateways in SealSuite are locked — no user can access them until an administrator explicitly creates an ACL Policy granting specific users, departments, or roles access. This is a Zero Trust principle: deny by default.'
        },
        {
          question: 'What is the correct first step when an employee is confirmed to be leaving the company today?',
          options: [
            'Wait for HR to process paperwork before taking any IT action',
            'Immediately terminate all active sessions and revoke VPN access from the Admin Console',
            'Only change their password and wait for the account to expire naturally',
            'Send a reminder email asking them to close all applications'
          ],
          correct_answer: 1,
          explanation: 'Security best practice requires immediate action: terminate all active sessions and revoke VPN/SSO access the moment it is confirmed an employee is leaving. Waiting for HR paperwork creates a security window where the departing employee retains access.'
        },
        {
          question: 'A Device Baseline check fails on an employee\'s laptop because antivirus is disabled. What happens next (with a properly configured policy)?',
          options: [
            'The user\'s account is permanently deleted',
            'Nothing happens — baseline failures are just logged',
            'The laptop is automatically blocked from network access until the antivirus is re-enabled and the device re-scans',
            'The user receives a warning but can continue working normally'
          ],
          correct_answer: 2,
          explanation: 'With a properly configured Device Baseline policy set to "Restrict Network Access" on failure, the device is immediately blocked from the corporate network. The user must fix the compliance issue (re-enable antivirus), after which a rescan will restore access. This enforces security without requiring manual admin intervention.'
        },
        {
          question: 'Which module in SealSuite is responsible for monitoring user behavior in real-time and automatically revoking access when a suspicious pattern is detected?',
          options: [
            'Identity Management (IAM)',
            'Device Baseline',
            'Dynamic Control Engine',
            'DLP eDiscovery'
          ],
          correct_answer: 2,
          explanation: 'The Dynamic Control Engine is SealSuite\'s AI-driven continuous monitoring and automated response system. It aggregates signals from all modules (identity, device, network, DLP) and can automatically take actions like revoking access, forcing re-authentication, or alerting admins when risk thresholds are exceeded.'
        }
      ]
    }
  ],


  // ═══════════════════════════════════════════════════════════════════════════
  // COURSE 2: SealSuite for End Users
  // ═══════════════════════════════════════════════════════════════════════════
  "SealSuite for End Users": [

    // ── Lesson 1: Welcome ───────────────────────────────────────────────────
    {
      title: 'Welcome to SealSuite — What You Need to Know',
      title_id: 'Selamat Datang di SealSuite — Yang Perlu Anda Ketahui',
      type: 'video',
      difficulty: 'beginner',
      video_url: 'https://www.youtube.com/watch?v=1lsPACR-zcc',
      xp_reward: 50,
      order_index: 1,
      resources: [
        { type: 'docs', label: 'Using the User Portal', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-viewing-sealsuite-portal' },
        { type: 'article', label: 'Download SealSuite Client', url: 'https://www.sealsuite.com/download/' },
      ],
      transcript: `Welcome! This course is designed for employees — people like you who use SealSuite every day as part of their work. You don't need to be an IT expert to understand SealSuite. In fact, SealSuite was designed to make YOUR work life easier and more secure. In this lesson, we'll explain what SealSuite is, why your organization uses it, and what it means for you day-to-day.`,
      transcript_id: `Selamat datang! Kursus ini dirancang untuk karyawan — orang-orang seperti Anda yang menggunakan SealSuite setiap hari sebagai bagian dari pekerjaan mereka. Anda tidak perlu menjadi ahli IT untuk memahami SealSuite. Faktanya, SealSuite dirancang untuk membuat kehidupan kerja Anda lebih mudah dan lebih aman. Dalam pelajaran ini, kita akan menjelaskan apa itu SealSuite, mengapa organisasi Anda menggunakannya, dan apa artinya bagi Anda sehari-hari.`,
      content: `# Welcome to SealSuite

## What is SealSuite?

SealSuite is the **security app your organization has installed** to protect company data and make your digital work life simpler. Think of it as your **all-in-one digital key** to your company's resources.

\`\`\`mermaid
graph LR
  A[👤 You] -->|SealSuite| B[🔑 One Login]
  B --> C[🌐 Corporate Apps - Jira, Salesforce, etc.]
  B --> D[🔒 VPN - Internal Network]
  B --> E[📧 Email & Collaboration Tools]
  B --> F[☁️ Cloud Services]
  style A fill:#7c3aed,color:#fff
  style B fill:#3b82f6,color:#fff
\`\`\`

## What SealSuite Does For You

| Before SealSuite | After SealSuite |
|-----------------|-----------------|
| Multiple passwords for different apps | **One account** for everything |
| Separate VPN app to install and configure | **One-click VPN** built right in |
| No clear way to know if your device is secure | **Automatic security checks** in the background |
| Password reset requests for every system | **Self-service** account management |

## What SealSuite Does NOT Do

It's important to understand what SealSuite is NOT:

- ❌ It does NOT read your personal messages or files
- ❌ It does NOT monitor your personal browsing (outside of work hours on personal devices)
- ✅ It DOES monitor file transfers involving corporate data
- ✅ It DOES ensure your device meets security requirements for accessing company resources

## Why Your Organization Uses SealSuite

Your organization handles sensitive information — customer data, financial records, proprietary business information. SealSuite protects this data by:

1. **Verifying your identity** before granting access (preventing impersonation)
2. **Checking your device's health** (preventing compromised devices from accessing sensitive data)
3. **Controlling data transfers** (preventing accidental or intentional data leakage)
4. **Providing secure remote access** (so you can work from anywhere safely)`,

      content_id: `# Selamat Datang di SealSuite

## Apa itu SealSuite?

SealSuite adalah **aplikasi keamanan yang dipasang organisasi Anda** untuk melindungi data perusahaan dan membuat kehidupan kerja digital Anda lebih sederhana. Anggap saja sebagai **kunci digital all-in-one** untuk sumber daya perusahaan Anda.

## Yang SealSuite Lakukan untuk Anda

| Sebelum SealSuite | Setelah SealSuite |
|-------------------|-------------------|
| Beberapa password untuk berbagai aplikasi | **Satu akun** untuk segalanya |
| Aplikasi VPN terpisah untuk diinstal | **VPN satu klik** sudah terintegrasi |
| Tidak ada cara jelas mengetahui keamanan perangkat | **Pemeriksaan keamanan otomatis** di latar belakang |
| Permintaan reset password untuk setiap sistem | Manajemen akun **layanan mandiri** |

## Yang SealSuite TIDAK Lakukan

- ❌ TIDAK membaca pesan atau file pribadi Anda
- ❌ TIDAK memantau penjelajahan pribadi Anda (di luar jam kerja pada perangkat pribadi)
- ✅ MEMANG memantau transfer file yang melibatkan data perusahaan
- ✅ MEMANG memastikan perangkat Anda memenuhi persyaratan keamanan

## Mengapa Organisasi Anda Menggunakan SealSuite

Organisasi Anda menangani informasi sensitif. SealSuite melindungi data ini dengan memverifikasi identitas Anda, memeriksa kesehatan perangkat, mengendalikan transfer data, dan menyediakan akses jarak jauh yang aman.`,

      challenge_text: 'In your own words, explain to a non-technical colleague why your organization uses SealSuite. Focus on the employee benefits: what problems does it solve for them personally? Write 3-5 sentences.',
      challenge_text_id: 'Dengan kata-kata Anda sendiri, jelaskan kepada rekan yang non-teknis mengapa organisasi Anda menggunakan SealSuite. Fokus pada manfaat untuk karyawan: masalah apa yang diselesaikannya untuk mereka secara pribadi? Tulis 3-5 kalimat.',
    },

    // ── Lesson 2: Getting Started ───────────────────────────────────────────
    {
      title: 'Getting Started: Login & First Setup',
      title_id: 'Mulai: Login & Pengaturan Pertama',
      type: 'video',
      difficulty: 'beginner',
      video_url: 'https://www.youtube.com/watch?v=cQv7Pg5v3gM',
      xp_reward: 50,
      order_index: 2,
      resources: [
        { type: 'article', label: 'Download SealSuite Client', url: 'https://www.sealsuite.com/download/' },
        { type: 'docs', label: 'Quick Start Guide', url: 'https://docs.byteplus.com/en/docs/sealsuite/quickstart' },
      ],
      transcript: `In this lesson, we walk through the very first steps of setting up SealSuite on your device. We cover downloading the client, logging in for the first time with your corporate credentials, setting up multi-factor authentication, and navigating the user portal.`,
      transcript_id: `Dalam pelajaran ini, kita menelusuri langkah pertama pengaturan SealSuite di perangkat Anda. Kita membahas mengunduh klien, masuk untuk pertama kali dengan kredensial perusahaan Anda, menyiapkan autentikasi multi-faktor, dan menavigasi portal pengguna.`,
      content: `# Getting Started: Login & First Setup

## Step 1: Download the SealSuite Client

Your IT department will provide you with the download link, or you can visit: **https://www.sealsuite.com/download/**

Available for:
- 🖥️ Windows (Windows 10/11)
- 🍎 macOS (10.15 Catalina and above)
- 📱 Android (7.0+)
- 📱 iOS (13.0+)
- 🐧 Linux (Ubuntu 18.04+)

## Step 2: First Login

1. Open the SealSuite client
2. Enter your **Tenant ID** (provided by your IT department — looks like a company name or code)
3. Enter your **username** (usually your work email)
4. Enter the **initial password** provided by your administrator
5. You will be prompted to change your password immediately

## Step 3: Set Up Multi-Factor Authentication (MFA)

\`\`\`mermaid
sequenceDiagram
  participant Y as You
  participant S as SealSuite
  participant A as Auth App (Google Auth)
  Y->>S: First login with new password
  S->>Y: MFA Setup required
  Y->>A: Install Google Authenticator / Authy
  S->>Y: Show QR code
  Y->>A: Scan QR code
  A-->>Y: Generates 6-digit OTP codes
  Y->>S: Enter 6-digit code to verify
  S-->>Y: ✅ MFA setup complete!
\`\`\`

### Popular MFA Apps:
- **Google Authenticator** (Android / iOS) — Most common
- **Microsoft Authenticator** (Android / iOS) — Good for Microsoft environments
- **Authy** (Android / iOS / Desktop) — Best for multiple devices

## Step 4: Explore the User Portal

After logging in, open the **SealSuite User Portal** (URL provided by IT):

| Section | What You Can Do |
|---------|----------------|
| **My Apps** | One-click access to all your authorized corporate applications |
| **Announcements** | Company notices from IT / HR |
| **Downloads** | Latest SealSuite client versions |
| **My Account** | Change password, manage devices, view activity logs |

## First-Time Setup Checklist

- [ ] SealSuite client installed
- [ ] Initial password changed
- [ ] MFA app set up and verified
- [ ] Can access the User Portal
- [ ] At least one corporate app accessible via SSO
- [ ] VPN connectivity tested (if your role requires it)`,

      content_id: `# Mulai: Login & Pengaturan Pertama

## Langkah 1: Unduh Klien SealSuite

Departemen IT Anda akan memberikan tautan unduhan, atau kunjungi: **https://www.sealsuite.com/download/**

Tersedia untuk: Windows, macOS, Android, iOS, dan Linux.

## Langkah 2: Login Pertama

1. Buka klien SealSuite
2. Masukkan **Tenant ID** (disediakan oleh IT)
3. Masukkan **username** (biasanya email kerja Anda)
4. Masukkan **password awal** dari administrator
5. Anda akan diminta mengubah password segera

## Langkah 3: Atur Multi-Factor Authentication (MFA)

Instal Google Authenticator atau Authy di smartphone Anda, scan QR code yang ditampilkan SealSuite, dan masukkan kode 6 digit untuk verifikasi.

## Langkah 4: Jelajahi Portal Pengguna

Portal Pengguna SealSuite memiliki empat bagian utama:
- **My Apps:** Akses satu klik ke semua aplikasi perusahaan Anda
- **Announcements:** Pemberitahuan perusahaan
- **Downloads:** Versi klien SealSuite terbaru
- **My Account:** Ubah password, kelola perangkat, lihat log aktivitas`,

      challenge_text: 'Complete your actual SealSuite first-time setup: (1) Install the client, (2) Change your initial password, (3) Set up an MFA app, (4) Log into the User Portal and identify 3 apps you have access to. Take a screenshot of the User Portal\'s "My Apps" section.',
      challenge_text_id: 'Selesaikan pengaturan pertama SealSuite Anda: (1) Instal klien, (2) Ganti password awal, (3) Siapkan aplikasi MFA, (4) Login ke Portal Pengguna dan identifikasi 3 aplikasi yang dapat Anda akses. Screenshot bagian "My Apps" Portal Pengguna.',
    },

    // ── Lesson 3: Using SSO ─────────────────────────────────────────────────
    {
      title: 'Accessing Work Apps with Single Sign-On (SSO)',
      title_id: 'Mengakses Aplikasi Kerja dengan Single Sign-On (SSO)',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 50,
      order_index: 3,
      content: `# Accessing Work Apps with Single Sign-On (SSO)

## What is Single Sign-On?

**Single Sign-On (SSO)** means you log in to SealSuite ONCE, and then you can access all your authorized work applications without typing passwords again.

\`\`\`mermaid
graph LR
  A[You log into SealSuite ✅] --> B[SealSuite Portal]
  B -->|Click app icon| C[📊 Jira]
  B -->|Click app icon| D[📧 Outlook]
  B -->|Click app icon| E[🤝 Salesforce]
  B -->|Click app icon| F[📁 SharePoint]
  C & D & E & F --> G[Logged in automatically — no password needed!]
  style A fill:#7c3aed,color:#fff
  style G fill:#10b981,color:#fff
\`\`\`

## How to Access Your Apps

### Method 1: From the SealSuite User Portal (Browser)
1. Open the SealSuite User Portal in your browser
2. Find your app in the **My Apps** section
3. Click the app icon
4. You are automatically logged in — no password required!

### Method 2: Directly from the App URL
For apps configured with SealSuite SSO, when you navigate to the app's URL (e.g., yourcompany.atlassian.net), it will automatically redirect you to SealSuite for authentication and then bring you back logged in.

### Method 3: Via Third-Party Platforms
If your organization uses Lark (Feishu), DingTalk, or WeCom, your IT team may have configured SSO access directly through those platforms' interfaces.

---

## Common SSO Scenarios

### Scenario A: First Access to a New App
1. You click on an unfamiliar app icon in the portal
2. SealSuite verifies your identity (already logged in = no extra steps)
3. The app opens and you are logged in with your work profile
4. ✅ Success!

### Scenario B: App Shows "Access Denied"
This means you are NOT authorized for this application. Contact your manager or IT administrator to request access.

### Scenario C: App Asks for a Password Even Though You Used SSO
Some older applications don't support modern SSO. For these, SealSuite may use **Password Autofill** — it securely saves your credential and auto-types it. If it's not working, check with IT.

---

## Troubleshooting SSO Issues

| Problem | What To Do |
|---------|-----------|
| App not in My Apps | Contact IT to request access |
| SSO redirects to SealSuite login | Your SealSuite session expired; log in again |
| "Access Denied" on the app | Request authorization from your manager |
| MFA prompt every time | Your session timer may be short; check with IT |

---

## Password Manager vs SSO

SSO is better than a password manager for work apps because:
- ✅ Your organization controls which apps you access (security)
- ✅ When you leave the company, access is revoked centrally
- ✅ No risk of saving weak or reused passwords
- ✅ Administrators can see which apps you're using (compliance)`,

      content_id: `# Mengakses Aplikasi Kerja dengan Single Sign-On (SSO)

## Apa itu Single Sign-On?

**Single Sign-On (SSO)** berarti Anda login ke SealSuite SEKALI, dan kemudian Anda dapat mengakses semua aplikasi kerja yang diotorisasi tanpa mengetik password lagi.

## Cara Mengakses Aplikasi Anda

### Metode 1: Dari Portal Pengguna SealSuite (Browser)
1. Buka Portal Pengguna SealSuite di browser Anda
2. Temukan aplikasi Anda di bagian **My Apps**
3. Klik ikon aplikasi
4. Anda secara otomatis masuk — tidak perlu password!

### Metode 2: Langsung dari URL Aplikasi
Untuk aplikasi yang dikonfigurasi dengan SSO SealSuite, saat Anda menavigasi ke URL aplikasi, ia akan otomatis mengalihkan Anda ke SealSuite untuk autentikasi.

## Pemecahan Masalah SSO

| Masalah | Apa yang Harus Dilakukan |
|---------|--------------------------|
| Aplikasi tidak ada di My Apps | Hubungi IT untuk meminta akses |
| SSO mengalihkan ke login SealSuite | Sesi SealSuite Anda kedaluwarsa; login lagi |
| "Access Denied" di aplikasi | Minta otorisasi dari manajer Anda |
| Prompt MFA setiap saat | Hubungi IT untuk mengatur ulang timer sesi |`,

      challenge_text: 'Using SealSuite SSO, access 3 of your authorized corporate applications from the User Portal without entering a password for each one. For each app, note: (1) The app name, (2) Whether you were automatically logged in or prompted, (3) The method used (direct click from portal / URL redirect).',
      challenge_text_id: 'Menggunakan SSO SealSuite, akses 3 aplikasi perusahaan yang diotorisasi dari Portal Pengguna tanpa memasukkan password untuk masing-masing. Untuk setiap aplikasi, catat: (1) Nama aplikasi, (2) Apakah Anda otomatis masuk atau diminta, (3) Metode yang digunakan.',
    },

    // ── Lesson 4: VPN for Users ─────────────────────────────────────────────
    {
      title: 'Using VPN for Secure Remote Access',
      title_id: 'Menggunakan VPN untuk Akses Jarak Jauh yang Aman',
      type: 'video',
      difficulty: 'beginner',
      video_url: 'https://www.youtube.com/watch?v=j_GfBjdxt3o',
      xp_reward: 50,
      order_index: 4,
      content: `# Using VPN for Secure Remote Access

## Why Use VPN?

VPN (**Virtual Private Network**) creates a secure, encrypted connection between your device and your company's internal network — even when you're working from home, a café, or a hotel.

\`\`\`mermaid
graph LR
  A[🏠 Your Home Network] -->|Without VPN| B[❌ Cannot access internal servers]
  A -->|With SealSuite VPN| C[🔒 Encrypted Tunnel]
  C --> D[🏢 Company Internal Network]
  D --> E[Internal servers, databases, tools]
  style C fill:#3b82f6,color:#fff
  style E fill:#10b981,color:#fff
\`\`\`

## When Do You Need VPN?

You need VPN when:
- ✅ Accessing internal company servers or databases
- ✅ Using company development/staging environments
- ✅ Working with files stored on internal file shares (not cloud)
- ✅ Accessing systems that are NOT available on the public internet

You do NOT need VPN when:
- ❌ Using cloud apps (Microsoft 365, Google Workspace, Salesforce) — these work over the internet
- ❌ Checking email (usually cloud-based)
- ❌ Using public websites

## How to Connect to VPN in SealSuite

### One-Click Connection:
1. Open the **SealSuite client** on your computer
2. Go to the **VPN** section
3. Click **Connect**
4. Wait for the connection indicator to show ✅ **Connected**
5. You can now access internal resources!

### Disconnecting:
1. Open the SealSuite client
2. Click **Disconnect**
3. Your device returns to normal internet routing

---

## Troubleshooting VPN Connection

| Problem | Possible Cause | Solution |
|---------|---------------|---------|
| Can't connect to VPN | No VPN gateway assigned to your account | Contact IT admin |
| VPN connects but can't reach internal server | You don't have authorization for that server | Request access from IT |
| VPN keeps disconnecting | Unstable internet connection | Switch to more stable network |
| VPN slow | Full tunnel mode routing all traffic | Ask IT if split tunnel is available |
| Device blocked from connecting | Device Baseline check failed | Fix device compliance issues first |

---

## Corporate Wi-Fi Access

In addition to VPN, SealSuite also manages **corporate Wi-Fi** connections in the office:

1. When you arrive at the office, open SealSuite client
2. Go to **Network** section
3. Your authorized Wi-Fi networks will appear
4. Click to connect — authentication happens automatically (no password to type)

---

## Security Best Practices for Remote Access

- 🔒 **Always use VPN** when accessing internal resources from outside the office
- 🚫 **Never use public Wi-Fi without VPN** — coffee shop networks are insecure
- 🔌 **Disconnect VPN when not needed** — this helps network performance
- 📱 **Keep SealSuite client updated** — updates include security patches`,

      content_id: `# Menggunakan VPN untuk Akses Jarak Jauh yang Aman

## Mengapa Menggunakan VPN?

VPN (**Virtual Private Network**) menciptakan koneksi terenkripsi yang aman antara perangkat Anda dan jaringan internal perusahaan — bahkan saat Anda bekerja dari rumah, kafe, atau hotel.

## Kapan Anda Memerlukan VPN?

Anda memerlukan VPN saat: mengakses server atau database internal perusahaan, menggunakan lingkungan pengembangan/staging perusahaan, bekerja dengan file di file share internal.

Anda TIDAK memerlukan VPN saat: menggunakan aplikasi cloud (Microsoft 365, Google Workspace, Salesforce), memeriksa email berbasis cloud.

## Cara Terhubung ke VPN di SealSuite

1. Buka klien SealSuite di komputer Anda
2. Pergi ke bagian **VPN**
3. Klik **Connect**
4. Tunggu indikator koneksi menunjukkan ✅ **Connected**
5. Anda sekarang dapat mengakses sumber daya internal!

## Praktik Terbaik Keamanan untuk Akses Jarak Jauh

- 🔒 Selalu gunakan VPN saat mengakses sumber daya internal dari luar kantor
- 🚫 Jangan pernah menggunakan Wi-Fi publik tanpa VPN
- 🔌 Putuskan VPN saat tidak diperlukan untuk membantu kinerja jaringan`,

      challenge_text: 'Test your VPN connection: (1) From home or outside the office, connect to VPN via SealSuite. (2) After connecting, try to access an internal resource that is only available on the company network. (3) Disconnect VPN and confirm you can no longer access it. Document the steps and the internal resource you accessed.',
      challenge_text_id: 'Uji koneksi VPN Anda: (1) Dari rumah atau di luar kantor, hubungkan ke VPN melalui SealSuite. (2) Setelah terhubung, coba akses sumber daya internal yang hanya tersedia di jaringan perusahaan. (3) Putuskan VPN dan konfirmasi Anda tidak lagi dapat mengaksesnya.',
    },

    // ── Lesson 5: Device Security ───────────────────────────────────────────
    {
      title: 'Device Security — Understanding What SealSuite Monitors',
      title_id: 'Keamanan Perangkat — Memahami Apa yang Dipantau SealSuite',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 50,
      order_index: 5,
      content: `# Device Security — Understanding What SealSuite Monitors

## What is "Device Security" in SealSuite?

When you install SealSuite on your device, it can perform **Device Baseline checks** — automated scans that verify your device meets the company's minimum security standards. This isn't about monitoring you personally — it's about ensuring the device accessing company data is not compromised.

\`\`\`mermaid
graph TD
  A[SealSuite checks your device] --> B{Is antivirus active?}
  B -->|Yes ✅| C{Is OS updated?}
  B -->|No ❌| Z[⚠️ Network access restricted until fixed]
  C -->|Yes ✅| D{Is screen lock set?}
  C -->|No ❌| Z
  D -->|Yes ✅| E[✅ Device compliant — full access granted]
  D -->|No ❌| Z
  style E fill:#10b981,color:#fff
  style Z fill:#ef4444,color:#fff
\`\`\`

## What SealSuite Checks (Device Baseline)

| Check Item | Why It Matters | How to Fix If Failing |
|-----------|---------------|----------------------|
| **Antivirus active** | Protects against malware that could steal company data | Enable Windows Defender / Install antivirus |
| **OS patches up to date** | Patches fix known security vulnerabilities | Run Windows/macOS updates |
| **Screen lock enabled** | Prevents unauthorized physical access | Enable screen lock in system settings |
| **Disk encryption** | Protects data if device is lost/stolen | Enable BitLocker (Windows) / FileVault (Mac) |
| **Required software** | Ensures work tools are present | Install missing software from company portal |

---

## What to Do If Your Device Is Non-Compliant

You'll receive a notification from SealSuite if your device fails a baseline check.

### Common Fix Scenarios:

**Problem: "Antivirus not active"**
1. Press Windows key → search "Windows Security"
2. Click "Virus & threat protection"
3. Turn on "Real-time protection"
4. SealSuite will re-check automatically

**Problem: "OS not updated"**
1. Press Windows key → search "Windows Update"
2. Click "Check for updates"
3. Install all available updates
4. Restart your computer if prompted

**Problem: "Screen lock not set"**
1. Go to Settings → Accounts → Sign-in Options
2. Under "Password" or "PIN," set a lock
3. Set auto-lock timeout to 5-10 minutes

---

## BYOD (Bring Your Own Device)

If you're using a **personal device** for work:

✅ SealSuite will still check security compliance on your personal device
✅ It will NOT read your personal photos, messages, or files
✅ It CAN monitor file transfers involving company data
✅ You can **log out of SealSuite** at any time to stop device monitoring

> 💡 **Tip:** If you're concerned about privacy on a personal device, talk to your IT team about using a company-provided device instead.

---

## Device Management — What You Can See

Navigate to the **SealSuite User Portal > My Account > Devices**

Here you can see:
- All devices where SealSuite is installed under your account
- Last login time from each device
- Device name and operating system
- **Remote sign-out:** Sign out your account from any device remotely (useful if you lose a device)`,

      content_id: `# Keamanan Perangkat — Memahami Apa yang Dipantau SealSuite

## Apa itu "Keamanan Perangkat" di SealSuite?

Saat Anda menginstal SealSuite di perangkat Anda, ia dapat melakukan **pemeriksaan Device Baseline** — pemindaian otomatis yang memverifikasi perangkat Anda memenuhi standar keamanan minimum perusahaan. Ini bukan tentang memantau Anda secara pribadi — ini tentang memastikan perangkat yang mengakses data perusahaan tidak dikompromikan.

## Yang Diperiksa SealSuite (Device Baseline)

| Item Pemeriksaan | Cara Memperbaiki Jika Gagal |
|-----------------|----------------------------|
| **Antivirus aktif** | Aktifkan Windows Defender / Instal antivirus |
| **Patch OS terkini** | Jalankan pembaruan Windows/macOS |
| **Screen lock diaktifkan** | Aktifkan screen lock di pengaturan sistem |
| **Enkripsi disk** | Aktifkan BitLocker (Windows) / FileVault (Mac) |
| **Software yang diperlukan** | Instal software yang hilang dari portal perusahaan |

## Apa yang Harus Dilakukan Jika Perangkat Tidak Patuh

Anda akan menerima notifikasi dari SealSuite jika perangkat Anda gagal pemeriksaan baseline. Perbaiki masalah yang disebutkan dan SealSuite akan memeriksa ulang secara otomatis.

## BYOD (Bring Your Own Device)

Jika menggunakan perangkat pribadi:
- SealSuite AKAN memeriksa kepatuhan keamanan
- SealSuite TIDAK AKAN membaca foto, pesan, atau file pribadi Anda
- SealSuite DAPAT memantau transfer file yang melibatkan data perusahaan
- Anda dapat **logout dari SealSuite** kapan saja untuk menghentikan pemantauan perangkat`,

      challenge_text: 'Check your current device compliance status in SealSuite. (1) Open SealSuite client and find the device health/compliance section. (2) List all security checks and whether they are passing (✅) or failing (❌). (3) If any are failing, describe the steps you took to fix them.',
      challenge_text_id: 'Periksa status kepatuhan perangkat Anda saat ini di SealSuite. (1) Buka klien SealSuite dan temukan bagian kesehatan/kepatuhan perangkat. (2) Sebutkan semua pemeriksaan keamanan dan apakah mereka lulus (✅) atau gagal (❌). (3) Jika ada yang gagal, jelaskan langkah yang Anda ambil untuk memperbaikinya.',
    },

    // ── Lesson 6: Data Security ─────────────────────────────────────────────
    {
      title: 'Data Security — Your Responsibilities as an Employee',
      title_id: 'Keamanan Data — Tanggung Jawab Anda sebagai Karyawan',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 50,
      order_index: 6,
      content: `# Data Security — Your Responsibilities as an Employee

## Understanding Data Loss Prevention (DLP)

Your organization uses **Data Loss Prevention (DLP)** technology within SealSuite to protect sensitive company and customer data. As an employee, you play a critical role in data security.

\`\`\`mermaid
graph TD
  A[Company Sensitive Data] --> B{How are you handling it?}
  B -->|Internal work use| C[✅ Allowed]
  B -->|Sending to approved channels| D[✅ Allowed with audit log]
  B -->|Copying to personal USB| E[❌ Blocked or flagged]
  B -->|Uploading to personal Dropbox| F[❌ Blocked or flagged]
  B -->|Printing without authorization| G[⚠️ May be watermarked/logged]
  style C fill:#10b981,color:#fff
  style D fill:#3b82f6,color:#fff
  style E fill:#ef4444,color:#fff
  style F fill:#ef4444,color:#fff
\`\`\`

## Types of Sensitive Data You May Handle

| Data Type | Examples | Protection Level |
|-----------|---------|-----------------|
| **Customer PII** | Names, addresses, ID numbers, contact info | 🔴 High |
| **Financial Data** | Invoices, account numbers, salary data | 🔴 High |
| **Intellectual Property** | Source code, product designs, trade secrets | 🔴 High |
| **Internal Business Data** | Sales figures, strategy documents | 🟡 Medium |
| **General Work Files** | Meeting notes, presentations | 🟢 Normal |

---

## What SealSuite May Restrict

Depending on your organization's policies, SealSuite's DLP may:

1. **Block or monitor USB transfers** — Copying company files to personal USB drives
2. **Restrict cloud uploads** — Uploading company files to personal Dropbox, Google Drive, etc.
3. **Apply screen watermarks** — Visible watermarks on sensitive documents in the browser
4. **Restrict printing** — Some highly sensitive documents can only be printed from approved printers
5. **Disable copy/paste** — In some protected web applications via Application Gateway

---

## Your Responsibilities

### Do:
- ✅ Use only **approved channels** to share company data (company email, approved cloud storage)
- ✅ **Report** immediately if you accidentally send data to the wrong person
- ✅ Use company-provided devices for handling highly sensitive data
- ✅ Lock your screen when stepping away from your desk
- ✅ Follow your company's data classification guidelines

### Don't:
- ❌ Copy company data to personal USB drives
- ❌ Upload work files to personal cloud storage (personal Dropbox, personal Google Drive)
- ❌ Share login credentials with colleagues (everyone should have their own account)
- ❌ Leave sensitive documents on printers or shared spaces
- ❌ Screenshot or photograph sensitive screens

---

## What Happens When DLP Detects a Violation

If SealSuite detects a potential DLP policy violation:

1. **Audit only:** The action is logged but allowed — you won't notice anything
2. **Warning:** You receive a notification explaining the potential violation
3. **Block:** The action is stopped — you'll see an error message explaining why
4. **Alert escalation:** Your manager or IT security team is notified

> ⚠️ **Important:** DLP is not designed to get you in trouble. It's a safety net that helps PREVENT accidental data leaks. If you're blocked from something you need to do for work, contact IT to request an exception.

---

## Reporting a Data Incident

If you believe you've accidentally shared sensitive data:

1. **Don't wait** — Report immediately
2. Contact your **IT Security team** or **Data Protection Officer**
3. Provide: What data was involved, who may have received it, when it happened
4. Don't try to hide it — early reporting minimizes the impact

> 🛡️ In most organizations, **self-reporting is treated favorably** compared to incidents discovered through monitoring.`,

      content_id: `# Keamanan Data — Tanggung Jawab Anda sebagai Karyawan

## Memahami Data Loss Prevention (DLP)

Organisasi Anda menggunakan teknologi **Data Loss Prevention (DLP)** di dalam SealSuite untuk melindungi data sensitif perusahaan dan pelanggan. Sebagai karyawan, Anda memainkan peran penting dalam keamanan data.

## Jenis Data Sensitif yang Mungkin Anda Tangani

| Jenis Data | Contoh | Level Perlindungan |
|-----------|--------|-------------------|
| **PII Pelanggan** | Nama, alamat, nomor ID, info kontak | 🔴 Tinggi |
| **Data Keuangan** | Faktur, nomor rekening, data gaji | 🔴 Tinggi |
| **Kekayaan Intelektual** | Source code, desain produk, rahasia dagang | 🔴 Tinggi |
| **Data Bisnis Internal** | Angka penjualan, dokumen strategi | 🟡 Menengah |

## Tanggung Jawab Anda

Lakukan: Gunakan saluran yang disetujui untuk berbagi data perusahaan, laporkan segera jika data dikirim ke orang yang salah, kunci layar saat meninggalkan meja.

Jangan: Menyalin data perusahaan ke USB pribadi, mengunggah file kerja ke penyimpanan cloud pribadi, berbagi kredensial login dengan rekan.

## Melaporkan Insiden Data

Jika Anda percaya telah secara tidak sengaja berbagi data sensitif: Jangan tunggu — laporkan segera ke tim Keamanan IT atau Petugas Perlindungan Data Anda. Pelaporan dini meminimalkan dampak.`,

      challenge_text: 'Review your daily work habits against the data security checklist. Identify 2 current habits that might be risky (e.g., using personal email for work files, screenshots of customer data). For each habit, describe: (1) The current behavior, (2) Why it\'s a risk, (3) What you\'ll do differently going forward.',
      challenge_text_id: 'Tinjau kebiasaan kerja harian Anda terhadap checklist keamanan data. Identifikasi 2 kebiasaan saat ini yang mungkin berisiko (misalnya, menggunakan email pribadi untuk file kerja, screenshot data pelanggan). Untuk setiap kebiasaan, jelaskan: (1) Perilaku saat ini, (2) Mengapa itu berisiko, (3) Apa yang akan Anda lakukan berbeda ke depannya.',
    },

    // ── Lesson 7: Account Management & User Assessment ─────────────────────
    {
      title: 'Managing Your Account & End User Assessment',
      title_id: 'Mengelola Akun Anda & Penilaian Pengguna Akhir',
      type: 'quiz',
      difficulty: 'beginner',
      xp_reward: 150,
      order_index: 7,
      content: `# Managing Your Account in SealSuite

## Self-Service Account Features

The SealSuite User Portal gives you control over your own account. Navigate to: **User Portal > My Account**

### 1. Changing Your Password
1. Go to **My Account > Security Settings**
2. Click **Change Password**
3. Enter your current password
4. Enter and confirm your new password (must meet complexity requirements)
5. Click **Confirm** — your password is updated immediately

### 2. Managing Your Devices
Navigate to: **My Account > Devices**

Here you can see all devices registered under your account. If you see a device you don't recognize:
1. Click **Sign Out** next to the unknown device
2. Report the suspicious device to your IT team immediately

### 3. Viewing Activity Logs
Navigate to: **My Account > Activity Log**

Your personal log shows:
- Login times and locations
- Apps accessed via SSO
- Any security events related to your account

This is useful to review periodically to check for any unauthorized activity.

---

## Final Assessment

Test your knowledge of SealSuite as an end user.`,
      quizzes: [
        {
          question: 'You need to access an internal company server from home tonight. What should you do FIRST before trying to connect?',
          options: [
            'Open your browser and try to access the server directly via its IP address',
            'Email IT and wait for them to enable remote access',
            'Open the SealSuite client and connect to VPN first',
            'Call a colleague who is in the office to forward the connection'
          ],
          correct_answer: 2,
          explanation: 'To access internal company resources from outside the office, you must first connect to VPN through the SealSuite client. Once connected, your device becomes part of the corporate network and can reach internal servers.'
        },
        {
          question: 'SealSuite shows a notification: "Your device does not meet security requirements. Antivirus is not active." What should you do?',
          options: [
            'Ignore it — it\'s just a warning and your work won\'t be affected',
            'Immediately enable your antivirus/Windows Defender and let SealSuite re-scan',
            'Uninstall SealSuite to make the notification go away',
            'Use your personal phone as a hotspot to bypass the restriction'
          ],
          correct_answer: 1,
          explanation: 'A Device Baseline failure means SealSuite may restrict your network access to protect company data. The correct action is to fix the underlying issue (re-enable antivirus) so the device can pass the baseline check and your access is restored.'
        },
        {
          question: 'A colleague asks for your SealSuite username and password so they can access a file you have permission to view. What should you do?',
          options: [
            'Share the credentials since they just need it for a moment',
            'Share only the username, not the password',
            'Refuse to share — ask them to request access from IT, or share the file content directly instead',
            'Share via a secure message app since it\'s just one time'
          ],
          correct_answer: 2,
          explanation: 'Sharing credentials is a serious security violation regardless of how brief or trusted the situation appears. Every employee must have their own account for audit trails and proper access control. If a colleague needs access, they should request it from IT. If they need a specific file, share it through approved channels.'
        },
        {
          question: 'You want to take a document with customer PII home to work on it over the weekend. The document is on a company server. What is the SAFEST approach?',
          options: [
            'Copy the file to your personal USB drive for convenience',
            'Email the file to your personal Gmail account',
            'Connect via SealSuite VPN from home and access the file on the company server directly, without copying it locally',
            'Print the document and take the paper copy home'
          ],
          correct_answer: 2,
          explanation: 'The safest approach is to access the file remotely via VPN without copying it to a local device or personal account. This keeps the data on the company server (where it\'s protected) and avoids creating an uncontrolled copy outside the corporate environment.'
        }
      ]
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // COURSE 3: SealSuite Fundamentals
  // ═══════════════════════════════════════════════════════════════════════════
  "SealSuite Fundamentals": [
    // ── Lesson 1: The Gatekeeper Concept ─────────────────────────────────────
    {
      title: 'Simplifying Cybersecurity: The Gatekeeper Concept',
      title_id: 'Menyederhanakan Keamanan Siber: Konsep Penjaga Pintu',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 75,
      order_index: 1,
      resources: [
        { type: 'docs', label: 'Official SealSuite Intro', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-what-is-sealsuite' }
      ],
      content: `# Simplifying Cybersecurity: The Gatekeeper Concept

Imagine entering an airport. Before you can board a plane, you must go through a security checkpoint. You place your bags on a scanner, and you walk through a **metal detector**. If you have a hidden knife or a key, the detector immediately beeps. The security officer stops you, inspects your belongings, and makes sure you are safe to proceed.

This is exactly how **SealSuite** works for your company's digital office, even if you don't have an IT or cybersecurity background!

---

## 🏢 Traditional Security vs. SealSuite (Zero Trust)

Historically, offices secured data like a fortress: a large wall (called a firewall) kept outsiders out. But once you were inside the building (on the office Wi-Fi), you were trusted implicitly. You could access files, databases, and servers without questions.

But what if a bad actor snuck in disguised as an employee? Or what if a trusted employee's laptop got infected by a virus? They would have free access to everything!

### ✈️ The Airport Security Approach
SealSuite uses a strategy called **Zero Trust** (Never Trust, Always Verify). It acts like continuous airport security:

1. **Who are you?** (Identity check): Just like checking your passport and boarding pass.
2. **What are you carrying?** (Device health check): Walking through the metal detector.
3. **Continuous inspection:** Even after passing the gate, security guards ensure you stay in your designated zone.

![Office vs Airport Security](/images/office_vs_airport_security.png)

---

## 💡 Summary to Share with Others

> **How to explain SealSuite in 10 seconds:**
> *"SealSuite is like a digital metal detector gate for our company. It checks who we are, makes sure our work devices are safe and clean from viruses, and ensures our company's confidential files don't accidentally leak out."*`,

      content_id: `# Menyederhanakan Keamanan Siber: Konsep Penjaga Pintu

Bayangkan ketika Anda memasuki area bandara. Sebelum Anda dapat naik ke pesawat, Anda harus melewati pos pemeriksaan keamanan. Anda meletakkan tas Anda di atas pemindai (scanner), dan Anda berjalan melalui **pintu detektor logam (metal detector)**. Jika Anda membawa pisau tersembunyi atau senjata, detektor tersebut akan segera berbunyi bip. Petugas keamanan akan menghentikan Anda, memeriksa barang bawaan Anda, dan memastikan Anda aman sebelum dipersilakan melanjutkan perjalanan.

Ini adalah cara kerja dari **SealSuite** untuk mengamankan kantor digital perusahaan Anda, meskipun Anda tidak memiliki latar belakang IT atau keamanan siber!

---

## 🏢 Keamanan Tradisional vs. SealSuite (Zero Trust)

Di masa lalu, kantor mengamankan data seperti sebuah benteng: dinding besar (disebut firewall) digunakan untuk mencegah orang luar masuk. Namun sekali Anda berhasil masuk ke dalam gedung (atau terhubung ke Wi-Fi kantor), Anda langsung dipercaya sepenuhnya. Anda bisa bebas membuka file, basis data, dan server tanpa ada yang bertanya.

Namun, bagaimana jika ada orang jahat menyelinap masuk menyamar sebagai karyawan? Atau bagaimana jika laptop karyawan tepercaya terkena virus? Mereka akan mendapatkan akses bebas ke semua dokumen penting!

### ✈️ Pendekatan Keamanan Bandara
SealSuite menggunakan strategi bernama **Zero Trust** (Jangan Pernah Percaya, Selalu Verifikasi). Ini bertindak seperti pemeriksaan keamanan bandara yang terus-menerus:

1. **Siapa Anda?** (Pemeriksaan Identitas): Sama seperti memeriksa paspor dan tiket pesawat Anda.
2. **Apa yang Anda Bawa?** (Pemeriksaan Kesehatan Perangkat): Berjalan melewati pintu metal detector.
3. **Pemeriksaan Berkelanjutan:** Bahkan setelah Anda lolos dari gerbang, petugas keamanan tetap memastikan Anda berada di area yang sesuai dengan tiket Anda.

![Konsep Penjaga Pintu](/images/office_vs_airport_security.png)

---

## 💡 Ringkasan untuk Dibagikan kepada Orang Lain

> **Cara menjelaskan SealSuite dalam 10 detik:**
> *"SealSuite itu seperti pintu detektor logam digital untuk perusahaan kita. Sistem ini memastikan siapa diri kita, memastikan perangkat kerja kita aman & bersih dari virus, dan menjaga agar file rahasia perusahaan tidak bocor keluar secara tidak sengaja."*`
    },

    // ── Lesson 2: The 3 Core Pillars ─────────────────────────────────────────
    {
      title: 'The 3 Pillars of SealSuite Office Security',
      title_id: '3 Pilar Utama Keamanan Kantor SealSuite',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 75,
      order_index: 2,
      resources: [
        { type: 'docs', label: 'SealSuite Core Capabilities', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-what-is-sealsuite' }
      ],
      content: `# The 3 Pillars of SealSuite Office Security

To protect your company's data, SealSuite relies on three main pillars working side-by-side. Think of them as the three main safety measures at any major event or location.

![The 3 Pillars of SealSuite](/images/sealsuite_pillars.png)

---

## 🛠️ Explaining the 3 Pillars Simply

### 🔑 Pillar 1: Identity (IAM)
* **What it is:** Checking who is trying to access the office applications.
* **Easy Analogy:** **The Digital Boarding Pass.** You show your ticket at the entrance. If your name matches the list, you get in.

### 💻 Pillar 2: Endpoint Security
* **What it is:** Inspecting the safety and health of the device (laptop or phone) you use to work.
* **Easy Analogy:** **The Metal Detector Gate.** Even if you have a valid ticket, if you are carrying something unsafe (like a virus or a security risk), the gate beeps and blocks you.

### 🛡️ Pillar 3: Data Loss Prevention (DLP)
* **What it is:** Scanning and controlling outgoing files to prevent data leaks.
* **Easy Analogy:** **The Bag Check / X-Ray scanner.** Before you leave, security guards scan your bags to ensure you are not carrying away sensitive company files.`,

      content_id: `# 3 Pilar Utama Keamanan Kantor SealSuite

Untuk melindungi data perusahaan Anda, SealSuite bertumpu pada tiga pilar utama yang bekerja saling berdampingan. Bayangkan ini sebagai tiga tindakan pengamanan utama di setiap acara atau lokasi besar.

![3 Pilar Utama SealSuite](/images/sealsuite_pillars.png)

---

## 🛠️ Menjelaskan 3 Pilar Secara Sederhana

### 🔑 Pilar 1: Identitas (IAM)
* **Apa fungsinya:** Memeriksa siapa yang mencoba mengakses aplikasi kerja kantor.
* **Analogi Sederhana:** **Tiket Boarding Digital.** Anda menunjukkan tiket di pintu masuk. Jika nama Anda terdaftar, Anda dipersilakan masuk.

### 💻 Pilar 2: Keamanan Endpoint
* **Apa fungsinya:** Memeriksa keamanan dan kesehatan perangkat (laptop/ponsel) yang Anda gunakan untuk bekerja.
* **Analogi Sederhana:** **Gerbang Detektor Logam.** Meskipun tiket Anda sah, jika Anda membawa sesuatu yang tidak aman (seperti virus atau celah keamanan), pintu akan berbunyi dan menahan Anda.

### 🛡️ Pilar 3: Pencegahan Kebocoran Data (DLP)
* **Apa fungsinya:** Memantau dan mengontrol pengiriman file ke luar untuk mencegah kebocoran data.
* **Analogi Sederhana:** **Pemeriksaan Tas / Sinar-X.** Sebelum Anda pergi, petugas keamanan memindai tas Anda untuk memastikan Anda tidak membawa keluar berkas rahasia milik perusahaan.`
    },

    // ── Lesson 3: Authentication (SSO & MFA) ─────────────────────────────────
    {
      title: 'Identity Check: Single Sign-On (SSO) & MFA',
      title_id: 'Pemeriksaan Identitas: Single Sign-On (SSO) & MFA',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 75,
      order_index: 3,
      resources: [
        { type: 'docs', label: 'Identity and SSO Guide', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-basic-concepts' }
      ],
      content: `# Identity Check: Single Sign-On (SSO) & Multi-Factor Authentication (MFA)

How does SealSuite verify who you are without causing headache? It uses two secure features: **Single Sign-On (SSO)** and **Multi-Factor Authentication (MFA)**.

![SSO and MFA Analogy](/images/sealsuite_mfa_sso.png)

---

## 🔑 Single Sign-On (SSO): The Golden Master Key
Normally, you need 20 different usernames and passwords for email, HR software, internal drives, and work tools. Keeping track of all of them is exhausting.

* **SSO is like a Golden Master Key.** Once you unlock the main SealSuite client, that single key unlocks all your corporate web apps. You do not need to sign in repeatedly.

## 📱 Multi-Factor Authentication (MFA): The Double Lock
A master key is powerful, so it needs extra protection. If someone steals your password, they could access everything.

* **MFA is like a Double Lock.** When you login, SealSuite asks for a password, but also sends a temporary 6-digit verification code to your phone app. Even if a thief knows your password, they cannot enter because they don't have your physical phone!`,

      content_id: `# Pemeriksaan Identitas: Single Sign-On (SSO) & Multi-Factor Authentication (MFA)

Bagaimana cara SealSuite memverifikasi identitas Anda tanpa membuat Anda pusing? Sistem ini menggunakan dua fitur keamanan: **Single Sign-On (SSO)** dan **Multi-Factor Authentication (MFA)**.

![Analogi SSO dan MFA](/images/sealsuite_mfa_sso.png)

---

## 🔑 Single Sign-On (SSO): Kunci Emas Utama
Biasanya, Anda memerlukan 20 nama pengguna dan kata sandi yang berbeda untuk email, portal HR, drive kerja, dan aplikasi lainnya. Menghafal semuanya sangat melelahkan.

* **SSO itu seperti Kunci Emas Utama.** Begitu Anda masuk ke dalam aplikasi SealSuite, kunci tunggal tersebut otomatis membukakan akses ke semua aplikasi kerja perusahaan Anda. Anda tidak perlu login berulang-ulang.

## 📱 Multi-Factor Authentication (MFA): Kunci Ganda Pengaman
Karena kunci utama sangat kuat, ia membutuhkan perlindungan ekstra. Jika ada orang yang mencuri kata sandi Anda, mereka bisa membuka semuanya.

* **MFA itu seperti Gembok Kunci Ganda.** Saat Anda login, SealSuite meminta kata sandi, tetapi juga mengirimkan kode verifikasi 6-digit sementara ke aplikasi ponsel Anda. Bahkan jika pencuri tahu kata sandi Anda, mereka tetap tidak bisa masuk karena mereka tidak memegang ponsel fisik Anda!`
    },

    // ── Lesson 4: Network Security (VPN) ─────────────────────────────────────
    {
      title: 'Secure Remote Work: Connecting to the Office VPN',
      title_id: 'Kerja Remote yang Aman: Terhubung ke VPN Kantor',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 75,
      order_index: 4,
      resources: [
        { type: 'docs', label: 'VPN and Network Settings', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-viewing-sealsuite-portal' }
      ],
      content: `# Secure Remote Work: Connecting to the Office VPN

When you work from home or a public cafe, you connect to the internet via public networks. Sending sensitive business files over public Wi-Fi is risky — hackers can intercept the data.

SealSuite resolves this risk by building a **Virtual Private Network (VPN)** tunnel.

![VPN Secure Tunnel Analogy](/images/sealsuite_vpn.png)

---

## 🚗 The Secure Tunnel Analogy

* **Public Internet is like a public highway.** Anyone sitting nearby can look at your car and see what you are carrying inside.
* **SealSuite VPN is like a Private Underground Tunnel.** It connects your laptop directly to the office building. This tunnel is heavily guarded. No one on the public highway can see or touch the cars inside your tunnel.

With SealSuite, connecting to the VPN is built right into the client. With one click, your tunnel is active, allowing you to access office servers securely from anywhere.`,

      content_id: `# Kerja Remote yang Aman: Terhubung ke VPN Kantor

Ketika Anda bekerja dari rumah atau kafe, Anda terhubung ke internet menggunakan jaringan publik. Mengirim file bisnis yang sensitif melalui Wi-Fi publik sangat berisiko — peretas dapat menyadap data tersebut.

SealSuite mengatasi risiko ini dengan membangun terowongan **Virtual Private Network (VPN)**.

![Analogi Terowongan VPN](/images/sealsuite_vpn.png)

---

## 🚗 Analogi Terowongan Pengaman

* **Internet Publik itu seperti jalan raya umum.** Siapa pun yang berada di sekitar jalan tersebut dapat melihat mobil Anda dan isi muatannya.
* **SealSuite VPN itu seperti Terowongan Bawah Tanah Pribadi.** Terowongan ini menghubungkan laptop Anda secara langsung ke gedung kantor. Terowongan ini dijaga ketat. Tidak ada orang di jalan raya umum yang bisa melihat atau menyentuh mobil di dalam terowongan Anda.

Dengan SealSuite, akses VPN sudah terintegrasi langsung di aplikasi. Cukup dengan satu klik, terowongan aman Anda aktif dan Anda bisa mengakses server kantor dengan aman dari mana saja.`
    },

    // ── Lesson 5: Device Baseline ────────────────────────────────────────────
    {
      title: 'Device Compliance: The Digital Health Check',
      title_id: 'Kepatuhan Perangkat: Pemeriksaan Kesehatan Digital',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 75,
      order_index: 5,
      resources: [
        { type: 'docs', label: 'Endpoint Security and Baselines', url: 'https://docs.byteplus.com/en/docs/sealsuite/quickstart' }
      ],
      content: `# Device Compliance: The Digital Health Check

Before you can use the VPN or access apps, SealSuite scans your laptop or phone. This is called a **Device Baseline / Compliance Check**.

![Device Baseline Analogy](/images/sealsuite_device_baseline.png)

---

## 🩺 The 4 Health Criteria for Work Devices

Just like a metal detector at the airport checks for dangerous items, SealSuite checks your device against the company's baseline rules:

1. **🛡️ Antivirus Active:** Is your antivirus software running and updated?
2. **🔄 Latest Update:** Is your operating system (Windows/Mac) up to date?
3. **🧱 Firewall On:** Is your computer's built-in shield turned on?
4. **🔒 Screen Lock:** Do you have a secure PIN or password set to unlock your screen?

> **What happens if your device fails the check?**
> The gate "beeps" and temporarily limits your connection. Once you turn your antivirus back on or run updates, SealSuite automatically lets you back in. This protects the company from compromised devices.`,

      content_id: `# Kepatuhan Perangkat: Pemeriksaan Kesehatan Digital

Sebelum Anda diizinkan menggunakan VPN atau membuka aplikasi kerja, SealSuite memindai laptop atau ponsel Anda. Ini disebut **Pemeriksaan Kepatuhan Perangkat (Device Baseline)**.

![Analogi Kepatuhan Perangkat](/images/sealsuite_device_baseline.png)

---

## 🩺 4 Kriteria Kesehatan Perangkat Kerja

Sama seperti pintu detektor logam di bandara yang memeriksa benda berbahaya, SealSuite memeriksa perangkat Anda berdasarkan aturan dasar perusahaan:

1. **🛡️ Antivirus Aktif:** Apakah software antivirus Anda menyala dan versi terbaru?
2. **🔄 Pembaruan OS:** Apakah sistem operasi Anda (Windows/Mac) sudah diperbarui?
3. **🧱 Firewall Menyala:** Apakah dinding pelindung internal komputer Anda diaktifkan?
4. **🔒 Kunci Layar:** Apakah Anda memasang PIN atau sandi aman untuk membuka kunci layar?

> **Apa yang terjadi jika perangkat tidak lolos pemeriksaan?**
> Gerbang akan "berbunyi bip" dan membatasi koneksi Anda sementara waktu. Begitu Anda mengaktifkan kembali antivirus atau memperbarui sistem, SealSuite otomatis mengizinkan Anda masuk kembali. Ini mencegah perangkat yang terinfeksi merusak jaringan kantor.`
    },

    // ── Lesson 6: Data Leak Prevention (DLP) ──────────────────────────────────
    {
      title: 'Preventing Data Leaks: X-Ray Scanner & Watermarks',
      title_id: 'Mencegah Kebocoran Data: Pemindai Sinar-X & Watermark',
      type: 'text',
      difficulty: 'beginner',
      xp_reward: 75,
      order_index: 6,
      resources: [
        { type: 'docs', label: 'DLP and Traceability', url: 'https://docs.byteplus.com/en/docs/sealsuite/docs-operation-instructions' }
      ],
      content: `# Preventing Data Leaks: X-Ray Scanner & Watermarks

The final pillar is **Data Loss Prevention (DLP)**. It keeps confidential files safe from leaving the company borders accidentally or maliciously.

![DLP Watermark Analogy](/images/sealsuite_dlp_watermark.png)

---

## 💼 The 2 Main Data Shields

### 1. 🔍 The Outbound Scanner (The Airport X-Ray)
When you transfer a file externally (like uploading to a drive or sharing via message), the DLP scanner inspects the document. If it detects customer credit cards, financial records, or internal codes, it immediately blocks the transfer and notifies IT.

### 2. 📝 The Tracking Overlay (Digital Watermarks)
SealSuite overlays a faint, transparent watermark containing your name, email, and IP address onto sensitive company applications and files.
* **Why it is helpful:** It discourages anyone from taking photos of the screen with their phone to leak information. If a photo is leaked, the watermark instantly traces who leaked it.`,

      content_id: `# Mencegah Kebocoran Data: Pemindai Sinar-X & Watermark

Pilar terakhir adalah **Data Loss Prevention (DLP)**. Fitur ini menjaga agar dokumen rahasia perusahaan tidak keluar dari batas aman kantor secara tidak sengaja maupun sengaja.

![Analogi DLP dan Watermark](/images/sealsuite_dlp_watermark.png)

---

## 💼 2 Pelindung Data Utama

### 1. 🔍 Pemindai Berkas Keluar (Sinar-X Bandara)
Saat Anda mengirimkan file ke luar (seperti mengunggah ke cloud drive atau berbagi di chat), pemindai DLP akan memeriksa isi dokumen tersebut. Jika mendeteksi nomor kartu kredit pelanggan, catatan keuangan, atau kode program penting, sistem akan memblokir pengiriman tersebut dan melapor ke IT.

### 2. 📝 Pelacak Gambar (Watermark Digital)
SealSuite menempelkan tanda watermark transparan tipis yang berisi nama Anda, email, dan alamat IP Anda pada aplikasi dan dokumen kerja yang penting.
* **Mengapa ini berguna:** Ini mencegah orang mengambil foto layar komputer menggunakan kamera ponsel mereka untuk membocorkan informasi. Jika foto tersebut bocor, watermark akan melacak siapa pemilik akses tersebut.`
    },

    // ── Lesson 7: Assessment & Logs ──────────────────────────────────────────
    {
      title: 'Activity History & Fundamentals Assessment',
      title_id: 'Riwayat Aktivitas & Evaluasi Dasar',
      type: 'quiz',
      difficulty: 'beginner',
      xp_reward: 150,
      order_index: 7,
      resources: [],
      content: `# Activity History & Fundamentals Assessment

In addition to protecting you, SealSuite records a secure history book of your activities. You can view your login history and devices to ensure no unauthorized access occurred.

![Audit Logs Analogy](/images/sealsuite_audit_logs.png)

---

Test your understanding of basic SealSuite concepts, Zero Trust architecture, and security features using everyday analogies.`,

      content_id: `# Riwayat Aktivitas & Evaluasi Dasar

Selain melindungi Anda, SealSuite mencatat riwayat aktivitas Anda di buku catatan keamanan yang aman. Anda dapat melihat riwayat login dan perangkat untuk memastikan tidak ada akses ilegal yang terjadi.

![Analogi Riwayat Aktivitas](/images/sealsuite_audit_logs.png)

---

Uji pemahaman Anda tentang konsep dasar SealSuite, arsitektur Zero Trust, dan fitur keamanan utama dengan analogi sehari-hari.`,
      quizzes: [
        {
          question: 'In our airport security analogy, what represents SealSuite\'s "Endpoint Security" check?',
          options: [
            'Checking the passenger\'s passport and identity card',
            'Walking through the metal detector gate to scan for dangerous items',
            'Scanning the barcode on the boarding ticket',
            'Buying a cup of coffee inside the airport terminal lounge'
          ],
          correct_answer: 1,
          explanation: 'Endpoint Security is like a metal detector gate: it scans your device (laptop/phone) to ensure it is healthy and not carrying any dangerous security issues (such as deactivated antivirus or out-of-date systems) before permitting access.'
        },
        {
          question: 'What is the main difference between traditional "fortress" security and SealSuite\'s "Zero Trust" security?',
          options: [
            'Traditional security is faster, while Zero Trust is slower to run',
            'Traditional security trusts anyone once they are inside the network, while Zero Trust continuously checks identity and device security',
            'Zero Trust does not use passwords at all',
            'Traditional security only works for offices, while Zero Trust only works for airports'
          ],
          correct_answer: 1,
          explanation: 'Traditional security relies on network boundaries (once inside, you are trusted). Zero Trust never assumes trust—it continuously verifies the identity and device health of every access request, even if they are already connected.'
        },
        {
          question: 'Single Sign-On (SSO) is compared to a "Golden Master Key" because:',
          options: [
            'It is made of real gold metal',
            'It unlocks all your secure work applications with a single account login, so you don\'t need to sign in repeatedly',
            'It allows you to bypass the antivirus scanner check',
            'It resets your computer password automatically every day'
          ],
          correct_answer: 1,
          explanation: 'Single Sign-On (SSO) acts as a golden master key because it allows you to access all your authorized corporate apps after signing in just once, removing the hassle of logging into multiple apps.'
        },
        {
          question: 'Which of the following describes how a Virtual Private Network (VPN) works using our vehicle analogy?',
          options: [
            'It is like driving a very fast sports car on a public highway',
            'It is like renting a bicycle inside the office parking lot',
            'It is like driving through a private underground tunnel that connects you directly to the office building, protected from hackers on the public road',
            'It is like calling a taxi to deliver a file to the office'
          ],
          correct_answer: 2,
          explanation: 'A VPN works like a private underground tunnel. It encrypts your internet connection from home to the corporate office, protecting your network traffic from being intercepted on public networks.'
        },
        {
          question: 'What is the purpose of SealSuite\'s digital watermarking on corporate files?',
          options: [
            'To make the document look artistic and modern',
            'To increase the file download speed',
            'To display your identity and IP address on the screen to prevent and trace photo leakage',
            'To enable editing the file on mobile devices'
          ],
          correct_answer: 2,
          explanation: 'Digital watermarking overlays user details on corporate files so that if someone attempts to capture a photo of sensitive data to leak it, the source of the leak can be instantly traced.'
        }
      ]
    }
  ]
};
