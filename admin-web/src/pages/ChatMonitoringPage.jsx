import { mockConversations } from '../mockData';
import './ChatMonitoringPage.css';

export default function ChatMonitoringPage() {
  return (
    <div className="chat-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Chat Monitoring</h1>
          <p className="page-subtitle">Monitor traveler–agency conversations</p>
        </div>
        <span className="badge badge-coming" style={{ fontSize: 11, padding: '5px 12px' }}>Read-Only Preview</span>
      </div>

      <div className="chat-layout">
        {/* Conversation List */}
        <div className="card chat-list-card" style={{ padding: 0 }}>
          <div className="chat-list-header">
            <span className="card-title" style={{ padding: '18px 20px 0' }}>Conversations</span>
            <span className="card-count" style={{ marginRight: 20 }}>{mockConversations.length}</span>
          </div>
          <div className="chat-list">
            {mockConversations.map(conv => (
              <div key={conv.id} className={`chat-item ${conv.unread ? 'chat-item--unread' : ''}`}>
                <div className="avatar avatar-md avatar-blue">{conv.traveler.charAt(0)}</div>
                <div className="chat-item-body">
                  <div className="chat-item-top">
                    <span className="chat-item-name">{conv.traveler}</span>
                    <span className="chat-item-time">{conv.time}</span>
                  </div>
                  <span className="chat-item-agency">{conv.agency} · {conv.package}</span>
                  <span className="chat-item-msg">{conv.lastMsg}</span>
                </div>
                {conv.unread && <div className="chat-unread-dot" />}
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon panel */}
        <div className="card chat-coming-card">
          <div className="coming-soon-content">
            <div className="empty-icon">
              <ChatBubbleIcon />
            </div>
            <h2 className="empty-title">Full Chat View Coming Soon</h2>
            <p className="empty-desc">
              Real-time chat monitoring with message history, flagging, and intervention tools will be available in a future update.
            </p>
            <div className="coming-tags">
              <span className="badge badge-coming">Message History</span>
              <span className="badge badge-coming">Flag Content</span>
              <span className="badge badge-coming">Live Monitor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-plum)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5z"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
    </svg>
  );
}
