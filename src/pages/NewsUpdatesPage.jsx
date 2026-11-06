import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Newspaper, ShieldAlert, Cpu, Sparkles, ExternalLink, Clock, Search,
  ChevronDown, ChevronUp, Plus, Trash2, Flame, Shield, BookOpen, X, CheckCircle, AlertTriangle,
  Volume2, VolumeX, Share2, Smartphone, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MobileInstallModal from '../components/MobileInstallModal';

const CATEGORY_META = {
  all: {
    label_en: 'All Briefings',
    label_id: 'Semua Berita',
    color: '#8b5cf6',
  },
  cybersecurity: {
    label_en: 'Cybersecurity & Threats',
    label_id: 'Keamanan Siber & Ancaman',
    color: '#ef4444',
  },
  'vibe-coding': {
    label_en: 'Vibe Coding & AppSec',
    label_id: 'Vibe Coding & AppSec',
    color: '#f97316',
  },
  'ai-agents': {
    label_en: 'AI Agents & MCP',
    label_id: 'Agen AI & MCP',
    color: '#06b6d4',
  },
  'ai-models': {
    label_en: 'AI Models & ModelArk',
    label_id: 'Model AI & ModelArk',
    color: '#10b981',
  },
};

const SEVERITY_STYLE = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.4)',
    text: '#ef4444',
    label_en: 'CRITICAL ADVISORY',
    label_id: 'PERINGATAN KRITIS',
  },
  high: {
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.4)',
    text: '#f97316',
    label_en: 'HIGH PRIORITY',
    label_id: 'PRIORITAS TINGGI',
  },
  info: {
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
    text: '#06b6d4',
    label_en: 'TECH BRIEFING',
    label_id: 'INFO TEKNOLOGI',
  },
};

