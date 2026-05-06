import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Code2, Rocket, Play, Shield, CheckCircle, X, Building2, Users, Star, ArrowRight, Globe, Lock, Cpu } from 'lucide-react';

// ── Upgrade Modal ──────────────────────────────────────────────────────────
function UpgradeModal({ plan, onClose }) {
  const [step, setStep] = useState(1); // 1=biodata, 2=billing, 3=success
  const [form, setForm] = useState({ name:'', email:'', phone:'', company:'', role:'', team:'',
    card:'', expiry:'', cvv:'', billing_name:'', billing_address:'', billing_city:'', billing_zip:'', billing_country:'Indonesia' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const prices = { pro: 'Rp 450.000', enterprise: 'Custom' };
  const planLabel = plan === 'pro' ? 'Pro Plan' : 'Enterprise Plan';
  const isEnterprise = plan === 'enterprise';

  const handleNext = e => { e.preventDefault(); setStep(2); };
  const handlePay = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 1800);
  };

  const inputStyle = {
    width:'100%', background:'var(--bg-card)', border:'1px solid var(--border-light)',
    borderRadius:'var(--radius-sm)', padding:'0.6rem 0.9rem',
    color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box',
  };
  const labelStyle = { fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'0.3rem', display:'block', fontWeight:600 };
  const rowStyle = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:'var(--bg-surface)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:560,
        border:'1px solid var(--border-light)', boxShadow:'0 24px 64px rgba(0,0,0,0.5)', maxHeight:'90vh', overflow:'auto' }}>

        {/* Header */}
        <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:800, fontSize:'1.1rem' }}>Upgrade to {planLabel}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>
              {step === 1 ? 'Step 1/2 — Your Information' : step === 2 ? 'Step 2/2 — Payment Details' : 'You\'re all set!'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={20}/></button>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div style={{ height:3, background:'var(--border-light)' }}>
            <div style={{ height:'100%', width: step === 1 ? '50%' : '100%', background:'linear-gradient(90deg, var(--primary), var(--accent))', transition:'width 0.4s' }}/>
          </div>
        )}

        <div style={{ padding:'1.75rem' }}>
          {/* Step 1: Biodata */}
          {step === 1 && (
            <form onSubmit={handleNext} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div style={rowStyle}>
                <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} required value={form.name} onChange={set('name')} placeholder="John Doe"/></div>
                <div><label style={labelStyle}>Email *</label><input style={inputStyle} type="email" required value={form.email} onChange={set('email')} placeholder="you@company.com"/></div>
              </div>
              <div style={rowStyle}>
                <div><label style={labelStyle}>Phone Number</label><input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+62 812 3456 7890"/></div>
                <div><label style={labelStyle}>Company / Organization</label><input style={inputStyle} value={form.company} onChange={set('company')} placeholder="PT Example"/></div>
              </div>
              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Your Role</label>
                  <select style={inputStyle} value={form.role} onChange={set('role')}>
                    <option value="">Select role</option>
                    {['Developer','Team Lead','Engineering Manager','CTO','Founder','HR/L&D','Student','Other'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                {isEnterprise && (
                  <div><label style={labelStyle}>Team Size</label>
                    <select style={inputStyle} value={form.team} onChange={set('team')}>
                      <option value="">Select size</option>
                      {['5–10','11–25','26–50','51–100','100+'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {isEnterprise && (
                <div style={{ background:'rgba(6,182,212,0.07)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'var(--radius-sm)', padding:'1rem', fontSize:'0.83rem', color:'var(--text-muted)' }}>
                  🏢 Enterprise pricing is custom. After submission our team will contact you within 24 hours with a tailored quote.
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop:'0.5rem' }}>
                {isEnterprise ? 'Request Enterprise Quote' : 'Continue to Payment'} <ArrowRight size={16}/>
              </button>
            </form>
          )}

          {/* Step 2: Billing */}
          {step === 2 && !isEnterprise && (
            <form onSubmit={handlePay} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Plan summary */}
              <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'var(--radius-sm)', padding:'0.9rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700 }}>{planLabel}</span>
                <span style={{ fontWeight:800, color:'var(--primary)', fontSize:'1.1rem' }}>{prices[plan]}<span style={{ fontSize:'0.78rem', fontWeight:400, color:'var(--text-muted)' }}>/bulan</span></span>
              </div>
              <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Card Information</div>
              <div>
                <label style={labelStyle}>Card Number *</label>
                <input style={inputStyle} required maxLength={19} value={form.card} onChange={e => set('card')({target:{value:e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim()}})} placeholder="1234 5678 9012 3456"/>
              </div>
              <div style={rowStyle}>
                <div><label style={labelStyle}>Expiry (MM/YY) *</label><input style={inputStyle} required maxLength={5} value={form.expiry} onChange={set('expiry')} placeholder="12/27"/></div>
                <div><label style={labelStyle}>CVV *</label><input style={inputStyle} required maxLength={4} type="password" value={form.cvv} onChange={set('cvv')} placeholder="•••"/></div>
              </div>
              <div style={{ fontWeight:700, fontSize:'0.85rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:'0.25rem' }}>Billing Address</div>
              <div><label style={labelStyle}>Name on Card *</label><input style={inputStyle} required value={form.billing_name} onChange={set('billing_name')} placeholder="John Doe"/></div>
              <div><label style={labelStyle}>Address *</label><input style={inputStyle} required value={form.billing_address} onChange={set('billing_address')} placeholder="Jl. Sudirman No. 1"/></div>
              <div style={rowStyle}>
                <div><label style={labelStyle}>City *</label><input style={inputStyle} required value={form.billing_city} onChange={set('billing_city')} placeholder="Jakarta"/></div>
                <div><label style={labelStyle}>ZIP Code</label><input style={inputStyle} value={form.billing_zip} onChange={set('billing_zip')} placeholder="12345"/></div>
              </div>
              <div>
                <label style={labelStyle}>Country *</label>
                <select style={inputStyle} value={form.billing_country} onChange={set('billing_country')}>
                  {['Indonesia','Singapore','Malaysia','Philippines','Thailand','Vietnam','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.25rem' }}>
                <Lock size={13}/> Payments are secured with 256-bit SSL encryption
              </div>
              <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={loading}>
                  {loading ? <span className="animate-spin" style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }}/> : <>Pay {prices[plan]} <ArrowRight size={16}/></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div style={{ textAlign:'center', padding:'2rem 1rem' }}>
              <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>{isEnterprise ? '📋' : '🎉'}</div>
              <h2 style={{ marginBottom:'0.75rem' }}>{isEnterprise ? 'Request Received!' : 'Welcome to Pro!'}</h2>
              <p style={{ color:'var(--text-muted)', lineHeight:1.7, marginBottom:'2rem' }}>
                {isEnterprise
                  ? `Thank you ${form.name}! Our enterprise team will reach out to ${form.email} within 24 hours with a custom quote.`
                  : `Your ${planLabel} is now active. Check your email at ${form.email} for the receipt.`}
              </p>
              <button className="btn btn-primary btn-lg w-full" onClick={onClose}>
                {isEnterprise ? 'Got it!' : 'Start Learning →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Landing Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // null | 'pro' | 'enterprise'

  const features = [
    { icon: Code2, title: 'Interactive Labs', desc: 'Stop watching — start coding in real AI-assisted environments with guided challenges.' },
    { icon: Shield, title: 'Security-Aware', desc: 'Learn to spot vulnerabilities, prompt injections, and hallucinations in AI-generated code.' },
    { icon: Rocket, title: 'Gamified Progress', desc: 'Earn XP, unlock badges, and climb the global leaderboard as you master each module.' },
    { icon: Cpu, title: 'Prompt Engineering', desc: 'Master zero-shot, few-shot, and chain-of-thought techniques used by top AI engineers.' },
    { icon: Globe, title: 'Bilingual Content', desc: 'All courses available in English and Bahasa Indonesia with live-switching transcripts.' },
    { icon: Users, title: 'Community', desc: 'Ask instructors, discuss challenges, and share your builds with fellow vibe coders.' },
  ];

  const plans = [
    {
      id: 'free', label: 'Free', price: 'Rp 0', period: '', badge: null,
      color: 'var(--border-light)', highlight: false,
      features: ['1 Introductory Course', '2 Interactive Labs', 'Community Access', 'Bilingual Transcripts', 'XP & Leaderboard'],
      cta: 'Get Started', ctaAction: () => navigate('/login'),
    },
    {
      id: 'pro', label: 'Pro', price: 'Rp 450.000', period: '/mo', badge: 'Most Popular',
      color: 'var(--primary)', highlight: true,
      features: ['All 5 Premium Courses', 'Unlimited Lab Access', 'Security Scenarios', 'Priority AI Mentorship', 'Verified Certificates', 'Advanced Prompt Labs'],
      cta: 'Upgrade to Pro', ctaAction: () => setModal('pro'),
    },
    {
      id: 'enterprise', label: 'Enterprise', price: 'Custom', period: '', badge: 'For Teams',
      color: 'var(--accent)', highlight: false,
      features: ['Everything in Pro', 'Team Management Dashboard', 'Custom Course Builder', 'SSO / SAML Integration', 'SLA & Dedicated Support', 'Volume Pricing'],
      cta: 'Contact Sales', ctaAction: () => setModal('enterprise'),
    },
  ];

  const stats = [
    { value: '5+', label: 'Courses' }, { value: '20+', label: 'Labs' },
    { value: '2', label: 'Languages' }, { value: '∞', label: 'Possibilities' },
  ];

  return (
    <div style={{ background:'var(--bg-base)', minHeight:'100vh', color:'var(--text-primary)', fontFamily:'var(--font-sans, system-ui)' }}>
      {modal && <UpgradeModal plan={modal} onClose={() => setModal(null)} />}

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
            <p style={{ color:'var(--text-muted)' }}>Start for free. Scale when your team is ready.</p>
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
