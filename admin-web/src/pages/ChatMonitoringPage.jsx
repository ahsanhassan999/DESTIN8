import { useState, useEffect, useRef } from 'react';
import { mockConversations } from '../mockData';
import { api } from '../services/api';
import './ChatMonitoringPage.css';

// ─── Mock Messages Database ──────────────────────────────────────────────────
const INITIAL_MESSAGES = {
  c1: [
    { id: 1, sender: 'traveler', text: 'Hello! I am planning to join the K2 Base Camp Expedition next month.', time: '10:15 AM' },
    { id: 2, sender: 'agency', text: 'Hi Ahmed! That is wonderful. The K2 Base Camp trek is a phenomenal choice. The next departure is on June 25th.', time: '10:18 AM' },
    { id: 3, sender: 'traveler', text: 'Is there a group discount? We have a team of 4 people planning to book.', time: '10:20 AM' },
    { id: 4, sender: 'agency', text: 'Yes, absolutely! We offer a 10% discount for groups of 4 or more. We also have customizable deposit ratios.', time: '10:22 AM' },
    { id: 5, sender: 'traveler', text: 'Perfect. What details do you need for booking?', time: '10:25 AM' },
    { id: 6, sender: 'agency', text: 'Just your passport copies and a 50% deposit. Please transfer the remaining amount to my personal account or contact me at +92-311-2345678.', time: '10:28 AM' },
    { id: 7, sender: 'system', text: 'Warning: The agency requested payment outside the platform. Sharing direct bank details is against platform terms.', time: '10:29 AM', isWarning: true },
    { id: 8, sender: 'traveler', text: 'Is there a group discount?', time: '10:30 AM' },
  ],
  c2: [
    { id: 1, sender: 'traveler', text: 'Hi Blue Horizon team, regarding the Maldives Escape package, does it include water villa stay?', time: '09:00 AM' },
    { id: 2, sender: 'agency', text: 'Yes, Ali! The package includes 3 nights in a beach villa and 2 nights in an overwater pool villa.', time: '09:05 AM' },
    { id: 3, sender: 'traveler', text: 'Great. I have completed the deposit payment on the app.', time: '09:12 AM' },
    { id: 4, sender: 'agency', text: 'Received! We have confirmed your booking. Please confirm my seat.', time: '09:15 AM' },
  ],
  c3: [
    { id: 1, sender: 'traveler', text: 'Hi Zara, I wanted to enquire about the Swat Valley Spring Bloom Tour.', time: 'Yesterday' },
    { id: 2, sender: 'agency', text: 'Hello Usman! The Swat Spring Bloom is beautiful right now. What details can I help you with?', time: 'Yesterday' },
    { id: 3, sender: 'traveler', text: 'What is included in the price?', time: 'Yesterday' },
  ],
  c4: [
    { id: 1, sender: 'traveler', text: 'Hello Nadia, I have booked the Dubai Weekend Getaway. Can I cancel for a refund?', time: 'Yesterday' },
    { id: 2, sender: 'agency', text: 'Hi Maria! Cancellation is free up to 7 days before departure. After that, a 10% platform fee is retained.', time: 'Yesterday' },
    { id: 3, sender: 'traveler', text: 'Can I cancel for a refund?', time: 'Yesterday' },
  ],
  c5: [
    { id: 1, sender: 'traveler', text: 'Hello, what are the safety guidelines for the Hunza Valley Luxury Retreat?', time: '2 days ago' },
    { id: 2, sender: 'agency', text: 'Hi Fatima! The tour is fully guided by certified mountaineers. Oxygen kits and first aid are provided.', time: '2 days ago' },
    { id: 3, sender: 'traveler', text: 'Awesome! I will book now.', time: '2 days ago' },
  ],
};

const PRESET_WARNINGS = [
  'Security Check: Sharing direct phone numbers or bank details is prohibited.',
  'Payment Alert: Keep all booking payments inside the platform to remain protected.',
  'Moderation Notice: Inappropriate language detected. Please maintain professional communication.',
];

