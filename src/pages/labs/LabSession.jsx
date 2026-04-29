import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { ArrowLeft, Play, Send, CheckCircle, ShieldAlert, Code2 } from 'lucide-react';
import { XPPopup } from '../../components/XPBadge';

// A simple IDE-like code editor wrapper
function SimpleCodeEditor({ value, onChange, readOnly }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ background: '#0a0a1a', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}/>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}/>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}/>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>app.js</span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        style={{
          flex: 1, background: '#0d0d1f', color: '#a8d8ea', border: 'none',
          padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
          resize: 'none', outline: 'none', lineHeight: 1.6
        }}
      />
    </div>
  );
}

export default function LabSession() {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const { success, error, info } = useAlert();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('// Write or paste your code here\\n\\nfunction init() {\\n  console.log("Vibe Check!");\\n}\\n');
  const [chat, setChat] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [showXP, setShowXP] = useState(false);
  const [xpEarned, setXPEarned] = useState(0);

  useEffect(() => {
    // Load lab details and start session
    authFetch(`/labs/${id}`).then(async (l) => {
      setLab(l);
      if (l.type === 'code' || l.type === 'security') {
        setCode('// Find the bug in this AI generated code:\\nfunction authenticate(user, password) {\\n  if(user === "admin" && password == 1234) {\\n    return true; // Vulnerable!\\n  }\\n  return false;\\n}');
      }
      try {
        const s = await authFetch(`/labs/${id}/start`, { method: 'POST' });
        setSession(s);
      } catch (e) {
        error("Could not start session");
      }
    });
  }, [id]);

  const handleSimulatedAIResponse = (userMsg) => {
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setPrompt('');
    
    // Simulate AI thinking
    setTimeout(() => {
      let aiReply = "I've updated the code based on your vibe.";
      if (userMsg.toLowerCase().includes('sql') || userMsg.toLowerCase().includes('security')) {
        aiReply = "Good catch! I've parameterized the queries to prevent SQL injection.";
        setCode('// Secured Version\\nfunction getUser(id) {\\n  return db.query("SELECT * FROM users WHERE id = $1", [id]);\\n}');
      } else if (lab.type === 'prompt') {
        if (userMsg.length > 50) aiReply = "Excellent prompt! Very specific. Here is your highly optimized boilerplate.";
        else aiReply = "That prompt is a bit vague. Can you specify the framework and constraints?";
      }
      setChat(prev => [...prev, { role: 'ai', content: aiReply }]);
    }, 1000);
  };

  const submitLab = async () => {
    // Basic mock scoring based on interaction length or code length
    const score = Math.min(100, Math.max(50, code.length > 50 ? 95 : 60));
    try {
      const res = await authFetch(`/labs/sessions/${session.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ score, submission: { code, chat_length: chat.length } })
      });
      setXPEarned(res.xp_earned);
      setShowXP(true);
      success(`Lab Complete! Score: ${score}%`);
      setTimeout(() => navigate('/labs'), 3000);
    } catch (e) {
      error(e.message);
    }
  };

  if (!lab) return <div className="skeleton" style={{ height: '80vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ height: 'calc(100vh - var(--topbar-height) - 4rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <XPPopup visible={showXP} amount={xpEarned} />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/labs')}><ArrowLeft size={16} /></button>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{lab.title}</h2>
          <span className={`badge diff-${lab.difficulty}`}>{lab.difficulty}</span>
        </div>
        <button className="btn btn-success" onClick={submitLab} style={{ background: 'var(--success)', color: 'white' }}>
          <CheckCircle size={16} /> Submit Lab
        </button>
      </div>

      {/* Main Split Interface */}
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Pane: Simulator / Instructions */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code2 size={16} color="var(--primary)"/> Scenario</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{lab.description}</p>
          </div>
          
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chat.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                <Zap size={32} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>Start vibing with the AI to solve the lab.</p>
              </div>
            ) : (
              chat.map((msg, i) => (
                <div key={i} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--primary-glow)' : 'var(--bg-surface)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--primary)' : 'var(--border-light)'}`,
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', maxWidth: '85%', fontSize: '0.9rem'
                }}>
                  {msg.content}
                </div>
              ))
            )}
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" className="form-input" placeholder="Type your prompt here..." 
                value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && prompt && handleSimulatedAIResponse(prompt)}
              />
              <button className="btn btn-primary" onClick={() => prompt && handleSimulatedAIResponse(prompt)}><Send size={16} /></button>
            </div>
          </div>
        </div>

        {/* Right Pane: Code Editor */}
        <div style={{ flex: 1 }}>
          <SimpleCodeEditor value={code} onChange={setCode} />
        </div>
      </div>
    </div>
  );
}
