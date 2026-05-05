import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { ArrowLeft, ArrowRight, CheckCircle, Zap, Play, Trophy, BookOpen } from 'lucide-react';
import { XPPopup } from '../../components/XPBadge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';

// Resolve a video_url to the correct embed URL regardless of format
function resolveEmbedUrl(url) {
  if (!url) return null;
  // Already an embed URL
  if (url.includes('/embed/')) return url;
  // youtube.com/watch?v=ID
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`;
  return url;
}

// Detect if URL is a direct video file
function isDirectVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function VideoPlayer({ url, title }) {
  const embedUrl = resolveEmbedUrl(url);
  const direct = isDirectVideo(url);
  const [embedFailed, setEmbedFailed] = useState(false);

  if (direct) {
    return (
      <video controls style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
        <source src={url} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (embedFailed) {
    // Fallback: open in new tab
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', background: 'var(--bg-card)' }}>
        <Play size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320, fontSize: '0.9rem' }}>
          This video cannot be embedded. Click below to watch it in a new tab.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <Play size={16} /> Watch Video
        </a>
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="100%"
      style={{ border: 'none' }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      title={title}
      onError={() => setEmbedFailed(true)}
    />
  );
}

export default function LessonPage() {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const { success, error } = useAlert();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showXP, setShowXP] = useState(false);
  const [xpEarned, setXPEarned] = useState(0);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  }, []);

  useEffect(() => {
    authFetch(`/lessons/${id}`)
      .then(data => {
        setLesson(data);
        // Check enrollment via progress
        setEnrolled(!!data.user_progress);
      })
      .catch(err => { error(err.message); navigate('/courses'); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (lesson) {
      setTimeout(() => {
        try { mermaid.run({ querySelector: '.mermaid' }); } catch (e) {}
      }, 100);
    }
  }, [lesson]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      // Mark lesson as started by posting progress with "in_progress"
      await authFetch(`/lessons/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ score: 0, status: 'in_progress' })
      });
      setEnrolled(true);
      success('Enrolled! Let\'s start learning.');
    } catch (err) {
      // If already exists or any error, just set enrolled
      setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  };

  const handleComplete = async (andNavigateNext = false) => {
    if (lesson.type === 'quiz') {
      if (Object.keys(quizAnswers).length < lesson.quizzes.length) {
        return error('Please answer all questions before completing.');
      }
      let correct = 0;
      lesson.quizzes.forEach(q => { if (quizAnswers[q.id] === q.correct_answer) correct++; });
      const score = Math.round((correct / lesson.quizzes.length) * 100);
      if (score < 80) return error(`You scored ${score}%. You need 80% to pass.`);
    }

    if (isCompleted && andNavigateNext && lesson.next_lesson_id) {
      navigate(`/lessons/${lesson.next_lesson_id}`);
      return;
    }

    setCompleting(true);
    try {
      const res = await authFetch(`/lessons/${id}/complete`, {
        method: 'POST', body: JSON.stringify({ score: 100 })
      });
      setXPEarned(res.xp_earned || lesson.xp_reward);
      setShowXP(true);

      if (andNavigateNext && lesson.next_lesson_id) {
        setTimeout(() => navigate(`/lessons/${lesson.next_lesson_id}`), 1500);
      } else {
        success('Lesson completed! Awesome job. 🎉');
        setTimeout(() => navigate(`/courses/${lesson.course_id}`), 2500);
      }
    } catch (err) {
      error(err.message);
      setCompleting(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;
  if (!lesson) return null;

  const isCompleted = lesson.user_progress?.status === 'completed';

  // ── Enroll Gate ──
  // Show "Enroll" gate only if the user has never started this lesson
  if (!enrolled && !isCompleted) {
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px var(--primary-glow)',
        }}>
          <BookOpen size={32} color="white" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.6rem' }}>{lesson.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            You're about to start this lesson. Click below to enroll and begin learning!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="badge badge-accent" style={{ textTransform: 'uppercase' }}>{lesson.type}</span>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={12} /> {lesson.xp_reward} XP
          </span>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleEnroll}
          disabled={enrolling}
          style={{ minWidth: 200, fontSize: '1rem' }}
        >
          {enrolling ? 'Enrolling...' : <><Play size={18} /> Enroll Now</>}
        </button>
        <button className="btn btn-ghost" onClick={() => navigate(`/courses/${lesson.course_id}`)}>
          <ArrowLeft size={15} /> Back to Course
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <XPPopup visible={showXP} amount={xpEarned} />

      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/courses/${lesson.course_id}`)} style={{ width: 'fit-content' }}>
        <ArrowLeft size={15} /> Back to Course
      </button>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span className="badge badge-accent" style={{ textTransform: 'uppercase' }}>{lesson.type}</span>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={12} /> {lesson.xp_reward} XP
          </span>
          {isCompleted && <span className="badge badge-success"><CheckCircle size={12} /> Completed</span>}
        </div>
        <h1 style={{ marginBottom: '1rem' }}>{lesson.title}</h1>
      </div>

      {/* Video Content */}
      {lesson.type === 'video' && lesson.video_url && (
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <VideoPlayer url={lesson.video_url} title={lesson.title} />
        </div>
      )}

      {/* Text Content rendered with Markdown */}
      {(lesson.type === 'text' || lesson.type === 'video') && (
        <div className="card markdown-content" style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({node, ...props}) => <h1 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ marginTop: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }} {...props} />,
              p: ({node, ...props}) => <p style={{ marginBottom: '1rem' }} {...props} />,
              ul: ({node, ...props}) => <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }} {...props} />,
              ol: ({node, ...props}) => <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'decimal' }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
              blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '1rem', color: 'var(--text-muted)', margin: '1rem 0', background: 'rgba(124,58,237,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }} {...props} />,
              code: ({node, inline, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match && match[1] === 'mermaid') {
                  return <div className="mermaid" style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>{String(children).replace(/\n$/, '')}</div>;
                }
                return !inline ? (
                  <pre style={{ background: '#1e1e2e', padding: '1rem', borderRadius: 'var(--radius-md)', overflowX: 'auto', marginBottom: '1rem', border: '1px solid var(--border-light)' }}>
                    <code style={{ color: '#cdd6f4', fontFamily: 'monospace' }} {...props}>{children}</code>
                  </pre>
                ) : (
                  <code style={{ background: 'rgba(124,58,237,0.15)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.9em' }} {...props}>{children}</code>
                );
              }
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>
      )}

      {/* Quiz Content */}
      {lesson.type === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
          </div>
          {lesson.quizzes?.map((q, i) => (
            <div key={q.id} className="card">
              <h4 style={{ marginBottom: '1rem' }}>{i + 1}. {q.question}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, optIdx) => (
                  <button key={optIdx}
                    onClick={() => !isCompleted && setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                    disabled={isCompleted}
                    style={{
                      textAlign: 'left', padding: '1rem', borderRadius: 'var(--radius-sm)',
                      background: quizAnswers[q.id] === optIdx ? 'rgba(124,58,237,0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${quizAnswers[q.id] === optIdx ? 'var(--primary)' : 'var(--border-light)'}`,
                      color: 'var(--text-primary)', cursor: isCompleted ? 'default' : 'pointer', transition: 'var(--transition)',
                      opacity: isCompleted && quizAnswers[q.id] !== optIdx ? 0.6 : 1
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion CTA & Navigation */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {lesson.prev_lesson_id && (
            <button className="btn btn-secondary" onClick={() => navigate(`/lessons/${lesson.prev_lesson_id}`)}>
              <ArrowLeft size={16} /> Previous
            </button>
          )}
        </div>

        <button
          className={`btn btn-lg ${isCompleted ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => handleComplete(false)}
          disabled={completing || isCompleted}
          style={{ minWidth: 200, display: 'flex', justifyContent: 'center', opacity: isCompleted ? 0.6 : 1 }}
        >
          {isCompleted ? <><CheckCircle size={18} /> Already Completed</> : completing ? 'Processing...' : <><Trophy size={18} /> Complete Lesson</>}
        </button>

        <div>
          {lesson.next_lesson_id && (
            <button
              className="btn btn-primary"
              onClick={() => handleComplete(true)}
              disabled={completing}
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