export default function NewsUpdatesPage() {
  const { authFetch, user } = useAuth();
  const { lang } = useLanguage();
  const isId = lang === 'id';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'master';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSlug, setExpandedSlug] = useState('black-october-2026-ai-vulnpocalypse-cybersecurity');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [speakingSlug, setSpeakingSlug] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    category: 'cybersecurity',
    severity: 'high',
    is_pinned: false,
    badge_id: '🔥 LAPORAN TERBARU',
    badge_en: '🔥 BREAKING REPORT',
    title_id: '',
    title_en: '',
    summary_id: '',
    summary_en: '',
    content_id: '',
    content_en: '',
    tagsText: 'Cybersecurity, Vibe Coding',
    sourceTitle: '',
    sourcePublisher: '',
    sourceUrl: '',
  });

  const loadNews = () => {
    setLoading(true);
    authFetch('/news')
      .then(res => {
        if (res && Array.isArray(res.items)) {
          setItems(res.items);
          if (res.items.length > 0 && !expandedSlug) {
            setExpandedSlug(res.items[0].slug);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNews();
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudioBriefing = (item) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speakingSlug === item.slug) {
      window.speechSynthesis.cancel();
      setSpeakingSlug(null);
      return;
    }
    window.speechSynthesis.cancel();
    const title = (isId ? item.title_id : item.title_en) || '';
    const summary = (isId ? item.summary_id : item.summary_en) || '';
    const rawContent = ((isId ? item.content_id : item.content_en) || '')
      .replace(/[#*`_~>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(`${title}. ${summary}. ${rawContent}`);
    utterance.lang = isId ? 'id-ID' : 'en-US';
    utterance.rate = 1.02;
    utterance.onend = () => setSpeakingSlug(null);
    utterance.onerror = () => setSpeakingSlug(null);
    setSpeakingSlug(item.slug);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareArticle = async (item) => {
    const title = (isId ? item.title_id : item.title_en) || 'Promptara News';
    const summary = (isId ? item.summary_id : item.summary_en) || '';
    const shareUrl = `${window.location.origin}/news#${item.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} — ${summary}`,
          url: shareUrl,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard?.writeText(`${title}\n\n${summary}\n\n🔗 ${shareUrl}`);
      setCopiedSlug(item.slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    } catch {}
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title_id && !newPost.title_en) return;
    setSubmitting(true);
    try {
      const tags = newPost.tagsText
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      const sources = newPost.sourceUrl.trim()
        ? [{
            title: newPost.sourceTitle.trim() || newPost.sourceUrl.trim(),
            publisher: newPost.sourcePublisher.trim() || 'Official Source',
            url: newPost.sourceUrl.trim(),
          }]
        : [];

      const res = await authFetch('/news', {
        method: 'POST',
        body: JSON.stringify({
          category: newPost.category,
          severity: newPost.severity,
          is_pinned: newPost.is_pinned,
          badge_id: newPost.badge_id,
          badge_en: newPost.badge_en,
          title_id: newPost.title_id || newPost.title_en,
          title_en: newPost.title_en || newPost.title_id,
          summary_id: newPost.summary_id || newPost.summary_en,
          summary_en: newPost.summary_en || newPost.summary_id,
          content_id: newPost.content_id || newPost.content_en || newPost.summary_id,
          content_en: newPost.content_en || newPost.content_id || newPost.summary_en,
          tags,
          sources,
        }),
      });
      if (res?.item) {
        setItems(prev => [res.item, ...prev]);
        setExpandedSlug(res.item.slug);
        setShowAddModal(false);
        setNewPost({
          category: 'cybersecurity',
          severity: 'high',
          is_pinned: false,
          badge_id: '🔥 LAPORAN TERBARU',
          badge_en: '🔥 BREAKING REPORT',
          title_id: '',
          title_en: '',
          summary_id: '',
          summary_en: '',
          content_id: '',
          content_en: '',
          tagsText: 'Cybersecurity, Vibe Coding',
          sourceTitle: '',
          sourcePublisher: '',
          sourceUrl: '',
        });
      }
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      await authFetch(`/news/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch {}
  };

  const filteredItems = items.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const title = (isId ? item.title_id : item.title_en) || '';
    const summary = (isId ? item.summary_id : item.summary_en) || '';
    const tags = Array.isArray(item.tags) ? item.tags.join(' ') : '';
    const q = searchQuery.trim().toLowerCase();
    const matchQuery = !q ||
      title.toLowerCase().includes(q) ||
      summary.toLowerCase().includes(q) ||
      tags.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  const featuredBlackOctober = items.find(i => i.slug.includes('black-october')) || items[0];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #ef4444, #f97316, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(239, 68, 68, 0.3)'
            }}>
              <Newspaper size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isId ? 'Berita & Pembaruan Terkini (News & Updates)' : 'News & Cyber Intelligence Updates'}
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {isId
                  ? 'Rangkuman eksekutif tren Vibe Coding, agen AI, serta insiden keamanan siber global (termasuk laporan khusus "Black October") lengkap dengan tautan sumber resmi.'
                  : 'Executive summaries on Vibe Coding, AI agents, and global cybersecurity incidents (including the "Black October" special report) with verified source links.'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowMobileModal(true)}
            className="btn btn-ghost btn-sm"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              border: '1px solid rgba(6, 182, 212, 0.45)',
              background: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--accent)', fontWeight: 700, padding: '0.55rem 0.95rem'
            }}
          >
            <Smartphone size={16} />
            {isId ? '📱 Baca di iOS & Android' : '📱 Read on iOS & Android'}
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                background: 'linear-gradient(135deg, #f97316, #7c3aed)',
                border: 'none', padding: '0.6rem 1.1rem', fontWeight: 700
              }}
            >
              <Plus size={16} />
              {isId ? 'Tambah Berita / Update' : 'Publish Update'}
            </button>
          )}
        </div>
      </div>

      {/* ── Spotlight Banner: "Black October" Executive Alert ── */}
      {featuredBlackOctober && (
        <div style={{
          background: 'radial-gradient(circle at 15% 20%, rgba(239, 68, 68, 0.22) 0%, rgba(249, 115, 22, 0.12) 45%, var(--bg-card) 100%)',
          border: '1.5px solid rgba(239, 68, 68, 0.45)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem 1.75rem',
          boxShadow: '0 10px 32px rgba(239, 68, 68, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                padding: '0.22rem 0.65rem', borderRadius: 20, letterSpacing: '0.05em'
              }}>
                <Flame size={13} />
                {isId ? 'SOROTAN UTAMA · BLACK OCTOBER' : 'HEADLINE SPOTLIGHT · BLACK OCTOBER'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                📅 {featuredBlackOctober.published_at} • ⏱ {featuredBlackOctober.read_time_min} {isId ? 'menit baca' : 'min read'}
              </span>
            </div>

            <button
              onClick={() => {
                setActiveCategory('all');
                setExpandedSlug(featuredBlackOctober.slug);
                document.getElementById(`news-card-${featuredBlackOctober.slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#f87171',
                borderRadius: 8,
                padding: '0.38rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isId ? 'Baca Rangkuman Lengkap & Sumber →' : 'Read Full Summary & Sources →'}
            </button>
          </div>

          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {isId ? featuredBlackOctober.title_id : featuredBlackOctober.title_en}
          </h2>

          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {isId ? featuredBlackOctober.summary_id : featuredBlackOctober.summary_en}
          </p>

          {/* Quick Source Pills inside Spotlight */}
          {Array.isArray(featuredBlackOctober.sources) && featuredBlackOctober.sources.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {isId ? '🔗 Sumber Referensi Resmi:' : '🔗 Official Sources:'}
              </span>
              {featuredBlackOctober.sources.map((src, sIdx) => (
                <a
                  key={sIdx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent)',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                    padding: '0.22rem 0.65rem', borderRadius: 20, textDecoration: 'none'
                  }}
                >
                  {src.publisher || src.title} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Filter Tabs & Search Bar (Touch-Scrollable on Mobile) ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.75rem',
        background: 'var(--bg-card)', padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)'
      }}>
        <div style={{
          display: 'flex', gap: '0.45rem', overflowX: 'auto', maxWidth: '100%',
          paddingBottom: '0.15rem', WebkitOverflowScrolling: 'touch'
        }}>
          {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
            const active = activeCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                style={{
                  padding: '0.42rem 0.85rem',
                  borderRadius: 20,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  border: active ? `1.5px solid ${meta.color}` : '1px solid var(--border-light)',
                  background: active ? `${meta.color}22` : 'var(--bg-surface)',
                  color: active ? meta.color : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {isId ? meta.label_id : meta.label_en}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', minWidth: 220, flex: '1 1 240px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isId ? 'Cari topik (misal: Black October, MCP, DLP)...' : 'Search topics (e.g. Black October, MCP, DLP)...'}
            style={{
              width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 20,
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              color: 'var(--text-primary)',
              fontSize: '0.8rem'
            }}
          />
        </div>
      </div>

      {/* ── News Feed List ── */}
      {loading ? (
        <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)' }} />
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          {isId ? 'Tidak ada berita yang cocok dengan pencarian Anda.' : 'No news articles matched your filter.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {filteredItems.map(item => {
            const isExpanded = expandedSlug === item.slug;
            const sev = SEVERITY_STYLE[item.severity] || SEVERITY_STYLE.info;
            const catMeta = CATEGORY_META[item.category] || CATEGORY_META.cybersecurity;
            const title = isId ? item.title_id : item.title_en;
            const summary = isId ? item.summary_id : item.summary_en;
            const content = isId ? item.content_id : item.content_en;
            const badge = isId ? item.badge_id : item.badge_en;
            const tags = Array.isArray(item.tags) ? item.tags : [];
            const sources = Array.isArray(item.sources) ? item.sources : [];

            return (
              <div
                key={item.slug || item.id}
                id={`news-card-${item.slug}`}
                style={{
                  background: 'var(--bg-card)',
                  border: isExpanded ? `1.5px solid ${catMeta.color}` : '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isExpanded ? '0 8px 28px rgba(0,0,0,0.28)' : 'none'
                }}
              >
                {/* Card Header / Summary */}
                <div style={{ padding: '1.35rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800,
                        padding: '0.2rem 0.6rem', borderRadius: 6,
                        background: sev.bg, border: `1px solid ${sev.border}`, color: sev.text
                      }}>
                        {badge || (isId ? sev.label_id : sev.label_en)}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '0.18rem 0.55rem', borderRadius: 6,
                        background: 'var(--bg-surface)', color: catMeta.color,
                        border: '1px solid var(--border-light)'
                      }}>
                        {isId ? catMeta.label_id : catMeta.label_en}
                      </span>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {item.published_at} • {item.read_time_min || 5} {isId ? 'mnt baca' : 'min read'}
                      </span>
                    </div>

                    {isAdmin && item.id && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        title={isId ? 'Hapus Berita' : 'Delete Article'}
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-muted)',
                          cursor: 'pointer', padding: '0.25rem'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <h3
                    onClick={() => setExpandedSlug(isExpanded ? null : item.slug)}
                    style={{
                      margin: '0 0 0.55rem',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      lineHeight: 1.35
                    }}
                  >
                    {title}
                  </h3>

                  <p style={{ margin: '0 0 0.9rem', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {summary}
                  </p>

                  {/* Tags + Action Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.55rem',
                            borderRadius: 12,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-muted)'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      {/* Audio Briefing Button (Hands-free mobile listening) */}
                      <button
                        onClick={() => handleToggleAudioBriefing(item)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.4rem 0.75rem', borderRadius: 8,
                          background: speakingSlug === item.slug ? 'rgba(16, 185, 129, 0.16)' : 'var(--bg-surface)',
                          border: `1px solid ${speakingSlug === item.slug ? '#10b981' : 'var(--border-light)'}`,
                          color: speakingSlug === item.slug ? '#10b981' : 'var(--text-secondary)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {speakingSlug === item.slug ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        {speakingSlug === item.slug
                          ? (isId ? 'Hentikan Audio' : 'Stop Audio')
                          : (isId ? 'Dengarkan' : 'Listen')}
                      </button>

                      {/* Mobile Native Share Button */}
                      <button
                        onClick={() => handleShareArticle(item)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.4rem 0.75rem', borderRadius: 8,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-light)',
                          color: copiedSlug === item.slug ? '#10b981' : 'var(--text-secondary)',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {copiedSlug === item.slug ? <Check size={14} /> : <Share2 size={14} />}
                        {copiedSlug === item.slug
                          ? (isId ? 'Tersalin!' : 'Copied!')
                          : (isId ? 'Bagikan' : 'Share')}
                      </button>

                      <button
                        onClick={() => setExpandedSlug(isExpanded ? null : item.slug)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.42rem 0.9rem', borderRadius: 8,
                          background: isExpanded ? 'rgba(124, 58, 237, 0.15)' : 'var(--bg-surface)',
                          border: `1px solid ${isExpanded ? 'var(--primary)' : 'var(--border-light)'}`,
                          color: isExpanded ? 'var(--primary)' : 'var(--text-primary)',
                          fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        <BookOpen size={14} />
                        {isExpanded
                          ? (isId ? 'Tutup Rangkuman' : 'Collapse Briefing')
                          : (isId ? 'Baca Bedah Lengkap & Sumber' : 'Read Executive Breakdown & Sources')}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Deep-Dive Content + Source Links */}
                {isExpanded && (
                  <div style={{
                    padding: '1.25rem 1.5rem 1.5rem',
                    borderTop: '1px solid var(--border-light)',
                    background: 'var(--bg-surface)'
                  }}>
                    <div className="markdown-content" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h3: ({node, ...props}) => <h3 style={{ margin: '1rem 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }} {...props} />,
                          p: ({node, ...props}) => <p style={{ margin: '0 0 0.75rem' }} {...props} />,
                          ul: ({node, ...props}) => <ul style={{ margin: '0 0 0.85rem 1.25rem' }} {...props} />,
                          ol: ({node, ...props}) => <ol style={{ margin: '0 0 0.85rem 1.25rem' }} {...props} />,
                          li: ({node, ...props}) => <li style={{ marginBottom: '0.35rem' }} {...props} />,
                          strong: ({node, ...props}) => <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }} {...props} />,
                          table: ({node, ...props}) => (
                            <div style={{ overflowX: 'auto', margin: '0.85rem 0' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => <th style={{ textAlign: 'left', padding: '0.55rem 0.75rem', borderBottom: '2px solid var(--border-light)', color: 'var(--text-primary)', background: 'var(--bg-card)' }} {...props} />,
                          td: ({node, ...props}) => <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid var(--border-light)' }} {...props} />,
                          code: ({node, inline, children, ...props}) => (
                            <code style={{
                              background: 'rgba(124,58,237,0.14)', padding: '0.12rem 0.4rem',
                              borderRadius: 4, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.85em'
                            }} {...props}>{children}</code>
                          )
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </div>

                    {/* Verified External Sources Box */}
                    {sources.length > 0 && (
                      <div style={{
                        marginTop: '1.25rem',
                        padding: '1rem 1.15rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderLeft: '4px solid var(--accent)',
                        borderRadius: 'var(--radius-md)'
                      }}>
                        <div style={{
                          fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)',
                          marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}>
                          <ExternalLink size={14} color="var(--accent)" />
                          {isId ? 'Sumber Referensi & Laporan Resmi (Klik untuk Membuka):' : 'Verified Reference Sources & Advisories:'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.55rem' }}>
                          {sources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                padding: '0.55rem 0.8rem',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 8,
                                textDecoration: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '0.78rem',
                                transition: 'border-color 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                            >
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.72rem' }}>
                                  {src.publisher || 'Official Source'}
                                </div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.76rem' }}>
                                  {src.title}
                                </div>
                              </div>
                              <ExternalLink size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Admin Modal to Publish New Update ── */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {isId ? 'Tambah Berita & Pembaruan Baru' : 'Publish New Intelligence Briefing'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    {isId ? 'Kategori' : 'Category'}
                  </label>
                  <select
                    value={newPost.category}
                    onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                  >
                    <option value="cybersecurity">Cybersecurity & Threats</option>
                    <option value="vibe-coding">Vibe Coding & AppSec</option>
                    <option value="ai-agents">AI Agents & MCP</option>
                    <option value="ai-models">AI Models & ModelArk</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    {isId ? 'Tingkat Urgensi' : 'Severity'}
                  </label>
                  <select
                    value={newPost.severity}
                    onChange={e => setNewPost(p => ({ ...p, severity: e.target.value }))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                  >
                    <option value="critical">Critical Advisory</option>
                    <option value="high">High Priority</option>
                    <option value="info">Tech Briefing</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  {isId ? 'Judul Berita (Bahasa Indonesia / Inggris) *' : 'Headline Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={newPost.title_id}
                  onChange={e => setNewPost(p => ({ ...p, title_id: e.target.value, title_en: e.target.value }))}
                  placeholder={isId ? 'Contoh: Peringatan Kerentanan Baru pada AI Agent...' : 'Enter headline...'}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  {isId ? 'Rangkuman Singkat (Executive Summary) *' : 'Executive Summary *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={newPost.summary_id}
                  onChange={e => setNewPost(p => ({ ...p, summary_id: e.target.value, summary_en: e.target.value }))}
                  placeholder={isId ? 'Ringkasan 1-2 kalimat mengenai inti berita...' : '1-2 sentence summary...'}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  {isId ? 'Isi Pembahasan Lengkap (Mendukung Markdown)' : 'Full Breakdown Content (Markdown Supported)'}
                </label>
                <textarea
                  rows={5}
                  value={newPost.content_id}
                  onChange={e => setNewPost(p => ({ ...p, content_id: e.target.value, content_en: e.target.value }))}
                  placeholder={isId ? 'Tulis poin-poin analisis dan langkah mitigasi...' : 'Write detailed breakdown and mitigation steps...'}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    {isId ? 'Nama Sumber Referensi' : 'Source Publisher / Title'}
                  </label>
                  <input
                    type="text"
                    value={newPost.sourceTitle}
                    onChange={e => setNewPost(p => ({ ...p, sourceTitle: e.target.value, sourcePublisher: e.target.value }))}
                    placeholder="CISA / Cloudflare / The Hacker News"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                    {isId ? 'URL Sumber Referensi (https://...)' : 'Source Link URL (https://...)'}
                  </label>
                  <input
                    type="url"
                    value={newPost.sourceUrl}
                    onChange={e => setNewPost(p => ({ ...p, sourceUrl: e.target.value }))}
                    placeholder="https://thehackernews.com/..."
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                  {submitting ? (isId ? 'Menyimpan...' : 'Publishing...') : (isId ? 'Publikasikan Berita' : 'Publish Briefing')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileInstallModal open={showMobileModal} onClose={() => setShowMobileModal(false)} />
    </div>
  );
}
