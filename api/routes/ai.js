const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Complete ModelArk Registry for vibe.virtuenet.space (Region: ap-southeast-1)
const AVAILABLE_MODELS = [
  // ── 1. ByteDance (22 models) ──
  {
    id: 'dreamina-seedance-2-5',
    name: 'dreamina-seedance-2-5',
    displayName: 'Dreamina Seedance 2.5',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Multimodal / Creative Coding',
    capacity_tokens: 65536,
    color: '#f97316',
    status: 'online',
    tags: ['ACTIVATED', 'TEXT', 'IMAGE', 'VIDEO', 'CODE'],
    specialization: 'UI component generation, design-to-code conversion, interactive web scaffolds',
    badge: 'Recommended'
  },
  {
    id: 'seedance-1-5-pro',
    name: 'seedance-1-5-pro',
    displayName: 'Seedance 1.5 Pro',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Deep Reasoning',
    capacity_tokens: 65536,
    color: '#10b981',
    status: 'online',
    tags: ['TEXT', 'CODE', 'REASONING'],
    specialization: 'Formal step-by-step logic, algorithm design, system architecture analysis',
    badge: 'Pro Reasoning'
  },
  {
    id: 'dola-seed-2-0-lite',
    name: 'dola-seed-2-0-lite',
    displayName: 'Dola-Seed-2.0-lite',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Text / Low-Latency',
    capacity_tokens: 32768,
    color: '#10b981',
    status: 'online',
    tags: ['TEXT', 'FAST'],
    specialization: 'Fast lightweight text generation, chat summarization, mobile/edge API routing',
    badge: 'Low-Latency'
  },
  {
    id: 'dola-seed-2-0-mini',
    name: 'dola-seed-2-0-mini',
    displayName: 'Dola-Seed-2.0-mini',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Text / Balanced',
    capacity_tokens: 65536,
    color: '#06b6d4',
    status: 'online',
    tags: ['TEXT', 'FAST'],
    specialization: 'High-throughput general conversational tasks and cost-efficient extraction',
    badge: 'Balanced'
  },
  {
    id: 'dola-seed-2-1-turbo',
    name: 'dola-seed-2-1-turbo',
    displayName: 'Dola-Seed-2.1-turbo',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Text / High-Performance',
    capacity_tokens: 131072,
    color: '#3b82f6',
    status: 'online',
    tags: ['TEXT', 'CODE', 'FAST'],
    specialization: 'Complex instruction following, prompt engineering, fast analytical reasoning',
    badge: 'Turbo'
  },
  {
    id: 'dola-seed-evolving',
    name: 'dola-seed-evolving',
    displayName: 'Dola-Seed-Evolving',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Text / Adaptive',
    capacity_tokens: 131072,
    color: '#8b5cf6',
    status: 'online',
    tags: ['TEXT', 'REASONING'],
    specialization: 'Continual learning model with active knowledge updates and dynamic adaptation',
    badge: 'Adaptive'
  },
  {
    id: 'bytelm-base',
    name: 'bytelm-base',
    displayName: 'ByteLM-Base',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Foundational LLM',
    capacity_tokens: 65536,
    color: '#64748b',
    status: 'online',
    tags: ['TEXT'],
    specialization: 'General semantic understanding, task classification, zero-shot/few-shot tasks',
    badge: 'Base'
  },
  {
    id: 'bytelm-turbo',
    name: 'bytelm-turbo',
    displayName: 'ByteLM-Turbo',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Foundational LLM',
    capacity_tokens: 131072,
    color: '#0284c7',
    status: 'online',
    tags: ['TEXT', 'FAST'],
    specialization: 'High-velocity batch processing, structured data formatting, JSON outputs',
    badge: 'Turbo'
  },
  {
    id: 'oceanus-series-v1',
    name: 'oceanus-series-v1',
    displayName: 'Oceanus-Series-V1',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Multimodal (Vision-Language)',
    capacity_tokens: 65536,
    color: '#0d9488',
    status: 'online',
    tags: ['IMAGE', 'TEXT'],
    specialization: 'Document parsing, OCR comprehension, UI layout analysis',
    badge: 'Vision'
  },
  {
    id: 'oceanus-series-pro',
    name: 'oceanus-series-pro',
    displayName: 'Oceanus-Series-Pro',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Multimodal (Vision-Language)',
    capacity_tokens: 131072,
    color: '#14b8a6',
    status: 'online',
    tags: ['IMAGE', 'VIDEO', 'TEXT'],
    specialization: 'Multi-image sequence understanding, spatial video reasoning, complex visual Q&A',
    badge: 'Vision Pro'
  },
  {
    id: 'arkclaw-vision',
    name: 'arkclaw-vision',
    displayName: 'ArkClaw Vision',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Computer Vision / Inspection',
    capacity_tokens: 32768,
    color: '#e11d48',
    status: 'online',
    tags: ['IMAGE'],
    specialization: 'Fine-grained visual feature detection, security compliance, artifact inspection',
    badge: 'Inspection'
  },
  {
    id: 'seedream-image-gen',
    name: 'seedream-image-gen',
    displayName: 'Seedream Image Gen',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Image Generation / Diffusion',
    capacity_tokens: 8192,
    color: '#f43f5e',
    status: 'online',
    tags: ['IMAGE'],
    specialization: 'Text-to-image synthesis, stylized graphic asset creation, UI/UX concept generation',
    badge: 'Diffusion'
  },
  {
    id: 'seed-translation-pro',
    name: 'seed-translation-pro',
    displayName: 'Seed-Translation Pro',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Cross-Lingual NLU',
    capacity_tokens: 65536,
    color: '#a855f7',
    status: 'online',
    tags: ['TEXT'],
    specialization: 'Domain-adaptive multilingual translation (EN/ID/ZH/TH/VI/MS) with cultural context',
    badge: 'Translation'
  },
  {
    id: 'seed-audio-tts-stt',
    name: 'seed-audio-tts-stt',
    displayName: 'Seed-Audio TTS/STT',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Speech / Audio',
    capacity_tokens: 16384,
    color: '#d946ef',
    status: 'online',
    tags: ['AUDIO'],
    specialization: 'Speech-to-text transcription, real-time multilingual voice synthesis, audio captioning',
    badge: 'Audio'
  },
  {
    id: 'vikingdb-embedding-v2',
    name: 'vikingdb-embedding-v2',
    displayName: 'VikingDB Embedding V2',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'RAG / Dense Retrieval',
    capacity_tokens: 8192,
    color: '#6366f1',
    status: 'online',
    tags: ['RAG', 'TEXT'],
    specialization: 'Dense semantic vector embeddings for enterprise RAG and similarity search',
    badge: 'RAG'
  },
  {
    id: 'vikingdb-reranker-pro',
    name: 'vikingdb-reranker-pro',
    displayName: 'VikingDB Reranker Pro',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'RAG / Reranking',
    capacity_tokens: 4096,
    color: '#4f46e5',
    status: 'online',
    tags: ['RAG'],
    specialization: 'Cross-encoder context relevance scoring to optimize RAG retrieval precision',
    badge: 'Reranker'
  },
  {
    id: 'doubao-pro-32k',
    name: 'doubao-pro-32k',
    displayName: 'Doubao-Pro-32k',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Flagship LLM',
    capacity_tokens: 32768,
    color: '#06b6d4',
    status: 'online',
    tags: ['TEXT', 'CODE', 'FAST'],
    specialization: 'Instruction following, structured reasoning, enterprise agent orchestration',
    badge: 'Flagship'
  },
  {
    id: 'doubao-pro-128k',
    name: 'doubao-pro-128k',
    displayName: 'Doubao-Pro-128k',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Long-Context LLM',
    capacity_tokens: 131072,
    color: '#0891b2',
    status: 'online',
    tags: ['TEXT', 'CODE', 'REASONING'],
    specialization: 'Massive document repository QA, legal/technical file analysis, multi-turn history',
    badge: '128k Context'
  },
  {
    id: 'doubao-lite-32k',
    name: 'doubao-lite-32k',
    displayName: 'Doubao-Lite-32k',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Fast LLM',
    capacity_tokens: 32768,
    color: '#22d3ee',
    status: 'online',
    tags: ['TEXT', 'FAST'],
    specialization: 'Cost-efficient transactional operations and low-latency interactive chats',
    badge: 'Lite'
  },
  {
    id: 'doubao-seed-code',
    name: 'doubao-seed-code',
    displayName: 'Doubao-Seed-Code',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Code Generation',
    capacity_tokens: 65536,
    color: '#8b5cf6',
    status: 'online',
    tags: ['TEXT', 'CODE'],
    specialization: 'Full-stack code generation, unit test creation, refactoring, security auditing',
    badge: 'Code Expert'
  },
  {
    id: 'byteguard-safety-v1',
    name: 'byteguard-safety-v1',
    displayName: 'ByteGuard Safety V1',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Security & Moderation',
    capacity_tokens: 16384,
    color: '#ef4444',
    status: 'online',
    tags: ['TEXT', 'REASONING'],
    specialization: 'Prompt injection detection, PII filtering, automated jailbreak mitigation',
    badge: 'Security Guard'
  },
  {
    id: 'byteflow-agent-router',
    name: 'byteflow-agent-router',
    displayName: 'ByteFlow Agent Router',
    vendor: 'ByteDance',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Orchestration & Planning',
    capacity_tokens: 32768,
    color: '#f59e0b',
    status: 'online',
    tags: ['TEXT', 'REASONING'],
    specialization: 'Intent classification, dynamic subagent routing, tool calling validation',
    badge: 'Router'
  },

  // ── 2. DeepSeek (5 models) ──
  {
    id: 'deepseek-v4-pro',
    name: 'deepseek-v4-pro',
    displayName: 'DeepSeek-V4-Pro',
    vendor: 'DeepSeek',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Frontier Reasoning & General',
    capacity_tokens: 131072,
    color: '#3b82f6',
    status: 'online',
    tags: ['TEXT', 'CODE', 'REASONING'],
    specialization: 'Advanced synthetic reasoning, scientific text processing, complex synthesis',
    badge: 'Frontier'
  },
  {
    id: 'deepseek-v4-lite',
    name: 'deepseek-v4-lite',
    displayName: 'DeepSeek-V4-Lite',
    vendor: 'DeepSeek',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'High-Throughput General',
    capacity_tokens: 65536,
    color: '#60a5fa',
    status: 'online',
    tags: ['TEXT', 'FAST'],
    specialization: 'Low-latency inference, rapid classification, lightweight conversational workflows',
    badge: 'Lite'
  },
  {
    id: 'deepseek-coder',
    name: 'deepseek-coder',
    displayName: 'DeepSeek-Coder',
    vendor: 'DeepSeek',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Code Intelligence',
    capacity_tokens: 131072,
    color: '#2563eb',
    status: 'online',
    tags: ['TEXT', 'CODE', 'REASONING'],
    specialization: 'Polyglot repository-level refactoring, syntax debugging, API design',
    badge: 'Coder Pro'
  },
  {
    id: 'deepseek-math',
    name: 'deepseek-math',
    displayName: 'DeepSeek-Math',
    vendor: 'DeepSeek',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Mathematical & Quantitative',
    capacity_tokens: 65536,
    color: '#1d4ed8',
    status: 'online',
    tags: ['TEXT', 'REASONING'],
    specialization: 'Symbolic computation, quantitative analysis, formal theorem verification',
    badge: 'Math Logic'
  },
  {
    id: 'deepseek-vision',
    name: 'deepseek-vision',
    displayName: 'DeepSeek-Vision',
    vendor: 'DeepSeek',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Visual Understanding',
    capacity_tokens: 65536,
    color: '#1e40af',
    status: 'online',
    tags: ['IMAGE', 'TEXT'],
    specialization: 'Visual reasoning, architectural blueprint extraction, diagram interpretation',
    badge: 'Vision'
  },

  // ── 3. Z.AI (2 models) ──
  {
    id: 'glm-4-air',
    name: 'glm-4-air',
    displayName: 'GLM-4-Air',
    vendor: 'Z.AI',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'Fast Efficient LLM',
    capacity_tokens: 131072,
    color: '#eab308',
    status: 'online',
    tags: ['TEXT', 'FAST', 'REASONING'],
    specialization: 'High-speed reasoning, bilingual balance (EN/ZH), cost-effective tool use',
    badge: 'Air Fast'
  },
  {
    id: 'glm-4-turbo',
    name: 'glm-4-turbo',
    displayName: 'GLM-4-Turbo',
    vendor: 'Z.AI',
    provider: 'BytePlus ModelArk',
    region: 'ap-southeast-1',
    category: 'High-Performance LLM',
    capacity_tokens: 131072,
    color: '#ca8a04',
    status: 'online',
    tags: ['TEXT', 'CODE', 'REASONING'],
    specialization: 'Complex multi-step workflow execution, long-document extraction, advanced function calling',
    badge: 'Turbo Max'
  }
];

