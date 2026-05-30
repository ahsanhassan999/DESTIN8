import { useState } from 'react';
import { mockPackages } from '../mockData';
import './PackageModerationPage.css';

export default function PackageModerationPage() {
  const [packages, setPackages] = useState(mockPackages);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = filter === 'all' ? packages : packages.filter(p => filter === 'active' ? p.active : !p.active);
  const counts = { all: packages.length, active: packages.filter(p => p.active).length, taken: packages.filter(p => !p.active).length };

  const toggle = (id) => {
    setPackages(prev => prev.map(p => {
      if (p.id !== id) return p;
      showToast(p.active ? 'Package taken down.' : 'Package restored.', p.active ? 'danger' : 'success');
      return { ...p, active: !p.active };
    }));
  };

  return (
    <div className="packages-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Package Moderation</h1>
          <p className="page-subtitle">Review and moderate travel packages listed by agencies</p>
        </div>
      </div>

      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {[['all', 'All', counts.all], ['active', 'Active', counts.active], ['taken', 'Taken Down', counts.taken]].map(([val, label, count]) => (
          <button key={val} className={`filter-tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
            {label} <span className="tab-count">{count}</span>
          </button>
        ))}
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
              {filtered.map(pkg => (
                <tr key={pkg.id}>
                  <td style={{ fontWeight: 600, maxWidth: 200 }}>{pkg.title}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar avatar-sm avatar-plum">{pkg.agency.charAt(0)}</div>
                      <span style={{ fontSize: 13 }}>{pkg.agency}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <MapPinIcon /> {pkg.destination}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-plum)' }}>PKR {pkg.price.toLocaleString()}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{pkg.duration} days</td>
                  <td>
                    <span className={`badge ${pkg.active ? 'badge-active' : 'badge-rejected'}`}>
                      {pkg.active ? 'Active' : 'Taken Down'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${pkg.active ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggle(pkg.id)}
                    >
                      {pkg.active ? 'Take Down' : 'Restore'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
