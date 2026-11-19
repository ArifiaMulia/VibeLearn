import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, X, ChevronDown, Loader2, Bot, User, Check,
  RefreshCw, Search, Shield, Copy, ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useIsMobile } from '../hooks/useIsMobile';

const SEALSUITE_RELEASE_NOTES_URL = 'https://docs.byteplus.com/en/docs/sealsuite/docs-sealsuite-update-log';

export default function NewsAiAssistant({
  article,
  models = [],
  selectedModel = 'dreamina-seedance-2-5',
  onSelectModel,
  initialPrompt = '',
  onClearInitialPrompt,
  onClose,
}) {
  const { authFetch } = useAuth();
  const { lang } = useLanguage();
  const isMobile = useIsMobile();
  const isId = lang === 'id';

  const articleTitle = (isId ? (article?.title_id || article?.title_en) : (article?.title_en || article?.title_id)) || 'News Briefing';
  const hasSealSuite = Boolean(article?.sealsuite_resolution);
  const ssModules = Array.isArray(article?.sealsuite_resolution?.modules) ? article.sealsuite_resolution.modules : [];

  const activeModelObj = models.find((m) => m.id === selectedModel) || models[0] || {
    id: 'dreamina-seedance-2-5',
    name: 'dreamina-seedance-2-5',
    displayName: 'Dreamina Seedance 2.5',
    vendor: 'ByteDance',
    color: '#f97316',
  };

  const buildWelcomeMessage = (modelObj) => {
    if (isId) {
      return hasSealSuite
        ? `Halo! Saya **AI News & SealSuite Security Analyst** (\`${modelObj.displayName}\`).\n\nAnda sedang membaca berita: **"${articleTitle}"**.\n- 🛡️ **Modul SealSuite Terkait**: ${ssModules.join(' • ')}\n\nSilakan pilih pertanyaan cepat di bawah atau ketik pertanyaan Anda terkait **detail berita ini** maupun **apa yang bisa dilakukan BytePlus SealSuite** untuk mencegah dan menangani masalah tersebut!`
        : `Halo! Saya **AI News & SealSuite Analyst** (\`${modelObj.displayName}\`).\n\nAnda sedang membaca berita: **"${articleTitle}"**.\n\nSilakan tanyakan apa saja terkait isi berita ini, dampak teknisnya, atau bagaimana **BytePlus SealSuite** melindungi tim Anda saat mengadopsi teknologi yang dibahas di berita ini!`;
    }
    return hasSealSuite
      ? `Hi! I'm your **AI News & SealSuite Security Analyst** (\`${modelObj.displayName}\`).\n\nYou are reading: **"${articleTitle}"**.\n- 🛡️ **Relevant SealSuite Modules**: ${ssModules.join(' • ')}\n\nTap a quick prompt below or ask anything about **this news article** or **what BytePlus SealSuite can do** to prevent and mitigate this threat!`
      : `Hi! I'm your **AI News & SealSuite Analyst** (\`${modelObj.displayName}\`).\n\nYou are reading: **"${articleTitle}"**.\n\nAsk me anything about this briefing, its technical impact, or how **BytePlus SealSuite** secures teams working with the technologies covered here!`;
  };

  const [messages, setMessages] = useState(() => [
    { role: 'assistant', text: buildWelcomeMessage(activeModelObj), model: activeModelObj.displayName, vendor: activeModelObj.vendor, time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState('ALL');
  const [modelSearch, setModelSearch] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const lastInitialPromptRef = useRef('');

  const quickPrompts = isId
    ? [
        '🛡️ Apa yang bisa dilakukan SealSuite terhadap masalah di berita ini?',
        '🔍 Jelaskan kronologi, akar masalah, dan intisari berita ini',
        '⚙️ Bagaimana konfigurasi kebijakan SealSuite (ZTNA / DLP / EDR) untuk kasus ini?',
        '📋 Apa checklist tindakan darurat untuk tim IT & Security kami?',
      ]
    : [
        '🛡️ What can BytePlus SealSuite do regarding the issue in this news?',
        '🔍 Explain the chronology, root cause, and key takeaways of this news',
        '⚙️ How should we configure SealSuite policies (ZTNA / DLP / EDR) for this case?',
        '📋 What is the emergency action checklist for our IT & Security team?',
      ];

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, loading]);

  const sendQuestion = async (questionText) => {
    const trimmed = String(questionText || '').trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', text: trimmed, time: new Date() };
    const historyForApi = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-4)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await authFetch('/ai/ask-news', {
        method: 'POST',
        body: JSON.stringify({
          question: trimmed,
          lang,
          model: selectedModel,
          news_id: article?.id,
          slug: article?.slug,
          article: {
            id: article?.id,
            slug: article?.slug,
            category: article?.category,
            severity: article?.severity,
            published_at: article?.published_at,
            title_id: article?.title_id,
            title_en: article?.title_en,
            summary_id: article?.summary_id,
            summary_en: article?.summary_en,
            content_id: article?.content_id,
            content_en: article?.content_en,
            tags: article?.tags,
            sources: article?.sources,
            sealsuite_resolution: article?.sealsuite_resolution,
          },
          history: historyForApi,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res?.answer || (isId ? 'Tidak ada respons dari AI.' : 'No response from AI.'),
          model: res?.model_name || activeModelObj.displayName,
          vendor: res?.vendor || activeModelObj.vendor,
          time: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: isId
            ? 'Maaf, layanan AI sedang sibuk. Silakan coba kirim pertanyaan Anda kembali.'
            : 'Sorry, the AI service is momentarily busy. Please try sending your question again.',
          model: activeModelObj.displayName,
          vendor: activeModelObj.vendor,
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger initialPrompt automatically when passed from parent (e.g. "Tanya AI tentang Solusi SealSuite")
  useEffect(() => {
    if (initialPrompt && initialPrompt !== lastInitialPromptRef.current) {
      lastInitialPromptRef.current = initialPrompt;
      sendQuestion(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSelectModel = (modelId) => {
    if (onSelectModel) onSelectModel(modelId);
    setShowModelPicker(false);
    const chosen = models.find((m) => m.id === modelId);
    if (chosen) {
      const notice = isId
        ? `🔄 Model AI dialihkan ke **${chosen.displayName}** (${chosen.vendor} • ap-southeast-1).`
        : `🔄 AI Model switched to **${chosen.displayName}** (${chosen.vendor} • ap-southeast-1).`;
      setMessages((prev) => [...prev, { role: 'system', text: notice, time: new Date() }]);
    }
  };

  const handleResetChat = () => {
    lastInitialPromptRef.current = '';
    setMessages([
      {
        role: 'assistant',
        text: buildWelcomeMessage(activeModelObj),
        model: activeModelObj.displayName,
        vendor: activeModelObj.vendor,
        time: new Date(),
      },
    ]);
  };

  const handleCopyText = async (text, idx) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {}
  };

  const filteredModels = models.filter((m) => {
    const matchesVendor = selectedVendor === 'ALL' || m.vendor === selectedVendor;
    const q = modelSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.displayName.toLowerCase().includes(q) ||
      (m.specialization && m.specialization.toLowerCase().includes(q));
    return matchesVendor && matchesQuery;
  });

  const formatTime = (d) => d?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      data-testid="news-ai-assistant-panel"
      style={{
        marginTop: '0.85rem',
        borderRadius: 12,
        border: '1.5px solid rgba(139, 92, 246, 0.45)',
        background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.08) 0%, var(--bg-surface) 100%)',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.28)',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* ── Top Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0.65rem 0.8rem' : '0.75rem 1rem',
          borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0, flex: '1 1 200px' }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #10b981, #7c3aed, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.35)',
            }}
          >
            <Sparkles size={15} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: isMobile ? '0.8rem' : '0.85rem', color: 'var(--text-primary)' }}>
                {isId ? 'Tanya AI: Bedah Berita & Solusi SealSuite' : 'Ask AI: News & SealSuite Analyst'}
              </span>
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.42rem',
                  borderRadius: 6,
                  background: 'rgba(16, 185, 129, 0.16)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                }}
              >
                SEALSUITE + MODELARK
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isId
                ? 'Referensi: Konten Berita & Release Notes Resmi BytePlus SealSuite'
                : 'Grounded in Article Context & Official BytePlus SealSuite Release Notes'}
            </div>
          </div>
        </div>

        {/* Model Picker + Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowModelPicker((v) => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.38rem',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 20,
              padding: '0.28rem 0.68rem',
              color: '#f4f4f5',
              fontSize: '0.73rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ color: activeModelObj.color || '#f97316', fontFamily: 'monospace', maxWidth: isMobile ? 115 : 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeModelObj.name}
            </span>
            <ChevronDown size={12} color="#a1a1aa" />
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            title={isId ? 'Reset Percakapan AI' : 'Reset AI Chat'}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#18181b',
              border: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#a1a1aa',
            }}
          >
            <RefreshCw size={12} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title={isId ? 'Tutup Panel AI' : 'Close AI Panel'}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#18181b',
                border: '1px solid #27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#a1a1aa',
              }}
            >
              <X size={13} />
            </button>
          )}

          {showModelPicker && models.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 320,
                maxWidth: '88vw',
                background: '#141416',
                border: '1px solid #27272a',
                borderRadius: 14,
                padding: '0.75rem',
                zIndex: 1000,
                boxShadow: '0 18px 42px rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontWeight: 800, color: '#a1a1aa' }}>
                <span>{filteredModels.length} MODELS (ap-southeast-1)</span>
                <span style={{ color: '#10b981' }}>● Online</span>
              </div>

              <div style={{ display: 'flex', gap: '0.25rem', background: '#1c1c20', padding: '0.18rem', borderRadius: 8 }}>
                {['ALL', 'ByteDance', 'DeepSeek', 'Z.AI'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVendor(v)}
                    style={{
                      flex: 1,
                      padding: '0.24rem 0.35rem',
                      borderRadius: 6,
                      border: 'none',
                      background: selectedVendor === v ? '#27272a' : 'transparent',
                      color: selectedVendor === v ? '#fff' : '#71717a',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#1c1c20', border: '1px solid #27272a', borderRadius: 8, padding: '0.3rem 0.55rem' }}>
                <Search size={12} color="#71717a" />
                <input
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder={isId ? 'Cari model AI...' : 'Filter model...'}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.72rem', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: 210, overflowY: 'auto' }}>
                {filteredModels.map((m) => {
                  const isSel = m.id === selectedModel;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectModel(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.6rem',
                        borderRadius: 8,
                        background: isSel ? 'rgba(249,115,22,0.12)' : 'transparent',
                        border: isSel ? '1px solid rgba(249,115,22,0.35)' : '1px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: '#e4e4e7',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, fontFamily: 'monospace', color: isSel ? '#f97316' : '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.63rem', color: '#71717a' }}>
                          {m.vendor} • {m.category}
                        </div>
                      </div>
                      {isSel && <Check size={14} color="#f97316" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Prompt Suggestion Chips ── */}
      <div
        style={{
          padding: isMobile ? '0.55rem 0.75rem' : '0.6rem 1rem',
          borderBottom: '1px solid var(--border-light)',
          background: 'rgba(15, 23, 42, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            💡 {isId ? 'Pertanyaan Cepat (Klik untuk Tanya AI):' : 'Quick Questions (Tap to Ask AI):'}
          </span>
          <a
            href={SEALSUITE_RELEASE_NOTES_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#34d399',
              textDecoration: 'none',
            }}
          >
            <Shield size={11} />
            {isId ? 'Release Notes SealSuite' : 'SealSuite Release Notes'}
            <ExternalLink size={10} />
          </a>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: isMobile ? 'auto' : 'visible',
            flexWrap: isMobile ? 'nowrap' : 'wrap',
            paddingBottom: isMobile ? '0.15rem' : 0,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => sendQuestion(promptText)}
              style={{
                padding: '0.32rem 0.68rem',
                borderRadius: 16,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: isMobile ? 'nowrap' : 'normal',
                flexShrink: 0,
                textAlign: 'left',
                background: idx === 0 ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-card)',
                border: idx === 0 ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid var(--border-light)',
                color: idx === 0 ? '#34d399' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Messages Stream ── */}
      <div
        style={{
          maxHeight: isMobile ? 380 : 440,
          overflowY: 'auto',
          padding: isMobile ? '0.75rem' : '0.95rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  padding: '0.22rem 0.6rem',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  margin: '0 auto',
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            );
          }

          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.55rem',
                alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: isUser ? 'var(--primary)' : 'linear-gradient(135deg, #10b981, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isUser ? <User size={13} color="#fff" /> : <Bot size={13} color="#fff" />}
              </div>

              <div
                style={{
                  maxWidth: isUser ? '84%' : '92%',
                  minWidth: 0,
                  padding: isMobile ? '0.7rem 0.85rem' : '0.8rem 1rem',
                  background: isUser ? 'rgba(124, 58, 237, 0.18)' : 'var(--bg-card)',
                  border: `1px solid ${isUser ? 'rgba(124, 58, 237, 0.4)' : 'var(--border-light)'}`,
                  borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  fontSize: isMobile ? '0.81rem' : '0.84rem',
                  lineHeight: 1.65,
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem',
                      fontSize: '0.66rem',
                      color: '#34d399',
                      fontWeight: 800,
                      marginBottom: '0.45rem',
                      paddingBottom: '0.32rem',
                      borderBottom: '1px solid var(--border-light)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'monospace' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                      {msg.model || activeModelObj.displayName}
                      {msg.vendor ? ` (${msg.vendor})` : ''}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.text, i)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.22rem',
                        background: 'transparent',
                        border: 'none',
                        color: copiedIdx === i ? '#10b981' : 'var(--text-muted)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {copiedIdx === i ? <Check size={11} /> : <Copy size={11} />}
                      {copiedIdx === i ? (isId ? 'Tersalin' : 'Copied') : (isId ? 'Salin' : 'Copy')}
                    </button>
                  </div>
                )}

                {isUser ? (
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontWeight: 600 }}>{msg.text}</div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({ node, ...props }) => (
                          <h4 style={{ margin: '0.75rem 0 0.35rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }} {...props} />
                        ),
                        p: ({ node, ...props }) => <p style={{ margin: '0 0 0.55rem' }} {...props} />,
                        ul: ({ node, ...props }) => <ul style={{ margin: '0 0 0.6rem 1.15rem', padding: 0 }} {...props} />,
                        ol: ({ node, ...props }) => <ol style={{ margin: '0 0 0.6rem 1.15rem', padding: 0 }} {...props} />,
                        li: ({ node, ...props }) => <li style={{ marginBottom: '0.28rem' }} {...props} />,
                        strong: ({ node, ...props }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }} {...props} />,
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            style={{
                              margin: '0.55rem 0',
                              padding: '0.5rem 0.75rem',
                              borderLeft: '3px solid #10b981',
                              background: 'rgba(16, 185, 129, 0.08)',
                              borderRadius: '0 8px 8px 0',
                              color: 'var(--text-primary)',
                              fontSize: '0.79rem',
                            }}
                            {...props}
                          />
                        ),
                        code: ({ node, inline, children, ...props }) =>
                          !inline ? (
                            <pre
                              style={{
                                background: '#11111b',
                                padding: '0.65rem 0.8rem',
                                borderRadius: 8,
                                overflowX: 'auto',
                                margin: '0.45rem 0 0.65rem',
                                border: '1px solid #27272a',
                                fontSize: '0.76rem',
                              }}
                            >
                              <code style={{ color: '#cdd6f4', fontFamily: 'monospace' }} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code
                              style={{
                                background: 'rgba(124, 58, 237, 0.15)',
                                padding: '0.1rem 0.35rem',
                                borderRadius: 4,
                                color: 'var(--primary)',
                                fontFamily: 'monospace',
                                fontSize: '0.82em',
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}

                <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: isUser ? 'right' : 'left' }}>
                  {formatTime(msg.time)}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={13} color="#fff" />
            </div>
            <div
              style={{
                padding: '0.55rem 0.85rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '4px 14px 14px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}
            >
              <Loader2 size={14} className="animate-spin" color="#10b981" />
              <span>
                {isId
                  ? `${activeModelObj.displayName} sedang menganalisis berita & mitigasi SealSuite...`
                  : `${activeModelObj.displayName} is analyzing the briefing & SealSuite controls...`}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Form ── */}
      <div
        style={{
          padding: isMobile ? '0.6rem 0.75rem' : '0.7rem 1rem',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
          borderRadius: '0 0 11px 11px',
          display: 'flex',
          gap: '0.45rem',
          alignItems: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendQuestion(input);
            }
          }}
          placeholder={
            isId
              ? 'Tanyakan lebih lanjut tentang berita ini atau apa yang bisa dilakukan SealSuite...'
              : 'Ask further about this news or what BytePlus SealSuite can do...'
          }
          style={{
            flex: 1,
            minWidth: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 10,
            padding: '0.55rem 0.85rem',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
          }}
        />
        <button
          type="button"
          disabled={!input.trim() || loading}
          onClick={() => sendQuestion(input)}
          className="btn btn-primary btn-sm"
          style={{
            padding: '0.55rem 0.9rem',
            borderRadius: 10,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #7c3aed)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontWeight: 800,
            fontSize: '0.76rem',
            cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
          }}
        >
          <Send size={13} />
          {!isMobile && (isId ? 'Tanya AI' : 'Ask AI')}
        </button>
      </div>
    </div>
  );
}
