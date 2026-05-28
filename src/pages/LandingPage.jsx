import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Code2, Rocket, Play, Shield, CheckCircle, X, Building2, Users, Star, ArrowRight, Globe, Lock, Cpu } from 'lucide-react';
import UpgradeModal from '../components/UpgradeModal';

// ── Main Landing Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // null | 'pro' | 'enterprise'
  const [apiPlans, setApiPlans] = useState([]);
  const [currency, setCurrency] = useState('IDR');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || '/api'}/subscriptions/plans`)
      .then(res => res.json())
      .then(setApiPlans)
      .catch(err => console.error('Failed to load plans:', err));
  }, []);

  const features = [
    { icon: Code2, title: 'Interactive Labs', desc: 'Stop watching — start coding in real AI-assisted environments with guided challenges.' },
    { icon: Shield, title: 'Security-Aware', desc: 'Learn to spot vulnerabilities, prompt injections, and hallucinations in AI-generated code.' },
    { icon: Rocket, title: 'Gamified Progress', desc: 'Earn XP, unlock badges, and climb the global leaderboard as you master each module.' },
    { icon: Cpu, title: 'Prompt Engineering', desc: 'Master zero-shot, few-shot, and chain-of-thought techniques used by top AI engineers.' },
    { icon: Globe, title: 'Bilingual Content', desc: 'All courses available in English and Bahasa Indonesia with live-switching transcripts.' },
    { icon: Users, title: 'Community', desc: 'Ask instructors, discuss challenges, and share your builds with fellow vibe coders.' },
  ];

  // Base plans structure with UI config
  const uiPlansConfig = {
    free: { label: 'Free', badge: null, color: 'var(--border-light)', highlight: false, cta: 'Get Started', ctaAction: () => navigate('/login') },
    pro: { label: 'Pro', badge: 'Most Popular', color: 'var(--primary)', highlight: true, cta: 'Upgrade to Pro', ctaAction: () => setModal('pro') },
    enterprise: { label: 'Enterprise', badge: 'For Teams', color: 'var(--accent)', highlight: false, cta: 'Contact Sales', ctaAction: () => setModal('enterprise') }
  };

  const plans = apiPlans.map(p => {
    const config = uiPlansConfig[p.id] || uiPlansConfig.free;
    const priceStr = currency === 'IDR' ? (p.price_idr === 0 ? 'Rp 0' : `Rp ${p.price_idr.toLocaleString('id-ID')}`) : (p.price_usd === 0 ? '$0' : `$${p.price_usd}`);
    const periodStr = p.id === 'free' || p.id === 'enterprise' ? '' : '/mo';
    return {
      id: p.id,
      label: config.label,
      price: priceStr,
      period: periodStr,
      badge: config.badge,
      color: config.color,
      highlight: config.highlight,
      features: p.features || [],
      cta: config.cta,
      ctaAction: config.ctaAction
    };
  });

  const stats = [
    { value: '5+', label: 'Courses' }, { value: '20+', label: 'Labs' },
    { value: '2', label: 'Languages' }, { value: '∞', label: 'Possibilities' },
  ];

  return (
    <div style={{ background:'var(--bg-base)', minHeight:'100vh', color:'var(--text-primary)', fontFamily:'var(--font-sans, system-ui)' }}>
      {modal && <UpgradeModal planId={modal} plansData={plans} onClose={() => setModal(null)} />}

      {/* Nav */}
      <nav style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 5%', borderBottom:'1px solid var(--border-light)', background:'rgba(7,7,26,0.85)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <img src="/logo.png" alt="Promptara" style={{ width:36, height:36, borderRadius:10, objectFit:'cover', boxShadow:'0 0 16px var(--primary-glow)' }} />
          <span style={{ fontWeight:800, fontSize:'1.2rem' }}>Promptara</span>
          <span style={{ fontSize:'0.7rem', color:'var(--accent)', fontWeight:600 }}>AI Coding Academy</span>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <a href="#pricing" style={{ fontSize:'0.85rem', color:'var(--text-muted)', textDecoration:'none', padding:'0.4rem 0.75rem' }}
            onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--text-muted)'}>
            Pricing
          </a>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'7rem 5% 5rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'80vw', height:'80vw', background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 60%)', zIndex:0, pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:820, margin:'0 auto' }}>
          <div className="badge badge-accent" style={{ marginBottom:'1.5rem', display:'inline-flex', gap:'0.4rem' }}>
            <Star size={13}/> The #1 Platform for Vibe Coding in Indonesia
          </div>
          <h1 style={{ fontSize:'3.5rem', fontWeight:900, lineHeight:1.1, marginBottom:'1.5rem' }}>
            Learn to Build Software<br/>
            <span style={{ background:'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              At The Speed of Thought.
            </span>
          </h1>
          <p style={{ fontSize:'1.15rem', color:'var(--text-muted)', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:600, margin:'0 auto 2.5rem' }}>
            Master AI-assisted coding through interactive labs, real-world simulations, and a gamified bilingual curriculum for modern developers.
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}><Play size={18}/> Start Learning Free</button>
            <button className="btn btn-ghost btn-lg" onClick={() => setModal('pro')}><Zap size={18}/> Upgrade to Pro</button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding:'2rem 5%', background:'var(--bg-surface)', borderTop:'1px solid var(--border-light)', borderBottom:'1px solid var(--border-light)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', textAlign:'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize:'2.2rem', fontWeight:900, background:'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.value}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'5rem 5%' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <h2 style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>Why Promptara?</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'1.05rem' }}>Everything you need to master AI coding tools and ship real products.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding:'2rem', transition:'transform 0.2s, box-shadow 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(124,58,237,0.15)'; }}
                onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ width:52, height:52, borderRadius:14, background:'rgba(124,58,237,0.12)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem', color:'var(--primary)' }}>
                  <f.icon size={26}/>
                </div>
                <h3 style={{ fontSize:'1.1rem', marginBottom:'0.6rem' }}>{f.title}</h3>
                <p style={{ color:'var(--text-muted)', lineHeight:1.65, fontSize:'0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding:'5rem 5%', background:'var(--bg-surface)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <h2 style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>Simple, Transparent Pricing</h2>
            <p style={{ color:'var(--text-muted)', marginBottom: '1.5rem' }}>Start for free. Scale when your team is ready.</p>
            
            <div style={{ display: 'inline-flex', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
              <button 
                onClick={() => setCurrency('IDR')}
                style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', border: 'none', background: currency === 'IDR' ? 'var(--primary)' : 'transparent', color: currency === 'IDR' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                IDR
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', border: 'none', background: currency === 'USD' ? 'var(--primary)' : 'transparent', color: currency === 'USD' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                USD
              </button>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', alignItems:'center' }}>
            {plans.map(p => (
              <div key={p.id} className="card" style={{
                padding: p.highlight ? '3rem 2rem' : '2.5rem 2rem',
                border: `2px solid ${p.highlight ? p.color : 'var(--border-light)'}`,
                background: p.highlight ? 'linear-gradient(180deg, rgba(124,58,237,0.07), transparent)' : undefined,
                transform: p.highlight ? 'scale(1.04)' : undefined,
                position:'relative', overflow:'hidden',
                transition:'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseOver={e => { if(!p.highlight) { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=p.color; }}}
                onMouseOut={e => { if(!p.highlight) { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border-light)'; }}}
              >
                {p.highlight && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, var(--primary), var(--accent))' }}/>}
                {p.badge && (
                  <div style={{ marginBottom:'0.75rem' }}>
                    <span style={{ fontSize:'0.7rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:20, background:`${p.color}20`, color:p.color, border:`1px solid ${p.color}40`, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      {p.badge}
                    </span>
                  </div>
                )}
                <h3 style={{ fontSize:'1.4rem', marginBottom:'0.4rem' }}>{p.label}</h3>
                <div style={{ fontSize:'2.5rem', fontWeight:900, marginBottom:'0.25rem', color: p.highlight ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {p.price}<span style={{ fontSize:'1rem', color:'var(--text-muted)', fontWeight:400 }}>{p.period}</span>
                </div>
                <div style={{ height:1, background:'var(--border-light)', margin:'1.5rem 0' }}/>
                <ul style={{ listStyle:'none', padding:0, margin:'0 0 2rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ display:'flex', alignItems:'center', gap:'0.65rem', fontSize:'0.88rem' }}>
                      <CheckCircle size={16} color={p.color === 'var(--border-light)' ? 'var(--success)' : p.color} style={{ flexShrink:0 }}/> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn btn-lg w-full ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={p.ctaAction}
                  style={{ borderColor: !p.highlight ? p.color : undefined, color: (!p.highlight && p.color !== 'var(--border-light)') ? p.color : undefined }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:'2.5rem 5%', borderTop:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <img src="/logo.png" alt="Promptara" style={{ width:28, height:28, borderRadius:8, objectFit:'cover' }} />
          <span style={{ fontWeight:700 }}>Promptara</span>
        </div>
        <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', textAlign:'center' }}>
          © 2026 Promptara. All rights reserved. |{' '}
          <a href="https://virtuenet.id" target="_blank" rel="noopener noreferrer"
            style={{ color:'var(--accent)', textDecoration:'none' }}>Virtuenet.id</a>{' '}
          powered by Prasetia Dwidharma
        </div>
        <div style={{ display:'flex', gap:'1.5rem' }}>
          {['Privacy','Terms','Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize:'0.8rem', color:'var(--text-muted)', textDecoration:'none' }}
              onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color='var(--text-muted)'}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
