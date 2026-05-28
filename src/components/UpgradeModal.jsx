import { useState, useEffect } from 'react';
import { X, ArrowRight, Lock, Check, Copy, CreditCard, Building2, QrCode, Upload, RefreshCw } from 'lucide-react';
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

const TERMS = [
  { key: 'monthly', label: 'Monthly', discount: 0, months: 1 },
  { key: '1_year', label: '1 Year (10% Off)', discount: 10, months: 12 },
  { key: '2_years', label: '2 Years (25% Off)', discount: 25, months: 24 },
  { key: '3_years', label: '3 Years (40% Off)', discount: 40, months: 36 }
];

export default function UpgradeModal({ planId, plansData, onClose }) {
  const { user, authFetch } = useAuth();
  const { success, error, info } = useAlert();
  
  // Checkout States
  const [step, setStep] = useState(1); // 1 = Biodata/Confirmation, 2 = Payment Channel, 3 = Success
  const [payMethod, setPayMethod] = useState('card'); // 'card', 'bank', 'qris', 'manual'
  const [billingTerm, setBillingTerm] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Pending verification checks
  const [hasPending, setHasPending] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    role: '',
    cardNum: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: 'BCA',
    manualBankName: 'BCA',
    manualSenderName: ''
  });

  // Load plans data and check for pending payments
  useEffect(() => {
    setLoading(true);
    authFetch('/subscriptions/pending')
      .then(res => {
        if (res && res.pending) {
          setHasPending(true);
          setPendingVerification(res.verification);
        }
      })
      .catch(err => console.error("Error checking pending verifications:", err))
      .finally(() => setLoading(false));
  }, []);

  const planObj = plansData?.find(p => p.id === planId) || { label: 'Pro', price_idr: 450000, price_usd: 29 };
  const isEnterprise = planId === 'enterprise';

  // Calculate pricing based on billing term
  const basePriceIdr = planObj.price_idr || 450000;
  const basePriceUsd = planObj.price_usd || 29;

  const currentTerm = TERMS.find(t => t.key === billingTerm) || TERMS[0];
  const rawTotalIdr = basePriceIdr * currentTerm.months;
  const rawTotalUsd = basePriceUsd * currentTerm.months;

  const discountAmountIdr = Math.round(rawTotalIdr * (currentTerm.discount / 100));
  const finalPriceIdr = rawTotalIdr - discountAmountIdr;

  const discountAmountUsd = Math.round(rawTotalUsd * (currentTerm.discount / 100));
  const finalPriceUsd = rawTotalUsd - discountAmountUsd;

  const priceDisplay = isEnterprise 
    ? 'Custom' 
    : `Rp ${finalPriceIdr.toLocaleString('id-ID')}`;

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

  // Upload receipt uploader
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceiptLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('vl_token');
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.error || 'Upload failed');
      setReceiptUrl(data.url);
      success('Receipt file uploaded successfully!');
    } catch (err) {
      console.error(err);
      error('Failed to upload receipt file');
    } finally {
      setReceiptLoading(false);
    }
  };

  // Handle manual submission
  const handleSubmitManual = async (e) => {
    e.preventDefault();
    if (!receiptUrl) {
      error("Please upload payment receipt first.");
      return;
    }

    setLoading(true);
    try {
      await authFetch('/subscriptions/manual', {
        method: 'POST',
        body: JSON.stringify({
          plan: planId,
          billing_term: billingTerm,
          amount_idr: finalPriceIdr,
          sender_name: form.manualSenderName,
          bank_name: form.manualBankName,
          receipt_url: receiptUrl
        })
      });
      
      setStep(3);
      success("Payment receipt submitted successfully!");
    } catch (err) {
      error(err.message || "Failed to submit manual payment request");
    } finally {
      setLoading(false);
    }
  };

  // Mock standard payment channels
  const handleSimulatePayment = () => {
    setLoading(true);
    // Directly upgrade local mock flow for standard card/qris simulations
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      success('Payment received! Subscription activated.');
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
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: step === 2 ? 720 : 540,
        border: '1px solid var(--border-light)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', maxHeight: '95vh', overflow: 'auto', display: 'flex', flexDirection: 'column', transition: 'max-width 0.3s ease' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              {isEnterprise ? 'Request Enterprise Quote' : `Upgrade to ${planObj.name?.toUpperCase() || 'PRO'} Plan`}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {hasPending 
                ? 'Verification Status' 
                : step === 1 ? 'Step 1/2 — Contact Details & Billing Term' : step === 2 ? 'Step 2/2 — Secure Payment Gateway' : 'All set!'}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ minWidth: 'auto', padding: '0.25rem' }}><X size={18}/></button>
        </div>

        {/* Progress Bar */}
        {!hasPending && step < 3 && (
          <div style={{ height: 3, background: 'var(--border-light)' }}>
            <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.4s' }}/>
          </div>
        )}

        <div style={{ padding: '1.5rem' }}>
          
          {/* RENDER PENDING REQUEST IF USER HAS ONE */}
          {hasPending ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Verification Review Pending</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 1.5rem' }}>
                You have submitted a manual payment transfer receipt for the <strong style={{ color: 'var(--primary)' }}>{pendingVerification?.plan?.toUpperCase()}</strong> plan. 
                Our admin team is verifying your transaction. Once verified, your account will be upgraded immediately.
              </p>
              
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.82rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Billing Term:</span>
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{pendingVerification?.billing_term?.replace('_', ' ')}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Sender Bank:</span>
                  <span style={{ fontWeight: 600 }}>{pendingVerification?.bank_name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Sender Name:</span>
                  <span style={{ fontWeight: 600 }}>{pendingVerification?.sender_name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Amount Transferred:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Rp {pendingVerification?.amount_idr?.toLocaleString('id-ID')}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Submitted At:</span>
                  <span>{new Date(pendingVerification?.created_at).toLocaleString()}</span>
                </div>
              </div>

              <button type="button" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={onClose}>
                Close Dialog
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Customer Info & Terms */}
              {step === 1 && (
                <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Billing Term Selector */}
                  {!isEnterprise && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                      <label style={{ ...labelStyle, fontSize: '0.82rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Select Billing Term</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {TERMS.map(t => {
                          const itemTotalIdr = basePriceIdr * t.months;
                          const discountVal = Math.round(itemTotalIdr * (t.discount / 100));
                          const itemFinalPrice = itemTotalIdr - discountVal;

                          return (
                            <div
                              key={t.key}
                              onClick={() => setBillingTerm(t.key)}
                              style={{
                                border: `2px solid ${billingTerm === t.key ? 'var(--primary)' : 'var(--border-light)'}`,
                                background: billingTerm === t.key ? 'var(--primary-glow)' : 'transparent',
                                borderRadius: 8, padding: '0.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.2rem',
                                transition: 'all 0.2s'
                              }}
                            >
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.label}</span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
                                Rp {itemFinalPrice.toLocaleString('id-ID')}
                              </span>
                              {t.discount > 0 && (
                                <span style={{ fontSize: '0.62rem', background: 'var(--warning)', color: '#000', padding: '1px 5px', borderRadius: 10, alignSelf: 'flex-start', fontWeight: 800 }}>
                                  SAVE {t.discount}%
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

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

              {/* Step 2: Payment Gateways */}
              {step === 2 && !isEnterprise && (
                <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '1.5rem', minHeight: 340 }}>
                  
                  {/* Left Side: payment channels select */}
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

                    <button type="button" onClick={() => setPayMethod('manual')} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.6rem 0.8rem',
                      background: payMethod === 'manual' ? 'var(--primary-glow)' : 'transparent',
                      border: `1px solid ${payMethod === 'manual' ? 'var(--primary)' : 'var(--border-light)'}`,
                      color: payMethod === 'manual' ? 'var(--primary-light)' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem'
                    }}>
                      🏦 Manual Bank Transfer
                    </button>

                    <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount to Pay</div>
                      <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem', marginTop: '0.1rem' }}>{priceDisplay}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'lowercase', marginTop: '0.15rem' }}>({currentTerm.label} term)</div>
                    </div>
                  </div>

                  {/* Right Side: payment details panel */}
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

                    {/* MANUAL PAYMENT OPTIONS */}
                    {payMethod === 'manual' && (
                      <form onSubmit={handleSubmitManual} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Manual Bank Transfer</span>
                        </div>

                        {/* Bank destination card */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '0.75rem 0.9rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Transfer Destination</span>
                          <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>Bank Central Asia (BCA)</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800, color: '#fff' }}>123 - 456 - 7890</span>
                          <span style={{ color: 'var(--text-secondary)' }}>A/N: PT Vibe Learn / Arifia Mulia</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 800, marginTop: '0.15rem' }}>Transfer: {priceDisplay}</span>
                        </div>

                        <div style={rowStyle}>
                          <div>
                            <label style={labelStyle}>Your Bank Name *</label>
                            <input style={inputStyle} required value={form.manualBankName} onChange={e => setForm({...form, manualBankName: e.target.value})} placeholder="e.g. Mandiri, BCA"/>
                          </div>
                          <div>
                            <label style={labelStyle}>Account Holder Name *</label>
                            <input style={inputStyle} required value={form.manualSenderName} onChange={e => setForm({...form, manualSenderName: e.target.value})} placeholder="e.g. John Doe"/>
                          </div>
                        </div>

                        {/* File Upload for Transfer Receipt */}
                        <div>
                          <label style={labelStyle}>Upload Transfer Receipt (Bukti Transfer) *</label>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{
                              flex: 1, border: '1px dashed var(--border-light)', borderRadius: 8, padding: '0.5rem 0.75rem',
                              textAlign: 'center', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem',
                              color: receiptUrl ? 'var(--success)' : 'var(--text-secondary)'
                            }}>
                              <Upload size={14}/> 
                              {receiptUrl ? 'Receipt Image Loaded ✓' : 'Choose Receipt File'}
                              <input type="file" accept="image/*" onChange={handleReceiptUpload} style={{ display: 'none' }} required/>
                            </label>
                          </div>
                          {receiptLoading && <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.2rem' }}><RefreshCw size={10} className="spin"/> Uploading file receipt...</div>}
                          {receiptUrl && (
                            <a href={`${import.meta.env.VITE_API_URL || ''}${receiptUrl}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', fontSize: '0.72rem', color: 'var(--accent)', marginTop: '0.25rem', textDecoration: 'underline' }}>
                              View uploaded image proof
                            </a>
                          )}
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.35rem', justifyContent: 'center' }} disabled={loading || receiptLoading}>
                          {loading ? 'Submitting Verification...' : 'Submit Verification Request'}
                        </button>
                      </form>
                    )}

                  </div>
                </div>
              )}

              {/* Step 3: Success Screen */}
              {step === 3 && (
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    {isEnterprise ? '📨' : payMethod === 'manual' ? '⏳' : '🎉'}
                  </div>
                  <h2 style={{ marginBottom: '0.5rem', fontSize: '1.35rem' }}>
                    {isEnterprise 
                      ? 'Request Sent Successfully!' 
                      : payMethod === 'manual' ? 'Receipt Submitted!' : 'Welcome to Promptara Pro!'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 1.5rem' }}>
                    {isEnterprise
                      ? `Thanks, ${form.name}. Our enterprise coordination team will review your organization details (${form.company || 'N/A'}) and contact you at ${form.email} shortly.`
                      : payMethod === 'manual'
                        ? `Thank you, ${form.name}! We've received your manual payment of ${priceDisplay} for the ${planId?.toUpperCase()} subscription. Our admins will verify the receipt and upgrade your account shortly.`
                        : `Hooray, ${form.name}! Your account has been upgraded. You now have unlimited access to all courses, certification modules, and secure sandbox coding labs.`}
                  </p>
                  <button type="button" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={onClose}>
                    Done
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
