const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) return next();
  res.status(403).json({ error: 'Insufficient permissions' });
};

// GET /api/users — super_admin: all users; master: their participants
router.get('/', auth, async (req, res) => {
  try {
    let result;
    const baseSelect = `SELECT u.id, u.name, u.email, u.role, u.plan, u.avatar, u.last_activity, u.created_at,
      s.status AS sub_status, s.expires_at AS sub_expires_at
      FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id`;
    if (req.user.role === 'super_admin') {
      result = await pool.query(`${baseSelect} ORDER BY u.id ASC`);
    } else if (req.user.role === 'master') {
      result = await pool.query(`${baseSelect} WHERE u.role = 'participant' ORDER BY u.id ASC`);
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'super_admin' && req.user.id !== parseInt(id)) return res.status(403).json({ error: 'Forbidden' });
    const result = await pool.query('SELECT id, name, email, role, plan, avatar, last_activity, created_at FROM users WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users — super_admin only
router.post('/', auth, requireRole('super_admin'), async (req, res) => {
  const { name, email, password, role, plan } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, plan) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, plan, avatar, last_activity, created_at`,
      [name, email, hashed, role || 'participant', plan || 'free']
    );
    const user = result.rows[0];
    await pool.query(`INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, 'active') ON CONFLICT DO NOTHING`, [user.id, plan || 'free']);
    res.status(201).json(user);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id — super_admin or self (limited fields). Dynamically builds query.
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const isSelf = req.user.id === parseInt(id);
  const isAdmin = req.user.role === 'super_admin';
  if (!isSelf && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { name, email, password, role, plan, avatar } = req.body;

  try {
    const setClauses = [];
    const params = [];
    let idx = 1;

    if (name !== undefined)   { setClauses.push(`name=$${idx++}`);   params.push(name); }
    if (email !== undefined && isAdmin) { setClauses.push(`email=$${idx++}`); params.push(email); }
    if (avatar !== undefined) { setClauses.push(`avatar=$${idx++}`); params.push(avatar); }
    if (role !== undefined && isAdmin)  { setClauses.push(`role=$${idx++}`);  params.push(role); }
    if (plan !== undefined && isAdmin)  { setClauses.push(`plan=$${idx++}`);  params.push(plan); }
    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 10);
      setClauses.push(`password=$${idx++}`);
      params.push(hashed);
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(id);
    const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id=$${idx} RETURNING id, name, email, role, plan, avatar, last_activity`;
    const result = await pool.query(query, params);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

    // Also sync subscription plan if admin changed plan
    if (plan !== undefined && isAdmin) {
      await pool.query(`UPDATE subscriptions SET plan=$1 WHERE user_id=$2`, [plan, id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id — super_admin only
router.delete('/:id', auth, requireRole('super_admin'), async (req, res) => {
  const { id } = req.params;
  if (req.user.id === parseInt(id)) return res.status(400).json({ error: 'Cannot delete your own account' });
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
