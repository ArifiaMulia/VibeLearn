import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/CourseCard';
import { Search, Filter, BookOpen, Zap, Star, ArrowRight } from 'lucide-react';

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['all', 'fundamentals', 'prompting', 'project', 'quality', 'security'];

export default function CoursesPage() {
  const { authFetch } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get('level') || 'all';

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(levelParam);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const l = searchParams.get('level');
    if (l && LEVELS.includes(l)) {
      setLevel(l);
    }
  }, [searchParams]);

  useEffect(() => {
    Promise.all([authFetch('/courses'), authFetch('/courses/my/enrollments').catch(() => [])])
      .then(([c, e]) => { setCourses(c); setEnrollments(e); })
      .finally(() => setLoading(false));
  }, []);

  const enrolledIds = new Set(enrollments.map(e => e.course_id));
  const isNewUser = enrollments.length === 0;
  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'all' || c.level === level;
    const matchCat = category === 'all' || c.category === category;
    return matchSearch && matchLevel && matchCat;
  });

  // Level label mapping for display
  const levelLabel = (l) => ({
    all: lang === 'id' ? 'Semua Level' : 'All Levels',
    beginner: lang === 'id' ? '🌱 Pemula' : '🌱 Beginner',
    intermediate: lang === 'id' ? '🔥 Menengah' : '🔥 Intermediate',
    advanced: lang === 'id' ? '🚀 Mahir' : '🚀 Advanced',
  }[l] || l);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── START HERE STRIP (new users only) ── */}
      {isNewUser && !loading && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))',
          border: '1.5px solid rgba(124,58,237,0.25)', borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 1.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Star size={18} color="var(--warning)" />
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>{t('start_here_title')}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6, maxWidth: 560 }}>
            {t('start_here_sub')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { emoji: '🤖', label: lang === 'id' ? 'Dasar AI & Prompt' : 'AI & Prompt Basics', desc: lang === 'id' ? 'Mulai tanpa perlu coding' : 'No coding required' },
              { emoji: '✍️', label: lang === 'id' ? 'Buat Email dengan AI' : 'Write Emails with AI', desc: lang === 'id' ? 'Langsung praktik nyata' : 'Hands-on from day 1' },
              { emoji: '🔒', label: lang === 'id' ? 'Keamanan Digital' : 'Digital Security', desc: lang === 'id' ? 'Lindungi data kamu' : 'Protect your data' },
            ].map(({ emoji, label, desc }) => (
              <div
                key={label}
                onClick={() => { setLevel('beginner'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)', padding: '0.85rem 1.1rem',
                  cursor: 'pointer', transition: 'all 0.2s', flex: '1 1 180px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder={lang === 'id' ? 'Cari kursus, topik, atau skill...' : 'Search courses, topics, or skills...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)} className={`btn btn-sm ${level === l ? 'btn-primary' : 'btn-ghost'}`}>
              {levelLabel(l)}
            </button>
          ))}
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {filtered.length} {lang === 'id' ? 'kursus ditemukan' : `course${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>{lang === 'id' ? 'Tidak ada kursus' : 'No courses found'}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>{t('no_results_search')}</p>
          <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => { setSearch(''); setLevel('all'); setCategory('all'); }}>
            {lang === 'id' ? 'Reset Filter' : 'Clear All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((course, i) => {
            const enr = enrollments.find(e => e.course_id === course.id);
            return <CourseCard key={course.id} course={course} index={i} enrolled={enrolledIds.has(course.id)} progress={enr} />;
          })}
        </div>
      )}
    </div>
  );
}
