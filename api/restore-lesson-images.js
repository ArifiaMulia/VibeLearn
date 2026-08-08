// ─────────────────────────────────────────────────────────────────────────────
// restore-lesson-images.js
// One-time migration: restore lesson content from seedData for lessons that
// lost their images (content doesn't contain image markdown "![")
// Run once from server: node api/restore-lesson-images.js
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const pool = require('./db');
const seedData = require('./seedData');
const sealsuiteData = require('./sealsuiteData');

const allSeedData = { ...seedData, ...sealsuiteData };

async function restoreLessonImages() {
  console.log('🔄 Starting lesson image restoration...\n');
  
  let restored = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [courseName, lessons] of Object.entries(allSeedData)) {
    // Find the course in DB
    const courseRes = await pool.query('SELECT id FROM courses WHERE title=$1', [courseName]);
    if (!courseRes.rows.length) {
      console.log(`⚠️  Course not found in DB: "${courseName}"`);
      continue;
    }
    const courseId = courseRes.rows[0].id;

    for (const lesson of lessons) {
      // Check if seed data has images
      const seedHasImages = lesson.content && lesson.content.includes('![');
      const seedIdHasImages = lesson.content_id && lesson.content_id.includes('![');
      
      if (!seedHasImages && !seedIdHasImages) {
        // This lesson doesn't have images in seed data — skip
        continue;
      }

      // Find lesson in DB
      const lessonRes = await pool.query(
        'SELECT id, content, content_id FROM lessons WHERE course_id=$1 AND (title=$2 OR title_id=$3)',
        [courseId, lesson.title, lesson.title_id || null]
      );

      if (!lessonRes.rows.length) {
        console.log(`  ❓ Not found in DB: "${lesson.title}"`);
        notFound++;
        continue;
      }

      const dbLesson = lessonRes.rows[0];
      const dbHasImages = (dbLesson.content || '').includes('![');
      const dbIdHasImages = (dbLesson.content_id || '').includes('![');

      // Only restore if DB content is missing images but seed data has them
      const needsRestore = 
        (seedHasImages && !dbHasImages) || 
        (seedIdHasImages && !dbIdHasImages);

      if (!needsRestore) {
        console.log(`  ✅ OK (has images): "${lesson.title}"`);
        skipped++;
        continue;
      }

      // Restore content fields that lost images
      const newContent = seedHasImages ? lesson.content : dbLesson.content;
      const newContentId = seedIdHasImages ? lesson.content_id : dbLesson.content_id;

      await pool.query(
        `UPDATE lessons SET 
          content = CASE WHEN $1::boolean THEN $2 ELSE content END,
          content_id = CASE WHEN $3::boolean THEN $4 ELSE content_id END
         WHERE id = $5`,
        [seedHasImages, newContent, seedIdHasImages, newContentId, dbLesson.id]
      );

      console.log(`  🔧 RESTORED images in: "${lesson.title}"`);
      restored++;
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`✅ Done! Restored: ${restored} | Skipped (OK): ${skipped} | Not found: ${notFound}`);
  await pool.end();
}

restoreLessonImages().catch(err => {
  console.error('❌ Error:', err);
  pool.end();
  process.exit(1);
});
