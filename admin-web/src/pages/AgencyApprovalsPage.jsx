import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AgencyApprovalsPage.css';

const TABS = ['all', 'pending', 'approved', 'rejected'];

export default function AgencyApprovalsPage() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAgencyForDetails, setSelectedAgencyForDetails] = useState(null);
  const [modalRejectReason, setModalRejectReason] = useState('');
  const [showModalRejectInput, setShowModalRejectInput] = useState(false);

  const loadAgencies = async () => {
    try {
      const data = await api.getAgencies();
      setAgencies(data);
    } catch (err) {
      console.error("Failed to load agencies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? agencies.length : agencies.filter(a => a.status === t).length;
    return acc;
  }, {});

  const filtered = activeTab === 'all' ? agencies : agencies.filter(a => a.status === activeTab);
  const searchFiltered = filtered.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.email && a.email.toLowerCase().includes(search.toLowerCase())) ||
    (a.agency_profile?.owner_name && a.agency_profile.owner_name.toLowerCase().includes(search.toLowerCase()))
  );

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const approve = async (id) => {
    try {
      await api.updateAgencyStatus(id, 'approved');
      showToast('Agency approved successfully.');
      setExpanded(null);
      loadAgencies();
    } catch (err) {
      showToast(err.message || 'Failed to approve agency.', 'danger');
    }
  };

  const startReject = (id) => {
    setRejectTarget(id);
    setRejectReason('');
  };

  const confirmReject = async (id) => {
    try {
      await api.updateAgencyStatus(id, 'rejected', rejectReason);
      setRejectTarget(null);
      setExpanded(null);
      showToast('Agency rejected.', 'danger');
      loadAgencies();
    } catch (err) {
      showToast(err.message || 'Failed to reject agency.', 'danger');
    }
  };

  const handleApproveFromModal = async (id) => {
    await approve(id);
    setShowDetailsModal(false);
    setSelectedAgencyForDetails(null);
  };

  const handleRejectFromModal = async (id) => {
    try {
      await api.updateAgencyStatus(id, 'rejected', modalRejectReason);
      setModalRejectReason('');
      setShowModalRejectInput(false);
      setShowDetailsModal(false);
      setSelectedAgencyForDetails(null);
      showToast('Agency rejected.', 'danger');
      loadAgencies();
    } catch (err) {
      showToast(err.message || 'Failed to reject agency.', 'danger');
    }
  };

  return (
    <div className="approvals-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agency Approvals</h1>
          <p className="page-subtitle">Review and manage agency applications</p>
        </div>
      </div>

      {/* Controls */}
      <div className="approvals-controls">
        <div className="filter-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`filter-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(t === 'all' ? 0 : 1)}
              <span className="tab-count">{counts[t]}</span>
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
                <th>Agency</th>
                <th>Owner</th>
                <th>License</th>
                <th>Applied</th>
                <th>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {searchFiltered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No agencies found.</td></tr>
              ) : searchFiltered.map(agency => (
                <>
                  <tr
                    key={agency.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedAgencyForDetails(agency); setShowDetailsModal(true); setShowModalRejectInput(false); setModalRejectReason(''); }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm avatar-plum">{agency.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{agency.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{agency.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{agency.agency_profile?.owner_name || '—'}</td>
                    <td><code style={{ fontSize: 12, background: 'var(--color-surface-low)', padding: '2px 7px', borderRadius: 4 }}>{agency.agency_profile?.license_number || '—'}</code></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{agency.created_at ? agency.created_at.split(' ')[0] : '—'}</td>
                    <td><span className={`badge badge-${agency.status}`}>{agency.status}</span></td>
                    <td onClick={(e) => { e.stopPropagation(); setExpanded(expanded === agency.id ? null : agency.id); }}>
                      <ChevronIcon expanded={expanded === agency.id} />
                    </td>
                  </tr>
                  {expanded === agency.id && (
                    <tr key={`${agency.id}-exp`} className="expanded-row" onClick={(e) => e.stopPropagation()}>
                      <td colSpan={6}>
                        <div className="expanded-content">
                          <div className="expanded-details">
                            <DetailItem label="Phone" value={agency.phone || '—'} />
                            <DetailItem label="Address" value={agency.agency_profile?.business_address || '—'} />
                            <DetailItem label="Email" value={agency.email} />
                            <DetailItem label="License" value={agency.agency_profile?.license_number || '—'} />
                            {agency.agency_profile?.rejection_reason && (
                              <DetailItem label="Rejection Reason" value={agency.agency_profile.rejection_reason} highlight />
                            )}
                          </div>
                          {agency.status === 'pending' && (
                            <div className="expanded-actions">
                              {rejectTarget === agency.id ? (
                                <div className="reject-form">
                                  <input
                                    className="form-input"
                                    placeholder="Reason for rejection..."
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    autoFocus
                                  />
                                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button className="btn btn-danger btn-sm" onClick={() => confirmReject(agency.id)} disabled={!rejectReason.trim()}>Confirm Reject</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setRejectTarget(null)}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button className="btn btn-success" onClick={() => approve(agency.id)}>
                                    <CheckIcon /> Approve
                                  </button>
                                  <button className="btn btn-danger" onClick={() => startReject(agency.id)}>
                                    <XIcon /> Reject
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agency Details Modal */}
      {showDetailsModal && selectedAgencyForDetails && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDetailsModal(false)}>
          <div className="modal details-modal">
            <div className="modal-header">
              <h2 className="modal-title">Agency Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <XIcon />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div className="avatar avatar-lg avatar-plum">
                {selectedAgencyForDetails.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selectedAgencyForDetails.name}</h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <span className="badge badge-agency">Agency</span>
                  <span className={`badge badge-${selectedAgencyForDetails.status}`}>{selectedAgencyForDetails.status}</span>
                </div>
              </div>
            </div>

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
                  <span className="details-grid-value">{selectedAgencyForDetails.agency_profile?.owner_name || '—'}</span>
                </div>
                <div className="details-grid-item">
                  <span className="details-grid-label">License Number</span>
                  <span className="details-grid-value">{selectedAgencyForDetails.agency_profile?.license_number || '—'}</span>
                </div>
                <div className="details-grid-item" style={{ gridColumn: 'span 2' }}>
                  <span className="details-grid-label">Business Address</span>
                  <span className="details-grid-value">{selectedAgencyForDetails.agency_profile?.business_address || '—'}</span>
                </div>
                <div className="details-grid-item">
                  <span className="details-grid-label">Email Address</span>
                  <span className="details-grid-value">{selectedAgencyForDetails.email}</span>
                </div>
                <div className="details-grid-item">
                  <span className="details-grid-label">Phone Number</span>
                  <span className="details-grid-value">{selectedAgencyForDetails.phone || '—'}</span>
                </div>
                {selectedAgencyForDetails.agency_profile?.rejection_reason && (
                  <div className="details-grid-item" style={{ gridColumn: 'span 2' }}>
                    <span className="details-grid-label" style={{ color: 'var(--color-danger)' }}>Rejection Reason</span>
                    <span className="details-grid-value" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{selectedAgencyForDetails.agency_profile.rejection_reason}</span>
                  </div>
                )}
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

            {selectedAgencyForDetails.status === 'pending' && (
              <div className="details-section" style={{ borderTop: '1px solid var(--color-surface-dim)', paddingTop: '16px', marginTop: '16px' }}>
                <h4 className="details-section-title" style={{ color: 'var(--color-plum)' }}>Approval Actions</h4>
                {showModalRejectInput ? (
                  <div className="reject-form" style={{ minWidth: '100%' }}>
                    <input
                      className="form-input"
                      placeholder="Reason for rejection..."
                      value={modalRejectReason}
                      onChange={e => setModalRejectReason(e.target.value)}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRejectFromModal(selectedAgencyForDetails.id)} disabled={!modalRejectReason.trim()}>Confirm Reject</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setShowModalRejectInput(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleApproveFromModal(selectedAgencyForDetails.id)}>
                      <CheckIcon /> Approve Agency
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModalRejectInput(true)}>
                      <XIcon /> Reject Agency
                    </button>
                  </div>
                )}
              </div>
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

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}

function DetailItem({ label, value, highlight }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className={`detail-value ${highlight ? 'detail-value--highlight' : ''}`}>{value}</span>
    </div>
  );
}

function ChevronIcon({ expanded }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s ease', color: 'var(--color-text-faint)' }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
