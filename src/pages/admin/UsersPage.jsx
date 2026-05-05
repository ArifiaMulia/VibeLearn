import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { Search, Trash2, Mail, UserPlus, X, Shield, Crown, User } from 'lucide-react';

const ROLE_ICONS = { super_admin: Shield, master: Crown, participant: User };
const PLAN_COLORS = { free: 'var(--text-muted)', pro: 'var(--warning)', enterprise: 'var(--accent)' };

function AddUserModal({ onClose, onCreated, authFetch }) {
  const { error: showError } = useAlert();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'participant', plan: 'free' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authFetch('/users', { method: 'POST', body: JSON.stringify(form) });
      onCreated(user);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem', background: 'none',
          border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
        }}><X size={20} /></button>
        <h3 style={{ marginBottom: '0.5rem' }}>Add New User</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Create a new user account manually.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required placeholder="e.g. John Doe" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required placeholder="john@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required placeholder="Min 8 characters" value={form.password} onChange={set('password')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={set('role')}>
                <option value="participant">Participant</option>
                <option value="master">Master</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Plan</label>
              <select className="form-input" value={form.plan} onChange={set('plan')}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating...' : <><UserPlus size={16} /> Create User</>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { authFetch, user: currentUser } = useAuth();
  const { success, error } = useAlert();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await authFetch('/users');
      setUsers(data);
    } catch (e) {
      error('Failed to load users');
    }
    setLoading(false);
  };

  const updateRole = async (id, newRole) => {
    if (id === currentUser.id) return error('Cannot change your own role.');
    try {
      await authFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
      success('Role updated');
      loadUsers();
    } catch (e) { error(e.message); }
  };

  const updatePlan = async (id, newPlan) => {
    try {
      await authFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify({ plan: newPlan }) });
      success('Plan updated');
      loadUsers();
    } catch (e) { error(e.message); }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await authFetch(`/users/${id}`, { method: 'DELETE' });
      success('User deleted');
      loadUsers();
    } catch (e) { error(e.message); }
  };

  const handleUserCreated = user => {
    setUsers(prev => [...prev, user]);
    setShowAddModal(false);
    success(`User "${user.name}" created!`);
  };

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = d => {
    if (!d) return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No expiry</span>;
    const date = new Date(d);
    const isExpired = date < new Date();
    return (
      <span style={{ fontSize: '0.78rem', color: isExpired ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
        {isExpired ? '⚠ ' : ''}{date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </span>
    );
  };

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onCreated={handleUserCreated} authFetch={authFetch} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add User
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>User</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Role</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Plan</th>
              <th style={{ padding: '0.85rem 1.25rem' }}>Subscription Expiry</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const RoleIcon = ROLE_ICONS[u.role] || User;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem', color: 'white',
                      }}>
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {u.name}
                          {u.id === currentUser.id && <span className="badge badge-accent" style={{ marginLeft: 6, fontSize: '0.65rem' }}>You</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                          <Mail size={11} />{u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    {currentUser.role === 'super_admin' && u.id !== currentUser.id ? (
                      <select className="form-input" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                        value={u.role} onChange={e => updateRole(u.id, e.target.value)}>
                        <option value="participant">Participant</option>
                        <option value="master">Master</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <RoleIcon size={13} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>{u.role?.replace('_', ' ')}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    {currentUser.role === 'super_admin' ? (
                      <select className="form-input" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto', color: PLAN_COLORS[u.plan] }}
                        value={u.plan} onChange={e => updatePlan(u.id, e.target.value)}>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    ) : (
                      <span className="badge" style={{ color: PLAN_COLORS[u.plan], background: `${PLAN_COLORS[u.plan]}15`, border: `1px solid ${PLAN_COLORS[u.plan]}30` }}>
                        {u.plan}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    {formatDate(u.sub_expires_at)}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.35rem', color: 'var(--danger)' }}
                      disabled={u.id === currentUser.id}
                      onClick={() => deleteUser(u.id, u.name)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
