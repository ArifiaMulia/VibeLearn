const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/progress/me — user's full progress summary
router.get('/me', auth, async (req, res) => {
  try {
    const xp = await pool.query('SELECT COALESCE(SUM(amount),0) as total FROM xp_log WHERE user_id=$1', [req.user.id]);
    const achievements = await pool.query('SELECT * FROM achievements WHERE user_id=$1 ORDER BY earned_at DESC', [req.user.id]);
    const completedLessons = await pool.query(`SELECT COUNT(*) FROM progress WHERE user_id=$1 AND status='completed'`, [req.user.id]);
    const completedLabs = await pool.query(`SELECT COUNT(*) FROM lab_sessions WHERE user_id=$1 AND completed_at IS NOT NULL`, [req.user.id]);
    const completedCourses = await pool.query(`SELECT COUNT(*) FROM enrollments WHERE user_id=$1 AND completed_at IS NOT NULL`, [req.user.id]);
    const recentXP = await pool.query(`SELECT * FROM xp_log WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10`, [req.user.id]);
    res.json({
      total_xp: parseInt(xp.rows[0].total),
      achievements: achievements.rows,
      completed_lessons: parseInt(completedLessons.rows[0].count),
      completed_labs: parseInt(completedLabs.rows[0].count),
      completed_courses: parseInt(completedCourses.rows[0].count),
      recent_xp: recentXP.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.avatar, COALESCE(SUM(x.amount),0) as total_xp,
        (SELECT COUNT(*) FROM achievements WHERE user_id=u.id) as badge_count
       FROM users u LEFT JOIN xp_log x ON u.id = x.user_id
       WHERE u.role = 'participant' GROUP BY u.id, u.name, u.avatar ORDER BY total_xp DESC LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/progress/course/:courseId
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, l.title, l.type, l.xp_reward, l.order_index FROM progress p
       JOIN lessons l ON p.lesson_id = l.id WHERE p.user_id=$1 AND l.course_id=$2 ORDER BY l.order_index ASC`,
      [req.user.id, req.params.courseId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
