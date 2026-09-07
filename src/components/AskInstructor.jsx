import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, ChevronDown, ChevronUp, Loader2, Bot, User, Check, RefreshCw, Search, Shield, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function AskInstructor({ lessonId, lessonTitle, lessonType }) {
  const { authFetch } = useAuth();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('promptara_ai_model') || 'dreamina-seedance-2-5';
  });
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('ALL');
  const [activeFilterTag, setActiveFilterTag] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch all 29 models from backend
  useEffect(() => {
    authFetch('/ai/models')
      .then(res => {
        if (res && Array.isArray(res.models)) {
          setModels(res.models);
        }
      })
      .catch(() => {});
  }, []);

  const activeModelObj = models.find(m => m.id === selectedModel) || models[0] || {
    id: 'dreamina-seedance-2-5',
    name: 'dreamina-seedance-2-5',
    displayName: 'Dreamina Seedance 2.5',
    vendor: 'ByteDance',
    color: '#f97316'
  };

  const labels = {
    title:       lang === 'id' ? 'Tanya Instruktur AI' : 'Ask AI Instructor',
    subtitle:    'BytePlus ModelArk (ap-southeast-1) • vibe.virtuenet.space',
    placeholder: lang === 'id' ? `Tanya ${activeModelObj.displayName} tentang materi ini...` : `Ask ${activeModelObj.displayName} about this lesson...`,
    send:        lang === 'id' ? 'Kirim' : 'Send',
    welcome:     lang === 'id'
      ? `Halo! Saya asisten AI (${activeModelObj.displayName}). Tanyakan apa saja tentang **${lessonTitle}** dan saya siap membantu!`
      : `Hi! I'm your AI tutor running **${activeModelObj.displayName}** on BytePlus ModelArk. Ask me anything about **${lessonTitle}**!`,
    thinking:    lang === 'id' ? `${activeModelObj.name} sedang menganalisis...` : `${activeModelObj.name} is thinking...`,
    suggestions: lang === 'id'
      ? ['Jelaskan konsep intinya', 'Bisa beri contoh kode?', 'Bagaimana alur deploymentnya?']
      : ['Explain the core concept', 'Give me a code example', 'Explain the deployment pipeline'],
  };

  // Close model picker on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowModelPicker(false);
      }
    };
    if (showModelPicker) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showModelPicker]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', text: labels.welcome, model: activeModelObj.name, time: new Date() }]);
    }
  }, [open, activeModelObj.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const selectModel = (id) => {
    setSelectedModel(id);
    localStorage.setItem('promptara_ai_model', id);
    setShowModelPicker(false);
    const chosen = models.find(m => m.id === id);
    if (chosen) {
      const notice = lang === 'id'
        ? `🔄 Model dialihkan ke **${chosen.displayName}** (${chosen.vendor} • ap-southeast-1).`
        : `🔄 Model switched to **${chosen.displayName}** (${chosen.vendor} • ap-southeast-1).`;
      setMessages(prev => [...prev, { role: 'system', text: notice, time: new Date() }]);
    }
  };

  const handleResetChat = () => {
    setMessages([{ role: 'assistant', text: labels.welcome, model: activeModelObj.name, time: new Date() }]);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await authFetch(`/ai/ask`, {
        method: 'POST',
        body: JSON.stringify({
          lesson_id: lessonId,
          question: text.trim(),
          lang,
          model: selectedModel
        }),
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.answer,
        model: res.model_name || activeModelObj.name,
        vendor: res.vendor || activeModelObj.vendor,
        time: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: lang === 'id'
          ? 'Maaf, model AI sedang sibuk. Silakan coba lagi.'
          : "Sorry, the AI model is momentarily unavailable. Please try again.",
        model: activeModelObj.name,
        time: new Date(),
      }]);
    }
    setLoading(false);
  };

  const formatTime = d => d?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Filter models by Vendor, Modality Tag, and Search Query
  const filteredModels = models.filter(m => {
    const matchesVendor = selectedVendor === 'ALL' || m.vendor === selectedVendor;
    const matchesTag = activeFilterTag === 'ALL' || (m.tags && m.tags.includes(activeFilterTag));
    const matchesQuery = !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.specialization && m.specialization.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesVendor && matchesTag && matchesQuery;
  });

  return (
    <div style={{
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      overflow: 'visible',
      background: 'var(--bg-card)',
      position: 'relative'
    }}>
      {/* Header toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.1rem',
        borderBottom: open ? '1px solid var(--border-light)' : 'none',
        background: 'var(--bg-card)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            color: 'var(--text-primary)', textAlign: 'left'
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #f97316, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(249,115,22,0.3)'
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {labels.title}
              <span style={{
                fontSize: '0.62rem',
                background: 'rgba(249,115,22,0.15)',
                color: '#f97316',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 6,
                padding: '0.1rem 0.4rem',
                fontWeight: 800
              }}>
                BYTEPLUS ORCHESTRATOR
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{labels.subtitle}</div>
          </div>
        </button>

        {/* Model Selector Trigger Button (Screenshot Style) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModelPicker(v => !v);
              if (!open) setOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '24px',
              padding: '0.35rem 0.85rem',
              color: '#f4f4f5',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#27272a'}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block'
            }} />
            <span style={{ color: activeModelObj.color || '#f97316', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
              {activeModelObj.name}
            </span>
            <ChevronDown size={14} color="#a1a1aa" />
          </button>

          <button
            onClick={handleResetChat}
            title={lang === 'id' ? 'Reset Percakapan' : 'Reset Conversation'}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#18181b', border: '1px solid #27272a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#a1a1aa',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#52525b'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = '#27272a'; }}
          >
            <RefreshCw size={13} />
          </button>

          {/* Model Selector Floating Menu (Screenshot replicated style for 29 models) */}
          {showModelPicker && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: 360,
              maxWidth: '92vw',
              background: '#141416',
              border: '1px solid #27272a',
              borderRadius: '16px',
              padding: '0.85rem',
              zIndex: 1000,
              boxShadow: '0 20px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              backdropFilter: 'blur(24px)'
            }}>
              {/* Header + Vendor Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#a1a1aa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  {filteredModels.length} / {models.length} MODELS (ap-southeast-1)
                </div>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>● Connected</span>
              </div>

              {/* Vendor Selector Pill Tabs */}
              <div style={{ display: 'flex', gap: '0.3rem', background: '#1c1c20', padding: '0.2rem', borderRadius: 8 }}>
                {[
                  { id: 'ALL', label: 'All (29)' },
                  { id: 'ByteDance', label: 'ByteDance (22)' },
                  { id: 'DeepSeek', label: 'DeepSeek (5)' },
                  { id: 'Z.AI', label: 'Z.AI (2)' }
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVendor(v.id)}
                    style={{
                      flex: 1,
                      padding: '0.28rem 0.4rem',
                      borderRadius: 6,
                      border: 'none',
                      background: selectedVendor === v.id ? '#27272a' : 'transparent',
                      color: selectedVendor === v.id ? '#fff' : '#71717a',
                      fontSize: '0.68rem',
                      fontWeight: selectedVendor === v.id ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: '#1c1c20', border: '1px solid #27272a',
                borderRadius: 8, padding: '0.35rem 0.65rem'
              }}>
                <Search size={13} color="#71717a" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter model name or capability..."
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: '0.75rem', width: '100%'
                  }}
                />
              </div>

              {/* Models List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 260, overflowY: 'auto' }}>
                {filteredModels.map(m => {
                  const isSelected = m.id === selectedModel;
                  return (
                    <div
                      key={m.id}
                      onClick={() => selectModel(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(249,115,22,0.1)' : 'transparent',
                        border: isSelected ? '1px solid rgba(249,115,22,0.3)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.background = '#1f1f23';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: '#10b981',
                          boxShadow: isSelected ? '0 0 8px #10b981' : 'none',
                          flexShrink: 0
                        }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: isSelected ? '#f97316' : '#e4e4e7',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {m.name}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#71717a', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span>{m.vendor}</span>
                            <span>•</span>
                            <span>{m.category || m.provider}</span>
                            <span>•</span>
                            <span>{(m.capacity_tokens / 1024).toFixed(0)}k</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check size={16} color="#f97316" strokeWidth={2.5} style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modality & Capability Badges (Matching bottom pills in screenshot) */}
              <div style={{
                borderTop: '1px solid #27272a',
                paddingTop: '0.6rem',
                display: 'flex',
                gap: '0.35rem',
                flexWrap: 'wrap'
              }}>
                {['ACTIVATED', 'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'CODE', 'RAG', 'REASONING'].map(tag => {
                  const isActive = activeFilterTag === tag || (tag === 'ACTIVATED' && activeFilterTag === 'ALL');
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveFilterTag(prev => prev === tag ? 'ALL' : tag)}
                      style={{
                        background: isActive ? '#10b98120' : '#1f1f23',
                        color: isActive ? '#10b981' : '#a1a1aa',
                        border: `1px solid ${isActive ? '#10b98150' : '#27272a'}`,
                        borderRadius: '20px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '0.2rem'
            }}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Messages Container */}
          <div style={{
            maxHeight: 340,
            overflowY: 'auto',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {messages.map((msg, i) => {
              if (msg.role === 'system') {
                return (
                  <div key={i} style={{
                    textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)',
                    padding: '0.25rem 0.6rem', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12, margin: '0.2rem auto', maxWidth: '85%'
                  }}>
                    {msg.text}
                  </div>
                );
              }

              const isUser = msg.role === 'user';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'flex-start',
                    flexDirection: isUser ? 'row-reverse' : 'row'
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: isUser ? 'var(--primary)' : 'linear-gradient(135deg, #f97316, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isUser ? 'none' : '0 0 10px rgba(249,115,22,0.3)'
                  }}>
                    {isUser ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
                  </div>
                  <div style={{
                    maxWidth: '82%',
                    padding: '0.75rem 0.95rem',
                    background: isUser ? 'rgba(124,58,237,0.15)' : 'var(--bg-surface)',
                    border: `1px solid ${isUser ? 'rgba(124,58,237,0.3)' : 'var(--border-light)'}`,
                    borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    fontSize: '0.84rem', lineHeight: 1.6, color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {!isUser && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        fontSize: '0.68rem', color: '#f97316', fontWeight: 800,
                        marginBottom: '0.35rem', fontFamily: 'monospace'
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        {msg.model || activeModelObj.name}
                        {msg.vendor && <span style={{ color: '#71717a', fontWeight: 500 }}>({msg.vendor})</span>}
                      </div>
                    )}
                    {msg.text}
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-muted)',
                      marginTop: '0.35rem', textAlign: isUser ? 'right' : 'left'
                    }}>
                      {formatTime(msg.time)}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{
                  padding: '0.65rem 0.95rem', background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)', borderRadius: '4px 14px 14px 14px',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)'
                }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', color: '#f97316' }} />
                  <span style={{ fontFamily: 'monospace', color: '#f97316' }}>{activeModelObj.name}</span> {labels.thinking}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 0.85rem 0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {labels.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  style={{
                    fontSize: '0.73rem', padding: '0.28rem 0.75rem', borderRadius: 20,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                    cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div style={{
            padding: '0.65rem 0.85rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            background: 'var(--bg-card)'
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={labels.placeholder}
              disabled={loading}
              style={{
                flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem',
                color: 'var(--text-primary)', fontSize: '0.83rem',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="btn btn-primary btn-sm"
              style={{
                padding: '0.55rem 1rem',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #f97316, #7c3aed)',
                border: 'none'
              }}
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
