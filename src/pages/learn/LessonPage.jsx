import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { ArrowLeft, CheckCircle, Zap, Play, Trophy } from 'lucide-react';
import { XPPopup } from '../../components/XPBadge';

export default function LessonPage() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const { success, error } = useAlert();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showXP, setShowXP] = useState(false);
  const [xpEarned, setXPEarned] = useState(0);

  useEffect(() => {
    authFetch(`/lessons/${id}`)
      .then(setLesson)
      .catch(err => { error(err.message); navigate('/courses'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async () => {
    if (lesson.type === 'quiz') {
      // Validate all answered
      if (Object.keys(quizAnswers).length < lesson.quizzes.length) {
        return error('Please answer all questions before completing.');
      }
      // Calculate score
      let correct = 0;
      lesson.quizzes.forEach((q, i) => { if (quizAnswers[q.id] === q.correct_answer) correct++; });
      const score = Math.round((correct / lesson.quizzes.length) * 100);
      if (score < 80) return error(`You scored ${score}%. You need 80% to pass.`);
    }

    setCompleting(true);
    try {
      const res = await authFetch(`/lessons/${id}/complete`, { 
        method: 'POST', body: JSON.stringify({ score: 100 }) 
      });
      setXPEarned(res.xp_earned);
      setShowXP(true);
      success('Lesson completed! Awesome job.');
      setTimeout(() => {
        navigate(`/courses/${lesson.course_id}`);
      }, 2500);
    } catch (err) {
      error(err.message);
      setCompleting(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;
  if (!lesson) return null;

  const isCompleted = lesson.user_progress?.status === 'completed';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <XPPopup visible={showXP} amount={xpEarned} />
      
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/courses/${lesson.course_id}`)} style={{ width: 'fit-content' }}>
        <ArrowLeft size={15} /> Back to Course
      </button>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span className="badge badge-accent" style={{ textTransform: 'uppercase' }}>{lesson.type}</span>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={12} /> {lesson.xp_reward} XP
          </span>
          {isCompleted && <span className="badge badge-success"><CheckCircle size={12} /> Completed</span>}
        </div>
        <h1 style={{ marginBottom: '1rem' }}>{lesson.title}</h1>
      </div>

      {/* Video Content */}
      {lesson.type === 'video' && lesson.video_url && (
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
           <Play size={48} color="rgba(255,255,255,0.2)" />
           {/* In a real app, render an iframe or video tag here */}
           <span style={{ position: 'absolute', color: 'var(--text-muted)' }}>Video Player Placeholder</span>
        </div>
      )}

      {/* Text Content */}
      {(lesson.type === 'text' || lesson.type === 'video') && (
        <div className="card" style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {lesson.content.split('\\n\\n').map((paragraph, i) => {
            if (paragraph.startsWith('# ')) return <h2 key={i} style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{paragraph.replace('# ', '')}</h2>;
            if (paragraph.startsWith('## ')) return <h3 key={i} style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{paragraph.replace('## ', '')}</h3>;
            if (paragraph.startsWith('- ')) return <ul key={i} style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>{paragraph.split('\\n').map((li, j) => <li key={j}>{li.replace('- ', '')}</li>)}</ul>;
            return <p key={i} style={{ marginBottom: '1rem' }}>{paragraph}</p>;
          })}
        </div>
      )}

      {/* Quiz Content */}
      {lesson.type === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{ fontSize: '1.1rem' }}>{lesson.content}</p>
          {lesson.quizzes?.map((q, i) => (
            <div key={q.id} className="card">
              <h4 style={{ marginBottom: '1rem' }}>{i + 1}. {q.question}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt, optIdx) => (
                  <button key={optIdx} 
                    onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                    style={{ 
                      textAlign: 'left', padding: '1rem', borderRadius: 'var(--radius-sm)',
                      background: quizAnswers[q.id] === optIdx ? 'rgba(124,58,237,0.15)' : 'var(--bg-surface)',
                      border: `1px solid ${quizAnswers[q.id] === optIdx ? 'var(--primary)' : 'var(--border-light)'}`,
                      color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition)'
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion CTA */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleComplete} 
          disabled={completing || isCompleted}
          style={{ minWidth: 200, display: 'flex', justifyContent: 'center' }}
        >
          {isCompleted ? <><CheckCircle size={18} /> Completed</> : completing ? 'Processing...' : <><Trophy size={18} /> Complete Lesson</>}
        </button>
      </div>
    </div>
  );
}
