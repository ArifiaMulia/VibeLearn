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
    if (!course.title) return error("Course title is required");
    try {
      const method = id === 'new' ? 'POST' : 'PUT';
      const url = id === 'new' ? '/courses' : `/courses/${id}`;
      
      // Merge lessons into the request body
      const payload = { ...course, lessons };
      
      const savedCourse = await authFetch(url, { method, body: JSON.stringify(payload) });
      
      success(`Course ${id === 'new' ? 'created' : 'updated'} successfully!`);
      if (id === 'new') navigate(`/admin/courses/edit/${savedCourse.id}`);
      else {
        // Refresh local state with saved data
        setCourse(savedCourse);
        setLessons(savedCourse.lessons || lessons);
      }
    } catch (e) { 
      console.error('Save failed:', e);
      error(e.message || "Failed to save course. Check your permissions."); 
    }
  };

  const handleFileUpload = async (e, lessonIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await authFetch('/upload', {
        method: 'POST',
        body: formData,
        headers: {} // Need to let browser set Content-Type for FormData
      }, true); // if authFetch supports skipping headers

      // In case authFetch overrides Content-Type to application/json, we need a custom fetch
      // Let's use standard fetch with token:
      const token = localStorage.getItem('vl_token');
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.error || 'Upload failed');

      const newLessons = [...lessons];
      newLessons[lessonIndex].video_url = data.url;
      setLessons(newLessons);
      success('Video uploaded successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to upload video');
    }
  };

  const addLesson = () => {
    const newLesson = {
      id: 'temp-' + Date.now(),
      title: 'New Lesson',
      content: '',
      type: 'text',
      xp_reward: 50,
      order_index: lessons.length + 1
    };
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (lessonId) => {
    setLessons(lessons.filter(l => l.id !== lessonId));
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
            <button className="btn btn-ghost btn-sm" onClick={addLesson}><Plus size={14} /> Add Lesson</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lessons.map((lesson, index) => (
              <div key={lesson.id} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottomLeftRadius: lesson.expanded ? 0 : undefined, borderBottomRightRadius: lesson.expanded ? 0 : undefined }}>
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
                  <button className="btn btn-ghost btn-sm" onClick={() => removeLesson(lesson.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    const newLessons = [...lessons];
                    newLessons[index].expanded = !newLessons[index].expanded;
                    setLessons(newLessons);
                  }}>
                    <ChevronRight size={14} style={{ transform: lesson.expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>
              </div>
              
              {/* Expandable Lesson Editor */}
              {lesson.expanded && (
                <div className="card" style={{ marginLeft: '2.5rem', marginTop: '-0.5rem', marginBottom: '1rem', background: 'var(--bg-card)', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                  <div className="form-group mb-3">
                    <label className="form-label">Lesson Type</label>
                    <select 
                      className="form-select" 
                      value={lesson.type || 'text'} 
                      onChange={e => {
                        const newLessons = [...lessons];
                        newLessons[index].type = e.target.value;
                        setLessons(newLessons);
                      }}
                    >
                      <option value="text">Text / Article</option>
                      <option value="video">Video</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label className="form-label">XP Reward</label>
                    <input 
                      type="number"
                      className="form-input" 
                      value={lesson.xp_reward || 50} 
                      onChange={e => {
                        const newLessons = [...lessons];
                        newLessons[index].xp_reward = parseInt(e.target.value) || 0;
                        setLessons(newLessons);
                      }}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label">{lesson.type === 'quiz' ? 'Intro Content (Markdown Supported)' : 'Content (Markdown Supported)'}</label>
                    <textarea 
                      className="form-input" 
                      rows={lesson.type === 'quiz' ? "3" : "6"}
                      value={lesson.content || ''} 
                      placeholder="# Heading\nWrite your content here..."
                      onChange={e => {
                        const newLessons = [...lessons];
                        newLessons[index].content = e.target.value;
                        setLessons(newLessons);
                      }}
                      style={{ resize: 'vertical', fontFamily: 'monospace' }}
                    />
                  </div>

                  {lesson.type === 'video' && (
                    <div className="form-group mb-3">
                      <label className="form-label">Video URL</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="url"
                          className="form-input" 
                          style={{ flex: 1 }}
                          value={lesson.video_url || ''} 
                          placeholder="https://youtube.com/... or /uploads/videos/..."
                          onChange={e => {
                            const newLessons = [...lessons];
                            newLessons[index].video_url = e.target.value;
                            setLessons(newLessons);
                          }}
                        />
                        <input 
                          type="file" 
                          accept="video/*" 
                          id={`upload-${index}`} 
                          style={{ display: 'none' }} 
                          onChange={(e) => handleFileUpload(e, index)}
                        />
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => document.getElementById(`upload-${index}`).click()}
                        >
                          Upload Local Video
                        </button>
                      </div>
                    </div>
                  )}

                  {lesson.type === 'quiz' && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Quiz Questions</label>
                      {(lesson.quizzes || []).map((q, qIndex) => (
                        <div key={qIndex} className="card" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-surface)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Question {qIndex + 1}</span>
                            <button className="btn btn-ghost btn-sm" onClick={() => {
                              const newLessons = [...lessons];
                              newLessons[index].quizzes.splice(qIndex, 1);
                              setLessons(newLessons);
                            }} style={{ color: 'var(--danger)', padding: 0, height: 'auto' }}><Trash2 size={14} /></button>
                          </div>
                          <input 
                            className="form-input mb-2" 
                            placeholder="Question text..."
                            value={q.question || ''}
                            onChange={e => {
                              const newLessons = [...lessons];
                              newLessons[index].quizzes[qIndex].question = e.target.value;
                              setLessons(newLessons);
                            }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {(q.options || ['', '', '', '']).map((opt, optIndex) => (
                              <div key={optIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input 
                                  type="radio" 
                                  name={`correct-${lesson.id}-${qIndex}`}
                                  checked={q.correct_answer === optIndex}
                                  onChange={() => {
                                    const newLessons = [...lessons];
                                    newLessons[index].quizzes[qIndex].correct_answer = optIndex;
                                    setLessons(newLessons);
                                  }}
                                />
                                <input 
                                  className="form-input" 
                                  style={{ flex: 1 }}
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={opt}
                                  onChange={e => {
                                    const newLessons = [...lessons];
                                    if (!newLessons[index].quizzes[qIndex].options) newLessons[index].quizzes[qIndex].options = ['', '', '', ''];
                                    newLessons[index].quizzes[qIndex].options[optIndex] = e.target.value;
                                    setLessons(newLessons);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        const newLessons = [...lessons];
                        if (!newLessons[index].quizzes) newLessons[index].quizzes = [];
                        newLessons[index].quizzes.push({ question: '', options: ['', '', '', ''], correct_answer: 0 });
                        setLessons(newLessons);
                      }}>
                        <Plus size={14} /> Add Question
                      </button>
                    </div>
                  )}
                </div>
              )}
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
