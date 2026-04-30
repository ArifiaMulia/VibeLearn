import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { BookOpen, Plus, Save, Sparkles, Trash2, GripVertical, ChevronRight, Layout, Type, HelpCircle } from 'lucide-react';

export default function CourseEditor() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const { success, error, info } = useAlert();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (id === 'new') {
      setCourse({ title: '', description: '', level: 'beginner', category: 'general' });
      setLoading(false);
    } else {
      authFetch(`/courses/${id}`).then(data => {
        setCourse(data);
        setLessons(data.lessons || []);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAIOutline = async () => {
    if (!topic) return error("Enter a topic first!");
    setAiLoading(true);
    try {
      const outline = await authFetch('/courses/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic, type: 'outline' })
      });
      setLessons([...lessons, ...outline.map(l => ({ ...l, id: Date.now() + Math.random(), content: '' }))]);
      success("AI generated a course outline!");
    } catch (e) { error(e.message); }
    setAiLoading(false);
  };

  const handleSave = async () => {
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? '/courses' : `/courses/${id}`;
      const savedCourse = await authFetch(url, { method, body: JSON.stringify(course) });
      
      // Save lessons sequentially (in a real app, do batch update)
      success("Course saved!");
      if (id === 'new') navigate(`/admin/courses/edit/${savedCourse.id}`);
    } catch (e) { error(e.message); }
  };

  if (loading) return <div className="skeleton" style={{ height: '80vh' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layout color="var(--primary)" /> {id === 'new' ? 'New Course' : 'Edit Course'}
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/courses')}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Course Details */}
        <div className="flex-col gap-3">
          <div className="card">
            <h4 className="mb-3">General Info</h4>
            <div className="form-group mb-3">
              <label className="form-label">Course Title</label>
              <input 
                className="form-input" value={course.title} 
                onChange={e => setCourse({...course, title: e.target.value})} 
                placeholder="e.g. Master Vibe Coding"
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Level</label>
              <select className="form-select" value={course.level} onChange={e => setCourse({...course, level: e.target.value})}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--primary)' }}>
            <h4 className="mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" /> AI Co-pilot
            </h4>
            <p className="text-xs text-muted mb-3">Let AI help you structure your course in seconds.</p>
            <input 
              className="form-input mb-2" placeholder="Describe the topic..." 
              value={topic} onChange={e => setTopic(e.target.value)}
            />
            <button 
              className="btn btn-primary w-full" onClick={handleAIOutline} 
              disabled={aiLoading}
            >
              {aiLoading ? 'Thinking...' : 'Generate Outline'}
            </button>
          </div>
        </div>

        {/* Lesson Structure */}
        <div className="flex-col gap-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Course Structure</h3>
            <button className="btn btn-ghost btn-sm"><Plus size={14} /> Add Lesson</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ cursor: 'grab', color: 'var(--text-muted)' }}><GripVertical size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>LESSON {index + 1}</div>
                  <input 
                    className="form-input" value={lesson.title} 
                    onChange={e => {
                      const newLessons = [...lessons];
                      newLessons[index].title = e.target.value;
                      setLessons(newLessons);
                    }}
                    style={{ background: 'transparent', border: 'none', padding: 0, fontWeight: 600, fontSize: '1rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  <button className="btn btn-ghost btn-sm"><ChevronRight size={14} /></button>
                </div>
              </div>
            ))}

            {lessons.length === 0 && (
              <div className="card text-center" style={{ padding: '3rem', borderStyle: 'dashed' }}>
                <BookOpen size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p className="text-muted">No lessons yet. Use the AI Co-pilot or add one manually.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
