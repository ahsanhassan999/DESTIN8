import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './UserDirectoryPage.css';

const ROLE_TABS = ['all', 'traveler', 'agency', 'admin'];

export default function UserDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    role: 'traveler',
    name: '',
    email: '',
    password: '',
    phone: '',
    owner_name: '',
    business_address: '',
    license_number: '',
  });
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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

  const toggleSuspend = async (user) => {
    try {
      if (user.status === 'suspended') {
        await api.activateUser(user.id);
        showToast('User activated.', 'success');
        loadUsers();
      } else {
        setSuspendTarget(user);
        setSuspendReason('');
        setShowSuspendModal(true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle user suspension.', 'danger');
    }
  };

  const confirmSuspend = async (e) => {
    e.preventDefault();
    if (!suspendReason.trim()) return;
    try {
      await api.suspendUser(suspendTarget.id, suspendReason.trim());
      showToast('User suspended.', 'danger');
      setShowSuspendModal(false);
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to suspend user.', 'danger');
    }
  };

  const openCreateModal = () => {
    setShowModal(true);
    setNewUser({
      role: activeRole === 'all' ? 'traveler' : activeRole,
      name: '',
      email: '',
      password: '',
      phone: '',
      owner_name: '',
      business_address: '',
      license_number: '',
    });
  };

  const handleDelete = (user) => {
    setDeleteTarget(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteUser(deleteTarget.id);
      showToast('User account permanently deleted.', 'danger');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete account.', 'danger');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      // Build data depending on role
      const payload = {
        role: newUser.role,
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        phone: newUser.phone || null,
      };

      if (newUser.role === 'agency') {
        payload.owner_name = newUser.owner_name || newUser.name;
        payload.business_address = newUser.business_address || '';
        payload.license_number = newUser.license_number || '';
      }

      await api.createAdminUser(payload);
      setShowModal(false);
      setNewUser({
        role: 'traveler',
        name: '',
        email: '',
        password: '',
        phone: '',
        owner_name: '',
        business_address: '',
        license_number: '',
      });
      showToast('Account created successfully.');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to create user account.', 'danger');
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Directory</h1>
          <p className="page-subtitle">Manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <PlusIcon /> {
            activeRole === 'all' ? 'Create User' :
            activeRole === 'traveler' ? 'Create traveler account' :
            activeRole === 'agency' ? 'Create agency account' :
            'Create admin account'
          }
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
                <tr key={user.id} onClick={() => { setSelectedUserForDetails(user); setShowDetailsModal(true); }} style={{ cursor: 'pointer' }}>
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
                   <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{user.created_at ? user.created_at.split(' ')[0] : '—'}</td>
                  <td>
                    {user.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className={`btn btn-sm ${user.status === 'suspended' ? 'btn-success' : 'btn-danger'}`}
                          onClick={(e) => { e.stopPropagation(); toggleSuspend(user); }}
                        >
                          {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        {user.status === 'suspended' && (
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ backgroundColor: '#b41340', color: '#ffffff' }}
                            onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Account</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XIcon />
              </button>
            </div>
            <form onSubmit={createUser}>
              <div className="form-group">
                <label className="form-label" htmlFor="user-role">Account Role</label>
                <select
                  id="user-role"
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px', color: 'var(--color-text)' }}
                  value={newUser.role}
                  onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="traveler">Traveler</option>
                  <option value="agency">Agency</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {newUser.role === 'agency' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Agency Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Odyssey Travels" required value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Ahmed Hassan" required value={newUser.owner_name} onChange={e => setNewUser(p => ({ ...p, owner_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business Address</label>
                    <input type="text" className="form-input" placeholder="e.g. 12 MM Alam Rd, Lahore" required value={newUser.business_address} onChange={e => setNewUser(p => ({ ...p, business_address: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input type="text" className="form-input" placeholder="e.g. LHR-AGN-00121" required value={newUser.license_number} onChange={e => setNewUser(p => ({ ...p, license_number: e.target.value }))} />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Bilal Ahmed" required value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="user@destin8.com" required value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" placeholder="e.g. +92-300-1234567" value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Min. 8 characters" required minLength={8} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Reason Modal */}
      {showSuspendModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSuspendModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Suspend User Account</h2>
              <button className="modal-close" onClick={() => setShowSuspendModal(false)}>
                <XIcon />
              </button>
            </div>
            <form onSubmit={confirmSuspend}>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                Please provide a suspension reason for <strong>{suspendTarget?.name}</strong>. The account must be suspended with a reason before it can be deleted.
              </div>
              <div className="form-group">
                <label className="form-label">Suspension Reason</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Violation of terms / Spamming package listings"
                  required
                  autoFocus
                  value={suspendReason}
                  onChange={e => setSuspendReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSuspendModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Suspend Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title" style={{ color: '#b41340' }}>Delete User Account</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <XIcon />
              </button>
            </div>
            <div style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.5', color: 'var(--color-text)' }}>
              Are you sure you want to permanently delete the account for <strong>{deleteTarget?.name}</strong> (<em>{deleteTarget?.email}</em>)?
              <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#FFE4EC', borderLeft: '4px solid #b41340', borderRadius: '4px', fontSize: '13px', color: '#b41340' }}>
                <strong>WARNING:</strong> This action is permanent and cannot be undone. All associated packages, bookings, reviews, and profile records will be permanently deleted.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" style={{ backgroundColor: '#b41340', color: '#ffffff' }} onClick={confirmDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUserForDetails && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDetailsModal(false)}>
          <div className="modal details-modal">
            <div className="modal-header">
              <h2 className="modal-title">Account Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <XIcon />
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div className={`avatar avatar-lg ${getAvatarColor(selectedUserForDetails.role)}`}>
                {selectedUserForDetails.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selectedUserForDetails.name}</h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <span className={`badge badge-${selectedUserForDetails.role}`}>{selectedUserForDetails.role}</span>
                  <span className={`badge badge-${selectedUserForDetails.status}`}>{selectedUserForDetails.status}</span>
                </div>
              </div>
            </div>

            {selectedUserForDetails.role === 'traveler' && (
              <>
                <div className="details-stats">
                  <div className="details-stat-card">
                    <div className="details-stat-val">5</div>
                    <div className="details-stat-lbl">Trips Booked</div>
                  </div>
                  <div className="details-stat-card">
                    <div className="details-stat-val">3</div>
                    <div className="details-stat-lbl">Completed</div>
                  </div>
                  <div className="details-stat-card">
                    <div className="details-stat-val">4.8 ★</div>
                    <div className="details-stat-lbl">Avg Rating</div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="details-section-title">Profile Info</h4>
                  <div className="details-grid">
                    <div className="details-grid-item">
                      <span className="details-grid-label">Email</span>
                      <span className="details-grid-value">{selectedUserForDetails.email}</span>
                    </div>
                    <div className="details-grid-item">
                      <span className="details-grid-label">Phone</span>
                      <span className="details-grid-value">{selectedUserForDetails.phone || '—'}</span>
                    </div>
                    <div className="details-grid-item">
                      <span className="details-grid-label">Joined Date</span>
                      <span className="details-grid-value">{selectedUserForDetails.created_at ? selectedUserForDetails.created_at.split(' ')[0] : '—'}</span>
                    </div>
                    <div className="details-grid-item">
                      <span className="details-grid-label">Bio</span>
                      <span className="details-grid-value">Explorer & traveler interested in nature retreats and mountain hiking.</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="details-section-title">Recent Trips</h4>
                  <div className="details-list">
                    <div className="details-list-item">
                      <span className="details-list-item-name">Hunza Valley Autumn Adventure</span>
                      <span className="details-list-item-meta"><span className="badge badge-approved">Confirmed</span></span>
                    </div>
                    <div className="details-list-item">
                      <span className="details-list-item-name">Skardu Valley Wilderness</span>
                      <span className="details-list-item-meta"><span className="badge badge-pending">Pending</span></span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedUserForDetails.role === 'agency' && (
              <>
                <div className="details-stats">
                  <div className="details-stat-card">
                    <div className="details-stat-val">4</div>
                    <div className="details-stat-lbl">Active Packages</div>
                  </div>
                  <div className="details-stat-card">
                    <div className="details-stat-val">18</div>
                    <div className="details-stat-lbl">Bookings Managed</div>
                  </div>
                  <div className="details-stat-card">
                    <div className="details-stat-val">4.9 ★</div>
                    <div className="details-stat-lbl">Agency Rating</div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="details-section-title">Agency Credentials</h4>
                  <div className="details-grid">
                    <div className="details-grid-item">
                      <span className="details-grid-label">Owner Name</span>
                      <span className="details-grid-value">{selectedUserForDetails.agency_profile?.owner_name || selectedUserForDetails.name || '—'}</span>
                    </div>
                    <div className="details-grid-item">
                      <span className="details-grid-label">License Number</span>
                      <span className="details-grid-value">{selectedUserForDetails.agency_profile?.license_number || '—'}</span>
                    </div>
                    <div className="details-grid-item" style={{ gridColumn: 'span 2' }}>
                      <span className="details-grid-label">Business Address</span>
                      <span className="details-grid-value">{selectedUserForDetails.agency_profile?.business_address || '—'}</span>
                    </div>
                    <div className="details-grid-item">
                      <span className="details-grid-label">Email Address</span>
                      <span className="details-grid-value">{selectedUserForDetails.email}</span>
                    </div>
                    <div className="details-grid-item">
                      <span className="details-grid-label">Phone Number</span>
                      <span className="details-grid-value">{selectedUserForDetails.phone || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="details-section-title">Active Packages</h4>
                  <div className="details-list">
                    <div className="details-list-item">
                      <span className="details-list-item-name">Hunza Valley Autumn Adventure</span>
                      <span className="details-list-item-meta">Rs. 120,000</span>
                    </div>
                    <div className="details-list-item">
                      <span className="details-list-item-name">Skardu Valley Wilderness Expedition</span>
                      <span className="details-list-item-meta">Rs. 160,000</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedUserForDetails.role === 'admin' && (
              <>
                <div className="details-section">
                  <h4 className="details-section-title">Admin Info</h4>
                  <div className="details-grid">
                    <div className="details-grid-item">
                      <span className="details-grid-label">Access Level</span>
                      <span className="details-grid-value" style={{ color: 'var(--color-plum)', fontWeight: 700 }}>Full Administrator</span>
                    </div>
                    <div className="details-grid-item">
                      <span className="details-grid-label">Joined Date</span>
                      <span className="details-grid-value">{selectedUserForDetails.created_at ? selectedUserForDetails.created_at.split(' ')[0] : '—'}</span>
                    </div>
                    <div className="details-grid-item" style={{ gridColumn: 'span 2' }}>
                      <span className="details-grid-label">Email Address</span>
                      <span className="details-grid-value">{selectedUserForDetails.email}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="details-section-title">System Activities (Mock)</h4>
                  <div className="details-list">
                    <div className="details-list-item">
                      <span className="details-list-item-name">Approved agency "Odyssey Travels"</span>
                      <span className="details-list-item-meta">1 day ago</span>
                    </div>
                    <div className="details-list-item">
                      <span className="details-list-item-name">Suspended traveler "Spam Account"</span>
                      <span className="details-list-item-meta">3 days ago</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
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
