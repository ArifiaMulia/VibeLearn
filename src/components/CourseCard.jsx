import { BookOpen, Clock, Star, Users, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LEVEL_STYLES = {
  beginner:     { label: 'Beginner',     cls: 'diff-beginner' },
  intermediate: { label: 'Intermediate', cls: 'diff-intermediate' },
  advanced:     { label: 'Advanced',     cls: 'diff-advanced' },
};

const GRADIENT_PRESETS = [
  'linear-gradient(135deg,#7c3aed,#06b6d4)',
  'linear-gradient(135deg,#db2777,#7c3aed)',
  'linear-gradient(135deg,#0891b2,#10b981)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
];

export default function CourseCard({ course, index = 0, progress = null, enrolled = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const lvl = LEVEL_STYLES[course.level] || LEVEL_STYLES.beginner;
  const pct = progress ? Math.round((progress.completed_lessons / Math.max(progress.total_lessons, 1)) * 100) : 0;
  const gradient = GRADIENT_PRESETS[index % GRADIENT_PRESETS.length];
  const isLocked = user?.plan === 'free' && index > 0;

  return (
    <div className="card" onClick={() => !isLocked && navigate(`/courses/${course.id}`)}
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden', opacity: isLocked ? 0.7 : 1 }}>
      {/* Thumbnail */}
      <div style={{ height: 140, background: gradient, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BookOpen size={42} color="rgba(255,255,255,0.3)" />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className={`badge ${lvl.cls}`}>{lvl.label}</span>
        </div>
        {isLocked && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
            <Lock size={28} color="white" />
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>Upgrade to Pro</span>
          </div>
        )}
        {enrolled && pct === 100 && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span className="badge badge-success">✓ Completed</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{course.title}</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <BookOpen size={12} /> {course.lesson_count || 0} lessons
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users size={12} /> {course.enrolled_count || 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={12} color="var(--warning)" /> {course.category}
          </span>
        </div>

        {/* Progress */}
        {enrolled && progress && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* CTA */}
        {!isLocked && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
              {enrolled ? (pct > 0 ? 'Continue' : 'Start') : 'Enroll Now'}
            </span>
            <ChevronRight size={16} color="var(--primary)" />
          </div>
        )}
      </div>
    </div>
  );
}
