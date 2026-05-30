import { mockStats, mockRecentActivity, mockAgencies } from '../mockData';
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
  const pendingAgencies = mockAgencies.filter(a => a.status === 'pending');

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard
          icon={<UsersIcon />}
          iconColor="blue"
          label="Total Travelers"
          value={mockStats.totalTravelers.toLocaleString()}
          trend="+24 this week"
          trendUp
        />
        <StatCard
          icon={<AgencyIcon />}
          iconColor="plum"
          label="Total Agencies"
          value={mockStats.totalAgencies}
          trend={`${mockStats.approvedAgencies} approved`}
          trendUp
        />
        <StatCard
          icon={<PackageIcon />}
          iconColor="green"
          label="Active Packages"
          value={mockStats.activePackages}
          trend={`${mockStats.totalPackages} total`}
          trendUp
        />
        <StatCard
          icon={<ClockIcon />}
          iconColor="orange"
          label="Pending Approvals"
          value={mockStats.pendingAgencies}
          trend="Needs review"
          trendUp={false}
          alert
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
              <BreakdownRow label="Approved" value={mockStats.approvedAgencies} total={mockStats.totalAgencies} color="green" />
              <BreakdownRow label="Pending"  value={mockStats.pendingAgencies}  total={mockStats.totalAgencies} color="orange" />
              <BreakdownRow label="Rejected" value={mockStats.rejectedAgencies} total={mockStats.totalAgencies} color="red" />
            </div>
          </div>

          {/* Pending Agencies Quick View */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Awaiting Approval</h2>
              <span className="badge badge-pending">{pendingAgencies.length} pending</span>
            </div>
            <div className="pending-list">
              {pendingAgencies.map(a => (
                <div key={a.id} className="pending-item">
                  <div className="avatar avatar-sm avatar-plum">
                    {a.name.charAt(0)}
                  </div>
                  <div className="pending-info">
                    <span className="pending-name">{a.name}</span>
                    <span className="pending-owner">{a.owner}</span>
                  </div>
                  <span className="pending-date">{a.joined}</span>
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
  const pct = Math.round((value / total) * 100);
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
