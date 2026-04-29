const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', async (req, res) => {
  const checks = { api: 'ok', database: 'unknown', uptime: process.uptime(), version: '1.0.0', timestamp: new Date().toISOString() };
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

        CREATE TABLE IF NOT EXISTS lessons (
          id SERIAL PRIMARY KEY,
          course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT DEFAULT '',
          video_url TEXT,
          type VARCHAR(50) DEFAULT 'text',
          xp_reward INTEGER DEFAULT 50,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS quizzes (
          id SERIAL PRIMARY KEY,
          lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          correct_answer INTEGER NOT NULL,
          explanation TEXT DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(lesson_id, question)
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
      `);

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
        { title: 'Vibe Coding 101', description: 'Learn the mindset and fundamentals of AI-powered coding. Understand how to collaborate with AI to build anything fast.', level: 'beginner', category: 'fundamentals', order_index: 1 },
        { title: 'Prompt Engineering Mastery', description: 'Master the art of crafting perfect AI prompts for code generation. Learn patterns, formulas, and advanced techniques.', level: 'beginner', category: 'prompting', order_index: 2 },
        { title: 'Build Your First App in 4 Hours', description: 'A hands-on guide to building and deploying a full web application from scratch using only AI assistance.', level: 'intermediate', category: 'project', order_index: 3 },
        { title: 'AI Code Review & Debugging', description: 'Learn to spot bugs, security holes, and bad patterns in AI-generated code. Then fix them — with AI.', level: 'intermediate', category: 'quality', order_index: 4 },
        { title: 'Security-Aware Vibe Coding', description: 'Penetration test your AI-built apps. Find vulnerabilities, practice prompt injection defense, and ship secure code.', level: 'advanced', category: 'security', order_index: 5 },
      ];

      for (const c of courseSeeds) {
        const existing = await pool.query(`SELECT id FROM courses WHERE title=$1`, [c.title]);
        if (!existing.rows.length) {
          const courseRes = await pool.query(
            `INSERT INTO courses (title, description, level, category, created_by, is_published, order_index) VALUES ($1,$2,$3,$4,$5,true,$6) RETURNING id`,
            [c.title, c.description, c.level, c.category, masterId, c.order_index]
          );
          const courseId = courseRes.rows[0].id;

          // Seed 3 lessons per course
          const lessonSeeds = [
            { title: 'Introduction & Overview', content: `# Welcome to ${c.title}\n\nThis module will guide you through everything you need to know. Follow along step by step and complete each exercise to earn XP.\n\n## What You'll Learn\n- Core concepts\n- Practical techniques\n- Real-world applications\n\n## Let's Get Started!\nRead through this lesson carefully, then proceed to the next one.`, type: 'text', xp_reward: 50, order_index: 1 },
            { title: 'Core Concepts Deep Dive', content: `# Core Concepts\n\nLet's dive deep into the key ideas of this module.\n\n## Key Principles\n1. **Think in outcomes** — describe what you want, not how to build it\n2. **Iterate rapidly** — ship rough, refine quickly\n3. **Trust + verify** — AI writes, you review\n\n## Practice Exercise\nTry applying these concepts in the lab session below.`, type: 'text', xp_reward: 75, order_index: 2 },
            { title: 'Knowledge Check', content: 'Test your understanding with this quick quiz.', type: 'quiz', xp_reward: 100, order_index: 3 },
          ];
          for (const l of lessonSeeds) {
            const lessonRes = await pool.query(
              `INSERT INTO lessons (course_id, title, content, type, xp_reward, order_index) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
              [courseId, l.title, l.content, l.type, l.xp_reward, l.order_index]
            );
            // Add quiz questions for quiz lessons
            if (l.type === 'quiz') {
              await pool.query(
                `INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
                [lessonRes.rows[0].id, 'What is the core principle of vibe coding?', JSON.stringify(['Write every line of code manually', 'Describe outcomes and let AI generate code', 'Avoid using AI tools', 'Only use Python']), 1, 'Vibe coding is about describing what you want in natural language and collaborating with AI to build it.']
              );
              await pool.query(
                `INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
                [lessonRes.rows[0].id, 'Which is the best approach when AI generates code?', JSON.stringify(['Accept it blindly', 'Reject it always', 'Review and understand it', 'Only use 10 lines']), 2, 'Always review AI-generated code to understand what it does and catch any issues.']
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

      for (const lab of labSeeds) {
        await pool.query(
          `INSERT INTO labs (title, description, type, difficulty, xp_reward, config) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
          [lab.title, lab.description, lab.type, lab.difficulty, lab.xp_reward, JSON.stringify(lab.config)]
        ).catch(() => {});
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
