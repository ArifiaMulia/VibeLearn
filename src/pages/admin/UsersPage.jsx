import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { Search, Edit2, Shield, Trash2, Mail } from 'lucide-react';

export default function UsersPage() {
  const { authFetch, user: currentUser } = useAuth();
  const { success, error } = useAlert();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

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
      success('User role updated');
      loadUsers();
    } catch (e) { error(e.message); }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="skeleton" style={{ height: '70vh', borderRadius: 'var(--radius-lg)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem 1.5rem' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem' }}>Plan</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{u.name} {u.id === currentUser.id && <span className="badge badge-accent" style={{ marginLeft: 6 }}>You</span>}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}><Mail size={12} style={{ marginRight: 6, opacity: 0.5 }}/> {u.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {currentUser.role === 'super_admin' ? (
                    <select className="form-select" style={{ padding: '0.25rem 2rem 0.25rem 0.75rem', fontSize: '0.8rem', background: 'transparent' }} 
                      value={u.role} onChange={(e) => updateRole(u.id, e.target.value)} disabled={u.id === currentUser.id}>
                      <option value="participant">Participant</option>
                      <option value="master">Master</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  ) : (
                    <span className={`badge ${u.role === 'super_admin' ? 'badge-primary' : u.role === 'master' ? 'badge-accent' : 'badge-muted'}`}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}><span className="badge badge-success">{u.plan}</span></td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                  <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'var(--danger)' }} disabled={u.id === currentUser.id}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
