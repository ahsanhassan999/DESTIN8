import { useState } from 'react';
import { mockUsers } from '../mockData';
import './UserDirectoryPage.css';

const ROLE_TABS = ['all', 'traveler', 'agency', 'admin'];

export default function UserDirectoryPage() {
  const [users, setUsers] = useState(mockUsers);
  const [activeRole, setActiveRole] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const counts = ROLE_TABS.reduce((acc, r) => {
    acc[r] = r === 'all' ? users.length : users.filter(u => u.role === r).length;
    return acc;
  }, {});

  const filtered = users
    .filter(u => activeRole === 'all' || u.role === activeRole)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const toggleSuspend = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const newStatus = u.status === 'suspended' ? 'active' : 'suspended';
      showToast(newStatus === 'suspended' ? 'User suspended.' : 'User activated.', newStatus === 'suspended' ? 'danger' : 'success');
      return { ...u, status: newStatus };
    }));
  };

  const createAdmin = (e) => {
    e.preventDefault();
    const id = 'u' + Date.now();
    setUsers(prev => [...prev, { ...newAdmin, id, phone: null, role: 'admin', status: 'active', joined: new Date().toISOString().split('T')[0] }]);
    setShowModal(false);
    setNewAdmin({ name: '', email: '', password: '' });
    showToast('Admin account created successfully.');
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Directory</h1>
          <p className="page-subtitle">Manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusIcon /> Create Admin
        </button>
      </div>

      {/* Controls */}
      <div className="users-controls">
        <div className="filter-tabs">
          {ROLE_TABS.map(r => (
            <button key={r} className={`filter-tab ${activeRole === r ? 'active' : ''}`} onClick={() => setActiveRole(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
              <span className="tab-count">{counts[r]}</span>
            </button>
          ))}
        </div>
        <div className="search-bar">
          <SearchIcon />
          <input
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No users found.</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`avatar avatar-sm ${getAvatarColor(user.role)}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{user.phone || '—'}</td>
                  <td><span className={`badge badge-${user.status}`}>{user.status}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{user.joined}</td>
                  <td>
                    {user.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${user.status === 'suspended' ? 'btn-success' : 'btn-danger'}`}
                        onClick={() => toggleSuspend(user.id)}
                      >
                        {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create Admin Account</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XIcon />
              </button>
            </div>
            <form onSubmit={createAdmin}>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-name">Full Name</label>
                <input id="admin-name" type="text" className="form-input" placeholder="e.g. Support Admin" required value={newAdmin.name} onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-email">Email Address</label>
                <input id="admin-email" type="email" className="form-input" placeholder="admin@destin8.com" required value={newAdmin.email} onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="admin-password">Password</label>
                <input id="admin-password" type="password" className="form-input" placeholder="Min. 8 characters" required minLength={8} value={newAdmin.password} onChange={e => setNewAdmin(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}><CheckIcon /> {toast.msg}</div>
        </div>
      )}
    </div>
  );
}

function getAvatarColor(role) {
  return { traveler: 'avatar-blue', agency: 'avatar-plum', admin: 'avatar-orange' }[role] || 'avatar-plum';
}

function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
