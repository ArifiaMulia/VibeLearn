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
  const { code, submission } = req.body;
  try {
    const sessionRes = await pool.query('SELECT * FROM lab_sessions WHERE id=$1 AND user_id=$2', [req.params.sessionId, req.user.id]);
    if (!sessionRes.rows.length) return res.status(404).json({ error: 'Session not found' });
    const session = sessionRes.rows[0];
    const labRes = await pool.query('SELECT * FROM labs WHERE id=$1', [session.lab_id]);
    const lab = labRes.rows[0];

    // Intelligent Auto-grading (Pattern Matching + Heuristics)
    let score = 0;
    let feedback = [];
    
    if (code) {
      // Basic checks for good practices
      if (code.includes('console.log')) feedback.push("Note: Try to avoid leaving console.log in production code.");
      if (code.includes('async') && code.includes('await')) {
        score += 40;
        feedback.push("✓ Excellent use of async/await patterns.");
      } else {
        feedback.push("! Consider using async/await for better readability.");
      }
      
      // Complexity check
      const lines = code.split('\n').length;
      if (lines > 5) {
        score += 30;
        feedback.push("✓ Implementation has appropriate depth.");
      } else {
        feedback.push("! The implementation seems a bit brief.");
      }

      // Specific pattern check (simulated)
      if (code.includes('fetch') || code.includes('axios') || code.includes('authFetch')) {
        score += 30;
        feedback.push("✓ Correct data fetching implementation.");
      }
    } else {
      score = 0;
      feedback.push("No code submitted.");
    }

    const xp = Math.round((lab.xp_reward || 100) * (score / 100));

    await pool.query(
      `UPDATE lab_sessions SET completed_at=NOW(), score=$1, submission=$2 WHERE id=$3`,
      [score, JSON.stringify({ code, feedback }), req.params.sessionId]
    );
    await pool.query(`INSERT INTO xp_log (user_id, amount, reason) VALUES ($1,$2,$3)`, [req.user.id, xp, `Completed lab: ${lab.title}`]);

    res.json({ xp_earned: xp, score, feedback });
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
