import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ChevronDown, ChevronUp, Loader2, Bot, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function AskInstructor({ lessonId, lessonTitle, lessonType }) {
  const { authFetch } = useAuth();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const labels = {
    title:       lang === 'id' ? 'Tanya Instruktur AI' : 'Ask AI Instructor',
    subtitle:    lang === 'id' ? 'Pertanyaan tentang pelajaran ini' : 'Questions about this lesson',
    placeholder: lang === 'id' ? 'Ketik pertanyaanmu...' : 'Ask anything about this lesson...',
    send:        lang === 'id' ? 'Kirim' : 'Send',
    welcome:     lang === 'id'
      ? `Halo! Saya asisten AI untuk pelajaran ini. Tanyakan apa saja tentang **${lessonTitle}** dan saya akan membantu!`
      : `Hi! I'm the AI assistant for this lesson. Ask me anything about **${lessonTitle}** and I'll help you understand it!`,
    thinking:    lang === 'id' ? 'Sedang berpikir...' : 'Thinking...',
    suggestions: lang === 'id'
      ? ['Apa itu?', 'Bisa beri contoh?', 'Kenapa ini penting?']
      : ['Can you explain this?', 'Give me a real-world example', "Why does this matter?"],
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', text: labels.welcome, time: new Date() }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await authFetch(`/ai/ask`, {
        method: 'POST',
        body: JSON.stringify({ lesson_id: lessonId, question: text.trim(), lang }),
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.answer, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: lang === 'id'
          ? 'Maaf, saya tidak bisa menjawab saat ini. Coba lagi nanti!'
          : "Sorry, I couldn't get a response right now. Try again!",
        time: new Date(),
      }]);
    }
    setLoading(false);
  };

  const formatTime = d => d?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-card)' }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '0.85rem 1.1rem', background: 'none',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={14} color="white" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{labels.title}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{labels.subtitle}</div>
        </div>
        <span style={{ fontSize: '0.68rem', background: 'rgba(124,58,237,0.12)', color: 'var(--primary)', borderRadius: 10, padding: '0.15rem 0.5rem', fontWeight: 700, marginRight: '0.3rem' }}>AI</span>
        {open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'user' ? 'var(--primary)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                </div>
                <div style={{
                  maxWidth: '78%', padding: '0.65rem 0.85rem',
                  background: msg.role === 'user' ? 'rgba(124,58,237,0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(124,58,237,0.25)' : 'var(--border-light)'}`,
                  borderRadius: msg.role === 'user' ? '12px 3px 12px 12px' : '3px 12px 12px 12px',
                  fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-secondary)',
                }}>
                  {msg.text}
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {formatTime(msg.time)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '3px 12px 12px 12px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> {labels.thinking}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 0.75rem 0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {labels.suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{
                  fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 20,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                  cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '0.6rem 0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={labels.placeholder}
              disabled={loading}
              style={{
                flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.85rem',
                color: 'var(--text-primary)', fontSize: '0.82rem',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.5rem 0.9rem', flexShrink: 0 }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
