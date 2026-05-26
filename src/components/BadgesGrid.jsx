import { Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function BadgesGrid({ badges = [] }) {
  const { t } = useLanguage();

  if (badges.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No badges earned yet. Keep learning! 🚀</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem' }}>
      {badges.map((badge, i) => {
        const borderCol = badge.earned ? badge.color || 'var(--primary)' : 'var(--border-light)';
        const shadow = badge.earned ? `0 0 15px ${borderCol}25` : 'none';
        
        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            background: 'var(--bg-card)', border: `1px solid ${borderCol}`,
            borderRadius: 'var(--radius-md)', padding: '1.25rem 0.75rem',
            boxShadow: shadow, opacity: badge.earned ? 1 : 0.5,
            transition: 'all 0.2s', position: 'relative'
          }}
            onMouseEnter={e => {
              if (badge.earned) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 0 25px ${borderCol}45`;
              }
            }}
            onMouseLeave={e => {
              if (badge.earned) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = shadow;
              }
            }}
          >
            {/* Badge Icon wrap */}
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: badge.earned ? `${borderCol}15` : 'var(--bg-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', marginBottom: '0.25rem', position: 'relative'
            }}>
              {badge.icon}
              {!badge.earned && (
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', color: 'var(--text-muted)'
                }}>
                  <Lock size={10} />
                </div>
              )}
            </div>
            
            {/* Badge Name */}
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
              {badge.name}
            </span>
            
            {/* Badge Condition */}
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, marginTop: '0.15rem' }}>
              {badge.condition}
            </span>
          </div>
        );
      })}
    </div>
  );
}
