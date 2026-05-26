import { useState } from 'react';
import { X, ArrowRight, Lock, Check, Copy, CreditCard, Building2, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';

// Helper to render inline pixelated QR code
function MockQRCode() {
  return (
    <svg width="150" height="150" viewBox="0 0 29 29" style={{ border: '4px solid white', background: 'white', padding: 4, borderRadius: 6 }}>
      <path d="M0 0h7v7H0zm1 1v5h5V1zm10 0h1v1h-1zm1 1h1v1h-1zm-2 1h1v1h-1zm3 0h1v1h-1zm-2 1h1v1h-1zm2 0h1v1h-1zm-1 1h1v1h-1zm2 0h1v1h-1zm6-5h7v7h-7zm1 1v5h5V1zm-7 7h1v1h-1zm1 1h1v1h-1zm-2 1h1v1h-1zm4 0h1v1h-1zm-2 1h1v1h-1zm2 0h1v1h-1zm-1 1h1v1h-1zm2 0h1v1h-1zm-9 3h1v1h-1zm1 1h1v1h-1zm-2 1h1v1h-1zm3 0h1v1h-1zm-2 1h1v1h-1zm2 0h1v1h-1zm-1 1h1v1h-1zm2 0h1v1h-1zm10-5h1v1h-1zm1 1h1v1h-1zm-2 1h1v1h-1zm3 0h1v1h-1zm-2 1h1v1h-1zm2 0h1v1h-1zm-1 1h1v1h-1zm2 0h1v1h-1z" fill="#000"/>
      <rect x="0" y="0" width="7" height="7" fill="black"/>
      <rect x="1" y="1" width="5" height="5" fill="white"/>
      <rect x="2" y="2" width="3" height="3" fill="black"/>
      <rect x="22" y="0" width="7" height="7" fill="black"/>
      <rect x="23" y="1" width="5" height="5" fill="white"/>
      <rect x="24" y="2" width="3" height="3" fill="black"/>
      <rect x="0" y="22" width="7" height="7" fill="black"/>
      <rect x="1" y="23" width="5" height="5" fill="white"/>
      <rect x="2" y="24" width="3" height="3" fill="black"/>
    </svg>
  );
}

export default function UpgradeModal({ planId, plansData, onClose }) {
  const { user, upgradePlanClientSide } = useAuth();
  const { success, error } = useAlert();
  const [step, setStep] = useState(1); // 1 = Biodata/Confirmation, 2 = Payment Channel / SNAP overlay, 3 = Success
  const [payMethod, setPayMethod] = useState('card'); // 'card', 'bank', 'qris'
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    role: '',
    cardNum: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: 'BCA'
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const planObj = plansData?.find(p => p.id === planId) || { label: 'Pro', price: 'Rp 450.000' };
  const isEnterprise = planId === 'enterprise';
  const priceDisplay = isEnterprise ? 'Custom' : (planObj.price || 'Rp 450.000');

  const handleNext = (e) => {
    e.preventDefault();
    if (isEnterprise) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 1500);
    } else {
      setStep(2);
    }
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText('89273081234567890');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Virtual Account number copied!');
  };

  const handleSimulatePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      upgradePlanClientSide('pro'); // Upgrade locally
      setStep(3);
      success('Subscription activated successfully!');
    }, 1800);
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem',
    color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block', fontWeight: 600 };
  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: step === 2 ? 680 : 540,
        border: '1px solid var(--border-light)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', maxHeight: '95vh', overflow: 'auto', display: 'flex', flexDirection: 'column', transition: 'max-width 0.3s ease' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              {isEnterprise ? 'Request Enterprise Quote' : `Upgrade to ${planObj.label || 'Pro'} Plan`}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {step === 1 ? 'Step 1/2 — Contact Details' : step === 2 ? 'Step 2/2 — Secure Midtrans Checkout' : 'All set!'}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ minWidth: 'auto', padding: '0.25rem' }}><X size={18}/></button>
        </div>

        {/* Progress Bar */}
        {step < 3 && (
          <div style={{ height: 3, background: 'var(--border-light)' }}>
            <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.4s' }}/>
          </div>
        )}

        <div style={{ padding: '1.5rem' }}>
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={rowStyle}>
                <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe"/></div>
                <div><label style={labelStyle}>Email Address *</label><input style={inputStyle} type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com"/></div>
              </div>
              <div style={rowStyle}>
                <div><label style={labelStyle}>Phone Number *</label><input style={inputStyle} required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+62 812 3456 7890"/></div>
                <div><label style={labelStyle}>Company Name</label><input style={inputStyle} value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="PT Vibe Digital"/></div>
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select style={inputStyle} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="">Select your role</option>
                  {['Developer','Team Lead','Engineering Manager','Student','Other'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {isEnterprise && (
                <div style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  🏢 Enterprise accounts support larger development teams. Clicking request below submits your query, and our accounts manager will reach out within 24 hours.
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Submitting...' : isEnterprise ? 'Request Quote' : 'Proceed to Payment'} <ArrowRight size={16}/>
              </button>
            </form>
          )}

          {/* Step 2: Midtrans Snap Overlay Simulation */}
          {step === 2 && !isEnterprise && (
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', minHeight: 320 }}>
              {/* Payment Methods sidebar */}
              <div style={{ borderRight: '1px solid var(--border-light)', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Method</div>
                
                <button type="button" onClick={() => setPayMethod('card')} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.6rem 0.8rem',
                  background: payMethod === 'card' ? 'var(--primary-glow)' : 'transparent',
                  border: `1px solid ${payMethod === 'card' ? 'var(--primary)' : 'var(--border-light)'}`,
                  color: payMethod === 'card' ? 'var(--primary-light)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem'
                }}>
                  <CreditCard size={16}/> Credit / Debit Card
                </button>

                <button type="button" onClick={() => setPayMethod('bank')} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.6rem 0.8rem',
                  background: payMethod === 'bank' ? 'var(--primary-glow)' : 'transparent',
                  border: `1px solid ${payMethod === 'bank' ? 'var(--primary)' : 'var(--border-light)'}`,
                  color: payMethod === 'bank' ? 'var(--primary-light)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem'
                }}>
                  <Building2 size={16}/> Bank Transfer (VA)
                </button>

                <button type="button" onClick={() => setPayMethod('qris')} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.6rem 0.8rem',
                  background: payMethod === 'qris' ? 'var(--primary-glow)' : 'transparent',
                  border: `1px solid ${payMethod === 'qris' ? 'var(--primary)' : 'var(--border-light)'}`,
                  color: payMethod === 'qris' ? 'var(--primary-light)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem'
                }}>
                  <QrCode size={16}/> E-Wallet / QRIS
                </button>

                <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount to Pay</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1rem', marginTop: '0.1rem' }}>{priceDisplay}</div>
                </div>
              </div>

              {/* Payment Details right panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                {payMethod === 'card' && (
                  <form onSubmit={e => { e.preventDefault(); handleSimulatePayment(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Card Payment Detail</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>🔒 256-bit SSL</span>
                    </div>
                    <div>
                      <label style={labelStyle}>Card Number *</label>
                      <input style={inputStyle} required maxLength={19} value={form.cardNum} 
                        onChange={e => setForm({...form, cardNum: e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim()})} 
                        placeholder="4123 4567 8901 2345"/>
                    </div>
                    <div style={rowStyle}>
                      <div>
                        <label style={labelStyle}>Expiry Date *</label>
                        <input style={inputStyle} required maxLength={5} value={form.cardExpiry} 
                          onChange={e => setForm({...form, cardExpiry: e.target.value})} 
                          placeholder="12/28"/>
                      </div>
                      <div>
                        <label style={labelStyle}>CVV Code *</label>
                        <input style={inputStyle} required maxLength={4} type="password" value={form.cardCvv} 
                          onChange={e => setForm({...form, cardCvv: e.target.value})} 
                          placeholder="•••"/>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
                      {loading ? 'Processing Securely...' : `Pay ${priceDisplay}`}
                    </button>
                  </form>
                )}

                {payMethod === 'bank' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Bank Virtual Account</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['BCA', 'Mandiri', 'BNI'].map(b => (
                        <button key={b} type="button" onClick={() => setForm({...form, bankName: b})} style={{
                          flex: 1, padding: '0.4rem', border: `1px solid ${form.bankName === b ? 'var(--accent)' : 'var(--border-light)'}`,
                          background: form.bankName === b ? 'var(--accent-glow)' : 'transparent', color: form.bankName === b ? 'var(--accent-light)' : 'var(--text-secondary)',
                          fontSize: '0.78rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer'
                        }}>{b} Transfer</button>
                      ))}
                    </div>
                    
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '0.9rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{form.bankName} Virtual Account Number</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                          89273 0812 3456 7890
                        </span>
                        <button type="button" onClick={handleCopyVA} style={{
                          background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600
                        }}>
                          {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      1. Go to your Banking app.<br/>
                      2. Choose <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.<br/>
                      3. Paste the account number and proceed with transfer.
                    </div>
                    <button type="button" className="btn btn-primary" onClick={handleSimulatePayment} disabled={loading} style={{ justifyContent: 'center' }}>
                      {loading ? 'Verifying payment...' : 'Simulate Payment Completion'}
                    </button>
                  </div>
                )}

                {payMethod === 'qris' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
                    <div style={{ width: '100%', textAlign: 'left', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>QRIS GoPay / OVO</span>
                    </div>
                    
                    <MockQRCode />

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Scan the QR Code with GoPay, ShopeePay, OVO, LinkAja, or any local bank app to pay.
                    </div>
                    <button type="button" className="btn btn-primary w-full" onClick={handleSimulatePayment} disabled={loading} style={{ justifyContent: 'center' }}>
                      {loading ? 'Confirming receipt...' : 'Simulate Payment Completion'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{isEnterprise ? '📨' : '🎉'}</div>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.35rem' }}>
                {isEnterprise ? 'Request Sent Successfully!' : 'Welcome to Promptara Pro!'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 1.5rem' }}>
                {isEnterprise
                  ? `Thanks, ${form.name}. Our enterprise coordination team will review your organization details (${form.company || 'N/A'}) and contact you at ${form.email} shortly.`
                  : `Hooray, ${form.name}! Your account has been upgraded. You now have unlimited access to all courses, certification modules, and secure sandbox coding labs.`}
              </p>
              <button type="button" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={onClose}>
                {isEnterprise ? 'Done' : 'Start Learning Now →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
