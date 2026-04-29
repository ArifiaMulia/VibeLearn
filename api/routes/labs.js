const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });

// GET /api/labs
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*,
        (SELECT COUNT(*) FROM lab_sessions ls WHERE ls.lab_id = l.id) as total_attempts,
        (SELECT AVG(score) FROM lab_sessions ls WHERE ls.lab_id = l.id AND ls.completed_at IS NOT NULL) as avg_score
       FROM labs l ORDER BY l.difficulty ASC, l.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/labs/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM labs WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Lab not found' });
    const lab = result.rows[0];
    // Get user's sessions
    const sessions = await pool.query(
      'SELECT * FROM lab_sessions WHERE user_id=$1 AND lab_id=$2 ORDER BY started_at DESC LIMIT 5',
      [req.user.id, lab.id]
    );
    lab.my_sessions = sessions.rows;
    res.json(lab);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/labs — master/admin
router.post('/', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, description, type, difficulty, xp_reward, config } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO labs (title, description, type, difficulty, xp_reward, config) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, type, difficulty || 'beginner', xp_reward || 100, JSON.stringify(config || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/labs/:id
router.put('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, description, type, difficulty, xp_reward, config } = req.body;
  try {
    const result = await pool.query(
      `UPDATE labs SET title=$1, description=$2, type=$3, difficulty=$4, xp_reward=$5, config=$6 WHERE id=$7 RETURNING *`,
      [title, description, type, difficulty, xp_reward, JSON.stringify(config), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Lab not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/labs/:id
router.delete('/:id', auth, requireRole('super_admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM labs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Lab deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/labs/:id/start
router.post('/:id/start', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO lab_sessions (user_id, lab_id) VALUES ($1,$2) RETURNING *`,
      [req.user.id, req.params.id]
    );
    await pool.query('INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1,$2,$3,$4)', [req.user.id, 'start_lab', 'lab', req.params.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/labs/sessions/:sessionId/complete
router.post('/sessions/:sessionId/complete', auth, async (req, res) => {
  const { score, submission } = req.body;
  try {
    const session = await pool.query('SELECT * FROM lab_sessions WHERE id=$1 AND user_id=$2', [req.params.sessionId, req.user.id]);
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });
    const lab = await pool.query('SELECT * FROM labs WHERE id=$1', [session.rows[0].lab_id]);
    const xp = Math.round((lab.rows[0].xp_reward || 100) * (score / 100));

    await pool.query(
      `UPDATE lab_sessions SET completed_at=NOW(), score=$1, submission=$2 WHERE id=$3`,
      [score, JSON.stringify(submission || {}), req.params.sessionId]
    );
    await pool.query(`INSERT INTO xp_log (user_id, amount, reason) VALUES ($1,$2,$3)`, [req.user.id, xp, `Completed lab: ${lab.rows[0].title}`]);

    // Achievement for first lab completion
    const prevCompleted = await pool.query(
      `SELECT COUNT(*) FROM lab_sessions WHERE user_id=$1 AND completed_at IS NOT NULL`,
      [req.user.id]
    );
    if (parseInt(prevCompleted.rows[0].count) === 1) {
      await pool.query(`INSERT INTO achievements (user_id, badge_name) VALUES ($1,'first_lab') ON CONFLICT DO NOTHING`, [req.user.id]);
    }
    res.json({ xp_earned: xp, score });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/labs/leaderboard/:id
router.get('/:id/leaderboard', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.name, u.avatar, MAX(ls.score) as best_score, MIN(ls.completed_at - ls.started_at) as best_time
       FROM lab_sessions ls JOIN users u ON ls.user_id = u.id
       WHERE ls.lab_id=$1 AND ls.completed_at IS NOT NULL
       GROUP BY u.id, u.name, u.avatar ORDER BY best_score DESC LIMIT 10`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
