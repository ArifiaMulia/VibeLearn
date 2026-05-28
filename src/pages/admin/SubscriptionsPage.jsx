import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { 
  Star, CheckCircle, Save, X, Eye, Check, RefreshCw, 
  Upload, Trash2, Plus, Download, Type, Bold, Italic, 
  AlignCenter, AlignLeft, AlignRight, FileText, Settings, ShieldAlert 
} from 'lucide-react';

const DEFAULT_INVOICE_ELEMENTS = [
  { id: 'logo', type: 'image', label: 'Company Logo', src: '/logo.png', top: 7, left: 10, width: 45, height: 45, visible: true },
  { id: 'company_name', type: 'text', label: 'Company Name', text: 'PROMPTARA ACADEMY', top: 6, left: 17, fontSize: 13, fontFamily: 'sans-serif', color: '#1a1a1a', fontWeight: 'bold', align: 'left', visible: true },
  { id: 'company_addr', type: 'text', label: 'Company Address', text: 'virtuenet.id · Jakarta, Indonesia', top: 9, left: 17, fontSize: 7, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'normal', align: 'left', visible: true },
  
  { id: 'invoice_title', type: 'text', label: 'Invoice Title', text: 'INVOICE / RECEIPT', top: 6, left: 90, fontSize: 16, fontFamily: 'sans-serif', color: '#3182ce', fontWeight: '800', align: 'right', visible: true },
  { id: 'invoice_meta', type: 'text', label: 'Invoice Date & Ref', text: 'Date: May 28, 2026 | Ref: INV-87236', top: 9, left: 90, fontSize: 8, fontFamily: 'monospace', color: '#718096', fontWeight: 'normal', align: 'right', visible: true },
  
  { id: 'bill_to_label', type: 'text', label: 'Bill To Label', text: 'BILLED TO:', top: 19, left: 10, fontSize: 7, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'bold', align: 'left', visible: true },
  { id: 'bill_to_name', type: 'text', label: 'Student Name', text: 'Student Name', top: 22, left: 10, fontSize: 9, fontFamily: 'sans-serif', color: '#2d3748', fontWeight: 'bold', align: 'left', visible: true },
  { id: 'bill_to_email', type: 'text', label: 'Student Email', text: 'student@example.com', top: 25, left: 10, fontSize: 8, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'normal', align: 'left', visible: true },

  { id: 'payment_method_label', type: 'text', label: 'Payment Method Label', text: 'METHOD OF PAYMENT:', top: 19, left: 90, fontSize: 7, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'bold', align: 'right', visible: true },
  { id: 'payment_method_val', type: 'text', label: 'Payment Method Value', text: 'Manual Bank Transfer (BCA)', top: 22, left: 90, fontSize: 8, fontFamily: 'sans-serif', color: '#2d3748', fontWeight: '600', align: 'right', visible: true },
  { id: 'sender_info', type: 'text', label: 'Sender Details', text: 'A/N: John Doe', top: 25, left: 90, fontSize: 8, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'normal', align: 'right', visible: true },

  // Transaction Line Item Headings
  { id: 'th_desc', type: 'text', label: 'Header: Description', text: 'ITEM DESCRIPTION', top: 34, left: 10, fontSize: 7, fontFamily: 'sans-serif', color: '#a0aec0', fontWeight: 'bold', align: 'left', visible: true },
  { id: 'th_term', type: 'text', label: 'Header: Term', text: 'BILLING TERM', top: 34, left: 50, fontSize: 7, fontFamily: 'sans-serif', color: '#a0aec0', fontWeight: 'bold', align: 'center', visible: true },
  { id: 'th_price', type: 'text', label: 'Header: Price', text: 'AMOUNT', top: 34, left: 90, fontSize: 7, fontFamily: 'sans-serif', color: '#a0aec0', fontWeight: 'bold', align: 'right', visible: true },
  
  // Transaction Line Items values
  { id: 'val_desc', type: 'text', label: 'Value: Description', text: 'Promptara Academy Subscription (PRO Plan)', top: 40, left: 10, fontSize: 9, fontFamily: 'sans-serif', color: '#1a1a1a', fontWeight: 'bold', align: 'left', visible: true },
  { id: 'val_term', type: 'text', label: 'Value: Term', text: '2 Years (25% discount)', top: 40, left: 50, fontSize: 8, fontFamily: 'sans-serif', color: '#4a5568', fontWeight: 'normal', align: 'center', visible: true },
  { id: 'val_price', type: 'text', label: 'Value: Price', text: 'Rp 900.000', top: 40, left: 90, fontSize: 9, fontFamily: 'sans-serif', color: '#1a1a1a', fontWeight: 'bold', align: 'right', visible: true },

  // Summary calculations
  { id: 'sum_discount_label', type: 'text', label: 'Summary: Discount Label', text: 'Discount Applied:', top: 48, left: 70, fontSize: 8, fontFamily: 'sans-serif', color: '#e53e3e', fontWeight: 'bold', align: 'right', visible: true },
  { id: 'sum_discount_val', type: 'text', label: 'Summary: Discount Value', text: '- Rp 225.000', top: 48, left: 90, fontSize: 8, fontFamily: 'sans-serif', color: '#e53e3e', fontWeight: 'bold', align: 'right', visible: true },
  
  { id: 'sum_total_label', type: 'text', label: 'Summary: Total Label', text: 'TOTAL AMOUNT PAID:', top: 54, left: 70, fontSize: 10, fontFamily: 'sans-serif', color: '#1a1a1a', fontWeight: '800', align: 'right', visible: true },
  { id: 'sum_total_val', type: 'text', label: 'Summary: Total Value', text: 'Rp 675.000', top: 54, left: 90, fontSize: 11, fontFamily: 'sans-serif', color: '#3182ce', fontWeight: '800', align: 'right', visible: true },
  
  // Notes & Footer
  { id: 'note_title', type: 'text', label: 'Note Title', text: 'NOTES & POLICIES', top: 66, left: 10, fontSize: 7, fontFamily: 'sans-serif', color: '#a0aec0', fontWeight: 'bold', align: 'left', visible: true },
  { id: 'note_text', type: 'text', label: 'Note Wording', text: 'Thank you for upgrading! This document serves as official proof of payment. Access is valid instantly.', top: 70, left: 10, fontSize: 8, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'normal', align: 'left', visible: true },
  
  { id: 'footer_terms', type: 'text', label: 'Footer Brand', text: 'Promptara Academy · virtuenet.id · Verify at vibe.virtuenet.space', top: 94, left: 50, fontSize: 6, fontFamily: 'sans-serif', color: '#a0aec0', fontWeight: 'normal', align: 'center', visible: true },

  // Draggable Signatures
  { id: 'sig_name', type: 'text', label: 'Authorized Signature Name', text: 'Arifia Mulia', top: 82, left: 90, fontSize: 9, fontFamily: 'Georgia', color: '#4a5568', fontWeight: 'normal', align: 'right', visible: true },
  { id: 'sig_role', type: 'text', label: 'Authorized Signature Role', text: 'Finance Director', top: 86, left: 90, fontSize: 7, fontFamily: 'sans-serif', color: '#718096', fontWeight: 'normal', align: 'right', visible: true },
  { id: 'sig_img', type: 'image', label: 'Authorized Signature Image', src: '', top: 76, left: 90, width: 70, height: 30, visible: false },

  // Draggable Watermark Stamp
  { id: 'paid_stamp', type: 'text', label: 'PAID Watermark Stamp', text: 'PAID', top: 52, left: 30, fontSize: 32, fontFamily: 'monospace', color: 'rgba(72,187,120,0.22)', fontWeight: '800', align: 'center', visible: true, rotate: -20 },
];

