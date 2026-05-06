import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Zap, Trophy, ArrowRight, X, Star, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon: '🎉',
    title: 'Welcome to Promptara!',
    subtitle: 'Your AI Coding Academy',
    body: 'Promptara is where you learn to build real software using AI as your coding partner. No prior experience needed — just curiosity and a willingness to vibe!',
    visual: (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['🤖 AI Tools', '⚡ Prompt Mastery', '🛡️ Secure Coding', '🚀 Ship Apps'].map(t => (
          <span key={t} style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>{t}</span>
        ))}
      </div>
    ),
  },
  {
    icon: '🗺️',
    title: 'How It Works',
    subtitle: 'Learn in 4 simple steps',
    body: null,
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        {[
          { icon: BookOpen, color: 'var(--accent)', label: '1. Enroll', desc: 'Pick a course and click Enroll Now' },
          { icon: Star, color: 'var(--warning)', label: '2. Learn', desc: 'Watch videos, read guides, and try quizzes' },
          { icon: CheckCircle, color: 'var(--success)', label: '3. Complete', desc: 'Finish lessons at your own pace' },
          { icon: Zap, color: 'var(--primary)', label: '4. Earn XP', desc: 'Level up and unlock badges' },
        ].map(({ icon: Icon, color, label, desc }) => (
          <div key={label} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color={color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: '⚡',
    title: 'XP & Levels Explained',
    subtitle: 'Your progress, gamified',
    body: null,
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          {[
            { emoji: '📚', label: 'Complete Lesson', xp: '+50 XP' },
            { emoji: '✅', label: 'Pass a Quiz', xp: '+100 XP' },
            { emoji: '🧪', label: 'Finish a Lab', xp: '+150 XP' },
            { emoji: '🏅', label: 'Complete Course', xp: '+500 XP' },
          ].map(({ emoji, label, xp }) => (
            <div key={label} style={{ padding: '0.65rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem' }}>{emoji}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', marginTop: '0.15rem' }}>{xp}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', border: '1px solid rgba(124,58,237,0.15)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.4rem' }}>🏆 Level Milestones</div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>🌱 0–499 XP: Beginner</span>
            <span>🔥 500–999 XP: Explorer</span>
            <span>🚀 1000+ XP: Vibe Coder</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: '🚀',
    title: "You're All Set!",
    subtitle: 'Time to start your first lesson',
    body: 'Browse the course catalog, enroll in any course that interests you, and complete your first lesson today. Your journey to becoming a Vibe Coder starts now!',
    visual: (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 0 40px var(--primary-glow)' }}>🚀</div>
      </div>
    ),
  },
];

export default function OnboardingModal() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `vl_onboarded_${user.id}`;
    if (!localStorage.getItem(key)) setShow(true);
  }, [user]);

  const handleDone = () => {
    localStorage.setItem(`vl_onboarded_${user.id}`, '1');
    setShow(false);
  };

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)',
        padding: '2rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem',
        boxShadow: '0 0 60px rgba(124,58,237,0.2)',
        animation: 'fadeInUp 0.3s ease',
      }}>
        {/* Skip */}
        <button onClick={handleDone} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height: 4, width: i === step ? 24 : 8, borderRadius: 2, background: i === step ? 'var(--primary)' : 'var(--border-light)', transition: 'all 0.3s ease', cursor: 'pointer' }} onClick={() => setStep(i)} />
          ))}
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{current.icon}</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{current.title}</h2>
          <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{current.subtitle}</p>
        </div>

        {/* Visual */}
        {current.visual}

        {/* Body text */}
        {current.body && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>{current.body}</p>}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary" style={{ flex: 1 }}>← Back</button>
          )}
          <button
            onClick={isLast ? handleDone : () => setStep(s => s + 1)}
            className="btn btn-primary"
            style={{ flex: 2, fontWeight: 700 }}
          >
            {isLast ? '🚀 Start Learning!' : <>Next <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
