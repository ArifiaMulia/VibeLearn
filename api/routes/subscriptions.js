const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// GET /api/subscriptions/plans — must be before /:userId
router.get('/plans', auth, async (req, res) => {
  const PLANS = [
    { id: 1, name: 'free', price: 0, features: ['1 Introductory Course', '2 Beginner Labs', 'Community Forum Access', 'XP Tracking'] },
    { id: 2, name: 'pro', price: 29, features: ['All 5 Courses', 'Unlimited Lab Access', 'AI Code Review Scenarios', 'Security Audit Labs', 'Priority Support', 'Verified Completion Badges'] },
    { id: 3, name: 'enterprise', price: 199, features: ['Everything in Pro', 'Custom Course Builder', 'Team Management', 'Dedicated Analytics Dashboard', 'SLA Support', 'White-label Options'] },
  ];
  res.json(PLANS);
});

// GET /api/subscriptions — admin: all; user: own
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      const result = await pool.query(
        `SELECT s.*, u.name, u.email FROM subscriptions s JOIN users u ON s.user_id = u.id ORDER BY s.started_at DESC`
      );
      return res.json(result.rows);
    }
    const result = await pool.query('SELECT * FROM subscriptions WHERE user_id=$1 ORDER BY started_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/subscriptions/:userId — super_admin changes plan
router.put('/:userId', auth, requireRole('super_admin'), async (req, res) => {
  const { plan, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE subscriptions SET plan=$1, status=$2 WHERE user_id=$3 RETURNING *`,
      [plan, status, req.params.userId]
    );
    // Also update user's plan column
    await pool.query('UPDATE users SET plan=$1 WHERE id=$2', [plan, req.params.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Subscription not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/subscriptions/stats — super_admin usage stats
router.get('/stats/overview', auth, requireRole('super_admin'), async (req, res) => {
  try {
    const plans = await pool.query(`SELECT plan, COUNT(*) as count FROM subscriptions WHERE status='active' GROUP BY plan`);
    const revenue = { free: 0, pro: 29, enterprise: 199 };
    const mrr = plans.rows.reduce((acc, row) => acc + (revenue[row.plan] || 0) * parseInt(row.count), 0);
    res.json({ plans: plans.rows, mrr });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
