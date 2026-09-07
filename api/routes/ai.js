const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || process.env.OPENAI_BASE_URL || 'http://ai-gateway:4000/v1';
const AI_GATEWAY_KEY = process.env.AI_GATEWAY_KEY || process.env.OPENAI_API_KEY || 'sk-Pxsv90izxviJtrtTEyojQw';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'dola-seed-2-1-turbo-260628';

// Smart contextual responses by topic detection (Graceful fallback)
function generateResponse(question, lessonTitle, lang) {
  const q = question.toLowerCase();
  const isId = lang === 'id';

  // Detect topics
  const isAboutXP      = /xp|experience|level|poin|point/.test(q);
  const isAboutCode    = /code|kode|program|function|fungsi|variable|variabel/.test(q);
  const isAboutAI      = /ai|artificial|llm|prompt|gpt|model/.test(q);
  const isAboutSecurity= /security|keamanan|hack|inject|sql/.test(q);
  const isAboutPrompt  = /prompt|instruction|instruksi/.test(q);
  const isHowTo        = /how|cara|bagaimana|gimana/.test(q);
  const isWhy          = /why|kenapa|mengapa|why/.test(q);
  const isExample      = /example|contoh|like|seperti/.test(q);

  if (isAboutXP) {
    return isId
      ? `XP (Experience Points) adalah cara Promptara mengukur kemajuan belajarmu! Kamu mendapatkan XP dengan:\n• Menyelesaikan pelajaran (+50 XP)\n• Lulus kuis (+100 XP)\n• Menyelesaikan lab (+150 XP)\n• Menyelesaikan kursus penuh (+500 XP)\n\nKumpulkan 500 XP untuk naik level! 🚀`
      : `XP (Experience Points) is how Promptara measures your progress! You earn XP by:\n• Completing lessons (+50 XP)\n• Passing quizzes (+100 XP)\n• Finishing labs (+150 XP)\n• Completing full courses (+500 XP)\n\nCollect 500 XP to level up! 🚀`;
  }

  if (isAboutPrompt) {
    return isId
      ? `Prompt adalah instruksi yang kamu berikan ke AI. Prompt yang baik biasanya:\n1. **Jelas dan spesifik** — hindari kata yang ambigu\n2. **Berikan konteks** — ceritakan situasinya\n3. **Tentukan format output** — misalnya "jawab dalam 3 poin"\n4. **Iteratif** — refinement setiap percakapan\n\nCoba: "Tulis fungsi JavaScript yang..." alih-alih "Buat kode"`
      : `A prompt is the instruction you give to AI. Great prompts are:\n1. **Clear and specific** — avoid ambiguous words\n2. **Provide context** — explain the situation\n3. **Specify output format** — e.g. "answer in 3 bullet points"\n4. **Iterative** — refine across turns\n\nTry: "Write a JavaScript function that..." instead of "make code"`;
  }

  if (isAboutAI) {
    return isId
      ? `AI (Artificial Intelligence) dalam konteks coding adalah tools yang dapat:\n• **Generate kode** dari deskripsi natural language\n• **Debug** dan menjelaskan error\n• **Review** kode dan saran perbaikan\n• **Explain** konsep teknis dengan cara mudah\n\nContoh tools: GitHub Copilot, ChatGPT, Claude, Gemini 💡`
      : `AI in a coding context refers to tools that can:\n• **Generate code** from natural language descriptions\n• **Debug** and explain errors\n• **Review** code and suggest improvements\n• **Explain** technical concepts in plain English\n\nExamples: GitHub Copilot, ChatGPT, Claude, Gemini 💡`;
  }

  if (isExample) {
    return isId
      ? `Contoh nyata dari **${lessonTitle}**:\n\nBayangkan kamu bekerja di startup dan bos minta fitur baru. Alih-alih coding dari nol, kamu bisa:\n1. Deskripsikan fitur ke AI: "Buat tombol yang menyimpan data ke localStorage"\n2. Dapatkan kode yang bisa dipakai langsung\n3. Modifikasi sesuai kebutuhan spesifik\n4. Review dan pastikan kodenya secure\n\nInilah inti dari Vibe Coding! ⚡`
      : `A real-world example from **${lessonTitle}**:\n\nImagine you're at a startup and your manager asks for a new feature. Instead of coding from scratch:\n1. Describe the feature to AI: "Create a button that saves data to localStorage"\n2. Get working code immediately\n3. Customize for your specific needs\n4. Review and ensure security\n\nThis is the essence of Vibe Coding! ⚡`;
  }

  if (isWhy) {
    return isId
      ? `Pertanyaan bagus! Ini penting karena:\n\n**${lessonTitle}** adalah skill yang dibutuhkan industri saat ini. Developer yang bisa berkolaborasi dengan AI mengerjakan lebih banyak hal dalam waktu lebih singkat.\n\nData menunjukkan developer yang menggunakan AI tools bisa menyelesaikan task **55% lebih cepat**. Itulah mengapa Vibe Coding adalah skill masa depan! 🔮`
      : `Great question! This matters because:\n\n**${lessonTitle}** is a skill the industry needs right now. Developers who collaborate with AI accomplish more in less time.\n\nStudies show AI-assisted developers complete tasks **55% faster**. That's why Vibe Coding is a future-proof skill! 🔮`;
  }

  if (isHowTo) {
    return isId
      ? `Cara terbaik untuk memahami **${lessonTitle}**:\n\n1. 📖 **Baca ulang** konten pelajaran perlahan-lahan\n2. 🧪 **Coba langsung** — buka lab yang relevan\n3. ❓ **Tanya spesifik** — kalau bingung, tanyakan konsep tertentu\n4. 🔁 **Ulangi** — ulangi materi sebelum lanjut ke pelajaran berikutnya\n\nApa bagian spesifik yang ingin kamu pahami lebih dalam?`
      : `The best way to understand **${lessonTitle}**:\n\n1. 📖 **Re-read** the lesson content slowly\n2. 🧪 **Try it yourself** — open the relevant lab\n3. ❓ **Ask specifically** — when stuck, ask about a specific concept\n4. 🔁 **Repeat** — review before moving to the next lesson\n\nWhat specific part would you like to dive deeper into?`;
  }

  // Default thoughtful response
  return isId
    ? `Pertanyaan menarik tentang **${lessonTitle}**! 🤔\n\nUntuk menjawab lebih baik, bisa kamu ceritakan lebih detail? Misalnya:\n• Konsep mana yang bikin bingung?\n• Kamu sudah mencoba apa?\n• Bagian mana dari pelajaran yang belum jelas?\n\nSaya siap membantu kamu memahami materi ini! 💪`
    : `Great question about **${lessonTitle}**! 🤔\n\nTo give you the best answer, could you be more specific? For example:\n• Which concept is confusing you?\n• What have you already tried?\n• Which part of the lesson is unclear?\n\nI'm here to help you master this material! 💪`;
}

