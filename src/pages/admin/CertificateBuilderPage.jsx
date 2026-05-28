import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { Trophy, Download, Search, Users, Award, Eye } from 'lucide-react';

// ── Inline Certificate Preview ───────────────────────────────────────────────
function CertificatePreview({ recipientName, courseName, courseLevel, lessonCount, totalXP, certId, dateStr }) {
  return (
    <div
      className="certificate-card"
      style={{
        position: 'relative',
        background: 'linear-gradient(145deg, #07071a 0%, #0d0d2b 40%, #0a1628 70%, #070718 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        padding: '2.5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Outer gold border frames */}
      <div style={{ position: 'absolute', inset: 8, border: '2px solid rgba(212,175,55,0.35)', borderRadius: 10, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 13, border: '1px solid rgba(212,175,55,0.12)', borderRadius: 7, pointerEvents: 'none' }} />

      {/* Corner ornaments */}
      {[{ top: 18, left: 18 }, { top: 18, right: 18 }, { bottom: 18, left: 18 }, { bottom: 18, right: 18 }].map((pos, i) => (
        <svg key={i} width="26" height="26" viewBox="0 0 28 28" style={{ position: 'absolute', ...pos, opacity: 0.55 }}>
          <path d="M0 14 L0 0 L14 0" fill="none" stroke="#d4af37" strokeWidth="1.5"
            transform={i === 1 ? 'scale(-1,1) translate(-28,0)' : i === 2 ? 'scale(1,-1) translate(0,-28)' : i === 3 ? 'scale(-1,-1) translate(-28,-28)' : ''} />
          <circle cx={i === 0 || i === 2 ? 0 : 28} cy={i === 0 || i === 1 ? 0 : 28} r="2.5" fill="#d4af37" opacity="0.8" />
        </svg>
      ))}

      {/* Aurora blobs */}
      <div style={{ position: 'absolute', top: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Dot grid */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }} width="100%" height="100%">
        <defs>
          <pattern id="admin-cert-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#d4af37" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#admin-cert-dots)" />
      </svg>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', width: 70, height: 70 }}>
          <svg viewBox="0 0 80 80" width="70" height="70" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="adminSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" /><stop offset="50%" stopColor="#f3e5ab" /><stop offset="100%" stopColor="#b8860b" />
              </linearGradient>
            </defs>
            <polygon points="40,4 73,22 73,58 40,76 7,58 7,22" fill="none" stroke="url(#adminSealGrad)" strokeWidth="2" />
            <polygon points="40,10 67,25 67,55 40,70 13,55 13,25" fill="rgba(212,175,55,0.08)" stroke="url(#adminSealGrad)" strokeWidth="1" strokeDasharray="3 2" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={24} color="#d4af37" />
          </div>
        </div>
        <div style={{ fontSize: '0.6rem', letterSpacing: '0.28em', color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', fontWeight: 600 }}>
          ✦ PROMPTARA · AI CODING ACADEMY ✦
        </div>
        <h2 style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: '1.25rem', fontWeight: 700, color: '#d4af37', letterSpacing: '0.08em', margin: 0, textShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
          CERTIFICATE OF COMPLETION
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', maxWidth: 320 }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6))' }} />
          <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '0.65rem' }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.6), transparent)' }} />
        </div>
      </div>

      {/* Recipient */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>This is proudly presented to</span>
        <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)', fontWeight: 700, color: '#fff', textAlign: 'center', textShadow: '0 2px 20px rgba(255,255,255,0.1)', lineHeight: 1.2 }}>
          {recipientName || 'Student Name'}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>for successfully completing all lessons and assessments in</span>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#7dd3fc', textAlign: 'center', padding: '0.35rem 1rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8 }}>
          {courseName || 'Course Name'}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {[
          { label: 'Lessons', value: lessonCount || '—', icon: '📚' },
          { label: 'XP Earned', value: totalXP || '—', icon: '⚡' },
          { label: 'Level', value: courseLevel ? courseLevel.charAt(0).toUpperCase() + courseLevel.slice(1) : '—', icon: '🎯' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', padding: '0.5rem 0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, minWidth: 75 }}>
            <span style={{ fontSize: '1rem' }}>{s.icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{s.value}</span>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1.2rem', background: 'linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 30, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '0.85rem' }}>🛡️</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4af37', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Certified Digital Builder · Vibe Coding Graduate</span>
      </div>

      {/* Footer */}
      <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Date of Completion</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{dateStr}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Credential ID</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#d4af37', fontWeight: 700 }}>{certId}</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '2rem' }}>
          {[{ name: 'Arifia Mulia', role: 'Academy Director' }, { name: 'Prasetia Dwidharma', role: 'Lead Instructor' }].map((sig, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flex: 1 }}>
              <span style={{ fontFamily: "'Georgia',serif", fontStyle: 'italic', color: 'rgba(212,175,55,0.85)', fontSize: '0.9rem' }}>{sig.name}</span>
              <div style={{ width: 100, height: 1, background: 'rgba(212,175,55,0.25)' }} />
              <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{sig.role}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Issued by Promptara · AI Coding Academy · virtuenet.id · Verify at vibe.virtuenet.space
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function CertificateBuilderPage() {
  const { authFetch } = useAuth();
  const { error } = useAlert();

  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [completions, setCompletions] = useState([]); // { user, course }
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    Promise.all([
      authFetch('/courses').catch(() => []),
      authFetch('/users').catch(() => []),
    ]).then(([c, u]) => {
      setCourses(Array.isArray(c) ? c : c.courses || []);
      setUsers(Array.isArray(u) ? u : u.users || []);
    }).catch(err => error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const makeCertId = (courseId, userId) =>
    `VL-${String(courseId).padStart(3, '0')}-${String(userId).padStart(4, '0')}-${Math.abs((courseId * 183 + userId * 761) % 100000).toString().padStart(5, '0')}`;

  const openPreview = (user, course) => {
    const totalXP = course?.lessons?.reduce((s, l) => s + (l.xp_reward || 0), 0) || 0;
    setPreviewData({
      recipientName: user?.name,
      courseName: course?.title,
      courseLevel: course?.level,
      lessonCount: course?.lessons?.length || 0,
      totalXP,
      certId: makeCertId(course?.id, user?.id),
      dateStr,
    });
    setPreviewOpen(true);
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,rgba(212,175,55,0.2),rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} color="#d4af37" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Certificate Builder</h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Preview, generate and download completion certificates for any student & course.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.4rem 1rem', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, fontSize: '0.8rem', color: '#d4af37', fontWeight: 600 }}>
          🎓 {users.length} Students · {courses.length} Courses
        </div>
      </div>

      {/* Generator Panel */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(124,58,237,0.05))', border: '1px solid rgba(212,175,55,0.15)' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={16} color="#d4af37" /> Generate & Preview Certificate
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Select Student */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Student
            </label>
            <select
              value={selectedUser?.id || ''}
              onChange={e => setSelectedUser(users.find(u => u.id === parseInt(e.target.value)) || null)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
            >
              <option value="">— Choose a student —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Select Course */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Course
            </label>
            <select
              value={selectedCourse?.id || ''}
              onChange={e => setSelectedCourse(courses.find(c => c.id === parseInt(e.target.value)) || null)}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
            >
              <option value="">— Choose a course —</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            disabled={!selectedUser || !selectedCourse}
            onClick={() => openPreview(selectedUser, selectedCourse)}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem',
              background: selectedUser && selectedCourse ? 'linear-gradient(135deg,rgba(212,175,55,0.9),rgba(180,140,20,0.9))' : 'var(--bg-card)',
              color: selectedUser && selectedCourse ? '#07071a' : 'var(--text-muted)',
              border: '1px solid rgba(212,175,55,0.4)', cursor: selectedUser && selectedCourse ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <Eye size={15} /> Preview Certificate
          </button>
          <button
            disabled={!selectedUser || !selectedCourse}
            onClick={() => { openPreview(selectedUser, selectedCourse); setTimeout(() => window.print(), 300); }}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem',
              background: 'var(--bg-card)', color: 'var(--text-muted)',
              border: '1px solid var(--border-light)', cursor: selectedUser && selectedCourse ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Users size={16} color="var(--primary)" /> Students · Quick Certificate
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2rem', padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.82rem', width: 220 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['Student', 'Email', 'Role', 'Plan', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students found</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{u.role?.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: u.plan === 'enterprise' ? 'var(--accent)' : u.plan === 'pro' ? 'var(--warning)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{u.plan}</span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {courses.slice(0, 4).map(c => (
                        <button
                          key={c.id}
                          onClick={() => openPreview(u, c)}
                          title={`Preview cert: ${u.name} — ${c.title}`}
                          style={{
                            padding: '0.25rem 0.6rem', borderRadius: 6, border: '1px solid rgba(212,175,55,0.3)',
                            background: 'rgba(212,175,55,0.06)', color: '#d4af37', fontSize: '0.65rem',
                            fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.18)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
                        >
                          🎓 {c.title.split(' ').slice(0, 2).join(' ')}…
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Template Preview Card (always visible) */}
      <div className="card">
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={16} color="#d4af37" /> Live Template Preview
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem', marginTop: 0 }}>
          This is the certificate template. Select a student + course above to personalize it.
        </p>
        <CertificatePreview
          recipientName={selectedUser?.name || 'Your Student Name'}
          courseName={selectedCourse?.title || 'Course Title'}
          courseLevel={selectedCourse?.level}
          lessonCount={selectedCourse?.lessons?.length}
          totalXP={selectedCourse?.lessons?.reduce((s, l) => s + (l.xp_reward || 0), 0)}
          certId={selectedUser && selectedCourse ? makeCertId(selectedCourse.id, selectedUser.id) : 'VL-XXX-XXXX-XXXXX'}
          dateStr={dateStr}
        />
      </div>

      {/* Full-screen print preview modal */}
      {previewOpen && previewData && (
        <div
          className="no-print"
          style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
          onClick={() => setPreviewOpen(false)}
        >
          <div style={{ width: '100%', maxWidth: 860, display: 'flex', flexDirection: 'column', gap: '1rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>🎓 Certificate Preview</span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.1)', color: '#d4af37', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ⬇ Save as PDF
                </button>
                <button
                  onClick={() => setPreviewOpen(false)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            </div>
            <CertificatePreview {...previewData} />
          </div>
        </div>
      )}
    </div>
  );
}
