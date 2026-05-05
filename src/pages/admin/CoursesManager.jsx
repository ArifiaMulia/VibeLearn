import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CoursesManager() {
  const { authFetch } = useAuth();
  const { error, success } = useAlert();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await authFetch('/courses');
      setCourses(data);
    } catch (e) { error(e.message); }
    setLoading(false);
  };

  const handleNew = () => navigate('/admin/courses/edit/new');
  const handleEdit = (id) => navigate(`/admin/courses/edit/${id}`);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await authFetch(`/courses/${id}`, { method: 'DELETE' });
      success('Course deleted');
      loadCourses();
    } catch (e) { error(e.message); }
  };

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen color="var(--primary)" /> Course Builder
        </h2>
        <button className="btn btn-primary" onClick={handleNew}><Plus size={16} /> New Course</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Title</th>
              <th style={{ padding: '1rem 1.5rem' }}>Level</th>
              <th style={{ padding: '1rem 1.5rem' }}>Category</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{c.title}</td>
                <td style={{ padding: '1rem 1.5rem' }}><span className={`badge diff-${c.level}`}>{c.level}</span></td>
                <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>{c.category}</td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button className="btn btn-ghost" onClick={() => handleEdit(c.id)} style={{ padding: '0.4rem', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(c.id)} style={{ padding: '0.4rem', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
