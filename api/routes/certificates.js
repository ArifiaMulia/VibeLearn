const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

// GET /api/certificates/verify/:cert_id — Public certificate validation
router.get('/verify/:cert_id', async (req, res) => {
  const { cert_id } = req.params;

  try {
    // Format expected: CERT-<userId>-<courseId> or hash
    const parts = cert_id.split('-');
    let userId, courseId;

    if (parts.length >= 3 && parts[0] === 'CERT') {
      userId = parseInt(parts[1]);
      courseId = parseInt(parts[2]);
    } else {
      return res.status(400).json({ error: 'Invalid certificate format' });
    }

    if (isNaN(userId) || isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid certificate parameters' });
    }

    // Query user and course completion
    const [userRes, courseRes, enrollRes] = await Promise.all([
      pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]),
      pool.query('SELECT id, title, description, category FROM courses WHERE id = $1', [courseId]),
      pool.query('SELECT completed_at, created_at FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId])
    ]);

    if (!userRes.rows.length || !courseRes.rows.length) {
      return res.status(404).json({ valid: false, error: 'Certificate record not found' });
    }

    const user = userRes.rows[0];
    const course = courseRes.rows[0];
    const enrollment = enrollRes.rows[0];

    const issueDate = enrollment?.completed_at || enrollment?.created_at || new Date();
    
    // Generate verification signature hash
    const secret = process.env.JWT_SECRET || 'vibelearn_super_secret_jwt_2026';
    const hash = crypto.createHmac('sha256', secret)
      .update(`${userId}:${courseId}:${user.name}:${course.title}`)
      .digest('hex')
      .substring(0, 16);

    res.json({
      valid: true,
      certificate_id: cert_id,
      student_name: user.name,
      course_title: course.title,
      category: course.category,
      issued_at: issueDate,
      issuer: 'Promptara AI Coding Academy',
      verification_hash: hash.toUpperCase(),
      verified_url: `https://vibe.virtuenet.space/verify/${cert_id}`
    });

  } catch (err) {
    console.error('Verify certificate error:', err);
    res.status(500).json({ valid: false, error: 'Failed to verify certificate' });
  }
});

module.exports = router;
