import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookOpen, Play, CheckCircle, Lock, Clock, Zap, ArrowLeft, Users, Trophy, Star } from 'lucide-react';

const TYPE_ICONS = { text: BookOpen, video: Play, quiz: Zap, lab: Lock };
const TYPE_LABELS = { text: 'Reading', video: 'Video', quiz: 'Quiz', lab: 'Lab' };
const TYPE_COLORS = { text: 'var(--accent)', video: 'var(--primary)', quiz: 'var(--warning)', lab: 'var(--text-muted)' };

// Estimate reading time from content length
function estimateTime(type, content) {
  if (type === 'video') return '~10 min';
  if (type === 'quiz') return '~5 min';
  const words = (content || '').split(/\s+/).length;
  const mins = Math.max(2, Math.ceil(words / 200));
  return `~${mins} min`;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const { success, error } = useAlert();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    Promise.all([
      authFetch(`/courses/${id}`),
      authFetch(`/progress/course/${id}`).catch(() => []),
      authFetch('/courses/my/enrollments').catch(() => []),
    ]).then(([c, p, enrs]) => {
      setCourse(c);
      setProgress(p);
      setEnrolled(enrs.some(e => e.course_id === parseInt(id)));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await authFetch(`/courses/${id}/enroll`, { method: 'POST' });
      setEnrolled(true);
      success(`${t('enroll_now')} 🎉 Start your first lesson`);
    } catch (e) { error(e.message); }
    setEnrolling(false);
  };

  const completedIds = new Set(progress.filter(p => p.status === 'completed').map(p => p.lesson_id));
  const totalXP = course?.lessons?.reduce((s, l) => s + (l.xp_reward || 0), 0) || 0;
  const pct = course?.lessons?.length > 0 ? Math.round((completedIds.size / course.lessons.length) * 100) : 0;
  const isCourseDone = course?.lessons?.length > 0 && completedIds.size === course.lessons.length;

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />;
  if (!course) return <div className="card" style={{ textAlign: 'center' }}><p>Course not found</p></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/courses')} style={{ width: 'fit-content' }}>
        <ArrowLeft size={15} /> {t('back_to_courses')}
      </button>

      {/* Course Completion Banner */}
      {isCourseDone && (
        <div style={{
          padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
          border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        }}>
          <Trophy size={32} color="var(--success)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>{t('course_complete_title')}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('course_complete_body')}</div>
          </div>
          <button className="btn btn-success" onClick={() => setShowCert(true)} style={{ background: 'var(--success)', color: 'white' }}>
            {t('get_certificate')}
          </button>
        </div>
      )}

      {/* Hero */}
      <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className={`badge diff-${course.level}`}>{course.level}</span>
              <span className="badge badge-muted">{course.category}</span>
              <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Zap size={11} /> {totalXP} XP Total
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{course.title}</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{course.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={14} />{course.lessons?.length || 0} lessons</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14} />{course.enrolled_count} enrolled</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} />By {course.instructor_name}</span>
            </div>
            {enrolled ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                            <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{completedIds.size}/{course.lessons?.length} {t('completed')}</div>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="progress-track" style={{ height: 10, marginBottom: '1rem' }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleEnroll} disabled={enrolling}>
                              {enrolling ? t('processing') : <>{t('enroll_now')} <Zap size={18} /></>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Learning Path */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{t('learning_path')} — {course.lessons?.length} {t('lessons')}</h3>
          {enrolled && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {completedIds.size} of {course.lessons?.length} done · {totalXP} XP available
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {course.lessons?.map((lesson, i) => {
            const done = completedIds.has(lesson.id);
            const isActive = !done && enrolled && [...course.lessons].slice(0, i).every(l => completedIds.has(l.id));
            const isLocked = !enrolled;
            const TypeIcon = TYPE_ICONS[lesson.type] || BookOpen;
            const color = TYPE_COLORS[lesson.type] || 'var(--primary)';

            return (
              <div key={lesson.id} style={{ display: 'flex', gap: '0', position: 'relative' }}>
                {/* Connector line */}
                {i < course.lessons.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 17, top: 44, bottom: -8, width: 2,
                    background: done ? 'var(--success)' : 'var(--border-light)', zIndex: 0,
                  }} />
                )}

                {/* Node */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.6rem 0.5rem', flex: 1, zIndex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: done ? 'var(--success)' : isActive ? color : 'var(--bg-card)',
                    border: `2px solid ${done ? 'var(--success)' : isActive ? color : 'var(--border-light)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? `0 0 12px ${color}40` : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {done ? <CheckCircle size={16} color="white" /> : isLocked ? <Lock size={14} color="var(--text-muted)" /> : <TypeIcon size={16} color={done || isActive ? 'white' : color} />}
                  </div>

                  {/* Lesson info card */}
                  <div
                    onClick={() => !isLocked && navigate(`/lessons/${lesson.id}`)}
                    style={{
                      flex: 1, padding: '0.7rem 1rem',
                      background: done ? 'rgba(16,185,129,0.05)' : isActive ? `${color}08` : 'var(--bg-surface)',
                      border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : isActive ? `${color}30` : 'var(--border-light)'}`,
                      borderRadius: 'var(--radius-sm)', cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.5 : 1, transition: 'all 0.2s',
                      marginBottom: '0.5rem',
                    }}
                    onMouseEnter={e => !isLocked && (e.currentTarget.style.transform = 'translateX(4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                          <span style={{ fontSize: '0.7rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {i + 1}. {TYPE_LABELS[lesson.type] || 'Lesson'}
                          </span>
                                                    {isActive && <span style={{ fontSize: '0.65rem', background: `${color}20`, color, padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>{t('up_next')}</span>}
                          {done && <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '0.1rem 0.4rem', borderRadius: 10, fontWeight: 700 }}>{t('done')}</span>}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: done ? 'var(--success)' : 'var(--text-primary)' }}>{lesson.title}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{estimateTime(lesson.type, lesson.content)}</span>
                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}><Zap size={10} />{lesson.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Digital Builder Certificate Modal */}
      {showCert && (
        <div className="no-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowCert(false)}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '800px', border: '1px solid var(--border-light)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}
            onClick={e => e.stopPropagation()}>
            
            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Certificate Viewer</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCert(false)} style={{ minWidth: 'auto', padding: '0.25rem' }}>✕</button>
            </div>

            {/* Certificate Card Container */}
            <div className="certificate-card" style={{
              background: '#0d0d26',
              color: 'white',
              border: '10px double #d4af37',
              padding: '3rem 2rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(212,175,55,0.06)', filter: 'blur(30px)' }} />
              <div style={{ position: 'absolute', bottom: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', filter: 'blur(30px)' }} />

              {/* Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #d4af37, #f3e5ab)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
                  <Trophy size={30} color="#0d0d26" />
                </div>
                <h2 style={{ fontFamily: "'Georgia', serif", fontSize: '1.4rem', letterSpacing: '0.12em', color: '#d4af37', margin: '0.5rem 0 0', fontWeight: 800 }}>
                  {t('certificate_modal_title')}
                </h2>
                <div style={{ height: '2px', width: '80px', background: 'linear-gradient(90deg, transparent, #d4af37, transparent)', marginTop: '0.25rem' }} />
              </div>

              {/* Presented To */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  {t('certificate_presented_to')}
                </span>
                <h1 style={{ fontFamily: "'Georgia', serif", fontSize: '2.5rem', color: '#ffffff', textShadow: '0 2px 10px rgba(255,255,255,0.1)', margin: '0.5rem 0', fontWeight: 700 }}>
                  {user?.name}
                </h1>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', lineHeight: 1.5 }}>
                  {t('certificate_course_completed')}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent)', margin: '0.25rem 0', fontWeight: 700 }}>
                  {course?.title}
                </h3>
              </div>

              {/* Role Badge */}
              <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '30px', padding: '0.4rem 1.2rem', fontSize: '0.82rem', color: '#d4af37', fontWeight: 700, letterSpacing: '0.05em' }}>
                🛡️ {t('certificate_role')}
              </div>

              {/* Footer details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('certificate_date')}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('certificate_id')}</span>
                  <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#d4af37', fontWeight: 600 }}>{`VL-CERT-${course.id}-${user?.id || 99}-${Math.abs((course.id * 183 + (user?.id || 99) * 761) % 100000).toString().padStart(5, '0')}`}</span>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', width: '100%', marginTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', color: '#d4af37', fontSize: '1rem' }}>Arifia Mulia</span>
                  <div style={{ width: '120px', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '0.25rem 0' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Academy Director</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic', color: '#d4af37', fontSize: '1rem' }}>AI Validator</span>
                  <div style={{ width: '120px', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '0.25rem 0' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Automated Reviewer</span>
                </div>
              </div>
            </div>

            {/* Print Action */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowCert(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ {t('certificate_print')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
