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

    // Find previous and next lessons
    const courseLessons = await pool.query('SELECT id FROM lessons WHERE course_id = $1 ORDER BY order_index ASC, id ASC', [lesson.course_id]);
    const currentIndex = courseLessons.rows.findIndex(l => l.id === lesson.id);
    lesson.prev_lesson_id = currentIndex > 0 ? courseLessons.rows[currentIndex - 1].id : null;
    lesson.next_lesson_id = currentIndex < courseLessons.rows.length - 1 ? courseLessons.rows[currentIndex + 1].id : null;
    lesson.lesson_number = currentIndex + 1;
    lesson.total_lessons = courseLessons.rows.length;

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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/lessons — master/admin
router.post('/', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { course_id, title, title_id, content, content_id, video_url, type, xp_reward, order_index, difficulty, resources, challenge_text, challenge_text_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, title_id, content, content_id, video_url, type, xp_reward, order_index, difficulty, resources, challenge_text, challenge_text_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [course_id, title, title_id || null, content || '', content_id || null, video_url || null, type || 'text',
       xp_reward || 50, order_index || 0, difficulty || 'beginner',
       JSON.stringify(resources || []), challenge_text || '', challenge_text_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/lessons/:id
router.put('/:id', auth, requireRole('super_admin', 'master'), async (req, res) => {
  const { title, title_id, content, content_id, video_url, type, xp_reward, order_index, difficulty, resources, challenge_text, challenge_text_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE lessons SET title=$1, title_id=$2, content=$3, content_id=$4, video_url=$5, type=$6, xp_reward=$7, order_index=$8,
       difficulty=$9, resources=$10, challenge_text=$11, challenge_text_id=$12 WHERE id=$13 RETURNING *`,
      [title, title_id || null, content, content_id || null, video_url, type, xp_reward, order_index,
       difficulty || 'beginner', JSON.stringify(resources || []), challenge_text || '', challenge_text_id || null, req.params.id]
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
  const lessonId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const lessonResult = await pool.query(
      'SELECT id, title, xp_reward, course_id FROM lessons WHERE id = $1', [lessonId]
    );
    if (!lessonResult.rows.length) return res.status(404).json({ error: 'Lesson not found' });
    const lesson = lessonResult.rows[0];
    const xp = lesson.xp_reward || 50;

    // Upsert progress — preserve best score, only set completed_at on first completion
    await pool.query(
      `INSERT INTO progress (user_id, lesson_id, status, score, completed_at)
       VALUES ($1,$2,'completed',$3,NOW())
       ON CONFLICT (user_id, lesson_id) DO UPDATE
         SET status='completed',
             score=GREATEST(progress.score, $3),
             completed_at=COALESCE(progress.completed_at, NOW())`,
      [userId, lessonId, score || 100]
    );

    // Award XP only once per lesson per user
    const alreadyAwarded = await pool.query(
      `SELECT id FROM xp_log WHERE user_id=$1 AND reason=$2 LIMIT 1`,
      [userId, `lesson:${lessonId}`]
    );
    let xpEarned = 0;
    if (!alreadyAwarded.rows.length) {
      await pool.query(
        `INSERT INTO xp_log (user_id, amount, reason) VALUES ($1,$2,$3)`,
        [userId, xp, `lesson:${lessonId}`]
      );
      xpEarned = xp;
      await pool.query(
        'INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1,$2,$3,$4)',
        [userId, 'complete_lesson', 'lesson', lessonId]
      ).catch(() => {});
    }

    // Check course completion — wrapped so it never breaks the main response
    let isCourseDone = false;
    try {
      const courseId = lesson.course_id;
      const [totalResult, completedResult] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM lessons WHERE course_id=$1', [courseId]),
        pool.query(
          `SELECT COUNT(*) FROM progress p
           JOIN lessons l ON p.lesson_id = l.id
           WHERE p.user_id=$1 AND l.course_id=$2 AND p.status='completed'`,
          [userId, courseId]
        ),
      ]);
      isCourseDone = parseInt(completedResult.rows[0].count) >= parseInt(totalResult.rows[0].count);

      if (isCourseDone) {
        await pool.query(
          `UPDATE enrollments SET completed_at=NOW()
           WHERE user_id=$1 AND course_id=$2 AND completed_at IS NULL`,
          [userId, courseId]
        ).catch(() => {});

        await pool.query(
          `INSERT INTO achievements (user_id, badge_name) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [userId, `course_complete_${courseId}`]
        ).catch(() => {});

        const courseXpKey = `course_complete:${courseId}`;
        const courseXpAlready = await pool.query(
          `SELECT id FROM xp_log WHERE user_id=$1 AND reason=$2 LIMIT 1`,
          [userId, courseXpKey]
        );
        if (!courseXpAlready.rows.length) {
          await pool.query(
            `INSERT INTO xp_log (user_id, amount, reason) VALUES ($1,$2,$3)`,
            [userId, 200, courseXpKey]
          ).catch(() => {});
        }
      }
    } catch (courseErr) {
      console.error('[complete] course check failed (non-fatal):', courseErr.message);
    }

    return res.json({ xp_earned: xpEarned, course_completed: isCourseDone });

  } catch (err) {
    console.error('[POST /lessons/:id/complete] ERROR:', err.message, err.stack);
    return res.status(500).json({ error: err.message || 'Internal server error' });
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
