const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// GET /api/courses/my/enrollments  ← MUST be before /:id
router.get('/my/enrollments', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, e.enrolled_at, e.completed_at,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM progress p WHERE p.user_id = $1 AND p.lesson_id IN (SELECT id FROM lessons WHERE course_id = c.id) AND p.status = 'completed') as completed_lessons
       FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses — all published, or all if admin/master
router.get('/', auth, async (req, res) => {
  try {
    let query = `SELECT c.*, u.name as instructor_name,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count,
      (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lesson_count
      FROM courses c LEFT JOIN users u ON c.created_by = u.id`;
    if (req.user.role === 'participant') query += ` WHERE c.is_published = true`;
    query += ` ORDER BY c.order_index ASC, c.created_at ASC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name as instructor_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
       FROM courses c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Course not found' });
    const course = result.rows[0];

    // Access control check
    const PLAN_TIERS = { free: 0, pro: 1, enterprise: 2 };
    const userTier = PLAN_TIERS[req.user.plan] || 0;
    const requiredTier = PLAN_TIERS[course.required_plan] || 0;
    const isPromoActive = course.promo_expiry && new Date(course.promo_expiry) > new Date();
    
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'master';
    if (!isAdmin && (requiredTier > userTier) && !isPromoActive) {
      return res.status(403).json({ error: 'Upgrade plan to access this course' });
    }

    const lessons = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC', [req.params.id]);
    course.lessons = lessons.rows;
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses — master or super_admin
router.post('/', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, description, thumbnail, level, category, is_published, order_index, required_plan, promo_expiry, lessons } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO courses (title, description, thumbnail, level, category, created_by, is_published, order_index, required_plan, promo_expiry)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, description, thumbnail || null, level || 'beginner', category || 'general', req.user.id, is_published || false, order_index || 0, required_plan || 'pro', promo_expiry || null]
    );
    const courseId = result.rows[0].id;

    if (lessons && Array.isArray(lessons)) {
      for (const lesson of lessons) {
        const insertRes = await client.query(
          `INSERT INTO lessons (course_id, lab_id, title, content, video_url, type, xp_reward, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [courseId, lesson.lab_id || null, lesson.title, lesson.content || '', lesson.video_url || null, lesson.type || 'text', lesson.xp_reward || 50, lesson.order_index || 0]
        );
        const newLessonId = insertRes.rows[0].id;
        
        if (lesson.type === 'quiz' && lesson.quizzes && Array.isArray(lesson.quizzes)) {
          for (const q of lesson.quizzes) {
            await client.query(
              `INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES ($1,$2,$3,$4,$5)`,
              [newLessonId, q.question, JSON.stringify(q.options), q.correct_answer, q.explanation || '']
            );
          }
        }
      }
    }

    await client.query('INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1,$2,$3,$4)', [req.user.id, 'create_course', 'course', courseId]);
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  } finally {
    client.release();
  }
});

// PUT /api/courses/:id
router.put('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, description, thumbnail, level, category, is_published, order_index, required_plan, promo_expiry, lessons } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE courses SET title=$1, description=$2, thumbnail=$3, level=$4, category=$5, is_published=$6, order_index=$7, required_plan=$8, promo_expiry=$9 WHERE id=$10 RETURNING *`,
      [title, description, thumbnail, level, category, is_published, order_index, required_plan || 'pro', promo_expiry || null, req.params.id]
    );
    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Course not found' });
    }

    // Sync lessons: delete and re-insert for simplicity in this version
    if (lessons && Array.isArray(lessons)) {
      await client.query('DELETE FROM lessons WHERE course_id = $1', [req.params.id]);
      for (const lesson of lessons) {
        const insertRes = await client.query(
          `INSERT INTO lessons (course_id, lab_id, title, content, video_url, type, xp_reward, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [req.params.id, lesson.lab_id || null, lesson.title, lesson.content || '', lesson.video_url || null, lesson.type || 'text', lesson.xp_reward || 50, lesson.order_index || 0]
        );
        const newLessonId = insertRes.rows[0].id;
        
        // Save quizzes if present
        if (lesson.type === 'quiz' && lesson.quizzes && Array.isArray(lesson.quizzes)) {
          for (const q of lesson.quizzes) {
            await client.query(
              `INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES ($1,$2,$3,$4,$5)`,
              [newLessonId, q.question, JSON.stringify(q.options), q.correct_answer, q.explanation || '']
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  } finally {
    client.release();
  }
});

// DELETE /api/courses/:id
router.delete('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const courseRes = await pool.query('SELECT required_plan, promo_expiry FROM courses WHERE id=$1', [req.params.id]);
    if (!courseRes.rows.length) return res.status(404).json({ error: 'Course not found' });
    const course = courseRes.rows[0];

    // Access control check
    const PLAN_TIERS = { free: 0, pro: 1, enterprise: 2 };
    const userTier = PLAN_TIERS[req.user.plan] || 0;
    const requiredTier = PLAN_TIERS[course.required_plan] || 0;
    const isPromoActive = course.promo_expiry && new Date(course.promo_expiry) > new Date();
    
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'master';
    if (!isAdmin && (requiredTier > userTier) && !isPromoActive) {
      return res.status(403).json({ error: 'Upgrade plan to enroll in this course' });
    }

    await pool.query(
      `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.id]
    );
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1,$2,$3,$4)', [req.user.id, 'enroll', 'course', req.params.id]);
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses/generate-content — AI Assistant
router.post('/generate-content', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { topic, type } = req.body;
  try {
    // Mock AI Response
    let content = {};
    if (type === 'outline') {
      content = [
        { title: `Basics of ${topic}`, order: 1 },
        { title: `Intermediate ${topic} Patterns`, order: 2 },
        { title: `Mastering ${topic} in Production`, order: 3 },
      ];
    } else {
      content = {
        title: `Deep Dive into ${topic}`,
        markdown: `## Understanding ${topic}\n\n${topic} is a transformative technology that allows developers to...`
      };
    }

    // Simulate AI thinking time
    setTimeout(() => res.json(content), 1500);
  } catch (err) {
    res.status(500).json({ error: 'AI Assistant failed' });
  }
});

module.exports = router;
