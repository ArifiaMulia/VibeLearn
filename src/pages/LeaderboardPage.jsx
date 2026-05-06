import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Trophy, Zap, Medal, Crown, Star } from 'lucide-react';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { authFetch, user } = useAuth();
  const { t, lang } = useLanguage();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    // Fetch leaderboard — uses a public-safe endpoint, no admin required
    authFetch('/users/leaderboard')
      .then(data => {
        if (Array.isArray(data)) {
          setLeaders(data);
          const idx = data.findIndex(u => u.id === user?.id);
          if (idx >= 0) setMyRank(idx + 1);
        }
      })
      .catch(() => {
        // Fallback: show current user + placeholder entries
        setLeaders([
          { id: user?.id, name: user?.name || 'You', xp: 0, badges: 0, isMe: true },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  const label = (key) => ({
    title:    lang === 'id' ? 'Papan Peringkat Global' : 'Global Leaderboard',
    subtitle: lang === 'id' ? 'Para vibe coder terbaik di akademi.' : 'The top vibe coders in the academy.',
    rank:     lang === 'id' ? 'Peringkat kamu' : 'Your rank',
    xpLabel:  lang === 'id' ? 'XP Diperoleh' : 'XP Earned',
    badges:   lang === 'id' ? 'Lencana' : 'Badges',
    you:      lang === 'id' ? 'Kamu' : 'You',
    empty:    lang === 'id' ? 'Belum ada data leaderboard. Selesaikan pelajaran untuk masuk peringkat!' : 'No leaderboard data yet. Complete lessons to rank up!',
  }[key]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '3rem 1rem 1rem' }}>
        <Trophy size={56} color="var(--warning)" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.5))' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{label('title')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{label('subtitle')}</p>
      </div>

      {/* My rank card (if found) */}
      {myRank && myRank > 3 && (
        <div style={{
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 'var(--radius-md)', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <Star size={20} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {label('rank')}: <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>#{myRank}</strong>
          </span>
        </div>
      )}

      {/* Leaderboard list */}
      {leaders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {label('empty')}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {leaders.map((entry, i) => {
            const isTop3 = i < 3;
            const isMe = entry.id === user?.id || entry.isMe;
            return (
              <div key={entry.id || i} style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                padding: '1.25rem 2rem',
                borderBottom: i < leaders.length - 1 ? '1px solid var(--border-light)' : 'none',
                background: isMe
                  ? 'rgba(124,58,237,0.1)'
                  : isTop3
                    ? `rgba(245,158,11,0.0${3 - i})`
                    : 'transparent',
                transition: 'background 0.2s',
              }}>
                {/* Rank */}
                <div style={{ width: 44, textAlign: 'center', fontWeight: 800, fontSize: isTop3 ? '1.5rem' : '1.1rem', flexShrink: 0 }}>
                  {isTop3 ? RANK_MEDALS[i] : <span style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: isMe
                    ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                    : isTop3
                      ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                      : 'linear-gradient(135deg, var(--bg-card), var(--border-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1rem',
                  boxShadow: isTop3 ? '0 0 16px rgba(245,158,11,0.3)' : 'none',
                }}>
                  {entry.name?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Name + badges */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: '1rem',
                    color: isMe ? 'var(--primary)' : isTop3 ? 'var(--warning)' : 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    {entry.name}
                    {isMe && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{label('you')}</span>}
                    {i === 0 && <Crown size={14} color="var(--warning)" />}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Medal size={13} color="var(--success)" /> {entry.badges || 0} {label('badges')}
                    </span>
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Zap size={16} /> {(entry.xp || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label('xpLabel')}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
