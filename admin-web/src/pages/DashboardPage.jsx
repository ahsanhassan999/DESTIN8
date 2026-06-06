import { useState, useEffect } from 'react';
import { mockRecentActivity } from '../mockData';
import { api } from '../services/api';
import './DashboardPage.css';

const ACTIVITY_ICONS = {
  register_traveler: { icon: '👤', color: 'blue'   },
  register_agency:   { icon: '🏢', color: 'plum'   },
  approved:          { icon: '✓',  color: 'green'  },
  rejected:          { icon: '✕',  color: 'red'    },
  package:           { icon: '📦', color: 'orange' },
  suspended:         { icon: '⊘',  color: 'grey'   },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_travelers: 0,
    total_agencies: 0,
    approved_agencies: 0,
    pending_agencies: 0,
    total_packages: 0,
    active_packages: 0,
  });
  const [pendingAgencies, setPendingAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsData = await api.getStats();
        setStats(statsData);

        const agenciesData = await api.getAgencies("pending");
        setPendingAgencies(agenciesData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--color-text-muted)' }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--color-surface-hover)', borderTopColor: 'var(--color-plum)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard
          icon={<UsersIcon />}
          iconColor="blue"
          label="Total Travelers"
          value={stats.total_travelers.toLocaleString()}
          trend="Real-time count"
          trendUp
        />
        <StatCard
          icon={<AgencyIcon />}
          iconColor="plum"
          label="Total Agencies"
          value={stats.total_agencies}
          trend={`${stats.approved_agencies} approved`}
          trendUp
        />
        <StatCard
          icon={<PackageIcon />}
          iconColor="green"
          label="Active Packages"
          value={stats.active_packages}
          trend={`${stats.total_packages} total`}
          trendUp
        />
        <StatCard
          icon={<ClockIcon />}
          iconColor="orange"
          label="Pending Approvals"
          value={stats.pending_agencies}
          trend="Needs review"
          trendUp={false}
          alert={stats.pending_agencies > 0}
        />
      </div>

      {/* Two column layout */}
      <div className="dashboard-cols">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <span className="card-count">{mockRecentActivity.length} events</span>
          </div>
          <div className="activity-list">
            {mockRecentActivity.map(item => {
              const meta = ACTIVITY_ICONS[item.type] || { icon: '•', color: 'grey' };
              return (
                <div key={item.id} className="activity-item">
                  <div className={`activity-icon activity-icon--${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="activity-body">
                    <span className="activity-user">{item.user}</span>
                    <span className="activity-detail">{item.detail}</span>
                  </div>
                  <span className="activity-time">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="dashboard-right">
          {/* Agency Breakdown */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Agency Breakdown</h2>
            </div>
            <div className="breakdown-list">
              <BreakdownRow label="Approved" value={stats.approved_agencies} total={stats.total_agencies} color="green" />
              <BreakdownRow label="Pending"  value={stats.pending_agencies}  total={stats.total_agencies} color="orange" />
              <BreakdownRow label="Rejected" value={stats.total_agencies - stats.approved_agencies - stats.pending_agencies} total={stats.total_agencies} color="red" />
            </div>
          </div>

          {/* Pending Agencies Quick View */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Awaiting Approval</h2>
              <span className="badge badge-pending">{pendingAgencies.length} pending</span>
            </div>
            <div className="pending-list">
              {pendingAgencies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-muted)', fontSize: 14 }}>No pending agencies.</div>
              ) : pendingAgencies.map(a => (
                <div key={a.id} className="pending-item">
                  <div className="avatar avatar-sm avatar-plum">
                    {a.name.charAt(0)}
                  </div>
                  <div className="pending-info">
                    <span className="pending-name">{a.name}</span>
                    <span className="pending-owner">{a.agency_profile?.owner_name || '—'}</span>
                  </div>
                  <span className="pending-date">{a.created_at ? a.created_at.split(' ')[0] : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconColor, label, value, trend, trendUp, alert }) {
  return (
    <div className={`stat-card ${alert ? 'stat-card--alert' : ''}`}>
      <div className={`stat-icon stat-icon--${iconColor}`}>{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        <span className={`stat-trend ${trendUp ? 'stat-trend--up' : 'stat-trend--neutral'}`}>
          {trendUp ? <TrendUpIcon /> : <AlertIcon />}
          {trend}
        </span>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="breakdown-row">
      <div className="breakdown-header">
        <span className="breakdown-label">{label}</span>
        <span className="breakdown-value">{value} <span className="breakdown-pct">({pct}%)</span></span>
      </div>
      <div className="breakdown-bar-bg">
        <div className={`breakdown-bar breakdown-bar--${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Icons
function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function AgencyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M9 8h1m5 0h1M9 12h1m5 0h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>;
}
function PackageIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/></svg>;
}
function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function TrendUpIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
}
function AlertIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
