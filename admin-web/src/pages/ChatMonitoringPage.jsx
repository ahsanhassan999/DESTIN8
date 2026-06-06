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
    { id: 8, sender: 'traveler', text: 'Is there a group discount?', time: '10:30 AM' }
  ],
  c2: [
    { id: 1, sender: 'traveler', text: 'Hi Blue Horizon team, regarding the Maldives Escape package, does it include water villa stay?', time: '09:00 AM' },
    { id: 2, sender: 'agency', text: 'Yes, Ali! The package includes 3 nights in a beach villa and 2 nights in an overwater pool villa.', time: '09:05 AM' },
    { id: 3, sender: 'traveler', text: 'Great. I have completed the deposit payment on the app.', time: '09:12 AM' },
    { id: 4, sender: 'agency', text: 'Received! We have confirmed your booking. Please confirm my seat.', time: '09:15 AM' }
  ],
  c3: [
    { id: 1, sender: 'traveler', text: 'Hi Zara, I wanted to enquire about the Swat Valley Spring Bloom Tour.', time: 'Yesterday' },
    { id: 2, sender: 'agency', text: 'Hello Usman! The Swat Spring Bloom is beautiful right now. What details can I help you with?', time: 'Yesterday' },
    { id: 3, sender: 'traveler', text: 'What is included in the price?', time: 'Yesterday' }
  ],
  c4: [
    { id: 1, sender: 'traveler', text: 'Hello Nadia, I have booked the Dubai Weekend Getaway. Can I cancel for a refund?', time: 'Yesterday' },
    { id: 2, sender: 'agency', text: 'Hi Maria! Cancellation is free up to 7 days before departure. After that, a 10% platform fee is retained.', time: 'Yesterday' },
    { id: 3, sender: 'traveler', text: 'Can I cancel for a refund?', time: 'Yesterday' }
  ],
  c5: [
    { id: 1, sender: 'traveler', text: 'Hello, what are the safety guidelines for the Hunza Valley Luxury Retreat?', time: '2 days ago' },
    { id: 2, sender: 'agency', text: 'Hi Fatima! The tour is fully guided by certified mountaineers. Oxygen kits and first aid are provided.', time: '2 days ago' },
    { id: 3, sender: 'traveler', text: 'Awesome! I will book now.', time: '2 days ago' }
  ]
};

const PRESET_WARNINGS = [
  "Security Check: Sharing direct phone numbers or bank details is prohibited.",
  "Payment Alert: Keep all booking payments inside the platform to remain protected.",
  "Moderation Notice: Inappropriate language detected. Please maintain professional communication.",
];

