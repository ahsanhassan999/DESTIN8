import { useState } from 'react';
import { mockAgencies } from '../mockData';
import './AgencyApprovalsPage.css';

const TABS = ['all', 'pending', 'approved', 'rejected'];

export default function AgencyApprovalsPage() {
  const [agencies, setAgencies] = useState(mockAgencies);
  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? agencies.length : agencies.filter(a => a.status === t).length;
    return acc;
  }, {});

  const filtered = activeTab === 'all' ? agencies : agencies.filter(a => a.status === activeTab);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const approve = (id) => {
    setAgencies(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', reason: undefined } : a));
    setExpanded(null);
    showToast('Agency approved successfully.');
  };

  const startReject = (id) => {
    setRejectTarget(id);
    setRejectReason('');
  };

  const confirmReject = (id) => {
    setAgencies(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', reason: rejectReason } : a));
    setRejectTarget(null);
    setExpanded(null);
    showToast('Agency rejected.', 'danger');
  };

  return (
    <div className="approvals-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agency Approvals</h1>
          <p className="page-subtitle">Review and manage agency applications</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t}
            className={`filter-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="tab-count">{counts[t]}</span>
          </button>
        ))}
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
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No agencies found.</td></tr>
              ) : filtered.map(agency => (
                <>
                  <tr
                    key={agency.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === agency.id ? null : agency.id)}
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
                    <td>{agency.owner}</td>
                    <td><code style={{ fontSize: 12, background: 'var(--color-surface-low)', padding: '2px 7px', borderRadius: 4 }}>{agency.license}</code></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{agency.joined}</td>
                    <td><span className={`badge badge-${agency.status}`}>{agency.status}</span></td>
                    <td>
                      <ChevronIcon expanded={expanded === agency.id} />
                    </td>
                  </tr>
                  {expanded === agency.id && (
                    <tr key={`${agency.id}-exp`} className="expanded-row">
                      <td colSpan={6}>
                        <div className="expanded-content">
                          <div className="expanded-details">
                            <DetailItem label="Phone" value={agency.phone} />
                            <DetailItem label="Address" value={agency.address} />
                            <DetailItem label="Email" value={agency.email} />
                            <DetailItem label="License" value={agency.license} />
                            {agency.reason && (
                              <DetailItem label="Rejection Reason" value={agency.reason} highlight />
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

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}><CheckIcon /> {toast.msg}</div>
        </div>
      )}
    </div>
  );
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
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
