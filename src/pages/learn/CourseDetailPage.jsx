import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { BookOpen, Play, CheckCircle, Lock, Clock, Zap, ArrowLeft, Users } from 'lucide-react';

const TYPE_ICONS = { text: BookOpen, video: Play, quiz: Zap, lab: Lock };
const TYPE_LABELS = { text: 'Reading', video: 'Video', quiz: 'Quiz', lab: 'Lab' };

export default function CourseDetailPage() {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const { success, error } = useAlert();
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
      success('Enrolled successfully! 🎉 Start your first lesson');
    } catch (e) { error(e.message); }
    setEnrolling(false);
  };

  const completedIds = new Set(progress.filter(p => p.status === 'completed').map(p => p.lesson_id));
  const totalXP = course?.lessons?.reduce((s, l) => s + (l.xp_reward || 0), 0) || 0;

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />;
  if (!course) return <div className="card" style={{ textAlign: 'center' }}><p>Course not found</p></div>;

  const pct = course.lessons?.length > 0 ? Math.round((completedIds.size / course.lessons.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/courses')} style={{ width: 'fit-content' }}>
        <ArrowLeft size={15} /> Back to Courses
      </button>

      {/* Hero */}
      <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className={`badge diff-${course.level}`}>{course.level}</span>
              <span className="badge badge-muted">{course.category}</span>
              <span className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Zap size={11} /> {totalXP} XP Total
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{course.title}</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{course.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><BookOpen size={14} />{course.lessons?.length || 0} lessons</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14} />{course.enrolled_count} enrolled</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} />By {course.instructor_name}</span>
            </div>
            {enrolled ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{completedIds.size}/{course.lessons?.length} completed</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div className="progress-track" style={{ height: 10, marginBottom: '1rem' }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : 'Enroll Now — Free'} {!enrolling && <Zap size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Course Content — {course.lessons?.length} Lessons</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {course.lessons?.map((lesson, i) => {
            const done = completedIds.has(lesson.id);
            const TypeIcon = TYPE_ICONS[lesson.type] || BookOpen;
            const isLocked = !enrolled;
            return (
              <div key={lesson.id} onClick={() => !isLocked && navigate(`/lessons/${lesson.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.9rem 1rem', borderRadius: 'var(--radius-sm)',
                  background: done ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface)',
                  border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border-light)'}`,
                  cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.6 : 1,
                  transition: 'var(--transition)',
                }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: done ? 'var(--success-glow)' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done ? <CheckCircle size={18} color="var(--success)" /> : isLocked ? <Lock size={16} color="var(--text-muted)" /> : <TypeIcon size={18} color="var(--primary)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: done ? 'var(--success)' : 'var(--text-primary)' }}>
                    {i + 1}. {lesson.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {TYPE_LABELS[lesson.type] || 'Lesson'}
                  </div>
                </div>
                <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}><Zap size={10} />{lesson.xp_reward} XP</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
