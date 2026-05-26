import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { Star, CheckCircle, Save, X } from 'lucide-react';

export default function SubscriptionsPage() {
  const { authFetch } = useAuth();
  const { success, error } = useAlert();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({ price_usd: 0, price_idr: 0 });

  const loadPlans = () => {
    setLoading(true);
    authFetch('/subscriptions/plans').then(setPlans).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleEditClick = (e, plan) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit Plan clicked for:', plan);
    setEditingPlan(plan);
    setEditForm({ price_usd: plan.price_usd || 0, price_idr: plan.price_idr || 0 });
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting plan update:', editForm);
      const res = await authFetch(`/subscriptions/plans/${editingPlan.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      console.log('Update response:', res);
      success(`Successfully updated ${editingPlan.name} plan!`);
      setEditingPlan(null);
      loadPlans();
    } catch (err) {
      console.error('Failed to update plan:', err);
      error(err.message || 'Failed to update plan. Please check your connection.');
    }
  };

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {editingPlan && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
          onClick={() => setEditingPlan(null)}
        >
          <form 
            onSubmit={handleSavePlan} 
            onClick={(e) => e.stopPropagation()} 
            style={{ background: 'var(--bg-surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 450, border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ textTransform: 'capitalize', margin: 0, fontSize: '1.25rem' }}>Edit {editingPlan.name} Plan</h3>
              <button type="button" onClick={() => setEditingPlan(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Price in USD ($)</label>
              <input type="number" min="0" required value={editForm.price_usd} onChange={(e) => setEditForm({ ...editForm, price_usd: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Price in IDR (Rp)</label>
              <input type="number" min="0" required value={editForm.price_idr} onChange={(e) => setEditForm({ ...editForm, price_idr: parseInt(e.target.value) || 0 })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '1rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingPlan(null)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
      <div>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Star color="var(--warning)" /> Subscription Plans
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage SaaS tiers, pricing, and active subscriptions.</p>
      </div>

      <div className="grid-3">
        {plans.map(plan => (
          <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column', border: plan.name === 'pro' ? '1px solid var(--primary)' : '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ textTransform: 'capitalize' }}>{plan.name}</h3>
              {plan.name === 'pro' && <span className="badge badge-primary">Most Popular</span>}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>${plan.price_usd}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rp {plan.price_idr.toLocaleString('id-ID')}/mo</div>
            
            <div style={{ flex: 1, marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {plan.features?.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <CheckCircle size={14} color="var(--success)" /> {f}
                </div>
              ))}
            </div>

            <button type="button" className={`btn w-full mt-6 ${plan.name === 'pro' ? 'btn-primary' : 'btn-ghost'}`} onClick={(e) => handleEditClick(e, plan)}>
              Edit Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
