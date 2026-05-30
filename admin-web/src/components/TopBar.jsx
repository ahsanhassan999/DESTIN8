import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TopBar.css';

const PAGE_TITLES = {
  '/':         { title: 'Dashboard',          subtitle: 'Platform overview and key metrics' },
  '/agencies': { title: 'Agency Approvals',   subtitle: 'Review and manage agency applications' },
  '/users':    { title: 'User Directory',      subtitle: 'Manage all platform users' },
  '/packages': { title: 'Package Moderation', subtitle: 'Review and moderate travel packages' },
  '/chat':     { title: 'Chat Monitoring',     subtitle: 'Monitor traveler-agency conversations' },
};

export default function TopBar() {
  const location = useLocation();
  const { user } = useAuth();
  const page = PAGE_TITLES[location.pathname] || { title: 'Admin Panel', subtitle: '' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{page.title}</h1>
        {page.subtitle && <p className="topbar-subtitle">{page.subtitle}</p>}
      </div>
      <div className="topbar-right">
        <button className="topbar-bell" title="Notifications">
          <BellIcon />
          <span className="topbar-bell-dot" />
        </button>
        <div className="topbar-divider" />
        <div className="topbar-user">
          <div className="avatar avatar-md avatar-plum">{user?.initials || 'DA'}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name || 'Admin'}</span>
            <span className="topbar-user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
    </svg>
  );
}
