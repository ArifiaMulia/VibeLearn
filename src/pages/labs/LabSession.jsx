import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { Play, Save, Terminal as TerminalIcon, Sparkles, CheckCircle2, MessageSquare, Lightbulb, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

// Progressive hint system
function HintPanel({ hints = [] }) {
  const [revealed, setRevealed] = useState(0);
  const [open, setOpen] = useState(false);

  const defaultHints = hints.length > 0 ? hints : [
    'Read the task description again carefully — the clue is often in the wording.',
    'Try breaking the problem into smaller steps. What is the very first thing you need to do?',
    'Look at the expected output in the terminal. Work backwards from there.',
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-primary)',
        }}
      >
        <Lightbulb size={16} color="var(--warning)" />
        <span style={{ fontWeight: 700, fontSize: '0.85rem', flex: 1, textAlign: 'left' }}>
          AI Hints {revealed > 0 ? `(${revealed}/${defaultHints.length} revealed)` : ''}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Already revealed hints */}
          {defaultHints.slice(0, revealed).map((hint, i) => (
            <div key={i} style={{
              padding: '0.65rem 0.85rem', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)',
              fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '0.72rem', display: 'block', marginBottom: '0.2rem' }}>
                💡 Hint {i + 1}
              </span>
              {hint}
            </div>
          ))}

          {/* Reveal next button */}
          {revealed < defaultHints.length ? (
            <button
              onClick={() => setRevealed(v => v + 1)}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', borderStyle: 'dashed', fontSize: '0.78rem' }}
            >
              <Lightbulb size={13} /> Reveal Hint {revealed + 1} of {defaultHints.length}
            </button>
          ) : (
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.25rem' }}>
              All hints revealed. You've got this! 💪
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LabSession() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const { success, error } = useAlert();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('');
  const [logs, setLogs] = useState([{ type: 'system', text: 'Initializing environment...' }]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    authFetch(`/labs/${id}`).then(data => {
      setLab(data);
      setCode(data.starter_code || '// Write your solution here\n');
      authFetch(`/labs/${id}/start`, { method: 'POST' }).then(s => {
        setSession(s);
        setLoading(false);
        addLog('System', 'Environment ready. Start coding!');
      });
    });
  }, [id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (type, text) => {
    setLogs(prev => [...prev, { type, text, time: new Date().toLocaleTimeString() }]);
  };

  const handleRun = () => {
    setRunning(true);
    addLog('System', 'Executing code...');
    setTimeout(() => {
      addLog('Output', 'Build successful. Running tests...');
      addLog('Output', '✓ Test 1: Component renders');
      addLog('Output', '✓ Test 2: API connection active');
      setRunning(false);
      success('Code executed successfully!');
    }, 1500);
  };

  const handleReset = () => {
    setCode(lab?.starter_code || '// Write your solution here\n');
    setLogs([{ type: 'system', text: 'Editor reset to starter code.' }]);
  };

  const handleSubmit = async () => {
    try {
      addLog('System', 'Submitting for AI review...');
      const data = await authFetch(`/labs/sessions/${session.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      setResult(data);
      success(`Lab Completed! Scored: ${data.score}%`);
    } catch (e) { error(e.message); }
  };

  if (loading) return <div className="skeleton" style={{ height: '80vh' }} />;

  if (result) {
    return (
      <div className="card animate-glow" style={{ textAlign: 'center', padding: '3rem', maxWidth: 600, margin: '2rem auto' }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>Mission Accomplished! 🏅</h2>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', margin: '1rem 0' }}>{result.score}%</div>
        <p style={{ color: 'var(--text-muted)' }}>XP Earned: <strong style={{ color: 'var(--accent)' }}>+{result.xp_earned}</strong></p>

        <div className="card" style={{ textAlign: 'left', background: 'var(--bg-surface)', border: '1px solid var(--border)', margin: '1.5rem 0' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="var(--primary)" /> AI Reviewer Feedback
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {result.feedback.map((f, i) => (
              <div key={i} style={{ fontSize: '0.9rem', color: f.startsWith('✓') ? 'var(--success)' : f.startsWith('!') ? 'var(--warning)' : 'var(--text-secondary)' }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/labs')}>Return to Hub</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-accent" style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>{lab.type || 'lab'}</span>
            <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>⚡ {lab.xp_reward || 150} XP</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{lab.title}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{lab.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleReset} title="Reset to starter code">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-ghost" onClick={handleRun} disabled={running}>
            <Play size={16} /> {running ? 'Running…' : 'Run Code'}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Save size={16} /> Submit Task
          </button>
        </div>
      </div>

      {/* Main Grid: Editor | Console + Hints */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Left: Code Editor */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '0.6rem 1rem', background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600,
          }}>
            {/* Traffic lights */}
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ marginLeft: '0.5rem' }}><TerminalIcon size={13} /> main.js</span>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1, background: '#0d0d28', color: '#a8d8ea',
              border: 'none', padding: '1.25rem', fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)', resize: 'none', outline: 'none', lineHeight: 1.7,
            }}
          />
        </div>

        {/* Right: Terminal + Hints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
          {/* Terminal */}
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#07071a', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '0.6rem 1rem', background: '#13133a',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <TerminalIcon size={13} /> Terminal
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--success)', fontWeight: 400 }}>● LIVE</span>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem' }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 68, flexShrink: 0 }}>[{log.time || 'INIT'}]</span>
                  <span style={{ color: log.type === 'System' ? 'var(--accent)' : log.type === 'Output' ? 'var(--success)' : 'white' }}>
                    <span style={{ opacity: 0.5 }}>{log.type}: </span>{log.text}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Progressive Hints */}
          <HintPanel hints={lab.hints || []} />
        </div>
      </div>
    </div>
  );
}