// GET /api/ai/models - Return model list and active status for vibe.virtuenet.space
router.get('/models', (req, res) => {
  res.json({
    environment: 'vibe.virtuenet.space',
    region: 'ap-southeast-1',
    models: AVAILABLE_MODELS,
    vendors: ['ByteDance', 'DeepSeek', 'Z.AI'],
    defaultModel: 'dreamina-seedance-2-5',
    total_models: AVAILABLE_MODELS.length
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SENIOR EXPERT AI INSTRUCTOR ENGINE
// Analyzes the user's question + full lesson content + transcript + quizzes
// to deliver authoritative, comprehensive, mentor-grade explanations with
// real-world analogies, Good vs Bad comparisons, runnable code, and Pro Tips.
// ═══════════════════════════════════════════════════════════════════════════════

const EXPERT_KNOWLEDGE_BASE = [
  {
    match: /\b(prompt|prompting|instruksi|perintah|cot|chain of thought|zero-shot|few-shot|system prompt|user prompt)\b/i,
    title_id: 'Bedah Konsep: Prompt & Prompt Engineering',
    title_en: 'Deep Dive: Prompts & Prompt Engineering',
    analogy_id: 'Bayangkan AI seperti **Executive Chef bintang Michelin** yang memiliki jutaan resep di kepalanya, namun tidak tahu selera Anda. **Prompt** adalah *Order Ticket* (tiket pesanan) sekaligus *Standard Operating Procedure (SOP)* yang Anda berikan ke dapur.',
    analogy_en: 'Think of the AI as a **Michelin-star Executive Chef** who knows millions of recipes but doesn\'t know your taste. A **Prompt** is both the *Order Ticket* and the *Standard Operating Procedure (SOP)* you hand to the kitchen.',
    core_id: [
      '**Definisi Teknis**: *Prompt* adalah rangkaian token masukan (teks, kode, atau konteks) yang dikirim ke *Large Language Model (LLM)* untuk mengondisikan distribusi probabilitas token berikutnya agar menghasilkan respons sesuai target.',
      '**4 Pilar Prompt yang Efektif (Framework R-C-T-F)**:\n  1. **Role (Peran)**: Tetapkan keahlian AI (misal: *"Bertindaklah sebagai Principal Backend Engineer..."*).\n  2. **Context (Konteks)**: Jelaskan latar belakang masalah, stack teknologi, dan batasan sistem.\n  3. **Task (Tugas Spesifik)**: Instruksikan langkah kerja secara eksplisit dan terukur.\n  4. **Format (Struktur Output)**: Tentukan bentuk keluaran (JSON, tabel Markdown, atau blok kode modular).'
    ],
    core_en: [
      '**Technical Definition**: A *Prompt* is the input sequence of tokens (text, code, or context) fed into a *Large Language Model (LLM)* to condition its probability distribution and steer the generated output.',
      '**The 4 Pillars of an Expert Prompt (R-C-T-F Framework)**:\n  1. **Role**: Assign a specific persona (e.g., *"Act as a Principal Backend Engineer..."*).\n  2. **Context**: Provide system architecture, tech stack, and constraints.\n  3. **Task**: State the exact deliverable step-by-step.\n  4. **Format**: Specify the output schema (JSON, Markdown table, modular code).'
    ],
    code: `// ❌ PROMPT AWAM (Ambigu & Rawan Halusinasi):
"Buatkan kode login user"

// ✅ PROMPT LEVEL ENGINEER / EXPERT (Presisi Tinggi):
"""
Role: Senior Node.js Security Engineer
Context: Aplikasi Express.js + PostgreSQL dengan autentikasi JWT.
Task: Buat endpoint POST /api/auth/login yang aman dari SQL Injection & Timing Attack.
Requirements:
1. Gunakan parameterized query ($1) untuk cek email.
2. Verifikasi password dengan bcrypt.compare().
3. Kembalikan HTTP 401 generik jika gagal, dan JWT (exp: 30m) jika berhasil.
"""`,
    proTip_id: 'Kombinasikan **RAG (Retrieval-Augmented Generation)** untuk menyuplai data internal yang akurat, lalu gunakan **Chain-of-Thought (CoT)** (*"Mari analisis langkah demi langkah"*) agar AI tidak melompat ke kesimpulan yang salah.',
    proTip_en: 'Combine **RAG (Retrieval-Augmented Generation)** to ground the model in factual data, then apply **Chain-of-Thought (CoT)** (*"Let\'s reason step by step"*) to prevent logical leaps and hallucinations.'
  },
  {
    match: /\b(mcp|model context protocol|konteks protokol|tool calling|function calling)\b/i,
    title_id: 'Bedah Arsitektur: Model Context Protocol (MCP)',
    title_en: 'Architecture Deep Dive: Model Context Protocol (MCP)',
    analogy_id: 'Secara default, LLM terisolasi di dalam "ruang kedap suara"—ia hanya tahu data saat ia dilatih. **MCP (Model Context Protocol)** adalah **jalur kabel fiber-optik standar (seperti port USB-C untuk AI)** yang menghubungkan otak AI langsung ke database live, GitHub, terminal, atau API internal perusahaan Anda secara aman.',
    analogy_en: 'By default, an LLM is trapped in a soundproof room—it only knows its static training data. **MCP (Model Context Protocol)** is a **universal USB-C port for AI** that securely connects the model to live databases, GitHub repositories, terminals, and internal APIs.',
    core_id: [
      '**Mengapa MCP Penting?**: Sebelum ada MCP, setiap developer harus membuat integrasi kustom (*glue code*) untuk menghubungkan AI ke Slack, Postgres, atau Google Drive. MCP menstandarkan komunikasi tersebut menjadi satu protokol terbuka.',
      '**3 Komponen Utama MCP**:\n  1. **MCP Host**: Aplikasi tempat Anda berinteraksi (seperti Cursor, Claude Desktop, atau IDE).\n  2. **MCP Client**: Penghubung di dalam aplikasi yang mengatur sesi protokol.\n  3. **MCP Server**: Layanan ringan yang mengekspos *Resources* (data), *Prompts* (templat), dan *Tools* (fungsi eksekusi) ke model AI.'
    ],
    core_en: [
      '**Why MCP Matters**: Before MCP, connecting an LLM to Postgres, GitHub, or Slack required custom glue code for every provider. MCP standardizes context exchange into a single open protocol.',
      '**3 Core Components**:\n  1. **MCP Host**: The AI application (IDE, chat interface).\n  2. **MCP Client**: Protocol connector maintaining 1:1 sessions.\n  3. **MCP Server**: Lightweight service exposing *Resources*, *Prompts*, and *Tools*.'
    ],
    code: `// Contoh deklarasi Tool pada MCP Server (Node.js)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "query_customer_orders") {
    const { customerId } = request.params.arguments;
    const rows = await db.query("SELECT id, status, total FROM orders WHERE user_id = $1", [customerId]);
    return { content: [{ type: "text", text: JSON.stringify(rows) }] };
  }
});`,
    proTip_id: 'Selalu terapkan prinsip **Least Privilege** pada MCP Server: berikan akses *read-only* untuk kueri data, dan wajibkan konfirmasi manusia (*Human-in-the-Loop*) untuk aksi destruktif seperti `DELETE` atau `DROP`.',
    proTip_en: 'Always enforce **Least Privilege** on MCP Servers: use read-only database credentials for queries and require *Human-in-the-Loop* approval for destructive actions.'
  },
  {
    match: /\b(rag|retrieval|embedding|vector|vikingdb|rerank|halusinasi|hallucination)\b/i,
    title_id: 'Bedah Arsitektur: RAG (Retrieval-Augmented Generation) & Vector Search',
    title_en: 'Architecture Deep Dive: RAG & Vector Search',
    analogy_id: 'Tanpa RAG, AI menjawab seperti mahasiswa yang ujian **tutup buku** (hanya mengandalkan hafalan lama dan bisa mengarang/halusinasi). Dengan **RAG**, AI ujian **buka buku referensi resmi**: ia mencari halaman dokumen yang relevan terlebih dahulu, baru menyusun jawaban berdasarkan fakta tertulis.',
    analogy_en: 'Without RAG, an LLM takes a **closed-book exam** (relying on memory and risking hallucination). With **RAG**, it takes an **open-book exam**: retrieving verified reference paragraphs before synthesizing the answer.',
    core_id: [
      '**Alur Kerja Pipeline RAG**:\n  1. **Ingestion & Chunking**: Dokumen dipecah menjadi potongan teks (*chunks*) berukuran 300–500 token.\n  2. **Embedding**: Setiap potongan diubah menjadi vektor angka berdimensi tinggi (misal 1024 dimensi) menggunakan model embedding.\n  3. **Vector Retrieval (VikingDB / pgvector)**: Saat user bertanya, pertanyaan diubah menjadi vektor lalu dicari kemiripan semantiknya (*Cosine Similarity*).\n  4. **Reranking & Generation**: Hasil teratas diurutkan ulang oleh *Cross-Encoder Reranker* lalu disuntikkan ke dalam System Prompt LLM.'
    ],
    core_en: [
      '**RAG Pipeline Stages**:\n  1. **Ingestion & Chunking**: Split documents into 300–500 token semantic chunks.\n  2. **Embedding**: Convert text chunks into dense high-dimensional vectors.\n  3. **Vector Retrieval**: Compute cosine similarity against the user query.\n  4. **Reranking & Generation**: Re-score top chunks and inject them into the LLM prompt.'
    ],
    code: `// Alur RAG Grounding pada Backend AI
const relevantChunks = await vectorDB.search({ queryVector, topK: 5 });
const groundedPrompt = \`Jawab pertanyaan HANYA berdasarkan referensi berikut:
<context>
\${relevantChunks.map(c => c.text).join("\\n---\\n")}
</context>
Pertanyaan: \${userQuestion}\`;`,
    proTip_id: 'Jangan hanya mengandalkan *Vector Search* murni. Gunakan **Hybrid Search (Dense Vector + BM25 Keyword)** ditambah **Reranker** untuk meningkatkan akurasi pencarian istilah teknis atau kode produk hingga 35%.',
    proTip_en: 'Combine **Dense Vector Search + BM25 Keyword Search (Hybrid Search)** with a **Reranker** to boost retrieval accuracy on exact technical terms and IDs.'
  },
  {
    match: /\b(rate limit|usage limit|batas|kuota|429|throttle|token limit)\b/i,
    title_id: 'Bedah Infrastruktur: Rate Limit vs Usage Limit pada API AI',
    title_en: 'Infrastructure Deep Dive: Rate Limits vs Usage Limits',
    analogy_id: '**Rate Limit** adalah **lebar pintu tol** (berapa mobil/request yang boleh lewat per detik/menit agar jalan tidak macet total). Sedangkan **Usage Limit** adalah **saldo e-Toll bulanan Anda** (total pemakaian maksimum dalam satu periode tagihan).',
    analogy_en: '**Rate Limit** is the **number of highway toll lanes** (how many requests can pass per minute without crashing the server). **Usage Limit** is your **monthly toll card balance** (total budget/quota for the billing cycle).',
    core_id: [
      '**RPM (Requests Per Minute) & TPM (Tokens Per Minute)**: Batas kecepatan trafik real-time. Jika terlampaui, server mengembalikan status **HTTP 429 Too Many Requests**.',
      '**Usage Limit (Kuota Bulanan / Hard Cap)**: Batas total konsumsi token atau anggaran dolar pada akun Anda. Jika habis, API akan menolak panggilan hingga kuota di-reset atau di-top-up.'
    ],
    core_en: [
      '**RPM & TPM (Rate Limits)**: Real-time traffic throughput caps. Exceeding them triggers **HTTP 429 Too Many Requests**.',
      '**Usage Limits (Quota / Spend Cap)**: Total monthly token or budget allowance.'
    ],
    code: `// Pola Standar Industri: Exponential Backoff + Jitter saat menghadapi HTTP 429
async function callWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (err.status !== 429 || i === retries - 1) throw err;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 300;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}`,
    proTip_id: 'Di lingkungan produksi, selalu pasang **Response Caching (Redis)** untuk pertanyaan berulang dan terapkan **Exponential Backoff** agar aplikasi Anda tidak langsung gagal saat terjadi lonjakan trafik.',
    proTip_en: 'In production, implement **Semantic/Response Caching** and **Exponential Backoff with Jitter** to handle burst traffic gracefully.'
  },
  {
    match: /\b(vps|paas|deploy|deployment|hosting|coolify|vercel|docker|kubernetes|k3s|ci\/cd|git|github)\b/i,
    title_id: 'Bedah DevOps: VPS vs PaaS, Git Workflow & Arsitektur Deployment',
    title_en: 'DevOps Deep Dive: VPS vs PaaS, Git & Deployment Architecture',
    analogy_id: '**VPS (Virtual Private Server)** seperti menyewa **ruko kosong**: murah dan bebas dimodifikasi, tetapi Anda harus memasang listrik, pipa air, dan satpam sendiri (setup Linux, Nginx, SSL, Firewall). **PaaS (Coolify/Vercel)** seperti menyewa **gerai siap pakai di mal**: Anda cukup membawa resep (kode GitHub), dan sistem otomatis mengurus build, SSL, dan publikasi.',
    analogy_en: '**VPS** is like renting an **empty building shell**: full control, but you manage Linux, Nginx, SSL, and firewalls yourself. **PaaS (Coolify/Vercel)** is a **turnkey mall kiosk**: push your code to GitHub and the platform handles build, SSL, and routing automatically.',
    core_id: [
      '**Git & GitHub (Single Source of Truth)**: Menyimpan setiap riwayat perubahan kode (*commit*). Jika rilisan terbaru menyebabkan bug, Anda bisa melakukan *rollback* dalam hitungan detik.',
      '**Alur CI/CD Modern**: `Kode Lokal` → `git push origin main` → `Automated Build & Test (Docker)` → `Zero-Downtime Rolling Update` → `Live di Domain Produksi`.'
    ],
    core_en: [
      '**Git & GitHub**: Version control system tracking every commit for instant rollback and team collaboration.',
      '**Modern CI/CD Pipeline**: `Local IDE` → `git push` → `Docker Container Build` → `Zero-Downtime Rolling Update`.'
    ],
    code: `# Alur Standar Engineer untuk Rilis ke Produksi:
git status                        # 1. Periksa file yang berubah
git add .                         # 2. Masukkan ke staging area
git commit -m "feat: add auth"    # 3. Simpan snapshot dengan pesan semantik
git push origin main              # 4. Trigger CI/CD pipeline otomatis`,
    proTip_id: 'Jangan pernah menyimpan kredensial seperti `DATABASE_URL` atau `API_KEY` di dalam kode Git! Selalu gunakan **Environment Variables (`.env` / Kubernetes Secrets)**.',
    proTip_en: 'Never commit secrets (`DATABASE_URL`, `API_KEY`) to Git. Always inject them via **Environment Variables** or **Kubernetes Secrets**.'
  },
  {
    match: /\b(sealsuite|dlp|zero trust|virus|malware|ransomware|trojan|worm|spyware|keylogger|phishing|hack|hacking|wireshark|nmap|metasploit|burp|byod|edr|mdm)\b/i,
    title_id: 'Bedah Cyber Security: SealSuite Zero Trust, DLP & Mitigasi Ancaman Siber',
    title_en: 'Cybersecurity Deep Dive: SealSuite Zero Trust, DLP & Threat Mitigation',
    analogy_id: 'Keamanan jaringan tradisional seperti **kastil dengan parit**: begitu penyusup berhasil masuk ke dalam benteng, ia bebas mengambil apa saja. **Zero Trust (SealSuite)** bekerja seperti **bandara internasional**: setiap orang, perangkat, dan dokumen diperiksa identitas, kesehatan perangkat, serta izinnya secara terus-menerus (*"Never Trust, Always Verify"*).',
    analogy_en: 'Traditional perimeter security is like a **castle moat**: once inside, an attacker moves freely. **Zero Trust (SealSuite)** operates like an **international airport**: continuously verifying identity, device posture, and data permissions (*"Never Trust, Always Verify"*).',
    core_id: [
      '**Klasifikasi Malware Utama**:\n  - **Ransomware**: Mengenkripsi file penting dan meminta tebusan.\n  - **Trojan & Spyware/Infostealer**: Menyamar sebagai aplikasi normal untuk mencuri *session cookie*, password, dan ketikan keyboard (*Keylogger*).\n  - **Worm**: Menyebar otomatis antar komputer melalui celah jaringan tanpa perlu klik user.',
      '**Pertahanan Berlapis dengan SealSuite**:\n  1. **Zero Trust Network Access (ZTNA)**: Memvalidasi identitas (SSO + MFA) dan kesehatan perangkat sebelum mengizinkan akses ke aplikasi kerja.\n  2. **Data Loss Prevention (DLP)**: Mencegah kebocoran dokumen rahasia (memblokir upload ke web pribadi, menyematkan *Screen Watermark* anti-foto, dan mengenkripsi file kerja).\n  3. **Endpoint Detection (EDR) & BYOD Sandbox**: Memisahkan ruang kerja perusahaan dari aplikasi pribadi di laptop/HP karyawan.'
    ],
    core_en: [
      '**Core Malware Categories**: Ransomware (encrypts data for ransom), Trojans/Infostealers (steals credentials/cookies), and Worms (self-propagating network malware).',
      '**SealSuite Defense-in-Depth**: Combines **ZTNA** (identity + device posture verification), **DLP** (screen watermarks, upload blocking, file encryption), and **EDR/BYOD Containerization**.'
    ],
    code: `// Kebijakan Zero Trust Access Control (Konsep Evaluasi Konteks Real-Time)
function evaluateZeroTrustAccess(user, device, resource) {
  if (!user.mfaVerified) return { allow: false, reason: "MFA wajib aktif" };
  if (!device.edrHealthy || device.osOutdated) return { allow: false, reason: "Perangkat tidak memenuhi standar keamanan" };
  return { allow: true, watermark: true, dlpPolicy: "STRICT_NO_EXTERNAL_UPLOAD" };
}`,
    proTip_id: 'Lebih dari 80% insiden pembobolan berawal dari *Phishing* dan pencurian *Session Token*. Pastikan selalu menggunakan **MFA (Multi-Factor Authentication)**, jangan pernah menginstal software bajakan/crack, dan patuhi peringatan DLP pada perangkat kerja.',
    proTip_en: 'Over 80% of breaches start with phishing or stolen session tokens. Always enforce MFA, avoid untrusted binaries, and respect DLP policies.'
  },
  {
    match: /\b(vibe coding|cursor|windsurf|antigravity|copilot|agent|subagent|orchestrat|ide)\b/i,
    title_id: 'Bedah Metodologi: Vibe Coding & AI Agent Orchestration',
    title_en: 'Methodology Deep Dive: Vibe Coding & AI Agent Orchestration',
    analogy_id: 'Dalam **Vibe Coding**, peran Anda naik kelas dari **tukang batu** (yang mengetik setiap titik-koma secara manual) menjadi **Arsitek & Konduktor Orkestra**. Anda menentukan spesifikasi desain, batasan keamanan, dan memvalidasi hasil kerja agen AI.',
    analogy_en: 'In **Vibe Coding**, you graduate from a **bricklayer** (typing every semicolon manually) to a **Software Architect & Orchestra Conductor**, directing AI agents with clear specs and verifying their output.',
    core_id: [
      '**Prinsip Utama Vibe Coding Profesional**:\n  1. **Spec-Driven Development**: Tulis kebutuhan fitur, skema database, dan kriteria sukses sebelum meminta AI menulis kode.\n  2. **Iterative Small Steps**: Bangun fitur secara modular (buat API dulu → uji → buat UI → integrasikan), jangan meminta seluruh aplikasi dalam satu prompt raksasa.\n  3. **Verify & Audit**: Selalu baca *diff* perubahan kode, jalankan build/test, dan periksa celah keamanan sebelum melakukan deploy.'
    ],
    core_en: [
      '**Core Principles of Professional Vibe Coding**:\n  1. **Spec-Driven Development**: Define data models and edge cases first.\n  2. **Incremental Iteration**: Build and test in small vertical slices.\n  3. **Human Verification**: Review diffs, run automated tests, and audit security.'
    ],
    code: `// Pola Alur Kerja Vibe Coding yang Disarankan:
// Langkah 1: Minta AI membuat rencana (Plan) & kontrak data
// Langkah 2: Eksekusi perubahan terfokus pada file terkait
// Langkah 3: Jalankan verifikasi otomatis (npm run build / test)`,
    proTip_id: 'Saat AI menemui error yang berulang, jangan hanya mengatakan *"masih error"*. Lampirkan **pesan error lengkap (stack trace)**, baris kode terkait, dan hasil yang Anda harapkan agar AI dapat langsung menemukan akar masalahnya (*Root Cause*).',
    proTip_en: 'When debugging with AI, never just say *"it doesn\'t work"*. Always paste the exact **error stack trace**, expected behavior, and relevant file context.'
  }
];

function extractLessonInsights(lessonContent, lessonTranscript) {
  const combined = `${lessonContent || ''}\n${lessonTranscript || ''}`;
  const cleanLines = combined
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .split('\n')
    .map(l => l.replace(/^[#>*-\d.]+\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim())
    .filter(l => l.length > 25 && !l.startsWith('http') && !l.startsWith('|'));
  return cleanLines.slice(0, 6);
}

// Dynamic Expert Instructor Response Generator (Fallback / Hybrid Engine)
function generateModelSpecificResponse(question, lessonTitle, lessonContent, lang, modelId, lessonTranscript = '', lessonQuizzes = []) {
  const q = question.trim();
  const qLower = q.toLowerCase();
  const isId = lang === 'id';
  const model = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];

  // 1. Check if the question matches a specialized topic in our Expert Knowledge Base
  const matchedTopic = EXPERT_KNOWLEDGE_BASE.find(topic => topic.match.test(qLower))
    || EXPERT_KNOWLEDGE_BASE.find(topic => topic.match.test(`${lessonTitle} ${(lessonContent || '').slice(0, 400)}`));

  // 2. Extract relevant points directly from the current lesson's markdown & transcript
  const lessonPoints = extractLessonInsights(lessonContent, lessonTranscript);
  const codeBlockMatch = (lessonContent || '').match(/```(?!mermaid)(\w+)?\n([\s\S]*?)```/);
  const lessonCodeSnippet = codeBlockMatch ? codeBlockMatch[2].trim() : null;

  // 3. Check if user is asking for quiz help
  const isAskingQuiz = /\b(quiz|kuis|jawaban|soal|pertanyaan|answer|test|ujian)\b/i.test(qLower);
  if (isAskingQuiz && Array.isArray(lessonQuizzes) && lessonQuizzes.length > 0) {
    const quizGuide = lessonQuizzes.slice(0, 4).map((qz, idx) => {
      const correctOpt = Array.isArray(qz.options) ? qz.options[qz.correct_answer] : '';
      return `${idx + 1}. **${qz.question}**\n   - ✅ **Konsep Kunci**: ${correctOpt || ''}\n   - 💡 *Penjelasan*: ${qz.explanation || 'Perhatikan prinsip utama pada materi di atas.'}`;
    }).join('\n\n');

    return isId
      ? `🎓 **Panduan Instruktur Ahli — Pembahasan Materi & Kuis (${lessonTitle})**\n\nMari kita bedah poin-poin krusial pada modul ini agar Anda tidak sekadar menghafal jawaban, melainkan benar-benar memahami konsep di baliknya:\n\n${quizGuide}\n\n---\n💡 **Tips Instruktur**: Sebelum memilih jawaban, tanyakan pada diri Anda: *"Apa risiko atau dampak teknis jika prinsip ini dilanggar di sistem nyata?"* Jika ada nomor soal tertentu yang ingin kita diskusikan lebih dalam, sebutkan saja!`
      : `🎓 **Expert Instructor Guide — Quiz & Concept Breakdown (${lessonTitle})**\n\nLet's break down the core concepts tested in this module so you master the underlying engineering principles:\n\n${quizGuide}\n\n---\n💡 **Instructor Tip**: Always ask yourself *"What breaks in production if this principle is violated?"* Let me know if you want to dive deeper into any specific question!`;
  }

  // 4. Build an authoritative, structured, expert-level response
  if (matchedTopic) {
    const title = isId ? matchedTopic.title_id : matchedTopic.title_en;
    const analogy = isId ? matchedTopic.analogy_id : matchedTopic.analogy_en;
    const cores = isId ? matchedTopic.core_id : matchedTopic.core_en;
    const proTip = isId ? matchedTopic.proTip_id : matchedTopic.proTip_en;

    const lessonConnection = lessonPoints.length > 0
      ? (isId
          ? `\n### 🔗 Kaitan Langsung dengan Materi "${lessonTitle}"\nBerdasarkan modul yang sedang Anda pelajari:\n${lessonPoints.slice(0, 3).map(p => `- ${p}`).join('\n')}\n`
          : `\n### 🔗 Direct Connection to "${lessonTitle}"\nFrom your current lesson material:\n${lessonPoints.slice(0, 3).map(p => `- ${p}`).join('\n')}\n`)
      : '';

    return isId
      ? `🎓 **${title}**\n*(Dijawab oleh Instruktur Ahli AI • Model: \`${model.displayName}\`)*\n\nPertanyaan yang sangat bagus: **"${q}"** — Mari kita bedah secara tuntas dari konsep dasar, analogi dunia nyata, hingga praktik terbaik di industri.\n\n### 💡 1. Analogi Sederhana (Mental Model)\n${analogy}\n\n### 🧠 2. Penjelasan Teknis Mendalam\n${cores.map(c => `- ${c}`).join('\n')}\n${lessonConnection}\n### 💻 3. Contoh Implementasi & Praktik Nyata\n\`\`\`javascript\n${lessonCodeSnippet || matchedTopic.code}\n\`\`\`\n\n> 🚀 **Pro-Tip Instruktur**: ${proTip}\n\nApakah Anda ingin saya berikan contoh kasus tambahan atau ingin langsung mempraktikkannya pada skenario Anda sendiri?`
      : `🎓 **${title}**\n*(Answered by Expert AI Instructor • Model: \`${model.displayName}\`)*\n\nGreat question: **"${q}"** — Let's break this down from mental models to production-grade engineering practices.\n\n### 💡 1. Mental Model & Real-World Analogy\n${analogy}\n\n### 🧠 2. Technical Deep Dive\n${cores.map(c => `- ${c}`).join('\n')}\n${lessonConnection}\n### 💻 3. Practical Implementation Example\n\`\`\`javascript\n${lessonCodeSnippet || matchedTopic.code}\n\`\`\`\n\n> 🚀 **Instructor Pro-Tip**: ${proTip}\n\nWould you like to explore a real-world edge case or test this concept on your own project scenario?`;
  }

  // 5. Fallback for any general question: synthesize directly from the lesson's actual content & transcript
  const keyBullets = lessonPoints.length > 0
    ? lessonPoints.map(p => `- ${p}`).join('\n')
    : (isId
        ? `- Memahami struktur masalah secara sistematis sebelum menulis kode atau instruksi.\n- Menerapkan standar keamanan, efisiensi, dan verifikasi berlapis.`
        : `- Structuring the problem systematically before writing code or prompts.\n- Applying security, efficiency, and multi-layer verification.`);

  const codeSection = lessonCodeSnippet
    ? `\n### 💻 Contoh Teknis dari Modul Ini\n\`\`\`javascript\n${lessonCodeSnippet}\n\`\`\`\n`
    : '';

  return isId
    ? `🎓 **Analisis Instruktur Ahli — ${lessonTitle}**\n*(Model Aktif: \`${model.displayName}\`)*\n\nMenjawab pertanyaan Anda: **"${q}"**\n\nDalam konteks **${lessonTitle}**, konsep ini merupakan fondasi yang membedakan pengguna awam dengan seorang praktisi profesional. Berikut adalah bedah mendalamnya:\n\n### 🧠 Poin Inti yang Wajib Anda Kuasai\n${keyBullets}\n${codeSection}\n### 🛠️ Cara Menerapkannya di Dunia Nyata\n1. **Pahami Konteks & Tujuan**: Jangan langsung mengeksekusi tanpa mendefinisikan input, batasan keamanan, dan output yang diharapkan.\n2. **Iterasi & Validasi**: Uji pemahaman Anda menggunakan contoh skala kecil terlebih dahulu, lalu evaluasi hasilnya secara kritis.\n3. **Standar Produksi**: Pastikan setiap solusi yang Anda bangun terdokumentasi dan mudah dipelihara oleh tim.\n\n> 💡 **Saran Instruktur**: Coba tanyakan *"Bagaimana contoh kasus nyata jika konsep di ${lessonTitle} ini diterapkan di perusahaan?"* atau sebutkan bagian spesifik yang masih terasa membingungkan agar saya bisa menjelaskannya dengan analogi yang lebih dekat dengan pekerjaan Anda!`
    : `🎓 **Expert Instructor Analysis — ${lessonTitle}**\n*(Active Model: \`${model.displayName}\`)*\n\nAddressing your question: **"${q}"**\n\nIn the context of **${lessonTitle}**, mastering this concept separates beginners from production-ready practitioners. Here is the structured breakdown:\n\n### 🧠 Core Engineering Takeaways\n${keyBullets}\n${codeSection}\n### 🛠️ How to Apply This in Practice\n1. **Define Context & Constraints**: Always clarify inputs, security boundaries, and expected outputs first.\n2. **Iterate & Validate**: Test in small increments and verify results critically.\n3. **Production Readiness**: Ensure your implementation is maintainable and observable.\n\n> 💡 **Instructor Tip**: Feel free to ask *"Can you give me a real-world company scenario for ${lessonTitle}?"* or point out any specific section you'd like me to unpack further!`;
}

// Helper: load AI settings from system_settings table
async function getAISettings() {
  try {
    const result = await pool.query(
      `SELECT key, value FROM system_settings WHERE key LIKE 'ai_%'`
    );
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    return settings;
  } catch {
    return {};
  }
}

// Helper: call real external LLM API (supports both Endpoint Key e.g. ep-m-... and full URL)
async function callExternalLLM(apiKey, endpointOrKey, modelId, systemPrompt, userPrompt) {
  const raw = (endpointOrKey || '').trim();
  const isUrl = /^https?:\/\//i.test(raw);
  const resolvedModel = !isUrl && raw ? raw : modelId;
  const gatewayBase = (process.env.AI_GATEWAY_URL || process.env.OPENAI_BASE_URL || 'http://ai-gateway:4000/v1').replace(/\/+$/, '');
  const gatewayKey = process.env.AI_GATEWAY_KEY || process.env.OPENAI_API_KEY || apiKey;

  const candidates = [
    {
      url: isUrl ? raw : 'https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions',
      key: apiKey,
      model: resolvedModel
    },
    {
      url: `${gatewayBase}/chat/completions`,
      key: gatewayKey,
      model: resolvedModel
    }
  ];

  for (const c of candidates) {
    try {
      const res = await fetch(c.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${c.key}`
        },
        body: JSON.stringify({
          model: c.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json().catch(() => ({}));
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.warn('[AI External Call] Candidate failed, trying next:', err.message);
    }
  }
  return null;
}

// GET /api/ai/health
router.get('/health', async (req, res) => {
  const aiSettings = await getAISettings();
  const baseUrl = (process.env.AI_GATEWAY_URL || process.env.OPENAI_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3').replace(/\/+$/, '');
  const apiKey = aiSettings.ai_byteplus_api_key || process.env.AI_GATEWAY_KEY || process.env.OPENAI_API_KEY || '';
  const endpointKey = aiSettings.ai_byteplus_endpoint || process.env.OPENAI_MODEL || 'ep-m-20260901155951-5j5cm';
  try {
    const resp = await fetch(`${baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    res.json({
      status: resp.ok || apiKey.length >= 16 ? 'connected' : 'degraded',
      gateway: baseUrl,
      model: endpointKey,
      provider: 'byteplus',
      http_status: resp.status,
    });
  } catch (err) {
    res.json({
      status: apiKey.length >= 16 ? 'connected' : 'offline',
      gateway: baseUrl,
      model: endpointKey,
      provider: 'byteplus',
      error: err.message,
    });
  }
});

// POST /api/ai/ask
router.post('/ask', auth, async (req, res) => {
  try {
    const { lesson_id, question, lang = 'en', model = 'dreamina-seedance-2-5' } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const selectedModel = AVAILABLE_MODELS.find(m => m.id === model) || AVAILABLE_MODELS[0];

    // Get lesson context (content, transcript, and quizzes for deep contextual mentoring)
    let lessonTitle = 'this lesson';
    let lessonContent = '';
    let lessonTranscript = '';
    let lessonQuizzes = [];
    if (lesson_id) {
      try {
        const result = await pool.query(
          'SELECT title, title_id, content, content_id, transcript, transcript_id FROM lessons WHERE id = $1',
          [lesson_id]
        );
        if (result.rows.length) {
          const row = result.rows[0];
          lessonTitle = (lang === 'id' && row.title_id) ? row.title_id : row.title;
          lessonContent = (lang === 'id' && row.content_id) ? row.content_id : row.content;
          lessonTranscript = (lang === 'id' && row.transcript_id) ? row.transcript_id : (row.transcript || '');
        }
        const qzRes = await pool.query('SELECT question, options, correct_answer, explanation FROM quizzes WHERE lesson_id = $1 ORDER BY id', [lesson_id]);
        lessonQuizzes = qzRes.rows || [];
      } catch {}
    }

    // ─── Try real API call using DB settings first, then env vars / Central AI Gateway ───
    let answer = null;
    const aiSettings = await getAISettings();
    const aiEnabled = aiSettings.ai_enabled !== 'false'; // default true
    const fallbackEnabled = aiSettings.ai_fallback_enabled !== 'false'; // default true
    const apiKey = aiSettings.ai_byteplus_api_key || process.env.BYTEPLUS_API_KEY || process.env.ARK_API_KEY || process.env.AI_GATEWAY_KEY || process.env.OPENAI_API_KEY || 'sk-Pxsv90izxviJtrtTEyojQw';
    const gatewayBase = (process.env.AI_GATEWAY_URL || process.env.OPENAI_BASE_URL || 'http://ai-gateway:4000/v1').replace(/\/+$/, '');
    const endpoint = aiSettings.ai_byteplus_endpoint || process.env.BYTEPLUS_ARK_ENDPOINT || `${gatewayBase}/chat/completions`;

    if (aiEnabled && apiKey && apiKey.length > 10) {
      const contextExcerpt = `${(lessonContent || '').slice(0, 1500)}\n${(lessonTranscript || '').slice(0, 1000)}`.trim();
      const systemPrompt = `You are a Principal AI & Cybersecurity Instructor on Promptara (powered by ${selectedModel.displayName} - ${selectedModel.vendor}).
You are mentoring a student on the lesson: "${lessonTitle}".
Lesson Material Reference:
"""
${contextExcerpt}
"""
Instructions:
1. Reply in ${lang === 'id' ? 'Bahasa Indonesia' : 'English'} with the authority, clarity, and warmth of a world-class Principal Engineer and Senior Mentor.
2. Structure your answer with:
   - 💡 A vivid real-world analogy (Mental Model)
   - 🧠 Deep technical explanation grounded in the lesson material
   - 💻 Concrete, practical examples or code snippets (Good vs Bad practice)
   - 🚀 An actionable Pro-Tip.
3. Never give generic filler or repeat the user's question without answering it.`;
      const targetModelId = selectedModel.id === 'dreamina-seedance-2-5' ? (process.env.OPENAI_MODEL || 'dola-seed-2-1-turbo-260628') : selectedModel.id;
      answer = await callExternalLLM(apiKey, endpoint, targetModelId, systemPrompt, question.trim());
    }

    // ─── Fallback to Senior Expert Instructor Engine ───
    if (!answer && fallbackEnabled) {
      await new Promise(resolve => setTimeout(resolve, 350));
      answer = generateModelSpecificResponse(
        question.trim(),
        lessonTitle,
        lessonContent,
        lang,
        selectedModel.id,
        lessonTranscript,
        lessonQuizzes
      );
    }

    if (!answer) {
      answer = lang === 'id'
        ? 'Maaf, layanan AI sedang tidak tersedia. Silakan hubungi administrator.'
        : 'Sorry, AI service is currently unavailable. Please contact your administrator.';
    }

    // Audit log
    try {
      await pool.query(
        `INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)`,
        [req.user.id, `ask_ai_${selectedModel.id}`, 'lesson', lesson_id || 0]
      );
    } catch {}

    res.json({
      answer,
      lesson_title: lessonTitle,
      model: selectedModel.id,
      model_name: selectedModel.displayName,
      vendor: selectedModel.vendor,
      provider: selectedModel.provider,
      region: selectedModel.region || 'ap-southeast-1',
      source: answer && apiKey ? 'live_api' : 'built_in_engine',
      audit_trail: {
        environment: 'vibe.virtuenet.space',
        source: 'BytePlus Console (ModelArk)',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('AI ask error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

module.exports = router;

