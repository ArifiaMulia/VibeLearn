import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Star, CheckCircle } from 'lucide-react';

export default function SubscriptionsPage() {
  const { authFetch } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/subscriptions/plans').then(setPlans).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>${plan.price}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            
            <div style={{ flex: 1, marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {plan.features?.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <CheckCircle size={14} color="var(--success)" /> {f}
                </div>
              ))}
            </div>

            <button className={`btn w-full mt-6 ${plan.name === 'pro' ? 'btn-primary' : 'btn-ghost'}`}>
              Edit Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
