import { useNavigate } from 'react-router-dom';
import { Zap, Code2, Rocket, Play, Shield, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 5%', borderBottom: '1px solid var(--border-light)', background: 'rgba(7,7,26,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>VibeLearn</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '6rem 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div className="badge badge-accent" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>✨ The #1 Platform for Vibe Coding</div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Learn to Build Software <br/>
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>At The Speed of Thought.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            Master AI-assisted coding through interactive labs, real-world simulations, and a gamified curriculum designed for modern developers.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}><Play size={18} /> Start Learning Free</button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}><Code2 size={18} /> View Curriculum</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 5%', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why VibeLearn?</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to master AI coding tools and techniques.</p>
          </div>
          
          <div className="grid-3">
            {[
              { icon: Code2, title: 'Interactive Labs', desc: 'Stop watching videos. Start coding in our simulated environments.' },
              { icon: Shield, title: 'Secure Coding', desc: 'Learn to spot and fix vulnerabilities introduced by AI code generators.' },
              { icon: Rocket, title: 'Gamified Progress', desc: 'Earn XP, unlock badges, and climb the global leaderboard as you learn.' }
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                  <f.icon size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '5rem 5%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Simple Pricing</h2>
            <p style={{ color: 'var(--text-muted)' }}>Start for free, upgrade when you're ready to master the craft.</p>
          </div>

          <div className="grid-2" style={{ alignItems: 'center', gap: '2rem' }}>
            <div className="card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Free Plan</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>$0</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Basic Prompting Course', '2 Interactive Labs', 'Community Access'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle size={18} color="var(--success)" /> {f}</li>
                ))}
              </ul>
              <button className="btn btn-ghost btn-lg w-full" onClick={() => navigate('/login')}>Get Started</button>
            </div>

            <div className="card" style={{ padding: '3rem', border: '2px solid var(--primary)', background: 'linear-gradient(180deg, rgba(124,58,237,0.05), transparent)', transform: 'scale(1.05)' }}>
              <div className="badge badge-primary" style={{ marginBottom: '1rem' }}>Most Popular</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pro Plan</h3>
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>$29<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['All Premium Courses', 'Unlimited Lab Access', 'Advanced Security Scenarios', 'Priority AI Mentorship', 'Verified Badges'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><CheckCircle size={18} color="var(--primary)" /> {f}</li>
                ))}
              </ul>
              <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/login')}>Upgrade to Pro</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
