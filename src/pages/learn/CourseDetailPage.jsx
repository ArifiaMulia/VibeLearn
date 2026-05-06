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
          <button className="btn btn-success" onClick={() => window.print()} style={{ background: 'var(--success)', color: 'white' }}>
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
    </div>
  );
}
