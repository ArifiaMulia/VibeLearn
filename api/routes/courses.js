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
    const lessons = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC', [req.params.id]);
    course.lessons = lessons.rows;
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/courses — master or super_admin
router.post('/', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, description, thumbnail, level, category, is_published, order_index } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO courses (title, description, thumbnail, level, category, created_by, is_published, order_index)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, thumbnail || null, level || 'beginner', category || 'general', req.user.id, is_published || false, order_index || 0]
    );
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1,$2,$3,$4)', [req.user.id, 'create_course', 'course', result.rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/courses/:id
router.put('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, description, thumbnail, level, category, is_published, order_index } = req.body;
  try {
    const result = await pool.query(
      `UPDATE courses SET title=$1, description=$2, thumbnail=$3, level=$4, category=$5, is_published=$6, order_index=$7 WHERE id=$8 RETURNING *`,
      [title, description, thumbnail, level, category, is_published, order_index, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
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

// GET /api/courses/my/enrollments
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

module.exports = router;