// GET /api/ai/health
router.get('/health', async (req, res) => {
  const baseUrl = AI_GATEWAY_URL.replace(/\/+$/, '');
  try {
    const resp = await fetch(`${baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${AI_GATEWAY_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    res.json({
      status: resp.ok ? 'connected' : 'degraded',
      gateway: baseUrl,
      model: DEFAULT_MODEL,
      provider: 'byteplus',
      http_status: resp.status,
    });
  } catch (err) {
    res.json({
      status: 'offline',
      gateway: baseUrl,
      model: DEFAULT_MODEL,
      provider: 'byteplus',
      error: err.message,
    });
  }
});

// POST /api/ai/ask
router.post('/ask', auth, async (req, res) => {
  try {
    const { lesson_id, question, lang = 'en' } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const isId = lang === 'id';
    let lessonTitle = isId ? 'pelajaran ini' : 'this lesson';
    let lessonContent = '';

    // Get lesson context
    if (lesson_id) {
      try {
        const result = await pool.query(
          'SELECT title, title_id, content, content_id, transcript, transcript_id FROM lessons WHERE id = $1',
          [lesson_id]
        );
        if (result.rows.length) {
          const row = result.rows[0];
          lessonTitle = (isId ? row.title_id : row.title) || row.title || (isId ? 'pelajaran ini' : 'this lesson');
          lessonContent = (isId ? (row.content_id || row.content || row.transcript_id || row.transcript) : (row.content || row.transcript)) || '';
        }
      } catch (dbErr) {
        console.warn('Failed to load lesson context:', dbErr.message);
      }
    }

    let answer = null;
    let usedModel = DEFAULT_MODEL;

    // Connect to Central AI Gateway (LiteLLM) with BytePlus model
    try {
      const baseUrl = AI_GATEWAY_URL.replace(/\/+$/, '');
      const systemPrompt = isId
        ? `Kamu adalah Instruktur AI VibeLearn (Vibe Coding Academy), seorang mentor pemrograman dan AI yang ramah, jelas, dan berwawasan luas.
Konteks materi saat ini: "${lessonTitle}".
${lessonContent ? `Ringkasan/Konten Pelajaran:\n${lessonContent.slice(0, 3000)}\n` : ''}
Instruksi:
- Jawab pertanyaan siswa dengan ramah, jelas, edukatif, dan mudah dipahami.
- Fokus pada konsep Vibe Coding, AI coding collaboration, arsitektur, dan best practices.
- Gunakan bahasa Indonesia yang natural dan profesional.
- Berikan contoh nyata atau analogi jika membantu.
- Format teks menggunakan Markdown yang rapi.`
        : `You are the VibeLearn AI Instructor (Vibe Coding Academy), an encouraging, knowledgeable, and practical coding mentor.
Current lesson context: "${lessonTitle}".
${lessonContent ? `Lesson Content/Summary:\n${lessonContent.slice(0, 3000)}\n` : ''}
Instructions:
- Answer the student's question clearly, constructively, and educationally.
- Focus on Vibe Coding concepts, AI coding collaboration, architecture, and best practices.
- Use clear and professional English.
- Provide real-world examples or code snippets when relevant.
- Format your response with clean Markdown.`;

      const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_GATEWAY_KEY}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question.trim() }
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          answer = text.trim();
        }
      } else {
        const errorText = await aiResponse.text();
        console.warn(`[AI Gateway] Non-200 response (${aiResponse.status}):`, errorText);
      }
    } catch (aiErr) {
      console.warn('[AI Gateway] Error calling AI Gateway, falling back to local responses:', aiErr.message);
    }

    // Fallback if AI Gateway failed or was empty
    if (!answer) {
      usedModel = 'fallback-local';
      answer = generateResponse(question.trim(), lessonTitle, lang);
    }

    // Log the question for analytics
    try {
      await pool.query(
        `INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)`,
        [req.user.id, 'ask_instructor', 'lesson', lesson_id || 0]
      );
    } catch {}

    res.json({ answer, lesson_title: lessonTitle, model: usedModel });
  } catch (err) {
    console.error('AI ask error:', err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

module.exports = router;
