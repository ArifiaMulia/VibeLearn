require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const path = require('path');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/upload', require('./routes/upload'));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', async (req, res) => {
  const checks = { api: 'ok', database: 'unknown', uptime: process.uptime(), version: '3.1.3', timestamp: new Date().toISOString() };
  try {
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch (err) {
    checks.database = 'error';
    checks.dbError = err.message;
  }
  res.status(checks.database === 'ok' ? 200 : 503).json(checks);
});

// ─── DATABASE INITIALIZATION ───────────────────────────────────────────────
const initDb = async (retries = 10, delay = 3000) => {
  while (retries > 0) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'participant',
          plan VARCHAR(50) NOT NULL DEFAULT 'free',
          avatar TEXT,
          last_activity TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS courses (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          thumbnail TEXT,
          level VARCHAR(50) DEFAULT 'beginner',
          category VARCHAR(100) DEFAULT 'general',
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          is_published BOOLEAN DEFAULT false,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS labs (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          difficulty VARCHAR(50) DEFAULT 'beginner',
          xp_reward INTEGER DEFAULT 100,
          config JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS lessons (
          id SERIAL PRIMARY KEY,
          course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
          lab_id INTEGER REFERENCES labs(id) ON DELETE SET NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT DEFAULT '',
          video_url TEXT,
          type VARCHAR(50) DEFAULT 'text',
          xp_reward INTEGER DEFAULT 50,
          order_index INTEGER DEFAULT 0,
          difficulty VARCHAR(50) DEFAULT 'beginner',
          resources JSONB DEFAULT '[]',
          challenge_text TEXT DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS quizzes (
          id SERIAL PRIMARY KEY,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          correct_answer INTEGER NOT NULL,
          explanation TEXT DEFAULT '',
          format VARCHAR(50) DEFAULT 'multiple_choice',
          code_lines JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(lesson_id, question)
        );

        CREATE TABLE IF NOT EXISTS enrollments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
          enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP WITH TIME ZONE,
          UNIQUE(user_id, course_id)
        );

        CREATE TABLE IF NOT EXISTS progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'started',
          score INTEGER DEFAULT 0,
          completed_at TIMESTAMP WITH TIME ZONE,
          UNIQUE(user_id, lesson_id)
        );

        CREATE TABLE IF NOT EXISTS lab_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          lab_id INTEGER REFERENCES labs(id) ON DELETE CASCADE,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP WITH TIME ZONE,
          score INTEGER,
          submission JSONB DEFAULT '{}'
        );

        CREATE TABLE IF NOT EXISTS xp_log (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS achievements (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          badge_name VARCHAR(100) NOT NULL,
          earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, badge_name)
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          plan VARCHAR(50) DEFAULT 'free',
          status VARCHAR(50) DEFAULT 'active',
          started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE
        );

        CREATE TABLE IF NOT EXISTS usage_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          action VARCHAR(100) NOT NULL,
          resource_type VARCHAR(100),
          resource_id INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS subscription_plans (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          price_usd INTEGER NOT NULL,
          price_idr INTEGER NOT NULL,
          features JSONB DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS payment_verifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          plan VARCHAR(50) NOT NULL,
          billing_term VARCHAR(20) DEFAULT 'monthly',
          amount_idr INTEGER NOT NULL,
          sender_name VARCHAR(100) NOT NULL,
          bank_name VARCHAR(100) NOT NULL,
          receipt_url VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP WITH TIME ZONE
        );
      `);

      // Seed subscription_plans
      try {
        const existingPlans = await pool.query('SELECT id FROM subscription_plans LIMIT 1');
        if (!existingPlans.rows.length) {
          await pool.query(`
            INSERT INTO subscription_plans (id, name, price_usd, price_idr, features) VALUES 
            ('free', 'free', 0, 0, '["1 Introductory Course", "2 Beginner Labs", "Community Forum Access", "XP Tracking"]'),
            ('pro', 'pro', 29, 450000, '["All 5 Courses", "Unlimited Lab Access", "AI Code Review Scenarios", "Security Audit Labs", "Priority Support", "Verified Completion Badges"]'),
            ('enterprise', 'enterprise', 199, 3000000, '["Everything in Pro", "Custom Course Builder", "Team Management", "Dedicated Analytics Dashboard", "SLA Support", "White-label Options"]')
            ON CONFLICT (id) DO NOTHING
          `);
          console.log('✅ Seeded subscription_plans.');
        }
      } catch (err) {
        console.error('Error seeding subscription plans:', err);
      }

      // Add lab_id to lessons if it doesn't exist (migration)
      try {
        await pool.query(`ALTER TABLE lessons ADD COLUMN lab_id INTEGER REFERENCES labs(id) ON DELETE SET NULL;`);
        console.log('✅ Added lab_id to lessons table.');
      } catch (e) { /* Ignore if column already exists */ }

      // v1.5 migrations
      const migrations = [
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'beginner';`,
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';`,
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS challenge_text TEXT DEFAULT '';`,
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_id TEXT DEFAULT NULL;`,
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS challenge_text_id TEXT DEFAULT NULL;`,
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS transcript TEXT DEFAULT NULL;`,
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS transcript_id TEXT DEFAULT NULL;`,
        `ALTER TABLE lessons ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT NULL;`,
        `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS format VARCHAR(50) DEFAULT 'multiple_choice';`,
        `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS code_lines JSONB DEFAULT '[]';`,
        `ALTER TABLE courses ADD COLUMN IF NOT EXISTS required_plan VARCHAR(50) DEFAULT 'pro';`,
        `ALTER TABLE courses ADD COLUMN IF NOT EXISTS promo_expiry TIMESTAMP WITH TIME ZONE DEFAULT NULL;`,
      ];
      for (const sql of migrations) {
        try { await pool.query(sql); } catch (e) { /* ignore */ }
      }
      
      // Add UNIQUE constraint to quizzes if missing (migration)
      try {
        await pool.query(`
          DELETE FROM quizzes a USING quizzes b 
          WHERE a.id > b.id AND a.lesson_id = b.lesson_id AND a.question = b.question;
        `);
        await pool.query(`
          ALTER TABLE quizzes ADD CONSTRAINT quizzes_lesson_id_question_key UNIQUE (lesson_id, question);
        `);
        console.log('✅ Added UNIQUE constraint to quizzes table.');
      } catch (e) { /* ignore if already exists */ }

      // Populate translated title_id and content_id for Vibe Coding 101 if missing
      try {
        await pool.query(`
          UPDATE lessons 
          SET title_id = 'Pengenalan Vibe Coding', 
              content_id = '# Apa itu Vibe Coding?\n\nVibe coding adalah paradigma baru yang sepenuhnya berbeda dalam rekayasa perangkat lunak. Ini bukan sekadar "menggunakan AI untuk membantu Anda menulis kode." Ini adalah proses bertindak sebagai **Direktur** dan **Arsitek** sementara AI bertindak sebagai **Pengetik** dan **Pelaksana**.\n\nDi era AI, mengetik boilerplate standar, mengingat sintaks API yang tidak jelas, dan menulis perulangan standar secara manual adalah penggunaan modal manusia yang buruk. Nilai Anda sekarang berasal dari:\n1. Memahami kebutuhan bisnis.\n2. Memecah kebutuhan tersebut menjadi bagian-bagian arsitektur yang modular.\n3. Mengomunikasikan batasan, konteks, dan tujuan kepada AI (seperti Claude, GPT-4, atau Copilot).\n4. Meninjau kode yang dihasilkan untuk keamanan, kinerja, dan kebenaran.\n\n## Pergeseran Mental\nPemrograman tradisional mengajarkan Anda untuk berpikir linier tentang baris kode. Vibe coding mengajarkan Anda untuk berpikir abstrak tentang **sistem dan mesin status (state machines)**.\n\n\`\`\`mermaid\ngraph TD\n  A[Manusia: Tentukan Tujuan & Cakupan] --> B[Manusia: Arsitektur Model Data]\n  B --> C[Manusia: Tulis Prompt Kaya Konteks]\n  C --> D[AI: Hasilkan Kode & Pengujian]\n  D --> E{Manusia: Tinjau & Validasi}\n  E -- Ditemukan Masalah --> F[Manusia: Berikan Konteks Debug Spesifik]\n  F --> D\n  E -- Terlihat Bagus --> G[Manusia: Setujui & Gabungkan]\n  style A fill:#3b82f6,color:#fff\n  style D fill:#8b5cf6,color:#fff\n  style G fill:#10b981,color:#fff\n\`\`\`\n\nTonton video di atas untuk mendalami lebih jauh tentang model mental yang diperlukan untuk berhasil di era rekayasa yang baru ini.'
          WHERE title = 'Introduction to Vibe Coding' AND content_id IS NULL;
        `);
      } catch (e) {
        console.error('Error migrating content_id:', e);
      }

      // ─── SEED: Super Admin ───
      const bcrypt = require('bcrypt');
      const adminPass = await bcrypt.hash('Admin@2026!', 10);
      await pool.query(`
        INSERT INTO users (name, email, password, role, plan)
        VALUES ('Super Admin', 'admin@vibelearn.id', $1, 'super_admin', 'enterprise')
        ON CONFLICT (email) DO NOTHING
      `, [adminPass]);

      const adminUser = await pool.query(`SELECT id FROM users WHERE email='admin@vibelearn.id'`);
      const adminId = adminUser.rows[0].id;
      await pool.query(`INSERT INTO subscriptions (user_id, plan, status) VALUES ($1,'enterprise','active') ON CONFLICT DO NOTHING`, [adminId]);

      // ─── SEED: Master User ───
      const masterPass = await bcrypt.hash('Master@2026!', 10);
      await pool.query(`
        INSERT INTO users (name, email, password, role, plan)
        VALUES ('Vibe Master', 'master@vibelearn.id', $1, 'master', 'pro')
        ON CONFLICT (email) DO NOTHING
      `, [masterPass]);
      const masterUser = await pool.query(`SELECT id FROM users WHERE email='master@vibelearn.id'`);
      const masterId = masterUser.rows[0].id;
      await pool.query(`INSERT INTO subscriptions (user_id, plan, status) VALUES ($1,'pro','active') ON CONFLICT DO NOTHING`, [masterId]);

      // ─── SEED: Courses ───
      const courseSeeds = [
        { title: 'IT Basics for AI Coding', description: 'Beginner-friendly IT concepts explained using simple analogies. Learn about Prompts, Deployment, and Git without the jargon.', level: 'beginner', category: 'fundamentals', order_index: 0, required_plan: 'free' },
        { title: 'Vibe Coding 101', description: 'Learn the mindset and fundamentals of AI-powered coding. Understand how to collaborate with AI to build anything fast.', level: 'beginner', category: 'fundamentals', order_index: 1, required_plan: 'pro' },
        { title: 'Prompt Engineering Mastery', description: 'Master the art of crafting perfect AI prompts for code generation. Learn patterns, formulas, and advanced techniques.', level: 'beginner', category: 'prompting', order_index: 2, required_plan: 'pro' },
        { title: 'Build Your First App in 4 Hours', description: 'A hands-on guide to building and deploying a full web application from scratch using only AI assistance.', level: 'intermediate', category: 'project', order_index: 3, required_plan: 'pro' },
        { title: 'AI Code Review & Debugging', description: 'Learn to spot bugs, security holes, and bad patterns in AI-generated code. Then fix them — with AI.', level: 'intermediate', category: 'quality', order_index: 4, required_plan: 'pro' },
        { title: 'Security-Aware Vibe Coding', description: 'Penetration test your AI-built apps. Find vulnerabilities, practice prompt injection defense, and ship secure code.', level: 'advanced', category: 'security', order_index: 5, required_plan: 'pro' },
      ];

      for (const c of courseSeeds) {
        let courseId;
        const existing = await pool.query(`SELECT id FROM courses WHERE title=$1`, [c.title]);
        if (!existing.rows.length) {
          const courseRes = await pool.query(
            `INSERT INTO courses (title, description, level, category, created_by, is_published, order_index, required_plan) VALUES ($1,$2,$3,$4,$5,true,$6,$7) RETURNING id`,
            [c.title, c.description, c.level, c.category, masterId, c.order_index, c.required_plan || 'pro']
          );
          courseId = courseRes.rows[0].id;
        } else {
          courseId = existing.rows[0].id;
          // Update course info in case description changed
          await pool.query(
            `UPDATE courses SET description=$1, level=$2, category=$3, order_index=$4, required_plan=$5 WHERE id=$6`,
            [c.description, c.level, c.category, c.order_index, c.required_plan || 'pro', courseId]
          );
        }

        // Seed/Update lessons uniquely per course using imported data
        const seedData = require('./seedData.js');
        const lessonSeeds = seedData[c.title] || [];
        
        for (const l of lessonSeeds) {
          const existingLesson = await pool.query(
            `SELECT id FROM lessons WHERE course_id=$1 AND (title=$2 OR title_id=$3)`,
            [courseId, l.title, l.title_id || null]
          );
          
          let lessonId;
          if (existingLesson.rows.length) {
            lessonId = existingLesson.rows[0].id;
            // Update existing lesson
            await pool.query(
              `UPDATE lessons 
               SET title=$1, content=$2, video_url=$3, type=$4, xp_reward=$5, order_index=$6, difficulty=$7, 
                   resources=$8, challenge_text=$9, content_id=$10, challenge_text_id=$11, 
                   transcript=$12, transcript_id=$13, title_id=$14
               WHERE id=$15`,
              [l.title, l.content, l.video_url || null, l.type, l.xp_reward, l.order_index,
               l.difficulty || 'beginner', JSON.stringify(l.resources || []), l.challenge_text || '',
               l.content_id || null, l.challenge_text_id || null,
               l.transcript || null, l.transcript_id || null, l.title_id || null, lessonId]
            );
          } else {
            // Insert new lesson
            const lessonRes = await pool.query(
              `INSERT INTO lessons (course_id, title, content, video_url, type, xp_reward, order_index, difficulty, resources, challenge_text, content_id, challenge_text_id, transcript, transcript_id, title_id)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
              [courseId, l.title, l.content, l.video_url || null, l.type, l.xp_reward, l.order_index,
               l.difficulty || 'beginner', JSON.stringify(l.resources || []), l.challenge_text || '',
               l.content_id || null, l.challenge_text_id || null,
               l.transcript || null, l.transcript_id || null, l.title_id || null]
            );
            lessonId = lessonRes.rows[0].id;
          }

          // Add/Update quiz questions for quiz lessons
          if (l.type === 'quiz' && l.quizzes) {
            for (const q of l.quizzes) {
              await pool.query(
                `INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation, format, code_lines)
                 VALUES ($1,$2,$3,$4,$5,$6,$7)
                 ON CONFLICT (lesson_id, question) DO UPDATE
                 SET options=EXCLUDED.options, correct_answer=EXCLUDED.correct_answer, explanation=EXCLUDED.explanation, format=EXCLUDED.format, code_lines=EXCLUDED.code_lines`,
                [lessonId, q.question, JSON.stringify(q.options), q.correct_answer,
                 q.explanation, q.format || 'multiple_choice', JSON.stringify(q.code_lines || [])]
              );
            }
          }
        }
      }

      // ─── SEED: Labs ───
      const labSeeds = [
        { title: 'AI Prompt Simulator', description: 'Practice crafting perfect prompts in a simulated AI chat environment. Score based on specificity, clarity, and results.', type: 'prompt', difficulty: 'beginner', xp_reward: 100, config: { scenarios: ['Build a login form', 'Create a REST API', 'Debug this error', 'Refactor this function'] } },
        { title: 'Code Challenge Lab', description: 'Fix broken AI-generated code in the browser editor. Each challenge has intentional bugs — find and fix them all.', type: 'code', difficulty: 'intermediate', xp_reward: 150, config: { language: 'javascript', time_limit: 900 } },
        { title: 'Security Audit Lab', description: 'Analyze sample vibe-coded applications for security vulnerabilities. Find SQL injection, XSS, and auth flaws.', type: 'security', difficulty: 'advanced', xp_reward: 200, config: { targets: ['auth_bypass', 'sql_injection', 'xss_attack'] } },
        { title: 'Build Challenge', description: 'Build a complete feature from scratch using AI assistance. Judged on functionality, code quality, and speed.', type: 'build', difficulty: 'intermediate', xp_reward: 175, config: { challenge: 'Build a todo list with CRUD operations', time_limit: 1800 } },
        { title: 'Speed Run — 15 Min Challenge', description: 'Build a working React component in under 15 minutes using AI. Race against the clock and compete on the leaderboard.', type: 'speedrun', difficulty: 'beginner', xp_reward: 125, config: { time_limit: 900, component: 'Dashboard card with stats' } },
      ];

      // Clean duplicate labs first
      try {
        await pool.query(`
          DELETE FROM labs a USING labs b 
          WHERE a.id > b.id AND a.title = b.title;
        `);
      } catch (err) {
        console.error('Error cleaning duplicate labs:', err);
      }

      for (const lab of labSeeds) {
        try {
          const existing = await pool.query('SELECT id FROM labs WHERE title = $1', [lab.title]);
          if (!existing.rows.length) {
            await pool.query(
              `INSERT INTO labs (title, description, type, difficulty, xp_reward, config) VALUES ($1,$2,$3,$4,$5,$6)`,
              [lab.title, lab.description, lab.type, lab.difficulty, lab.xp_reward, JSON.stringify(lab.config)]
            );
          } else {
            await pool.query(
              `UPDATE labs SET description=$1, type=$2, difficulty=$3, xp_reward=$4, config=$5 WHERE id=$6`,
              [lab.description, lab.type, lab.difficulty, lab.xp_reward, JSON.stringify(lab.config), existing.rows[0].id]
            );
          }
        } catch (err) {
          console.error(`Error seeding lab "${lab.title}":`, err);
        }
      }

      console.log('✅ Database initialized and seeded.');
      return;
    } catch (err) {
      console.error(`❌ DB init error. Retries left: ${retries - 1}`, err.message);
      retries--;
      if (retries === 0) { console.error('Could not connect to DB. Exiting.'); process.exit(1); }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

initDb().then(() => {
  app.listen(port, () => console.log(`🚀 VibeLearn API running on port ${port}`));
});
