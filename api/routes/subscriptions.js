const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// GET /api/subscriptions/plans — must be before /:userId
router.get('/plans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subscription_plans ORDER BY price_usd ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/subscriptions/plans/:id — admin updates plan pricing
router.put('/plans/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { price_usd, price_idr } = req.body;
  try {
    const result = await pool.query(
      `UPDATE subscription_plans SET price_usd=$1, price_idr=$2 WHERE id=$3 RETURNING *`,
      [price_usd, price_idr, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Plan not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
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

// POST /api/subscriptions/manual — submit manual payment verification
router.post('/manual', auth, async (req, res) => {
  const { plan, billing_term, amount_idr, sender_name, bank_name, receipt_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO payment_verifications (user_id, plan, billing_term, amount_idr, sender_name, bank_name, receipt_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, plan, billing_term, amount_idr, sender_name, bank_name, receipt_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating manual payment verification:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/subscriptions/pending — check for pending verification
router.get('/pending', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM payment_verifications WHERE user_id=$1 AND status='pending' LIMIT 1`,
      [req.user.id]
    );
    if (result.rows.length > 0) {
      res.json({ pending: true, verification: result.rows[0] });
    } else {
      res.json({ pending: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/subscriptions/verifications — admin lists all verifications
router.get('/verifications', auth, requireRole('super_admin', 'master'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pv.*, u.name as user_name, u.email as user_email 
       FROM payment_verifications pv 
       JOIN users u ON pv.user_id = u.id 
       ORDER BY pv.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/subscriptions/verifications/:id — admin resolves verification
router.put('/verifications/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    await pool.query('BEGIN');
    
    const verResult = await pool.query(
      `UPDATE payment_verifications SET status=$1, resolved_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    
    if (!verResult.rows.length) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Verification record not found' });
    }
    
    const verification = verResult.rows[0];
    
    if (status === 'approved') {
      let interval = '30 days';
      if (verification.billing_term === '1_year') interval = '1 year';
      else if (verification.billing_term === '2_years') interval = '2 years';
      else if (verification.billing_term === '3_years') interval = '3 years';
      
      await pool.query('UPDATE users SET plan=$1 WHERE id=$2', [verification.plan, verification.user_id]);
      
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan, status, expires_at) 
         VALUES ($1, $2, 'active', CURRENT_TIMESTAMP + CAST($3 AS INTERVAL))
         ON CONFLICT (user_id) 
         DO UPDATE SET plan=EXCLUDED.plan, status='active', started_at=CURRENT_TIMESTAMP, expires_at=CURRENT_TIMESTAMP + CAST($3 AS INTERVAL)`,
        [verification.user_id, verification.plan, interval]
      );
    }
    
    await pool.query('COMMIT');
    res.json(verification);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error updating manual payment verification status:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