// ─── Default Tags ─────────────────────────────────────────────────────────────
const DEFAULT_TAGS = [
  { id: 't1', label: 'Off-Platform Payment', color: '#ef4444' },
  { id: 't2', label: 'Refund Request',        color: '#f59e0b' },
  { id: 't3', label: 'Suspicious Activity',  color: '#8b5cf6' },
  { id: 't4', label: 'Resolved',             color: '#10b981' },
  { id: 't5', label: 'Needs Follow-up',      color: '#0ea5e9' },
];

// ─── Stat Icons (matching DashboardPage exact shapes) ─────────────────────────
function IconChats() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5z"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
    </svg>
  );
}
function IconFlagged() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  );
}
function IconUnread() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconWarnings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

export default function ChatMonitoringPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messagesDb, setMessagesDb] = useState(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | flagged | <tag-id>
  const [warningText, setWarningText] = useState('');
  const [flaggedIds, setFlaggedIds] = useState(new Set(['c1']));

  // Tags state
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [convTags, setConvTags] = useState({ c1: ['t1', 't3'] }); // conv id → tag ids
  const [showTagModal, setShowTagModal] = useState(false);   // tag manager modal
  const [showCreateTag, setShowCreateTag] = useState(false); // create tag sub-panel
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');
  const [tagAssignConvId, setTagAssignConvId] = useState(null); // which conv is being tagged

  // Takedown state
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [takedownReason, setTakedownReason] = useState('');
  const [takedownPkgId, setTakedownPkgId] = useState(null);
  const [takedownPkgTitle, setTakedownPkgTitle] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => { setConversations(mockConversations); }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeMessages = messagesDb[activeConvId] || [];
  const activeConvTagIds = convTags[activeConvId] || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // ─── Derived stats ────────────────────────────────────────────────────────
  const totalChats    = conversations.length;
  const flaggedCount  = flaggedIds.size;
  const unreadCount   = conversations.filter(c => c.unread).length;
  const warningCount  = Object.values(messagesDb).reduce(
    (acc, msgs) => acc + msgs.filter(m => m.sender === 'system').length, 0
  );

  const handleSelectConversation = (id) => {
    setActiveConvId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: false } : c));
  };

  const handleSendWarning = (text) => {
    if (!text.trim() || !activeConvId) return;
    const newMsg = {
      id: Date.now(),
      sender: 'system',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWarning: true,
    };
    setMessagesDb(prev => ({ ...prev, [activeConvId]: [...(prev[activeConvId] || []), newMsg] }));
    setConversations(prev =>
      prev.map(c => c.id === activeConvId ? { ...c, lastMsg: `⚠ System Warning: ${text.trim()}` } : c)
    );
    setWarningText('');
  };

  const toggleFlag = (id) => {
    setFlaggedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ─── Tag Management ────────────────────────────────────────────────────────
  const handleCreateTag = () => {
    if (!newTagLabel.trim()) return;
    const tag = { id: `t${Date.now()}`, label: newTagLabel.trim(), color: newTagColor };
    setTags(prev => [...prev, tag]);
    setNewTagLabel('');
    setNewTagColor('#6366f1');
    setShowCreateTag(false);
  };

  const handleDeleteTag = (tagId) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setConvTags(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(convId => {
        updated[convId] = updated[convId].filter(id => id !== tagId);
      });
      return updated;
    });
  };

  const toggleConvTag = (convId, tagId) => {
    setConvTags(prev => {
      const existing = prev[convId] || [];
      const next = existing.includes(tagId)
        ? existing.filter(id => id !== tagId)
        : [...existing, tagId];
      return { ...prev, [convId]: next };
    });
  };

  const openTagAssign = (convId, e) => {
    e.stopPropagation();
    setTagAssignConvId(tagAssignConvId === convId ? null : convId);
  };

  // ─── Takedown ─────────────────────────────────────────────────────────────
  const handleInitiateTakedown = async () => {
    if (!activeConv) return;
    try {
      const packages = await api.getPackages();
      const match = packages.find(
        p => p.title.toLowerCase().includes(activeConv.package.toLowerCase()) ||
             activeConv.package.toLowerCase().includes(p.title.toLowerCase())
      );
      if (match) {
        setTakedownPkgId(match.id);
        setTakedownPkgTitle(match.title);
        setTakedownReason('');
        setShowTakedownModal(true);
      } else {
        alert(`Could not find a package matching "${activeConv.package}" in the database.`);
      }
    } catch (err) {
      alert('Error finding package: ' + err.message);
    }
  };

  const handleConfirmTakedown = async () => {
    if (!takedownPkgId || !takedownReason.trim()) return;
    try {
      await api.takedownPackage(takedownPkgId, takedownReason.trim());
      alert(`Package "${takedownPkgTitle}" has been successfully taken down.`);
      setShowTakedownModal(false);
    } catch (err) {
      alert('Takedown failed: ' + err.message);
    }
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────────
  const filteredConversations = conversations.filter(c => {
    const q = search.toLowerCase();
    const matchesQuery = c.traveler.toLowerCase().includes(q) ||
                         c.agency.toLowerCase().includes(q) ||
                         c.package.toLowerCase().includes(q);
    if (filter === 'unread')   return matchesQuery && c.unread;
    if (filter === 'flagged')  return matchesQuery && flaggedIds.has(c.id);
    if (filter.startsWith('t')) return matchesQuery && (convTags[c.id] || []).includes(filter);
    return matchesQuery;
  });

  const TAG_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="chat-page">
      {/* ─── Page Header ──────────────────────────────────────────────────── */}
      <div className="chat-page-header">
        <div>
          <h1 className="chat-page-title">Chat &amp; Message Monitoring</h1>
          <p className="chat-page-sub">Monitor live communication, flag violations, manage tags, and send moderation alerts</p>
        </div>
        <button className="btn-manage-tags" onClick={() => setShowTagModal(true)}>
          <IconTagsIcon /> Manage Tags
        </button>
      </div>

      {/* ─── Stat Cards (Dashboard-style) ─────────────────────────────────── */}
      <div className="chat-stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--blue"><IconChats /></div>
          <div className="stat-body">
            <span className="stat-label">Total Chats</span>
            <span className="stat-value">{totalChats}</span>
            <span className="stat-trend stat-trend--up"><span>Active conversations</span></span>
          </div>
        </div>
        <div className="stat-card stat-card--alert">
          <div className="stat-icon stat-icon--orange"><IconUnread /></div>
          <div className="stat-body">
            <span className="stat-label">Unread</span>
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-trend stat-trend--neutral"><span>Awaiting review</span></span>
          </div>
        </div>
        <div className="stat-card stat-card--alert">
          <div className="stat-icon stat-icon--red"><IconFlagged /></div>
          <div className="stat-body">
            <span className="stat-label">Flagged</span>
            <span className="stat-value">{flaggedCount}</span>
            <span className="stat-trend stat-trend--neutral"><span>Needs attention</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--plum"><IconWarnings /></div>
          <div className="stat-body">
            <span className="stat-label">Warnings Sent</span>
            <span className="stat-value">{warningCount}</span>
            <span className="stat-trend stat-trend--up"><span>System alerts injected</span></span>
          </div>
        </div>
      </div>

      {/* ─── Main Layout ──────────────────────────────────────────────────── */}
      <div className="chat-layout">
        {/* Left: Conversations List */}
        <div className="chat-list-pane">
          <div className="chat-search-container">
            <input
              type="text"
              className="chat-search-input"
              placeholder="Search traveler, agency, or tour…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="chat-filter-tabs">
            {[
              { key: 'all',     label: 'All' },
              { key: 'unread',  label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
              { key: 'flagged', label: `Flagged${flaggedCount > 0 ? ` (${flaggedCount})` : ''}` },
            ].map(tab => (
              <button
                key={tab.key}
                className={`chat-filter-tab ${filter === tab.key ? 'active' : ''}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tag Filter Pills */}
          {tags.length > 0 && (
            <div className="chat-tag-filters">
              <span className="chat-tag-filter-label">Filter by tag:</span>
              <div className="chat-tag-pills">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`chat-tag-pill ${filter === tag.id ? 'active' : ''}`}
                    style={{
                      '--tag-color': tag.color,
                      background: filter === tag.id ? tag.color : tag.color + '20',
                      color: filter === tag.id ? '#fff' : tag.color,
                      borderColor: filter === tag.id ? tag.color : tag.color + '40',
                    }}
                    onClick={() => setFilter(filter === tag.id ? 'all' : tag.id)}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Items */}
          <div className="chat-items-list">
            {filteredConversations.length === 0 ? (
              <div className="chat-empty-list">No conversations found</div>
            ) : filteredConversations.map(conv => {
              const isFlagged = flaggedIds.has(conv.id);
              const convTagList = (convTags[conv.id] || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean);
              return (
                <div
                  key={conv.id}
                  className={`chat-list-item ${conv.id === activeConvId ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="chat-item-header">
                    <div className="chat-item-avatars">
                      <div className="avatar avatar-sm avatar-blue" title={conv.traveler}>{conv.traveler.charAt(0)}</div>
                      <span className="chat-avatar-separator">↔</span>
                      <div className="avatar avatar-sm avatar-plum" title={conv.agency}>{conv.agency.charAt(0)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="chat-item-time">{conv.time}</span>
                      <button
                        className="chat-tag-assign-btn"
                        title="Assign tags"
                        onClick={(e) => openTagAssign(conv.id, e)}
                      >
                        🏷
                      </button>
                    </div>
                  </div>

                  <div className="chat-item-meta">
                    <span className="chat-item-user-labels">
                      <strong>{conv.traveler}</strong> &amp; <span>{conv.agency}</span>
                    </span>
                    <span className="chat-item-package-label">{conv.package}</span>
                  </div>

                  <p className="chat-item-snippet">{conv.lastMsg}</p>

                  {/* Assigned Tags */}
                  {convTagList.length > 0 && (
                    <div className="chat-conv-tags">
                      {convTagList.map(tag => (
                        <span key={tag.id} className="chat-conv-tag" style={{ background: tag.color + '22', color: tag.color, borderColor: tag.color + '44' }}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="chat-item-indicators">
                    {conv.unread && <span className="chat-unread-indicator">New</span>}
                    {isFlagged && <span className="chat-flagged-indicator">🚩 Flagged</span>}
                  </div>

                  {/* Inline Tag Assignment Dropdown */}
                  {tagAssignConvId === conv.id && (
                    <div className="chat-tag-assign-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="tag-dropdown-header">
                        <span>Assign Tags</span>
                        <button className="tag-dropdown-close" onClick={() => setTagAssignConvId(null)}>✕</button>
                      </div>
                      <div className="tag-dropdown-list">
                        {tags.map(tag => {
                          const assigned = (convTags[conv.id] || []).includes(tag.id);
                          return (
                            <label key={tag.id} className="tag-dropdown-item">
                              <input
                                type="checkbox"
                                checked={assigned}
                                onChange={() => toggleConvTag(conv.id, tag.id)}
                              />
                              <span className="tag-dot" style={{ background: tag.color }} />
                              <span>{tag.label}</span>
                            </label>
                          );
                        })}
                        {tags.length === 0 && <span className="tag-dropdown-empty">No tags yet. Create one in Manage Tags.</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Room */}
        <div className="chat-monitor-pane">
          {activeConv ? (
            <div className="chat-monitor-room">
              {/* Room Header */}
              <div className="chat-room-header">
                <div className="chat-room-info">
                  <div className="chat-users-meta">
                    <h3>{activeConv.traveler}</h3>
                    <span className="chat-meta-divider">↔</span>
                    <h3>{activeConv.agency}</h3>
                  </div>
                  <div className="chat-pkg-meta">
                    <span>Enquiry on: <strong>{activeConv.package}</strong></span>
                  </div>
                  {/* Active Conv Tags */}
                  {activeConvTagIds.length > 0 && (
                    <div className="chat-room-tags">
                      {activeConvTagIds.map(tid => {
                        const tag = tags.find(t => t.id === tid);
                        if (!tag) return null;
                        return (
                          <span key={tid} className="chat-conv-tag" style={{ background: tag.color + '22', color: tag.color, borderColor: tag.color + '44' }}>
                            {tag.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="chat-room-actions">
                  <button
                    className={`btn-flag ${flaggedIds.has(activeConv.id) ? 'btn-flag-active' : ''}`}
                    onClick={() => toggleFlag(activeConv.id)}
                    title={flaggedIds.has(activeConv.id) ? 'Unflag conversation' : 'Flag conversation for review'}
                  >
                    {flaggedIds.has(activeConv.id) ? '🚩 Flagged' : '🏳️ Flag'}
                  </button>
                  <button
                    className="btn-tag-conv"
                    onClick={(e) => openTagAssign(activeConv.id, e)}
                    title="Assign tags to this conversation"
                  >
                    🏷 Tag
                  </button>
                  <button
                    className="btn-moderate-pkg"
                    onClick={handleInitiateTakedown}
                    title="Take down this package from the platform"
                  >
                    Moderate Tour
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="chat-messages-body">
                <div className="chat-alert-banner">
                  🛡️ You are monitoring this chat in read-only administrator mode.
                </div>
                <div className="chat-messages-timeline">
                  {activeMessages.map((msg) => {
                    if (msg.sender === 'system') {
                      return (
                        <div key={msg.id} className="msg-row msg-system-warning">
                          <div className="system-warning-bubble">
                            <span className="system-warning-icon">⚠️ SECURITY WARNING</span>
                            <p className="system-warning-text">{msg.text}</p>
                            <span className="system-warning-time">{msg.time}</span>
                          </div>
                        </div>
                      );
                    }
                    const isTraveler = msg.sender === 'traveler';
                    return (
                      <div key={msg.id} className={`msg-row ${isTraveler ? 'msg-row-left' : 'msg-row-right'}`}>
                        <div className="msg-avatar-wrap">
                          <div className={`avatar avatar-xs ${isTraveler ? 'avatar-blue' : 'avatar-plum'}`}>
                            {isTraveler ? activeConv.traveler.charAt(0) : activeConv.agency.charAt(0)}
                          </div>
                        </div>
                        <div className="msg-content-wrap">
                          <span className="msg-sender-name">
                            {isTraveler ? activeConv.traveler : activeConv.agency}
                            <span className="msg-sender-role"> ({isTraveler ? 'Traveler' : 'Agency'})</span>
                          </span>
                          <div className="msg-bubble">
                            <p className="msg-text">{msg.text}</p>
                            <span className="msg-time">{msg.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Moderation Footer */}
              <div className="chat-room-footer">
                <div className="preset-warnings-row">
                  <span className="presets-label">Quick Warnings:</span>
                  {PRESET_WARNINGS.map((p, idx) => (
                    <button key={idx} className="preset-btn" onClick={() => handleSendWarning(p)}>
                      {idx + 1}. {p.slice(0, 30)}…
                    </button>
                  ))}
                </div>
                <div className="custom-warning-input-wrap">
                  <input
                    type="text"
                    className="custom-warning-input"
                    placeholder="Type a custom system warning to inject into the chat feed…"
                    value={warningText}
                    onChange={(e) => setWarningText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendWarning(warningText); }}
                  />
                  <button
                    className="btn-send-warning"
                    disabled={!warningText.trim()}
                    onClick={() => handleSendWarning(warningText)}
                  >
                    Send Warning
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-monitor-empty">
              <div className="chat-empty-illustration">💬</div>
              <h2>No Conversation Selected</h2>
              <p>Select a traveler–agency conversation from the directory on the left to start live monitoring, audit message transcripts, and apply system warnings.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Manage Tags Modal ────────────────────────────────────────────── */}
      {showTagModal && (
        <div className="pay-modal-overlay" onClick={() => { setShowTagModal(false); setShowCreateTag(false); }}>
          <div className="pay-modal chat-tags-modal" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-header">
              <h3>Manage Chat Tags</h3>
              <button className="pay-modal-close" onClick={() => { setShowTagModal(false); setShowCreateTag(false); }}>✕</button>
            </div>
            <p className="pay-modal-desc">
              Create and manage labels to categorise conversations. Tags help you filter and prioritise chats quickly.
            </p>

            {/* Existing Tags */}
            <div className="tags-list">
              {tags.map(tag => (
                <div key={tag.id} className="tag-row">
                  <span className="tag-color-dot" style={{ background: tag.color }} />
                  <span className="tag-row-label">{tag.label}</span>
                  <span className="tag-row-usage">
                    {Object.values(convTags).filter(ids => ids.includes(tag.id)).length} conv.
                  </span>
                  <button className="tag-row-delete" title="Delete tag" onClick={() => handleDeleteTag(tag.id)}>✕</button>
                </div>
              ))}
              {tags.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '16px 0', fontSize: 13 }}>
                  No tags yet. Create one below.
                </div>
              )}
            </div>

            <hr className="tags-divider" />

            {/* Create New Tag */}
            {!showCreateTag ? (
              <button className="btn-create-tag-toggle" onClick={() => setShowCreateTag(true)}>
                + Create New Tag
              </button>
            ) : (
              <div className="create-tag-form">
                <div className="create-tag-row">
                  <input
                    type="text"
                    className="create-tag-input"
                    placeholder="Tag label (e.g. Off-Platform Payment)"
                    value={newTagLabel}
                    maxLength={40}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTag(); }}
                    autoFocus
                  />
                  <input
                    type="color"
                    className="create-tag-color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    title="Pick tag colour"
                  />
                </div>
                <div className="create-tag-color-presets">
                  {TAG_COLORS.map(c => (
                    <button
                      key={c}
                      className={`color-preset ${newTagColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewTagColor(c)}
                      title={c}
                    />
                  ))}
                </div>
                {newTagLabel.trim() && (
                  <div className="create-tag-preview">
                    Preview:&nbsp;
                    <span className="chat-conv-tag" style={{ background: newTagColor + '22', color: newTagColor, borderColor: newTagColor + '44' }}>
                      {newTagLabel.trim()}
                    </span>
                  </div>
                )}
                <div className="pay-modal-actions" style={{ marginTop: 12 }}>
                  <button className="pay-btn pay-btn-neutral" onClick={() => { setShowCreateTag(false); setNewTagLabel(''); }}>Cancel</button>
                  <button
                    className="pay-btn pay-btn-primary"
                    disabled={!newTagLabel.trim()}
                    onClick={handleCreateTag}
                    style={{ background: 'var(--color-plum)', color: '#fff', border: 'none' }}
                  >
                    Create Tag
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Moderate Package Modal ───────────────────────────────────────── */}
      {showTakedownModal && (
        <div className="pay-modal-overlay" onClick={() => setShowTakedownModal(false)}>
          <div className="pay-modal" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-header">
              <h3>Moderate Tour Package</h3>
              <button className="pay-modal-close" onClick={() => setShowTakedownModal(false)}>✕</button>
            </div>
            <p className="pay-modal-desc">
              You are initiating a moderation takedown for <strong>{takedownPkgTitle}</strong>.
              Please state the policy violation reason. This will be shown to the agency.
            </p>
            <textarea
              className="pay-modal-textarea"
              placeholder="Provide policy violation reasons (e.g. asking for outside payments, incorrect pricing, false advertising)..."
              value={takedownReason}
              onChange={(e) => setTakedownReason(e.target.value)}
              rows={4}
            />
            <div className="pay-modal-actions">
              <button className="pay-btn pay-btn-neutral" onClick={() => setShowTakedownModal(false)}>Cancel</button>
              <button
                className="pay-btn pay-btn-danger"
                disabled={!takedownReason.trim()}
                onClick={handleConfirmTakedown}
              >
                Confirm Takedown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Icon for button ───────────────────────────────────────────────────
function IconTagsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}
