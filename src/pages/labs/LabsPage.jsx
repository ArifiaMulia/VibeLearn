import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FlaskConical, Play, Shield, Terminal, Zap, Clock, ArrowUpDown } from 'lucide-react';

const LAB_ICONS = {
  prompt: Terminal,
  code: FlaskConical,
  security: Shield,
  build: Zap,
  speedrun: Clock
};

const DIFF_ORDER = { beginner: 1, intermediate: 2, advanced: 3 };

export default function LabsPage() {
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('vl_labs_sort') || 'default';
  });

  useEffect(() => {
    localStorage.setItem('vl_labs_sort', sortBy);
  }, [sortBy]);

  useEffect(() => {
    authFetch('/labs').then(setLabs).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />)}</div>;

  const sortedLabs = [...labs].sort((a, b) => {
    if (sortBy === 'diff-asc') return (DIFF_ORDER[a.difficulty] || 0) - (DIFF_ORDER[b.difficulty] || 0);
    if (sortBy === 'diff-desc') return (DIFF_ORDER[b.difficulty] || 0) - (DIFF_ORDER[a.difficulty] || 0);
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(124,58,237,0.1))', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
        <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FlaskConical size={32} color="var(--accent)" /> Vibe Coding Labs
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600 }}>
          Interactive environments to test your prompt engineering, debug AI-generated code, and practice secure vibe coding. Complete labs to earn massive XP.
        </p>
      </div>

      {/* Sorting Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '-0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <ArrowUpDown size={14} /> {t('sort_by_level')}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { key: 'default', label: t('sort_default') },
            { key: 'diff-asc', label: t('sort_beginner_first') },
            { key: 'diff-desc', label: t('sort_advanced_first') }
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`btn btn-sm ${sortBy === opt.key ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        {sortedLabs.map(lab => {
          const Icon = LAB_ICONS[lab.type] || FlaskConical;
          const isLocked = user?.plan === 'free' && lab.difficulty !== 'beginner';
          
          return (
            <div key={lab.id} className="card" style={{ display: 'flex', flexDirection: 'column', opacity: isLocked ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                  <Icon size={24} color={isLocked ? 'var(--text-muted)' : 'var(--accent)'} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {lab.completed && <span className="badge badge-success">✓ Completed</span>}
                  <span className={`badge diff-${lab.difficulty}`}>{lab.difficulty}</span>
                  <span className="badge badge-accent"><Zap size={10} /> {lab.xp_reward}</span>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{lab.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>{lab.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {lab.total_attempts} attempts • Avg {Math.round(lab.avg_score || 0)}%
                </div>
                {isLocked ? (
                  <button className="btn btn-sm btn-ghost" disabled>Pro Only</button>
                ) : lab.completed ? (
                  <button 
                    className="btn btn-sm btn-ghost" 
                    onClick={() => navigate(`/labs/${lab.id}`)}
                    style={{
                      borderColor: 'var(--success)',
                      color: 'var(--success)',
                      background: 'rgba(16,185,129,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--success)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.05)';
                      e.currentTarget.style.color = 'var(--success)';
                    }}
                  >
                    ✓ Completed
                  </button>
                ) : (
                  <button 
                    className="btn btn-sm btn-accent" 
                    onClick={() => navigate(`/labs/${lab.id}`)}
                  >
                    <Play size={14} /> Start Lab
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
