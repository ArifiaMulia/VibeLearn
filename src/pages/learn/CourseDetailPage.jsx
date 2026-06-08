import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookOpen, Play, CheckCircle, Lock, Clock, Zap, ArrowLeft, Users, Trophy, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

// ── Certificate Modal ────────────────────────────────────────────────────────
function CertificateModal({ course, user, lang, t, onClose }) {
  const certId = `VL-${course.id.toString().padStart(3,'0')}-${(user?.id||99).toString().padStart(4,'0')}-${Math.abs((course.id*183+(user?.id||99)*761)%100000).toString().padStart(5,'0')}`;
  const dateStr = new Date().toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalXP = course?.lessons?.reduce((s, l) => s + (l.xp_reward || 0), 0) || 0;

  const certRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      // Allow a brief delay for layout calculation and loading animations
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const canvas = await html2canvas(certRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#07071a',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`VibeLearn-Certificate-${course.title.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPNG = async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#07071a',
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `VibeLearn-Certificate-${course.title.replace(/\s+/g, '-')}.png`;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto download PDF on mount
  useEffect(() => {
    downloadPDF();
  }, []);

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', gap: '1rem' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Controls & Auto-download progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              🎓 Certificate of Completion
            </span>
            {isGenerating && (
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20,
                background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4',
              }}>
                ⚙️ {lang === 'id' ? 'Menyiapkan unduhan...' : 'Preparing download...'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              style={{
                padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(212,175,55,0.4)',
                background: 'rgba(212,175,55,0.1)', color: '#d4af37', fontWeight: 700,
                fontSize: '0.82rem', cursor: isGenerating ? 'not-allowed' : 'pointer', letterSpacing: '0.05em',
                transition: 'all 0.2s', opacity: isGenerating ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!isGenerating) e.currentTarget.style.background = 'rgba(212,175,55,0.2)'; }}
              onMouseLeave={e => { if (!isGenerating) e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
            >
              ⬇ {lang === 'id' ? 'Unduh PDF' : 'Download PDF'}
            </button>
            <button
              onClick={downloadPNG}
              disabled={isGenerating}
              style={{
                padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(6,182,212,0.4)',
                background: 'rgba(6,182,212,0.1)', color: '#06b6d4', fontWeight: 700,
                fontSize: '0.82rem', cursor: isGenerating ? 'not-allowed' : 'pointer', letterSpacing: '0.05em',
                transition: 'all 0.2s', opacity: isGenerating ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!isGenerating) e.currentTarget.style.background = 'rgba(6,182,212,0.2)'; }}
              onMouseLeave={e => { if (!isGenerating) e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; }}
            >
              ⬇ {lang === 'id' ? 'Unduh PNG' : 'Download PNG'}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        </div>

        {/* ── THE CERTIFICATE CARD ── */}
        <div
          ref={certRef}
          className="certificate-card"
          style={{
            position: 'relative',
            background: 'linear-gradient(145deg, #07071a 0%, #0d0d2b 40%, #0a1628 70%, #070718 100%)',
            borderRadius: 16,
            overflow: 'hidden',
            padding: '3rem 3.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            minHeight: 520,
          }}
        >
          {/* Outer golden border frame */}
          <div style={{
            position: 'absolute', inset: 8,
            border: '2px solid rgba(212,175,55,0.35)',
            borderRadius: 10,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 12,
            border: '1px solid rgba(212,175,55,0.12)',
            borderRadius: 8,
            pointerEvents: 'none',
          }} />

          {/* Corner ornaments */}
          {[
            { top: 18, left: 18 },
            { top: 18, right: 18 },
            { bottom: 18, left: 18 },
            { bottom: 18, right: 18 },
          ].map((pos, i) => (
            <svg key={i} width="28" height="28" viewBox="0 0 28 28" style={{ position: 'absolute', ...pos, opacity: 0.6 }}>
              <path d="M0 14 L0 0 L14 0" fill="none" stroke="#d4af37" strokeWidth="1.5"
                transform={i === 1 ? 'scale(-1,1) translate(-28,0)' : i === 2 ? 'scale(1,-1) translate(0,-28)' : i === 3 ? 'scale(-1,-1) translate(-28,-28)' : ''} />
              <circle cx={i===0||i===2?0:28} cy={i===0||i===1?0:28} r="2.5" fill="#d4af37" opacity="0.8" />
            </svg>
          ))}

          {/* Aurora glow blobs */}
          <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 200, background: 'radial-gradient(ellipse, rgba(212,175,55,0.04) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

          {/* Subtle dot-grid pattern */}
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }} width="100%" height="100%">
            <defs>
              <pattern id="cert-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#d4af37" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cert-dots)" />
          </svg>

          {/* ── HEADER ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
            {/* Hexagonal seal */}
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <svg viewBox="0 0 80 80" width="80" height="80" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37" />
                    <stop offset="50%" stopColor="#f3e5ab" />
                    <stop offset="100%" stopColor="#b8860b" />
                  </linearGradient>
                </defs>
                <polygon points="40,4 73,22 73,58 40,76 7,58 7,22" fill="none" stroke="url(#sealGrad)" strokeWidth="2" />
                <polygon points="40,10 67,25 67,55 40,70 13,55 13,25" fill="rgba(212,175,55,0.08)" stroke="url(#sealGrad)" strokeWidth="1" strokeDasharray="3 2" />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trophy size={28} color="#d4af37" />
              </div>
            </div>

            {/* Academy name */}
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', fontWeight: 600 }}>
              ✦ PROMPTARA · AI CODING ACADEMY ✦
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#d4af37',
              letterSpacing: '0.08em',
              textAlign: 'center',
              margin: 0,
              textShadow: '0 0 30px rgba(212,175,55,0.3)',
            }}>
              CERTIFICATE OF COMPLETION
            </h2>

            {/* Golden divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: 380 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6))' }} />
              <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.7rem' }}>◆</span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.6), transparent)' }} />
            </div>
          </div>

          {/* ── RECIPIENT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              This is proudly presented to
            </span>
            <div style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
              textShadow: '0 2px 20px rgba(255,255,255,0.1)',
              lineHeight: 1.2,
              letterSpacing: '0.02em',
            }}>
              {user?.name}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', maxWidth: 420, textAlign: 'center', lineHeight: 1.6 }}>
              for successfully completing all lessons and assessments in
            </span>
            <div style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#7dd3fc',
              textAlign: 'center',
              padding: '0.4rem 1.2rem',
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 8,
              letterSpacing: '0.02em',
              marginTop: '0.25rem',
            }}>
              {course?.title}
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div style={{
            display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap',
            position: 'relative', zIndex: 1,
          }}>
            {[
              { label: 'Lessons Completed', value: `${course?.lessons?.length || 0}`, icon: '📚' },
              { label: 'XP Earned', value: `${totalXP}`, icon: '⚡' },
              { label: 'Skill Level', value: course?.level?.charAt(0).toUpperCase() + course?.level?.slice(1) || 'Beginner', icon: '🎯' },
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                padding: '0.6rem 1.1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                minWidth: 90,
              }}>
                <span style={{ fontSize: '1.1rem' }}>{stat.icon}</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{stat.value}</span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── CERTIFIED BADGE ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.45rem 1.4rem',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.05))',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: 30,
            position: 'relative', zIndex: 1,
          }}>
            <span style={{ fontSize: '0.9rem' }}>🛡️</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d4af37', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Certified Digital Builder · Vibe Coding Graduate
            </span>
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '1.5rem',
            position: 'relative', zIndex: 1,
          }}>
            {/* Date & Credential ID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Date of Completion</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Credential ID</span>
                <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#d4af37', fontWeight: 700, letterSpacing: '0.05em' }}>{certId}</span>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '2rem' }}>
              {[
                { name: 'Arifia Mulia', role: 'Academy Director' },
                { name: 'Prasetia Dwidharma', role: 'Lead Instructor' },
              ].map((sig, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flex: 1 }}>
                  <span style={{
                    fontFamily: "'Georgia', serif", fontStyle: 'italic',
                    color: 'rgba(212,175,55,0.85)', fontSize: '1rem', letterSpacing: '0.02em',
                  }}>{sig.name}</span>
                  <div style={{ width: 120, height: 1, background: 'rgba(212,175,55,0.25)' }} />
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{sig.role}</span>
                </div>
              ))}
            </div>

            {/* Bottom branding */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Issued by Promptara · AI Coding Academy · virtuenet.id · Verify at vibe.virtuenet.space
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const { success, error } = useAlert();
  const { t, lang } = useLanguage();
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
            const isLocked = !enrolled || (!done && !isActive);
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

      {/* Certificate Modal */}
      {showCert && (
        <CertificateModal
          course={course}
          user={user}
          lang={lang}
          t={t}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
