import { Star, Trophy, Zap, Shield, Target, Flame } from 'lucide-react';

const ICON_MAP = {
  streak: Flame,
  completion: Trophy,
  speed: Zap,
  security: Shield,
  mastery: Star,
  default: Target
};

export default function BadgesGrid({ badges = [] }) {
  if (badges.length === 0) {
    return (
      <div className="text-center p-3">
        <p className="text-muted text-sm">No badges earned yet. Keep learning! 🚀</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
      {badges.map((badge, i) => {
        const Icon = ICON_MAP[badge.type] || ICON_MAP.default;
        return (
          <div key={i} className="badge-item">
            <div className="badge-icon-wrap" style={{ 
              background: badge.earned ? 'var(--primary-glow)' : 'var(--bg-card)',
              color: badge.earned ? 'var(--primary-light)' : 'var(--text-muted)',
              opacity: badge.earned ? 1 : 0.4
            }}>
              <Icon size={24} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
              {badge.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
