import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseCard from '../../components/CourseCard';
import { Search, Filter, BookOpen } from 'lucide-react';

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['all', 'fundamentals', 'prompting', 'project', 'quality', 'security'];

export default function CoursesPage() {
  const { authFetch } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    Promise.all([authFetch('/courses'), authFetch('/courses/my/enrollments').catch(() => [])])
      .then(([c, e]) => { setCourses(c); setEnrollments(e); })
      .finally(() => setLoading(false));
  }, []);

  const enrolledIds = new Set(enrollments.map(e => e.course_id));
  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'all' || c.level === level;
    const matchCat = category === 'all' || c.category === category;
    return matchSearch && matchLevel && matchCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)} className={`btn btn-sm ${level === l ? 'btn-primary' : 'btn-ghost'}`}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No courses found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
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