const INVOICE_PRESETS = {
  corporate: {
    name: 'Corporate Clean (Default)',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderTop: '8px solid #3182ce',
    textColor: '#1a1a1a',
    accentColor: '#3182ce',
    subColor: '#718096',
    fontSans: 'sans-serif',
  },
  tech: {
    name: 'Tech Terminal (Dark Mode)',
    background: '#1a202c',
    border: '2px solid #00ffcc',
    borderTop: '2px solid #00ffcc',
    textColor: '#39ff14',
    accentColor: '#00ffcc',
    subColor: '#8892b0',
    fontSans: 'monospace',
  },
  ivory: {
    name: 'Classic Ivory (Serif)',
    background: '#fcfbfa',
    border: '2px double #b8860b',
    borderTop: '2px double #b8860b',
    textColor: '#2d3748',
    accentColor: '#b8860b',
    subColor: '#718096',
    fontSans: 'Georgia',
  }
};

export default function SubscriptionsPage() {
  const { authFetch } = useAuth();
  const { success, error } = useAlert();
  const canvasRef = useRef(null);

  // Layout tabs state
  const [activeSubTab, setActiveSubTab] = useState('plans'); // plans | verifications | builder

  // Tab 1: Plans state
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({ price_usd: 0, price_idr: 0 });

  // Tab 2: Verifications state
  const [verifications, setVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Tab 3: Receipt Builder state
  const [elements, setElements] = useState(() => {
    const saved = localStorage.getItem('vb_invoice_elements');
    return saved ? JSON.parse(saved) : DEFAULT_INVOICE_ELEMENTS;
  });
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [invoiceTemplate, setInvoiceTemplate] = useState('corporate');
  const [builderTab, setBuilderTab] = useState('presets'); // presets | elements | assets

  // Load plans & verifications
  const loadPlans = () => {
    setLoading(true);
    authFetch('/subscriptions/plans').then(setPlans).finally(() => setLoading(false));
  };

  const loadVerifications = () => {
    authFetch('/subscriptions/verifications')
      .then(res => setVerifications(Array.isArray(res) ? res : []))
      .catch(err => console.error("Error loading verifications:", err));
  };

  useEffect(() => {
    loadPlans();
    loadVerifications();
  }, []);

  useEffect(() => {
    localStorage.setItem('vb_invoice_elements', JSON.stringify(elements));
  }, [elements]);

  // Tab 1: Save plan details
  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      await authFetch(`/subscriptions/plans/${editingPlan.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      success(`Successfully updated ${editingPlan.name} plan!`);
      setEditingPlan(null);
      loadPlans();
    } catch (err) {
      error(err.message || 'Failed to update plan.');
    }
  };

  // Tab 2: Resolve verification (Approve/Reject)
  const handleResolveVerification = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${status.toUpperCase()}?`)) return;
    try {
      await authFetch(`/subscriptions/verifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      success(`Payment verification was successfully ${status}!`);
      loadVerifications();
    } catch (err) {
      error(err.message || 'Failed to resolve payment.');
    }
  };

  // Switch to Tab 3 and pre-load transaction details
  const handleOpenReceiptBuilder = (verifyObj) => {
    setSelectedVerification(verifyObj);
    setActiveSubTab('builder');

    // Dynamically bind details to elements
    const dateStr = new Date(verifyObj.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const refId = `INV-${String(verifyObj.id).padStart(5, '0')}`;
    
    // Calculations
    const termLabelMap = {
      monthly: 'Monthly',
      '1_year': '1 Year (10% Off)',
      '2_years': '2 Years (25% Off)',
      '3_years': '3 Years (40% Off)'
    };
    
    // Find matching base plan to calculate raw subtotal
    const matchPlan = plans.find(p => p.id === verifyObj.plan) || { price_idr: 450000 };
    const basePrice = matchPlan.price_idr;
    
    let months = 1;
    let discountPct = 0;
    if (verifyObj.billing_term === '1_year') { months = 12; discountPct = 10; }
    else if (verifyObj.billing_term === '2_years') { months = 24; discountPct = 25; }
    else if (verifyObj.billing_term === '3_years') { months = 36; discountPct = 40; }

    const subtotalIdr = basePrice * months;
    const discountIdr = Math.round(subtotalIdr * (discountPct / 100));

    setElements(prev => prev.map(el => {
      switch (el.id) {
        case 'invoice_meta':
          return { ...el, text: `Date: ${dateStr} | Ref: ${refId}` };
        case 'bill_to_name':
          return { ...el, text: verifyObj.user_name || 'Student Name' };
        case 'bill_to_email':
          return { ...el, text: verifyObj.user_email || 'student@example.com' };
        case 'payment_method_val':
          return { ...el, text: `Manual Bank Transfer (${verifyObj.bank_name})` };
        case 'sender_info':
          return { ...el, text: `A/N: ${verifyObj.sender_name}` };
        case 'val_desc':
          return { ...el, text: `Promptara Academy Subscription (${verifyObj.plan?.toUpperCase()} Plan)` };
        case 'val_term':
          return { ...el, text: termLabelMap[verifyObj.billing_term] || 'Monthly' };
        case 'val_price':
          return { ...el, text: `Rp ${subtotalIdr.toLocaleString('id-ID')}` };
        case 'sum_discount_val':
          return { ...el, text: `- Rp ${discountIdr.toLocaleString('id-ID')}` };
        case 'sum_total_val':
          return { ...el, text: `Rp ${verifyObj.amount_idr?.toLocaleString('id-ID')}` };
        default:
          return el;
      }
    }));

    success(`Loaded transaction receipt context for ${verifyObj.user_name}!`);
  };

  // Tab 3: Apply Theme Presets
  const applyInvoiceTheme = (themeKey) => {
    setInvoiceTemplate(themeKey);
    const preset = INVOICE_PRESETS[themeKey];

    setElements(prev => prev.map(el => {
      let color = preset.textColor;
      if (el.id === 'invoice_title' || el.id === 'sum_total_val') {
        color = preset.accentColor;
      } else if (el.id.includes('addr') || el.id.includes('meta') || el.id.includes('email') || el.id.includes('sender') || el.id.includes('role') || el.id === 'footer_terms') {
        color = preset.subColor;
      } else if (el.id === 'paid_stamp') {
        color = themeKey === 'tech' ? 'rgba(0, 255, 204, 0.22)' : 'rgba(72,187,120,0.22)';
      } else if (el.id.includes('discount')) {
        color = '#e53e3e';
      }

      return {
        ...el,
        color,
        fontFamily: preset.fontSans
      };
    }));
  };

  // Drag and Drop Logic
  const handleDragStart = (e, id) => {
    e.preventDefault();
    setSelectedElementId(id);
    setDraggingId(id);

    const elementDom = e.currentTarget;
    const elementRect = elementDom.getBoundingClientRect();

    const clickX = e.clientX - elementRect.left;
    const clickY = e.clientY - elementRect.top;

    const currentEl = elements.find(el => el.id === id);
    const align = currentEl?.align || 'center';

    let offsetX = clickX;
    let offsetY = clickY;

    if (align === 'center') {
      offsetX = clickX - elementRect.width / 2;
      offsetY = clickY - elementRect.height / 2;
    } else if (align === 'right') {
      offsetX = clickX - elementRect.width;
    }

    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragMove = (e) => {
    if (!draggingId) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const xPx = e.clientX - canvasRect.left - dragOffset.x;
    const yPx = e.clientY - canvasRect.top - dragOffset.y;

    const leftPct = Math.max(0, Math.min(100, (xPx / canvasRect.width) * 100));
    const topPct = Math.max(0, Math.min(100, (yPx / canvasRect.height) * 100));

    setElements(prev => prev.map(el => {
      if (el.id === draggingId) {
        return { ...el, left: parseFloat(leftPct.toFixed(2)), top: parseFloat(topPct.toFixed(2)) };
      }
      return el;
    }));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  // Asset Signature Uploader
  const handleAssetUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setElements(prev => prev.map(el => {
        if (el.id === 'sig_img') {
          return { ...el, src: event.target.result, visible: true };
        }
        return el;
      }));
      success("Signature image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  // Styles Editor
  const updateElementStyle = (key, value) => {
    setElements(prev => prev.map(el => {
      if (el.id === selectedElementId) {
        return { ...el, [key]: value };
      }
      return el;
    }));
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Reset all receipt layout edits and positions to original settings?")) {
      setElements(DEFAULT_INVOICE_ELEMENTS);
      setInvoiceTemplate('corporate');
      setSelectedElementId(null);
      localStorage.removeItem('vb_invoice_elements');
      success("Invoice builder state reset successfully.");
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElementId);
  const activePreset = INVOICE_PRESETS[invoiceTemplate] || {};

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Tab selection buttons */}
      <div className="no-print" style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', gap: '1rem' }}>
        <button
          onClick={() => setActiveSubTab('plans')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
            color: activeSubTab === 'plans' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'plans' ? '2px solid var(--primary)' : 'none',
          }}
        >
          ⚙ Plans Manager
        </button>
        <button
          onClick={() => setActiveSubTab('verifications')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
            color: activeSubTab === 'verifications' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'verifications' ? '2px solid var(--primary)' : 'none',
            display: 'flex', alignItems: 'center', gap: '0.35rem'
          }}
        >
          ⏳ Payment Verifications
          {verifications.filter(v => v.status === 'pending').length > 0 && (
            <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {verifications.filter(v => v.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('builder')}
          style={{
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
            color: activeSubTab === 'builder' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'builder' ? '2px solid var(--primary)' : 'none',
          }}
        >
          📄 Receipt Builder
        </button>
      </div>

      {/* ── TAB 1: PLANS MANAGEMENT ── */}
      {activeSubTab === 'plans' && (
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.35rem' }}>
              <Star color="var(--warning)" size={20} /> Subscription Plans Configuration
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>Set pricing points in USD and IDR for all active software subscription tiers.</p>
          </div>

          <div className="grid-3">
            {plans.map(plan => (
              <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column', border: plan.name === 'pro' ? '1px solid var(--primary)' : '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ textTransform: 'capitalize', margin: 0 }}>{plan.name}</h3>
                  {plan.name === 'pro' && <span className="badge badge-primary">Most Popular</span>}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>${plan.price_usd}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rp {plan.price_idr?.toLocaleString('id-ID')}/mo</div>
                
                <div style={{ flex: 1, marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {plan.features?.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <CheckCircle size={14} color="var(--success)" /> {f}
                    </div>
                  ))}
                </div>

                <button type="button" className={`btn w-full mt-6 ${plan.name === 'pro' ? 'btn-primary' : 'btn-ghost'}`} onClick={(e) => { setEditingPlan(plan); setEditForm({ price_usd: plan.price_usd, price_idr: plan.price_idr }); }}>
                  Edit Plan
                </button>
              </div>
            ))}
          </div>

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }} onClick={() => setEditingPlan(null)}>
              <form onSubmit={handleSavePlan} onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 420, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ textTransform: 'capitalize', margin: 0, fontSize: '1.1rem' }}>Edit {editingPlan.name} Plan</h3>
                  <button type="button" onClick={() => setEditingPlan(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Price in USD ($)</label>
                  <input type="number" min="0" required value={editForm.price_usd} onChange={(e) => setEditForm({ ...editForm, price_usd: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>Price in IDR (Rp)</label>
                  <input type="number" min="0" required value={editForm.price_idr} onChange={(e) => setEditForm({ ...editForm, price_idr: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.9rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingPlan(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}><Save size={14}/> Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: PAYMENT VERIFICATIONS ── */}
      {activeSubTab === 'verifications' && (
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="var(--primary)" /> Student Payment Verification Requests
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>Review uploaded bank transfer receipts. Approve to grant access instantly, or reject invalid receipts.</p>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
                    {['Student', 'Requested Plan', 'Term', 'Amount', 'Sender Account', 'Receipt', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No manual payment verification records found.
                      </td>
                    </tr>
                  ) : (
                    verifications.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.user_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.user_email}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{v.plan?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>
                          {v.billing_term?.replace('_', ' ')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--accent)' }}>
                          Rp {v.amount_idr?.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600 }}>{v.bank_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>A/N: {v.sender_name}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {v.receipt_url ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || ''}${v.receipt_url}`}
                              alt="Bukti Transfer"
                              onClick={() => setLightboxUrl(v.receipt_url)}
                              style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-light)', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                            />
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>No file</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase',
                            background: v.status === 'approved' ? 'rgba(72,187,120,0.12)' : v.status === 'rejected' ? 'rgba(239,68,68,0.12)' : 'rgba(237,137,54,0.12)',
                            color: v.status === 'approved' ? '#48bb78' : v.status === 'rejected' ? '#f56565' : '#ed8936',
                          }}>
                            {v.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {v.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleResolveVerification(v.id, 'approved')}
                                  style={{ padding: '0.3rem 0.6rem', background: '#48bb78', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleResolveVerification(v.id, 'rejected')}
                                  style={{ padding: '0.3rem 0.6rem', background: '#f56565', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
                                >
                                  Reject
                                </button>
                              </>
                            ) : v.status === 'approved' ? (
                              <button
                                onClick={() => handleOpenReceiptBuilder(v)}
                                style={{
                                  padding: '0.3rem 0.6rem', background: 'rgba(49,130,206,0.1)', color: '#3182ce',
                                  border: '1px solid rgba(49,130,206,0.2)', borderRadius: 6, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: '0.25rem'
                                }}
                              >
                                <FileText size={11}/> Build Receipt
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Resolved</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lightbox for receipt file proof */}
          {lightboxUrl && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setLightboxUrl(null)}>
              <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                <img
                  src={`${import.meta.env.VITE_API_URL || ''}${lightboxUrl}`}
                  alt="Receipt Preview"
                  style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <button
                  onClick={() => setLightboxUrl(null)}
                  style={{ position: 'absolute', top: -40, right: 0, background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: INVOICE/RECEIPT DRAG-AND-DROP BUILDER ── */}
      {activeSubTab === 'builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Editor Header controls */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem' }}>Invoice & Payment Receipt Customizer</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>
                {selectedVerification 
                  ? `Editing invoice proof for: ${selectedVerification.user_name}` 
                  : 'Design your billing template. Select a student payment verification in Tab 2 to preload details.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleResetToDefaults}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
                }}
              >
                <RefreshCw size={13} /> Reset Layout
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, rgba(49,130,206,1), rgba(43,108,176,1))', color: '#fff',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
                  boxShadow: '0 4px 12px rgba(49,130,206,0.25)'
                }}
              >
                <Download size={13} /> Download / Print Invoice
              </button>
            </div>
          </div>

          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Sidebar editor options */}
            <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 480 }}>
              
              {/* Tab Selector */}
              <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.2rem', borderRadius: 8, gap: '0.2rem' }}>
                {['presets', 'elements', 'assets'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setBuilderTab(tab)}
                    style={{
                      flex: 1, padding: '0.4rem', border: 'none', borderRadius: 6, fontSize: '0.78rem',
                      fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer',
                      background: builderTab === tab ? 'var(--bg-card)' : 'transparent',
                      color: builderTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    {tab === 'presets' ? 'Themes' : tab === 'elements' ? 'Fields' : 'Signatures'}
                  </button>
                ))}
              </div>

              {/* BUILDER TAB 1: INVOICE THEMES */}
              {builderTab === 'presets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Invoice Style Themes
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(INVOICE_PRESETS).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => applyInvoiceTheme(key)}
                          style={{
                            padding: '0.6rem 0.75rem', borderRadius: 8, border: invoiceTemplate === key ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                            background: invoiceTemplate === key ? 'rgba(124,58,237,0.05)' : 'var(--bg-surface)',
                            color: invoiceTemplate === key ? 'var(--primary)' : 'var(--text-primary)',
                            textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                          }}
                        >
                          <span>{val.name}</span>
                          {invoiceTemplate === key && <Check size={14} color="var(--primary)" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedVerification && (
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: 8, fontSize: '0.78rem' }}>
                      <span style={{ display: 'block', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.25rem' }}>Active Transaction Data:</span>
                      <strong>Buyer</strong>: {selectedVerification.user_name}<br/>
                      <strong>Billing</strong>: {selectedVerification.billing_term}<br/>
                      <strong>Amount</strong>: Rp {selectedVerification.amount_idr?.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              )}

              {/* BUILDER TAB 2: INVOICE ELEMENTS */}
              {builderTab === 'elements' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      Manage Layout Fields
                    </label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 200, overflowY: 'auto', paddingRight: '0.2rem' }}>
                      {elements.map(el => (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.5rem',
                            borderRadius: 6, cursor: 'pointer', border: selectedElementId === el.id ? '1px solid var(--primary)' : '1px solid transparent',
                            background: selectedElementId === el.id ? 'rgba(124,58,237,0.04)' : 'var(--bg-surface)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '80%' }}>
                            <input
                              type="checkbox"
                              checked={el.visible}
                              onChange={(e) => {
                                setElements(prev => prev.map(item => item.id === el.id ? { ...item, visible: e.target.checked } : item));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.78rem', color: el.visible ? 'var(--text-primary)' : 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {el.label}
                            </span>
                          </div>
                          {el.isCustom && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setElements(prev => prev.filter(item => item.id !== el.id)); if (selectedElementId === el.id) setSelectedElementId(null); }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const id = `custom_inv_text_${Date.now()}`;
                      setElements(prev => [...prev, {
                        id, type: 'text', label: `Custom Label (${elements.filter(e => e.id.includes('custom_inv_text')).length + 1})`,
                        text: 'Custom Text Field', top: 50, left: 50, fontSize: 10, fontFamily: 'sans-serif',
                        color: activePreset.textColor || '#1a1a1a', fontWeight: 'normal', align: 'left', visible: true, isCustom: true
                      }]);
                      setSelectedElementId(id);
                    }}
                    style={{
                      padding: '0.45rem', borderRadius: 8, border: '1px dashed var(--primary)', background: 'transparent',
                      color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    <Plus size={13} /> Add Custom Invoice Text
                  </button>

                  {/* Selected Element Editor */}
                  {selectedEl && (
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>
                        ✍️ Edit Field: {selectedEl.label}
                      </span>
                      
                      {selectedEl.type === 'text' ? (
                        <>
                          <input
                            type="text"
                            value={selectedEl.text}
                            onChange={(e) => updateElementStyle('text', e.target.value)}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                          />
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Font Size (px)</label>
                              <input type="number" min="5" max="64" value={selectedEl.fontSize} onChange={(e) => updateElementStyle('fontSize', parseInt(e.target.value) || 9)} style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                            </div>
                            {selectedEl.id === 'paid_stamp' ? (
                              <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Rotate Angle</label>
                                <input type="number" min="-90" max="90" value={selectedEl.rotate || 0} onChange={(e) => updateElementStyle('rotate', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                              </div>
                            ) : (
                              <div>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Text Color</label>
                                <input type="color" value={selectedEl.color.startsWith('#') ? selectedEl.color : '#1a1a1a'} onChange={(e) => updateElementStyle('color', e.target.value)} style={{ width: '100%', height: '30px', padding: 0, border: '1px solid var(--border-light)', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
                              </div>
                            )}
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Formatting</label>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button onClick={() => updateElementStyle('fontWeight', selectedEl.fontWeight === 'bold' ? 'normal' : 'bold')} style={{ flex: 1, padding: '0.35rem', border: '1px solid var(--border-light)', borderRadius: 6, background: selectedEl.fontWeight === 'bold' ? 'var(--border-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><Bold size={12} style={{ margin: '0 auto' }}/></button>
                              <button onClick={() => updateElementStyle('fontStyle', selectedEl.fontStyle === 'italic' ? 'normal' : 'italic')} style={{ flex: 1, padding: '0.35rem', border: '1px solid var(--border-light)', borderRadius: 6, background: selectedEl.fontStyle === 'italic' ? 'var(--border-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}><Italic size={12} style={{ margin: '0 auto' }}/></button>
                              {['left', 'center', 'right'].map(align => (
                                <button key={align} onClick={() => updateElementStyle('align', align)} style={{ flex: 1, padding: '0.35rem', border: '1px solid var(--border-light)', borderRadius: 6, background: selectedEl.align === align ? 'var(--border-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                  {align === 'left' ? <AlignLeft size={12} style={{ margin: '0 auto' }} /> : align === 'center' ? <AlignCenter size={12} style={{ margin: '0 auto' }} /> : <AlignRight size={12} style={{ margin: '0 auto' }} />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Width (px)</label>
                            <input type="number" min="20" max="250" value={selectedEl.width} onChange={(e) => updateElementStyle('width', parseInt(e.target.value) || 50)} style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Height (px)</label>
                            <input type="number" min="10" max="150" value={selectedEl.height} onChange={(e) => updateElementStyle('height', parseInt(e.target.value) || 20)} style={{ width: '100%', padding: '0.45rem', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* BUILDER TAB 3: SIGNATURES ASSETS */}
              {builderTab === 'assets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Invoice Signatures
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSelectedElementId('sig_img')}
                        style={{
                          width: '100%', padding: '0.5rem', borderRadius: 8, fontSize: '0.78rem',
                          fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border-light)',
                          background: 'var(--bg-surface)', color: 'var(--text-primary)',
                          display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}
                      >
                        <Settings size={12} /> Customize Signature Placement
                      </button>
                      
                      <label style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, background: 'var(--border-light)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <Upload size={13} /> Upload Signature Image
                        <input type="file" accept="image/*" onChange={handleAssetUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Side: Interactive Invoice Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                🖱️ Drag invoice elements inside the canvas to position them. Printing will scale page to fit A4 paper.
              </div>

              {/* The printable boundary canvas */}
              <div
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0f13', padding: '2rem 1rem', borderRadius: 12, border: '1px solid var(--border-light)'
                }}
              >
                <div
                  ref={canvasRef}
                  className="print-canvas"
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  style={{
                    width: '100%',
                    maxWidth: 580, // Portrait layout A4 size proportions
                    aspectRatio: '210/297',
                    position: 'relative',
                    background: activePreset.background || '#ffffff',
                    border: activePreset.border || '1px solid #e2e8f0',
                    borderTop: activePreset.borderTop || 'none',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    userSelect: 'none',
                    color: activePreset.textColor || '#1a1a1a'
                  }}
                  onClick={() => setSelectedElementId(null)}
                >
                  {/* Preset invoice double line borders overlays */}
                  {invoiceTemplate === 'ivory' && (
                    <div style={{ position: 'absolute', inset: 6, border: '1px solid rgba(184,134,11,0.18)', pointerEvents: 'none' }} />
                  )}
                  {invoiceTemplate === 'tech' && (
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(0, 255, 204, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 204, 0.3) 1px, transparent 1px)', backgroundSize: '15px 15px', pointerEvents: 'none' }} />
                  )}

                  {/* Element Mapper */}
                  {elements.map(el => {
                    if (!el.visible) return null;
                    const isSelected = selectedElementId === el.id;

                    return (
                      <div
                        key={el.id}
                        onMouseDown={(e) => handleDragStart(e, el.id)}
                        onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                        style={{
                          position: 'absolute',
                          top: `${el.top}%`,
                          left: `${el.left}%`,
                          transform: el.align === 'center' 
                            ? `translate(-50%, -50%) rotate(${el.rotate || 0}deg)` 
                            : el.align === 'right' 
                              ? `translate(-100%, -50%) rotate(${el.rotate || 0}deg)` 
                              : `translateY(-50%) rotate(${el.rotate || 0}deg)`,
                          cursor: draggingId === el.id ? 'grabbing' : 'grab',
                          outline: isSelected ? '1px dashed #d4af37' : 'none',
                          outlineOffset: '2px',
                          zIndex: isSelected ? 100 : 10,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {el.type === 'text' ? (
                          <span style={{
                            fontSize: `${el.fontSize}px`,
                            fontFamily: el.fontFamily,
                            color: el.color,
                            fontWeight: el.fontWeight,
                            fontStyle: el.fontStyle,
                            textAlign: el.align,
                            display: 'block',
                            letterSpacing: el.id.includes('title') || el.id.includes('name') ? '0.02em' : 'normal',
                            textShadow: el.id === 'paid_stamp' ? 'none' : (invoiceTemplate === 'tech' ? '0 0 5px rgba(0,255,204,0.3)' : 'none')
                          }}>
                            {el.text}
                          </span>
                        ) : (
                          <div style={{ width: el.width, height: el.height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {el.src ? (
                              <img src={el.src} alt={el.label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: 'rgba(0,0,0,0.05)', border: '1px dashed #718096', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#718096' }}>
                                No Sig
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
