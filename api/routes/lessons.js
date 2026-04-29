const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// GET /api/lessons/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Lesson not found' });
    const lesson = result.rows[0];
    // Get quiz questions if quiz type
    if (lesson.type === 'quiz') {
      const quizzes = await pool.query('SELECT * FROM quizzes WHERE lesson_id = $1 ORDER BY id ASC', [lesson.id]);
      lesson.quizzes = quizzes.rows;
    }
    // Get user progress
    const progress = await pool.query('SELECT * FROM progress WHERE user_id=$1 AND lesson_id=$2', [req.user.id, lesson.id]);
    lesson.user_progress = progress.rows[0] || null;
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1,$2,$3,$4)', [req.user.id, 'view_lesson', 'lesson', lesson.id]);
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lessons — master/admin
router.post('/', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { course_id, title, content, video_url, type, xp_reward, order_index } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, content, video_url, type, xp_reward, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [course_id, title, content || '', video_url || null, type || 'text', xp_reward || 50, order_index || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/lessons/:id
router.put('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, content, video_url, type, xp_reward, order_index } = req.body;
  try {
    const result = await pool.query(
      `UPDATE lessons SET title=$1, content=$2, video_url=$3, type=$4, xp_reward=$5, order_index=$6 WHERE id=$7 RETURNING *`,
      [title, content, video_url, type, xp_reward, order_index, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Lesson not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/lessons/:id
router.delete('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  try {
    await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.id]);
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lessons/:id/complete
router.post('/:id/complete', auth, async (req, res) => {
  const { score } = req.body;
  try {
    const lesson = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (!lesson.rows.length) return res.status(404).json({ error: 'Lesson not found' });
    const xp = lesson.rows[0].xp_reward || 50;

    await pool.query(
      `INSERT INTO progress (user_id, lesson_id, status, score, completed_at) VALUES ($1,$2,'completed',$3,NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET status='completed', score=$3, completed_at=NOW()`,
      [req.user.id, req.params.id, score || 100]
    );
    // Award XP
    await pool.query(`INSERT INTO xp_log (user_id, amount, reason) VALUES ($1,$2,$3)`, [req.user.id, xp, `Completed lesson: ${lesson.rows[0].title}`]);
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1,$2,$3,$4)', [req.user.id, 'complete_lesson', 'lesson', req.params.id]);

    // Check course completion
    const courseId = lesson.rows[0].course_id;
    const totalLessons = await pool.query('SELECT COUNT(*) FROM lessons WHERE course_id=$1', [courseId]);
    const completedLessons = await pool.query(
      `SELECT COUNT(*) FROM progress p JOIN lessons l ON p.lesson_id = l.id WHERE p.user_id=$1 AND l.course_id=$2 AND p.status='completed'`,
      [req.user.id, courseId]
    );
    const isCourseDone = parseInt(completedLessons.rows[0].count) >= parseInt(totalLessons.rows[0].count);
    if (isCourseDone) {
      await pool.query(`UPDATE enrollments SET completed_at=NOW() WHERE user_id=$1 AND course_id=$2 AND completed_at IS NULL`, [req.user.id, courseId]);
      await pool.query(`INSERT INTO achievements (user_id, badge_name) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [req.user.id, `course_complete_${courseId}`]);
      await pool.query(`INSERT INTO xp_log (user_id, amount, reason) VALUES ($1,$2,$3)`, [req.user.id, 200, 'Course completed!']);
    }
    res.json({ xp_earned: xp, course_completed: isCourseDone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lessons/:id/quizzes — add quiz question
router.post('/:id/quizzes', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { question, options, correct_answer, explanation } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, question, JSON.stringify(options), correct_answer, explanation || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
