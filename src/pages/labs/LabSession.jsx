import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { Play, Save, ChevronRight, Terminal as TerminalIcon, Sparkles, CheckCircle2, MessageSquare, AlertCircle, RotateCcw } from 'lucide-react';

export default function LabSession() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const { success, error, info } = useAlert();
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
      authFetch(`/labs/${id}/start`, { method: 'POST' }).then(s => {
        setSession(s);
        setLoading(false);
        addLog('System', 'Environment ready. Port 3000 active.');
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
      success("Code executed successfully!");
    }, 1500);
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
        <h2>Mission Accomplished!</h2>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', margin: '1rem 0' }}>{result.score}%</div>
        <p className="text-muted mb-4">XP Earned: +{result.xp_earned}</p>
        
        <div className="card" style={{ textAlign: 'left', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
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

        <button className="btn btn-primary mt-6 w-full" onClick={() => navigate('/labs')}>Return to Hub</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>{lab.title}</h2>
          <p className="text-xs text-muted">{lab.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={handleRun} disabled={running}><Play size={16} /> Run Code</button>
          <button className="btn btn-primary" onClick={handleSubmit}><Save size={16} /> Submit Task</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Editor Side */}
        <div className="flex-col" style={{ gap: '1rem' }}>
          <div className="card flex-col" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <TerminalIcon size={14} /> main.js
              </div>
            </div>
            <textarea 
              className="font-mono"
              value={code} onChange={e => setCode(e.target.value)}
              placeholder="// Write your implementation here..."
              style={{ 
                flex: 1, background: 'transparent', color: '#a8d8ea', border: 'none', padding: '1.5rem',
                fontSize: '0.9rem', resize: 'none', outline: 'none', lineHeight: 1.6
              }}
            />
          </div>
        </div>

        {/* Console / Terminal Side */}
        <div className="flex-col" style={{ gap: '1rem' }}>
          <div className="card flex-col" style={{ flex: 1, padding: 0, overflow: 'hidden', background: '#07071a' }}>
             <div style={{ padding: '0.75rem 1.25rem', background: '#13133a', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TerminalIcon size={14} /> Terminal
             </div>
             <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 70 }}>[{log.time || 'INIT'}]</span>
                    <span style={{ color: log.type === 'System' ? 'var(--accent)' : log.type === 'Output' ? 'var(--success)' : 'white' }}>
                      <span style={{ opacity: 0.5 }}>{log.type}:</span> {log.text}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
             </div>
          </div>

          {/* AI Helper Sidebar */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), transparent)', border: '1px solid var(--border)' }}>
             <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
               <Sparkles size={16} color="var(--primary)" /> AI Assistant
             </h4>
             <p className="text-xs text-muted">Need a hint? AI can analyze your code and point you in the right direction.</p>
             <button className="btn btn-ghost btn-sm mt-3 w-full"><MessageSquare size={14} /> Ask for Hint</button>
          </div>
        </div>
      </div>
    </div>
  );
}