export default function ChatMonitoringPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messagesDb, setMessagesDb] = useState(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | flagged
  const [warningText, setWarningText] = useState('');
  const [flaggedIds, setFlaggedIds] = useState(new Set(['c1'])); // c1 is flagged initially for demonstration
  
  // Takedown state
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [takedownReason, setTakedownReason] = useState('');
  const [takedownPkgId, setTakedownPkgId] = useState(null);
  const [takedownPkgTitle, setTakedownPkgTitle] = useState('');

  const messagesEndRef = useRef(null);

  // Initialize conversations list
  useEffect(() => {
    setConversations(mockConversations);
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeMessages = messagesDb[activeConvId] || [];

  // Scroll to bottom on message load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSelectConversation = (id) => {
    setActiveConvId(id);
    // Optimistically mark as read
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, unread: false } : c)
    );
  };

  const handleSendWarning = (text) => {
    if (!text.trim() || !activeConvId) return;

    const newMsg = {
      id: Date.now(),
      sender: 'system',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWarning: true
    };

    setMessagesDb(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg]
    }));

    // Update snippet in list
    setConversations(prev =>
      prev.map(c => c.id === activeConvId ? { ...c, lastMsg: `System Warning: ${text.trim()}` } : c)
    );

    setWarningText('');
  };

  const toggleFlag = (id) => {
    setFlaggedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Find actual package in database for takedown
  const handleInitiateTakedown = async () => {
    if (!activeConv) return;
    try {
      // Find package by title from database
      const packages = await api.getPackages();
      const match = packages.find(p => p.title.toLowerCase().includes(activeConv.package.toLowerCase()) || activeConv.package.toLowerCase().includes(p.title.toLowerCase()));
      if (match) {
        setTakedownPkgId(match.id);
        setTakedownPkgTitle(match.title);
        setTakedownReason('');
        setShowTakedownModal(true);
      } else {
        alert(`Could not find a package matching "${activeConv.package}" in the database.`);
      }
    } catch (err) {
      alert("Error finding package: " + err.message);
    }
  };

  const handleConfirmTakedown = async () => {
    if (!takedownPkgId || !takedownReason.trim()) return;
    try {
      await api.takedownPackage(takedownPkgId, takedownReason.trim());
      alert(`Package "${takedownPkgTitle}" has been successfully taken down.`);
      setShowTakedownModal(false);
    } catch (err) {
      alert("Takedown failed: " + err.message);
    }
  };

  // Filter list
  const filteredConversations = conversations.filter(c => {
    const q = search.toLowerCase();
    const matchesQuery = c.traveler.toLowerCase().includes(q) || 
                         c.agency.toLowerCase().includes(q) || 
                         c.package.toLowerCase().includes(q);
    
    if (filter === 'unread') return matchesQuery && c.unread;
    if (filter === 'flagged') return matchesQuery && flaggedIds.has(c.id);
    return matchesQuery;
  });

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <div>
          <h1 className="chat-page-title">Chat &amp; Message Monitoring</h1>
          <p className="chat-page-sub">Monitor live communication, flag violations, and send moderation alerts</p>
        </div>
      </div>

      <div className="chat-layout">
        {/* Left Side: Conversations Directory */}
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

          <div className="chat-filter-tabs">
            <button 
              className={`chat-filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`chat-filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
            <button 
              className={`chat-filter-tab ${filter === 'flagged' ? 'active' : ''}`}
              onClick={() => setFilter('flagged')}
            >
              Flagged
            </button>
          </div>

          <div className="chat-items-list">
            {filteredConversations.length === 0 ? (
              <div className="chat-empty-list">No conversations found</div>
            ) : filteredConversations.map(conv => {
              const isFlagged = flaggedIds.has(conv.id);
              return (
                <div 
                  key={conv.id} 
                  className={`chat-list-item ${conv.id === activeConvId ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="chat-item-header">
                    <div className="chat-item-avatars">
                      <div className="avatar avatar-sm avatar-blue" title={conv.traveler}>
                        {conv.traveler.charAt(0)}
                      </div>
                      <span className="chat-avatar-separator">↔</span>
                      <div className="avatar avatar-sm avatar-plum" title={conv.agency}>
                        {conv.agency.charAt(0)}
                      </div>
                    </div>
                    <span className="chat-item-time">{conv.time}</span>
                  </div>

                  <div className="chat-item-meta">
                    <span className="chat-item-user-labels">
                      <strong>{conv.traveler}</strong> &amp; <span>{conv.agency}</span>
                    </span>
                    <span className="chat-item-package-label">{conv.package}</span>
                  </div>

                  <p className="chat-item-snippet">{conv.lastMsg}</p>

                  <div className="chat-item-indicators">
                    {conv.unread && <span className="chat-unread-indicator">New</span>}
                    {isFlagged && <span className="chat-flagged-indicator">🚩 Flagged</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Message Room Monitor */}
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
                </div>

                <div className="chat-room-actions">
                  <button 
                    className={`btn-flag ${flaggedIds.has(activeConv.id) ? 'btn-flag-active' : ''}`}
                    onClick={() => toggleFlag(activeConv.id)}
                    title={flaggedIds.has(activeConv.id) ? "Unflag conversation" : "Flag conversation for review"}
                  >
                    {flaggedIds.has(activeConv.id) ? '🚩 Flagged' : '🏳️ Flag'}
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
                            <span className="msg-sender-role">({isTraveler ? 'Traveler' : 'Agency'})</span>
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

              {/* Moderation Controls Footer */}
              <div className="chat-room-footer">
                <div className="preset-warnings-row">
                  <span className="presets-label">Quick Warnings:</span>
                  {PRESET_WARNINGS.map((p, idx) => (
                    <button 
                      key={idx} 
                      className="preset-btn"
                      onClick={() => handleSendWarning(p)}
                    >
                      {idx + 1}. {p.slice(16, 40)}…
                    </button>
                  ))}
                </div>

                <div className="custom-warning-input-wrap">
                  <input
                    type="text"
                    className="custom-warning-input"
                    placeholder="Type custom warning notification to inject into the chat feed…"
                    value={warningText}
                    onChange={(e) => setWarningText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendWarning(warningText);
                    }}
                  />
                  <button 
                    className="btn-send-warning"
                    disabled={!warningText.trim()}
                    onClick={() => handleSendWarning(warningText)}
                  >
                    Send System Warning
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-monitor-empty">
              <div className="chat-empty-illustration">💬</div>
              <h2>No Conversation Selected</h2>
              <p>Select a traveler-agency conversation from the directory list on the left to start live monitoring, audit message transcripts, and apply system warnings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Moderate Package Modal */}
      {showTakedownModal && (
        <div className="pay-modal-overlay" onClick={() => setShowTakedownModal(false)}>
          <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
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
