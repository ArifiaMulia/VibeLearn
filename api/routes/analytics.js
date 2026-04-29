const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// GET /api/analytics/overview — super_admin
router.get('/overview', auth, requireRole('super_admin', 'master'), async (req, res) => {
  try {
    const totalUsers = await pool.query(`SELECT COUNT(*) FROM users WHERE role='participant'`);
    const activeToday = await pool.query(`SELECT COUNT(*) FROM users WHERE last_activity > NOW() - INTERVAL '24 hours'`);
    const totalCourses = await pool.query('SELECT COUNT(*) FROM courses');
    const totalLabs = await pool.query('SELECT COUNT(*) FROM labs');
    const totalEnrollments = await pool.query('SELECT COUNT(*) FROM enrollments');
    const completions = await pool.query(`SELECT COUNT(*) FROM enrollments WHERE completed_at IS NOT NULL`);
    const labSessions = await pool.query('SELECT COUNT(*) FROM lab_sessions');
    const totalXP = await pool.query('SELECT COALESCE(SUM(amount),0) as total FROM xp_log');

    // Daily active users last 7 days
    const dauData = await pool.query(`
      SELECT DATE(last_activity) as date, COUNT(*) as count FROM users
      WHERE last_activity > NOW() - INTERVAL '7 days' GROUP BY DATE(last_activity) ORDER BY date ASC`
    );

    // Top courses by enrollment
    const topCourses = await pool.query(`
      SELECT c.title, COUNT(e.id) as enrollments FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id, c.title ORDER BY enrollments DESC LIMIT 5`
    );

    // Recent activity log
    const recentActivity = await pool.query(`
      SELECT ul.*, u.name FROM usage_logs ul JOIN users u ON ul.user_id = u.id
      ORDER BY ul.created_at DESC LIMIT 20`
    );

    res.json({
      users: { total: parseInt(totalUsers.rows[0].count), active_today: parseInt(activeToday.rows[0].count) },
      courses: { total: parseInt(totalCourses.rows[0].count) },
      labs: { total: parseInt(totalLabs.rows[0].count), sessions: parseInt(labSessions.rows[0].count) },
      enrollments: { total: parseInt(totalEnrollments.rows[0].count), completed: parseInt(completions.rows[0].count) },
      total_xp: parseInt(totalXP.rows[0].total),
      dau: dauData.rows,
      top_courses: topCourses.rows,
      recent_activity: recentActivity.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/analytics/users/:id — per-user analytics
router.get('/users/:id', auth, async (req, res) => {
  const targetId = req.params.id === 'me' ? req.user.id : req.params.id;
  if (req.user.role === 'participant' && req.user.id !== parseInt(targetId)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const logs = await pool.query(
      `SELECT action, resource_type, created_at FROM usage_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [targetId]
    );
    const xpHistory = await pool.query(
      `SELECT amount, reason, created_at FROM xp_log WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20`,
      [targetId]
    );
    res.json({ activity_log: logs.rows, xp_history: xpHistory.rows });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
