import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, ArrowRight, CheckCircle, Zap, Play, Trophy, ExternalLink, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { XPPopup } from '../../components/XPBadge';
import ResourcesPanel from '../../components/ResourcesPanel';
import AskInstructor from '../../components/AskInstructor';
import CodeOrderExercise from '../../components/CodeOrderExercise';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';

// Resolves any video URL to an embeddable format, with external link fallback
function VideoPlayer({ url, title }) {
  if (!url) return null;

  let embedUrl = url;
  let externalUrl = url;
  let platform = 'Video';

  if (url.includes('archive.org')) {
    platform = 'Internet Archive';
    // Already an embed URL?
    if (!url.includes('/embed/')) {
      const match = url.match(/archive\.org\/details\/([^/?]+)/);
      if (match) embedUrl = `https://archive.org/embed/${match[1]}`;
    }
    externalUrl = embedUrl.replace('/embed/', '/details/');
  } else if (url.includes('vimeo.com')) {
    platform = 'Vimeo';
    if (!url.includes('player.vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
    }
    const idMatch = embedUrl.match(/\/video\/(\d+)/);
    externalUrl = idMatch ? `https://vimeo.com/${idMatch[1]}` : url;
  } else if (url.includes('youtube') || url.includes('youtu.be')) {
    platform = 'YouTube';
    const idMatch = url.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?]+)/);
    if (idMatch) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${idMatch[1]}?rel=0`;
      externalUrl = `https://www.youtube.com/watch?v=${idMatch[1]}`;
    }
  } else if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return (
      <video controls style={{ width: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
        <source src={url} />
      </video>
    );
  }

  return (
    <div>
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title={title}
        />
      </div>
      <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
        <a href={externalUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ExternalLink size={12} /> Watch on {platform}
        </a>
      </div>
    </div>
  );
}

// Estimate reading time
function estimateTime(type, content) {
  if (type === 'video') return '~10 min';
  if (type === 'quiz') return '~5 min';
  const words = (content || '').split(/\s+/).length;
  return `~${Math.max(2, Math.ceil(words / 200))} min`;
}

// Lesson Reaction widget
function LessonReaction({ lessonId }) {
  const { t } = useLanguage();
  const [picked, setPicked] = useState(() => localStorage.getItem(`vl_react_${lessonId}`));
  const options = [{ val: '1', emoji: '😕' }, { val: '2', emoji: '😐' }, { val: '3', emoji: '😊' }, { val: '4', emoji: '🤩' }];
  const pick = (val) => { setPicked(val); localStorage.setItem(`vl_react_${lessonId}`, val); };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        {picked ? t('thanks_feedback') : t('how_was_lesson')}
      </div>
      {!picked && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          {options.map(({ val, emoji }) => (
            <button key={val} onClick={() => pick(val)} style={{
              fontSize: '1.6rem', background: 'none', border: '2px solid var(--border-light)',
              borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.transform = 'scale(1.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
            >{emoji}</button>
          ))}
        </div>
      )}
      {picked && (
        <div style={{ fontSize: '2rem' }}>{options.find(o => o.val === picked)?.emoji}</div>
      )}
    </div>
  );
}

// ── QuizCard — supports multiple_choice, true_false, fill_blank, code_order ──
function QuizCard({ q, i, isCompleted, answer, onAnswer, t }) {
  const { lang } = useLanguage();
  const [fillText, setFillText] = useState('');
  const [fillSubmitted, setFillSubmitted] = useState(false);
  const fmt = q.format || 'multiple_choice';

  // TRUE/FALSE format
  if (fmt === 'true_false') {
    const options = [
      { label: lang === 'id' ? '✅ Benar' : '✅ True',  val: 0 },
      { label: lang === 'id' ? '❌ Salah' : '❌ False', val: 1 },
    ];
    return (
      <div className="card">
        <h4 style={{ marginBottom: '1rem' }}>{i + 1}. {q.question}</h4>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {options.map(({ label, val }) => {
            const sel = answer === val;
            return (
              <button key={val} onClick={() => onAnswer(val)} disabled={isCompleted}
                style={{
                  flex: 1, padding: '1rem 0.5rem', borderRadius: 'var(--radius-sm)',
                  fontWeight: 700, fontSize: '0.95rem', cursor: isCompleted ? 'default' : 'pointer',
                  background: sel ? (val === q.correct_answer ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)') : 'var(--bg-surface)',
                  border: `2px solid ${sel ? (val === q.correct_answer ? 'var(--success)' : 'var(--danger,#ef4444)') : 'var(--border-light)'}`,
                  color: sel ? (val === q.correct_answer ? 'var(--success)' : '#ef4444') : 'var(--text-primary)',
                  transition: 'all 0.15s',
                }}>
                {label}
              </button>
            );
          })}
        </div>
        {isCompleted && q.explanation && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--success)', background: 'rgba(16,185,129,0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--success)' }}>
            💡 {q.explanation}
          </p>
        )}
      </div>
    );
  }

  // FILL IN THE BLANK format
  if (fmt === 'fill_blank') {
    const correct = q.options?.[q.correct_answer] || '';
    const check = () => {
      setFillSubmitted(true);
      onAnswer(fillText.trim().toLowerCase() === correct.toLowerCase() ? q.correct_answer : -1);
    };
    return (
      <div className="card">
        <h4 style={{ marginBottom: '1rem' }}>{i + 1}. {q.question}</h4>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            value={fillText} onChange={e => setFillText(e.target.value)}
            disabled={isCompleted || fillSubmitted}
            placeholder={lang === 'id' ? 'Ketik jawabanmu...' : 'Type your answer...'}
            onKeyDown={e => e.key === 'Enter' && check()}
            style={{
              flex: 1, background: 'var(--bg-surface)', border: `1px solid ${fillSubmitted ? (answer === q.correct_answer ? 'var(--success)' : '#ef4444') : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', color: 'var(--text-primary)', fontSize: '0.9rem',
            }}
          />
          {!fillSubmitted && !isCompleted && (
            <button onClick={check} className="btn btn-primary btn-sm">
              {lang === 'id' ? 'Cek' : 'Check'}
            </button>
          )}
        </div>
        {fillSubmitted && (
          <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid', background: answer === q.correct_answer ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)', borderLeftColor: answer === q.correct_answer ? 'var(--success)' : '#ef4444', color: answer === q.correct_answer ? 'var(--success)' : '#ef4444' }}>
            {answer === q.correct_answer
              ? `✅ ${lang === 'id' ? 'Benar!' : 'Correct!'}`
              : `❌ ${lang === 'id' ? `Jawaban yang benar: ${correct}` : `Correct answer: ${correct}`}`}
            {q.explanation && <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>💡 {q.explanation}</div>}
          </div>
        )}
      </div>
    );
  }

  // CODE ORDER format
  if (fmt === 'code_order') {
    const lines = q.code_lines || q.options || [];
    return (
      <div className="card">
        <h4 style={{ marginBottom: '1rem' }}>{i + 1}. {q.question}</h4>
        <CodeOrderExercise lines={lines} onComplete={() => onAnswer(q.correct_answer)} />
      </div>
    );
  }

  // DEFAULT: MULTIPLE CHOICE
  return (
    <div className="card">
      <h4 style={{ marginBottom: '1rem' }}>{i + 1}. {q.question}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {q.options.map((opt, optIdx) => (
          <button key={optIdx}
            onClick={() => onAnswer(optIdx)}
            disabled={isCompleted}
            style={{
              textAlign: 'left', padding: '1rem', borderRadius: 'var(--radius-sm)',
              background: answer === optIdx ? 'rgba(124,58,237,0.15)' : 'var(--bg-surface)',
              border: `1px solid ${answer === optIdx ? 'var(--primary)' : 'var(--border-light)'}`,
              color: 'var(--text-primary)', cursor: isCompleted ? 'default' : 'pointer', transition: 'var(--transition)',
              opacity: isCompleted && answer !== optIdx ? 0.6 : 1,
            }}>
            <span style={{ marginRight: '0.75rem', opacity: 0.5, fontSize: '0.8rem' }}>{String.fromCharCode(65 + optIdx)}.</span>
            {opt}
          </button>
        ))}
      </div>
      {isCompleted && q.explanation && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--success)', background: 'rgba(16,185,129,0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--success)' }}>
          💡 {q.explanation}
        </p>
      )}
    </div>
  );
}

export default function LessonPage() {
  const { id } = useParams();

  const { authFetch, user } = useAuth();
  const { success, error } = useAlert();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();


  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showXP, setShowXP] = useState(false);
  const [xpEarned, setXPEarned] = useState(0);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  }, []);

  useEffect(() => {
    setLesson(null);
    setLoading(true);
    setQuizAnswers({});
    authFetch(`/lessons/${id}`)
      .then(setLesson)
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

  const handleComplete = async (andNavigateNext = false) => {
    if (lesson.type === 'quiz') {
      if (Object.keys(quizAnswers).length < (lesson.quizzes?.length || 0)) {
        return error('Please answer all questions before completing.');
      }
      let correct = 0;
      lesson.quizzes?.forEach(q => { if (quizAnswers[q.id] === q.correct_answer) correct++; });
      const score = Math.round((correct / lesson.quizzes.length) * 100);
      if (score < 80) return error(`You scored ${score}%. You need 80% to pass.`);
    }

    // If already completed and user just wants to navigate next
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
      success('Lesson completed! 🎉');

      if (andNavigateNext && lesson.next_lesson_id) {
        setTimeout(() => navigate(`/lessons/${lesson.next_lesson_id}`), 1200);
      } else {
        setTimeout(() => navigate(`/courses/${lesson.course_id}`), 2200);
      }
    } catch (err) {
      error(err.message);
      setCompleting(false);
    }
  };

  const handleNext = () => handleComplete(true);
  const handlePrev = () => navigate(`/lessons/${lesson.prev_lesson_id}`);

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;
  if (!lesson) return null;

  const isCompleted = lesson.user_progress?.status === 'completed';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <XPPopup visible={showXP} amount={xpEarned} />

      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/courses/${lesson.course_id}`)} style={{ width: 'fit-content' }}>
        <ArrowLeft size={15} /> {t('back_to_course')}
      </button>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-accent" style={{ textTransform: 'uppercase' }}>{lesson.type}</span>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={12} /> {lesson.xp_reward} XP
          </span>
          {isCompleted && <span className="badge badge-success"><CheckCircle size={12} /> Completed</span>}
        </div>
        <h1 style={{ marginBottom: '0.35rem' }}>{lesson.title}</h1>
        {lesson.lesson_number && lesson.total_lessons && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{t('lesson_label')} {lesson.lesson_number} {t('of')} {lesson.total_lessons}</span>
            <span style={{ color: 'var(--border-light)' }}>·</span>
            <div style={{ flex: 1, maxWidth: 100, height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--primary)', width: `${Math.round((lesson.lesson_number / lesson.total_lessons) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>
      {/* What You'll Learn intro card */}
      {!isCompleted && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))',
          border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start',
        }}>
          <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>{t('what_youll_learn')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 20, padding: '0.2rem 0.7rem', border: '1px solid var(--border-light)' }}>
                ⏱ {estimateTime(lesson.type, lesson.content)}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 20, padding: '0.2rem 0.7rem', border: '1px solid var(--border-light)' }}>
                📊 {lesson.type === 'quiz' ? 'Quiz — 80% to pass' : lesson.type === 'video' ? 'Watch & Read' : 'Read & Practice'}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', background: 'rgba(124,58,237,0.1)', borderRadius: 20, padding: '0.2rem 0.7rem', border: '1px solid rgba(124,58,237,0.2)', fontWeight: 700 }}>
                ⚡ +{lesson.xp_reward} XP on completion
              </span>
            </div>
          </div>
        </div>
      )}

      {lesson.type === 'video' && lesson.video_url && (
        <VideoPlayer url={lesson.video_url} title={lesson.title} />
      )}

      {/* Text / Video Markdown Content */}
      {(lesson.type === 'text' || lesson.type === 'video') && lesson.content && (() => {
        // Bilingual: prefer content_id (Indonesian) when lang=id
        const displayContent = lang === 'id' && lesson.content_id ? lesson.content_id : lesson.content;
        const showTranslationBanner = lang === 'id' && !lesson.content_id;
        return (
          <>
            {showTranslationBanner && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)',
                borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', fontSize: '0.8rem', color: 'var(--text-muted)',
              }}>
                <span style={{ fontSize: '1rem' }}>🇮🇩</span>
                <span>Terjemahan Bahasa Indonesia <strong>segera hadir</strong>. Menampilkan versi Bahasa Inggris.</span>
              </div>
            )}
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
                  blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid var(--primary)', color: 'var(--text-muted)', margin: '1rem 0', background: 'rgba(124,58,237,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }} {...props} />,
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
                {displayContent}
              </ReactMarkdown>
            </div>
          </>
        );
      })()}

      {/* Quiz Content */}
      {lesson.type === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
          </div>
          {lesson.quizzes?.map((q, i) => (
            <QuizCard key={q.id} q={q} i={i} isCompleted={isCompleted}
              answer={quizAnswers[q.id]} onAnswer={(val) => !isCompleted && setQuizAnswers(prev => ({ ...prev, [q.id]: val }))} t={t} />
          ))}
        </div>
      )}

      {/* Challenge Text — Your Turn block (bilingual) */}
      {(lesson.challenge_text || lesson.challenge_text_id) && (() => {
        const text = lang === 'id' && lesson.challenge_text_id ? lesson.challenge_text_id : lesson.challenge_text;
        if (!text) return null;
        return (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(6,182,212,0.05))',
            border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)',
            padding: '1.1rem 1.25rem', display: 'flex', gap: '0.85rem',
          }}>
            <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>🎯</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--warning)', marginBottom: '0.35rem' }}>
                {lang === 'id' ? 'Giliran Kamu!' : 'Your Turn!'}
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {text}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Lesson Reaction */}
      {isCompleted && <LessonReaction lessonId={id} />}

      {/* Resources Panel */}
      <ResourcesPanel resources={lesson.resources || []} lessonType={lesson.type} />

      {/* Ask AI Instructor */}
      <AskInstructor lessonId={id} lessonTitle={lesson.title} lessonType={lesson.type} />

      {/* Navigation & Completion */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '2rem' }}>
        <div>
          {lesson.prev_lesson_id && (
            <button className="btn btn-secondary" onClick={handlePrev}>
              <ArrowLeft size={16} /> {t('previous')}
            </button>
          )}
        </div>

        {!isCompleted && (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => handleComplete(false)}
            disabled={completing}
            style={{ minWidth: 200, display: 'flex', justifyContent: 'center' }}
          >
            {completing ? t('processing') : <><Trophy size={18} /> {t('complete_lesson')}</>}
          </button>
        )}

        {isCompleted && (
          <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            <CheckCircle size={16} /> {t('already_completed')}
          </span>
        )}

        <div>
          {lesson.next_lesson_id && (
            <button className="btn btn-primary" onClick={handleNext} disabled={completing}>
              {t('next')} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
