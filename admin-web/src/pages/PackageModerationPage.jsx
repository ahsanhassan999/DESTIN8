import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './PackageModerationPage.css';

export default function PackageModerationPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modal and Moderation States
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [takedownTarget, setTakedownTarget] = useState(null);
  const [takedownReason, setTakedownReason] = useState('');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const loadPackages = async () => {
    try {
      const data = await api.getPackages();
      setPackages(data);
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = (filter === 'all' 
    ? packages 
    : packages.filter(p => filter === 'active' ? p.is_active : !p.is_active)
  ).filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.agency_name && p.agency_name.toLowerCase().includes(search.toLowerCase())) ||
    (p.destination && p.destination.toLowerCase().includes(search.toLowerCase())) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    (p.agency_id && p.agency_id.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = { 
    all: packages.length, 
    active: packages.filter(p => p.is_active).length, 
    taken: packages.filter(p => !p.is_active).length 
  };

  const handleRestore = async (pkg) => {
    try {
      await api.restorePackage(pkg.id);
      showToast('Package restored.', 'success');
      if (selectedPackage && selectedPackage.id === pkg.id) {
        setShowDetailsModal(false);
        setSelectedPackage(null);
      }
      loadPackages();
    } catch (err) {
      showToast(err.message || 'Failed to restore package.', 'danger');
    }
  };

  const confirmTakedown = async (e) => {
    if (e) e.preventDefault();
    if (!takedownTarget || !takedownReason.trim()) return;
    try {
      await api.takedownPackage(takedownTarget.id, takedownReason);
      showToast('Package taken down.', 'danger');
      setShowTakedownModal(false);
      setTakedownTarget(null);
      setTakedownReason('');
      if (selectedPackage && selectedPackage.id === takedownTarget.id) {
        setShowDetailsModal(false);
        setSelectedPackage(null);
      }
      loadPackages();
    } catch (err) {
      showToast(err.message || 'Failed to take down package.', 'danger');
    }
  };

  const parseJsonArray = (val) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return [];
      }
    }
    if (Array.isArray(val)) return val;
    return [];
  };

  return (
    <div className="packages-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Package Moderation</h1>
          <p className="page-subtitle">Review and moderate travel packages listed by agencies</p>
        </div>
      </div>

      <div className="users-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {[['all', 'All', counts.all], ['active', 'Active', counts.active], ['taken', 'Taken Down', counts.taken]].map(([val, label, count]) => (
            <button key={val} className={`filter-tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
              {label} <span className="tab-count">{count}</span>
            </button>
          ))}
        </div>
        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '0 16px', height: '40px', minWidth: '280px' }}>
          <SearchIcon />
          <input
            placeholder="Search title, ID or agency..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--color-text)', width: '100%', fontSize: '14px' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Agency</th>
                <th>Destination</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ display: 'inline-block', width: 30, height: 30, border: '3px solid var(--color-surface-hover)', borderTopColor: 'var(--color-plum)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No packages found.</td>
                </tr>
              ) : filtered.map(pkg => (
                <tr key={pkg.id} onClick={() => { setSelectedPackage(pkg); setShowDetailsModal(true); }} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>
                    <div>{pkg.title}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)', fontWeight: 'normal', marginTop: 2 }}>ID: {pkg.id}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar avatar-sm avatar-plum">{(pkg.agency_name || 'U').charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 13 }}>{pkg.agency_name || 'Unknown'}</div>
                        <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-muted)', marginTop: 2 }}>Agency ID: {pkg.agency_id || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <MapPinIcon /> {pkg.destination}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-plum)' }}>PKR {pkg.price.toLocaleString()}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{pkg.duration_days} days</td>
                  <td>
                    <span className={`badge ${pkg.is_active ? 'badge-active' : 'badge-rejected'}`}>
                      {pkg.is_active ? 'Active' : 'Taken Down'}
                    </span>
                  </td>
                  <td>
                    {pkg.is_active ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTakedownTarget(pkg);
                          setTakedownReason('');
                          setShowTakedownModal(true);
                        }}
                      >
                        Take Down
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(pkg);
                        }}
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Details Modal */}
      {showDetailsModal && selectedPackage && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDetailsModal(false)}>
          <div className="modal details-modal" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">Package Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <XIcon />
              </button>
            </div>

            {selectedPackage.cover_image && (
              <img
                src={selectedPackage.cover_image.startsWith('http') ? selectedPackage.cover_image : `http://localhost:8000${selectedPackage.cover_image}`}
                alt={selectedPackage.title}
                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-text)' }}>{selectedPackage.title}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span className="badge badge-agency">Agency: {selectedPackage.agency_name}</span>
                <span className={`badge ${selectedPackage.is_active ? 'badge-active' : 'badge-rejected'}`}>
                  {selectedPackage.is_active ? 'Active' : 'Taken Down'}
                </span>
              </div>
            </div>

            <div className="details-stats">
              <div className="details-stat-card">
                <div className="details-stat-val">PKR {selectedPackage.price.toLocaleString()}</div>
                <div className="details-stat-lbl">Price</div>
              </div>
              <div className="details-stat-card">
                <div className="details-stat-val">{selectedPackage.duration_days}</div>
                <div className="details-stat-lbl">Days</div>
              </div>
              <div className="details-stat-card">
                <div className="details-stat-val" style={{ fontSize: '13px', paddingTop: '6px' }}>
                  {selectedPackage.departure_date || 'Flexible'}
                </div>
                <div className="details-stat-lbl">Departure</div>
              </div>
            </div>

            <div className="details-section">
              <h4 className="details-section-title">Overview</h4>
              <div className="details-grid" style={{ gridTemplateColumns: '1fr', gap: '8px' }}>
                <div className="details-grid-item">
                  <span className="details-grid-label">Destination</span>
                  <span className="details-grid-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPinIcon /> {selectedPackage.destination}
                  </span>
                </div>
                <div className="details-grid-item" style={{ marginTop: '8px' }}>
                  <span className="details-grid-label">Description</span>
                  <span className="details-grid-value" style={{ fontWeight: 'normal', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                    {selectedPackage.description}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4 className="details-section-title">Record IDs</h4>
              <div className="details-grid">
                <div className="details-grid-item">
                  <span className="details-grid-label">Package ID</span>
                  <span className="details-grid-value" style={{ fontFamily: 'monospace', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {selectedPackage.id}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedPackage.id); showToast('Package ID copied to clipboard!'); }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', color: 'var(--color-text-muted)' }}
                      title="Copy ID"
                    >
                      <CopyIcon />
                    </button>
                  </span>
                </div>
                <div className="details-grid-item">
                  <span className="details-grid-label">Agency ID</span>
                  <span className="details-grid-value" style={{ fontFamily: 'monospace', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {selectedPackage.agency_id}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(selectedPackage.agency_id); showToast('Agency ID copied to clipboard!'); }}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', color: 'var(--color-text-muted)' }}
                      title="Copy ID"
                    >
                      <CopyIcon />
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {selectedPackage.is_takedown && (
              <div className="details-section" style={{ background: 'var(--color-danger-bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #FCA5A5', marginBottom: '24px' }}>
                <h4 className="details-section-title" style={{ color: 'var(--color-danger)', borderBottom: 'none', marginBottom: '8px', paddingBottom: '0' }}>Takedown Reason</h4>
                <p style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: '13.5px' }}>
                  {selectedPackage.takedown_reason || 'No reason provided.'}
                </p>
              </div>
            )}

            {parseJsonArray(selectedPackage.included_services).length > 0 && (
              <div className="details-section">
                <h4 className="details-section-title">Included Services</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {parseJsonArray(selectedPackage.included_services).map((service, idx) => (
                    <span key={idx} style={{ background: 'var(--color-lavender-light)', color: 'var(--color-plum)', padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', fontWeight: '500' }}>
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parseJsonArray(selectedPackage.itinerary).length > 0 && (
              <div className="details-section">
                <h4 className="details-section-title">Itinerary Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--color-surface-dim)', paddingLeft: '16px', marginLeft: '8px' }}>
                  {parseJsonArray(selectedPackage.itinerary).map((day, idx) => (
                    <div key={day.id || idx} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-plum)', border: '2px solid var(--color-surface)' }} />
                      <div style={{ fontWeight: '700', fontSize: '11px', color: 'var(--color-text-faint)', textTransform: 'uppercase' }}>
                        Day {idx + 1}
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text)', marginTop: '2px' }}>
                        {day.title || `Day ${idx + 1}`}
                      </div>
                      {day.desc && (
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                          {day.desc}
                        </p>
                      )}
                      {(day.accommodation || day.location || (day.transport && day.transport.length > 0)) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '11.5px', color: 'var(--color-text-faint)' }}>
                          {day.location && <span>📍 {day.location}</span>}
                          {day.accommodation && <span>🏨 Stay: {day.accommodation}</span>}
                          {day.transport && day.transport.length > 0 && <span>🚗 {day.transport.join(', ')}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="details-section" style={{ borderTop: '1px solid var(--color-surface-dim)', paddingTop: '20px', marginTop: '20px' }}>
              <h4 className="details-section-title" style={{ color: 'var(--color-plum)' }}>Moderation Actions</h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedPackage.is_active ? (
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      setTakedownTarget(selectedPackage);
                      setTakedownReason('');
                      setShowTakedownModal(true);
                    }}
                  >
                    Take Down Package
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleRestore(selectedPackage)}
                  >
                    <CheckIcon /> Restore Package
                  </button>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Takedown Reason Modal */}
      {showTakedownModal && takedownTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowTakedownModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Reason for Takedown</h2>
              <button className="modal-close" onClick={() => setShowTakedownModal(false)}>
                <XIcon />
              </button>
            </div>
            <form onSubmit={confirmTakedown}>
              <div className="form-group">
                <label className="form-label">Takedown Justification</label>
                <textarea
                  className="form-input"
                  placeholder="Provide the reason for taking down this package..."
                  rows={4}
                  required
                  value={takedownReason}
                  onChange={(e) => setTakedownReason(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '4px' }}>
                  The agency user will see this explanation and will be blocked from re-publishing until approved.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={!takedownReason.trim()}
                >
                  Take Down
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTakedownModal(false);
                    setTakedownTarget(null);
                    setTakedownReason('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}

function MapPinIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-faint)' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}

function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-faint)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}
