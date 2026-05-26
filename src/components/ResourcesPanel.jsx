import { useState } from 'react';
import { ExternalLink, FileText, Github, BookOpen, Download, ChevronDown, ChevronUp, Link2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TYPE_CONFIG = {
  docs:      { icon: BookOpen,    color: 'var(--accent)',   label: 'Docs' },
  repo:      { icon: Github,      color: 'var(--text-muted)', label: 'Repository' },
  cheatsheet:{ icon: FileText,    color: 'var(--warning)',  label: 'Cheatsheet' },
  article:   { icon: Link2,       color: 'var(--primary)',  label: 'Article' },
  download:  { icon: Download,    color: 'var(--success)',  label: 'Download' },
};

// Default resources by lesson type when no specific resources are provided
const DEFAULT_RESOURCES = {
  text: [
    { type: 'docs',   label: 'MDN Web Docs',           url: 'https://developer.mozilla.org' },
    { type: 'article',label: 'AI Coding Best Practices',url: 'https://github.com/features/copilot' },
  ],
  video: [
    { type: 'docs',   label: 'Course Companion Notes',  url: '#' },
    { type: 'cheatsheet', label: 'Lesson Cheatsheet',   url: '#' },
  ],
  quiz: [
    { type: 'docs',   label: 'Review the Lesson Content', url: '#' },
    { type: 'article',label: 'Quiz Strategies for Beginners', url: 'https://en.wikipedia.org/wiki/Test-taking_strategies' },
  ],
};

export default function ResourcesPanel({ resources, lessonType }) {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const items = (resources && resources.length > 0)
    ? resources
    : DEFAULT_RESOURCES[lessonType] || DEFAULT_RESOURCES.text;

  const label = lang === 'id' ? 'Sumber Daya Belajar' : 'Learning Resources';
  const sublabel = lang === 'id' ? 'Referensi & tautan berguna' : 'References & useful links';

  return (
    <div style={{
      border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
      overflow: 'hidden', background: 'var(--bg-card)',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', padding: '0.85rem 1.1rem', background: 'none',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem',
          color: 'var(--text-primary)',
        }}
      >
        <BookOpen size={16} color="var(--accent)" />
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{label}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{items.length} {sublabel}</div>
        </div>
        {open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border-light)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {items.map((res, i) => {
            const cfg = TYPE_CONFIG[res.type] || TYPE_CONFIG.article;
            const Icon = cfg.icon;
            const isExternal = res.url && res.url !== '#';
            return (
              <a
                key={i}
                href={isExternal ? res.url : undefined}
                target={isExternal ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={!isExternal ? e => e.preventDefault() : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none', color: 'var(--text-secondary)',
                  background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                  transition: 'all 0.15s', cursor: isExternal ? 'pointer' : 'not-allowed', opacity: isExternal ? 1 : 0.5,
                }}
                onMouseEnter={e => { if (isExternal) { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 7, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t(res.label)}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t(cfg.label)}</div>
                </div>
                {isExternal && <ExternalLink size={12} color="var(--text-muted)" />}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
