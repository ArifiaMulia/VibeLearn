-- Fix broken YouTube video URLs
-- Run this directly in the database to update live content without reseeding

-- 1. Fix "The AI Chef (Prompts & MCP)" lesson - old video was deleted from YouTube
--    New video: IBM Technology "What is Prompt Engineering?" (~5 min, very beginner friendly)
UPDATE lessons 
SET video_url = 'https://www.youtube.com/watch?v=1c9iyoVIwDs'
WHERE video_url = 'https://www.youtube.com/watch?v=R94aK4L6lT8'
   OR (title ILIKE '%Chef%' AND title ILIKE '%MCP%')
   OR (title_id ILIKE '%Koki AI%');

-- Verify the update
SELECT id, title, title_id, video_url 
FROM lessons 
WHERE title ILIKE '%Chef%' OR title_id ILIKE '%Koki%';
