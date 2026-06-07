import { useState, useEffect, useRef, useCallback } from 'react';
import { mockConversations } from '../mockData';
import { api } from '../services/api';
import './ChatMonitoringPage.css';

// ─── Mock Messages ────────────────────────────────────────────────────────────
const INITIAL_MESSAGES = {
  c1: [
    { id: 1, sender: 'traveler', text: 'Hello! I am planning to join the K2 Base Camp Expedition next month.', time: '10:15 AM' },
    { id: 2, sender: 'agency',   text: 'Hi Ahmed! That is wonderful. The K2 Base Camp trek is a phenomenal choice. The next departure is on June 25th.', time: '10:18 AM' },
    { id: 3, sender: 'traveler', text: 'Is there a group discount? We have a team of 4 people planning to book.', time: '10:20 AM' },
    { id: 4, sender: 'agency',   text: 'Yes, absolutely! We offer a 10% discount for groups of 4 or more.', time: '10:22 AM' },
    { id: 5, sender: 'traveler', text: 'Perfect. What details do you need for booking?', time: '10:25 AM' },
    { id: 6, sender: 'agency',   text: 'Just your passport copies and a 50% deposit. Please transfer the remaining to my personal account at +92-311-2345678.', time: '10:28 AM' },
    { id: 7, sender: 'system',   text: 'Warning: The agency requested payment outside the platform. Sharing direct bank details is against platform terms.', time: '10:29 AM', isWarning: true },
    { id: 8, sender: 'traveler', text: 'Oh really? Is that the standard process?', time: '10:30 AM' },
  ],
  c2: [
    { id: 1, sender: 'traveler', text: 'Hi Blue Horizon team, does the Maldives Escape include a water villa stay?', time: '09:00 AM' },
    { id: 2, sender: 'agency',   text: 'Yes, Ali! The package includes 3 nights in a beach villa and 2 nights in an overwater pool villa.', time: '09:05 AM' },
    { id: 3, sender: 'traveler', text: 'Great. I have completed the deposit payment on the app.', time: '09:12 AM' },
    { id: 4, sender: 'agency',   text: 'Received! We have confirmed your booking.', time: '09:15 AM' },
  ],
  c3: [
    { id: 1, sender: 'traveler', text: 'Hi Zara, I wanted to enquire about the Swat Valley Spring Bloom Tour.', time: 'Yesterday' },
    { id: 2, sender: 'agency',   text: 'Hello Usman! The Swat Spring Bloom is beautiful right now. What details can I help with?', time: 'Yesterday' },
    { id: 3, sender: 'traveler', text: 'What is included in the price?', time: 'Yesterday' },
  ],
  c4: [
    { id: 1, sender: 'traveler', text: 'Hello Nadia, I booked the Dubai Weekend Getaway. Can I cancel for a refund?', time: 'Yesterday' },
    { id: 2, sender: 'agency',   text: 'Hi Maria! Cancellation is free up to 7 days before departure. After that a 10% fee applies.', time: 'Yesterday' },
  ],
  c5: [
    { id: 1, sender: 'traveler', text: 'Hello, what are the safety guidelines for the Hunza Valley Luxury Retreat?', time: '2 days ago' },
    { id: 2, sender: 'agency',   text: 'Hi Fatima! The tour is fully guided by certified mountaineers. First aid kits provided.', time: '2 days ago' },
    { id: 3, sender: 'traveler', text: 'Awesome! I will book now.', time: '2 days ago' },
  ],
};

const PRESET_WARNINGS = [
  'Security Check: Sharing direct phone numbers or bank details is prohibited.',
  'Payment Alert: Keep all booking payments inside the platform.',
  'Moderation Notice: Inappropriate language detected. Please maintain professional communication.',
];

const DEFAULT_TAGS = [
  { id: 't1', label: 'Off-Platform Payment', color: '#ef4444' },
  { id: 't2', label: 'Refund Request',        color: '#f59e0b' },
  { id: 't3', label: 'Suspicious Activity',   color: '#8b5cf6' },
  { id: 't4', label: 'Resolved',              color: '#10b981' },
  { id: 't5', label: 'Needs Follow-up',       color: '#0ea5e9' },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconChats()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>; }
function IconFlagged()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>; }
function IconUnread()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconWarnings() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function IconTagsIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }

// ─── Context Menu ─────────────────────────────────────────────────────────────
function ConvContextMenu({ menu, onClose, onAction, panelMode }) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('click', close);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    return () => window.removeEventListener('click', close);
  }, [onClose]);

  if (!menu) return null;

  return (
    <div className="conv-context-menu" style={{ left: menu.x, top: menu.y }} onClick={e => e.stopPropagation()}>
      <div className="ctx-section-label">Open in Panel A</div>
      <button className="ctx-item" onClick={() => onAction('panel-a', menu.convId)}>
        <span className="ctx-icon">◧</span> Replace active chat
      </button>
      <button className="ctx-item" onClick={() => onAction('tab-a', menu.convId)}>
        <span className="ctx-icon">＋</span> Open as new tab
      </button>

      <div className="ctx-divider" />

      {panelMode === 'split' ? (
        <>
          <div className="ctx-section-label">Open in Panel B</div>
          <button className="ctx-item" onClick={() => onAction('panel-b', menu.convId)}>
            <span className="ctx-icon">◨</span> Replace active chat
          </button>
          <button className="ctx-item" onClick={() => onAction('tab-b', menu.convId)}>
            <span className="ctx-icon">＋</span> Open as new tab
          </button>
          <div className="ctx-divider" />
        </>
      ) : (
        <>
          <button className="ctx-item" onClick={() => { onAction('split-b', menu.convId); }}>
            <span className="ctx-icon">◫</span> Open in new split panel
          </button>
          <div className="ctx-divider" />
        </>
      )}

      <button className="ctx-item ctx-item--popout" onClick={() => onAction('popout', menu.convId)}>
        <span className="ctx-icon">⧉</span> Pop out as floating window
      </button>

      <div className="ctx-divider" />
      <button className="ctx-item" onClick={() => onAction('flag', menu.convId)}>
        <span className="ctx-icon">🚩</span> Flag / Unflag
      </button>
      <button className="ctx-item" onClick={() => onAction('tag', menu.convId)}>
        <span className="ctx-icon">🏷</span> Assign tags…
      </button>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ panelId, tabs, activeTabId, conversations, messagesDb, onTabChange, onTabClose, flaggedIds, onToggleFlag, onSendWarning, onInitiateTakedown, convTags, tags }) {
  const [warningText, setWarningText] = useState('');
  const messagesEndRef = useRef(null);

  const activeConv    = conversations.find(c => c.id === activeTabId);
  const activeMessages = messagesDb[activeTabId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  if (tabs.length === 0) {
    return (
      <div className="chat-panel chat-panel-empty">
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>💬</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>Panel {panelId} Empty</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Right-click a conversation to open it here,<br/>or click any conversation to load it.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      {/* Tab Bar */}
      <div className="chat-panel-tabbar">
        <span className="chat-panel-label">Panel {panelId}</span>
        {tabs.map(tabId => {
          const conv = conversations.find(c => c.id === tabId);
          if (!conv) return null;
          const isFlagged = flaggedIds.has(tabId);
          return (
            <div
              key={tabId}
              className={`chat-panel-tab ${tabId === activeTabId ? 'active' : ''} ${isFlagged ? 'flagged' : ''}`}
              onClick={() => onTabChange(panelId, tabId)}
              title={`${conv.traveler} ↔ ${conv.agency}`}
            >
              <div className={`avatar avatar-xs ${tabId === activeTabId ? 'avatar-plum' : 'avatar-blue'}`}>{conv.traveler.charAt(0)}</div>
              <span className="chat-tab-name">{conv.traveler}</span>
              {isFlagged && <span className="chat-tab-flag">🚩</span>}
              <button className="chat-tab-close" onClick={e => { e.stopPropagation(); onTabClose(panelId, tabId); }} title="Close tab">✕</button>
            </div>
          );
        })}
      </div>

      {/* Room */}
      {activeConv ? (
        <div className="chat-monitor-room">
          <div className="chat-room-header">
            <div className="chat-room-info">
              <div className="chat-users-meta">
                <h3>{activeConv.traveler}</h3>
                <span className="chat-meta-divider">↔</span>
                <h3>{activeConv.agency}</h3>
              </div>
              <div className="chat-pkg-meta">Enquiry: <strong>{activeConv.package}</strong></div>
              {/* Conv tags */}
              {(convTags[activeTabId] || []).length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {(convTags[activeTabId] || []).map(tid => {
                    const t = tags.find(x => x.id === tid);
                    return t ? <span key={tid} className="chat-conv-tag" style={{ background: t.color + '20', color: t.color, borderColor: t.color + '40' }}>{t.label}</span> : null;
                  })}
                </div>
              )}
            </div>
            <div className="chat-room-actions">
              <button className={`btn-flag ${flaggedIds.has(activeConv.id) ? 'btn-flag-active' : ''}`} onClick={() => onToggleFlag(activeConv.id)}>
                {flaggedIds.has(activeConv.id) ? '🚩 Flagged' : '🏳️ Flag'}
              </button>
              <button className="btn-moderate-pkg" onClick={() => onInitiateTakedown(activeConv)}>Moderate Tour</button>
            </div>
          </div>

          <div className="chat-messages-body">
            <div className="chat-alert-banner">🛡️ Administrator read-only monitoring mode</div>
            <div className="chat-messages-timeline">
              {activeMessages.map(msg => {
                if (msg.sender === 'system') return (
                  <div key={msg.id} className="msg-row msg-system-warning">
                    <div className="system-warning-bubble">
                      <span className="system-warning-icon">⚠️ SECURITY WARNING</span>
                      <p className="system-warning-text">{msg.text}</p>
                      <span className="system-warning-time">{msg.time}</span>
                    </div>
                  </div>
                );
                const isTraveler = msg.sender === 'traveler';
                return (
                  <div key={msg.id} className={`msg-row ${isTraveler ? 'msg-row-left' : 'msg-row-right'}`}>
                    <div className="msg-avatar-wrap">
                      <div className={`avatar avatar-xs ${isTraveler ? 'avatar-blue' : 'avatar-plum'}`}>
                        {isTraveler ? activeConv.traveler.charAt(0) : activeConv.agency.charAt(0)}
                      </div>
                    </div>
                    <div className="msg-content-wrap">
                      <span className="msg-sender-name">{isTraveler ? activeConv.traveler : activeConv.agency} <span className="msg-sender-role">({isTraveler ? 'Traveler' : 'Agency'})</span></span>
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

          <div className="chat-room-footer">
            <div className="preset-warnings-row">
              <span className="presets-label">Quick:</span>
              {PRESET_WARNINGS.map((p, i) => (
                <button key={i} className="preset-btn" onClick={() => onSendWarning(activeConv.id, p)}>
                  {p.slice(0, 28)}…
                </button>
              ))}
            </div>
            <div className="custom-warning-input-wrap">
              <input
                className="custom-warning-input"
                placeholder="Type a custom system warning…"
                value={warningText}
                onChange={e => setWarningText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && warningText.trim()) { onSendWarning(activeConv.id, warningText); setWarningText(''); } }}
              />
              <button className="btn-send-warning" disabled={!warningText.trim()} onClick={() => { onSendWarning(activeConv.id, warningText); setWarningText(''); }}>Send Warning</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Pop-Out Window ───────────────────────────────────────────────────────────
function PopOutWindow({ conv, messages, flaggedIds, onToggleFlag, onSendWarning, onClose, onDock, index }) {
  const [warningText, setWarningText] = useState('');
  const [minimized, setMinimized]     = useState(false);
  const [pos, setPos]   = useState({ x: Math.max(20, window.innerWidth - 380 - index * 16), y: Math.max(20, window.innerHeight - 480 - index * 16) });
  const [drag, setDrag] = useState(null);
  const messagesEndRef  = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!drag) return;
    const onMove = e => setPos({ x: e.clientX - drag.ox, y: e.clientY - drag.oy });
    const onUp   = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [drag]);

  const isFlagged = flaggedIds.has(conv.id);

  return (
    <div className={`pop-out-window ${minimized ? 'pop-out-minimized' : ''}`} style={{ left: pos.x, top: pos.y }}>
      {/* Drag handle header */}
      <div className="pop-out-header" onMouseDown={e => setDrag({ ox: e.clientX - pos.x, oy: e.clientY - pos.y })}>
        <div className="pop-out-title">
          <span className="pop-out-live-dot" />
          <div className="avatar avatar-xs avatar-blue">{conv.traveler.charAt(0)}</div>
          <span>{conv.traveler} ↔ {conv.agency.split(' ')[0]}</span>
          {isFlagged && <span style={{ fontSize: '0.65rem' }}>🚩</span>}
        </div>
        <div className="pop-out-controls">
          <button className="pop-out-btn" title={minimized ? 'Restore' : 'Minimize'} onClick={() => setMinimized(m => !m)}>{minimized ? '▲' : '▼'}</button>
          <button className="pop-out-btn" title="Dock to Panel A" onClick={() => onDock(conv.id)}>⬛</button>
          <button className="pop-out-btn pop-out-close-btn" title="Close" onClick={() => onClose(conv.id)}>✕</button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="pop-out-pkg">{conv.package}</div>
          <div className="pop-out-messages">
            {messages.map(msg => {
              if (msg.sender === 'system') return (
                <div key={msg.id} className="msg-system-warning" style={{ maxWidth: '100%' }}>
                  <div className="system-warning-bubble" style={{ padding: '8px 12px' }}>
                    <span className="system-warning-icon" style={{ fontSize: '0.65rem' }}>⚠️ WARNING</span>
                    <p className="system-warning-text" style={{ fontSize: '0.7rem' }}>{msg.text}</p>
                  </div>
                </div>
              );
              const isT = msg.sender === 'traveler';
              return (
                <div key={msg.id} className={`msg-row ${isT ? 'msg-row-left' : 'msg-row-right'}`} style={{ maxWidth: '92%' }}>
                  <div className={`avatar avatar-xs ${isT ? 'avatar-blue' : 'avatar-plum'}`}>{isT ? conv.traveler.charAt(0) : conv.agency.charAt(0)}</div>
                  <div className="msg-content-wrap">
                    <div className="msg-bubble" style={{ padding: '7px 11px' }}>
                      <p className="msg-text" style={{ fontSize: '0.75rem' }}>{msg.text}</p>
                      <span className="msg-time">{msg.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="pop-out-footer">
            <button className={`pop-out-flag-btn ${isFlagged ? 'active' : ''}`} onClick={() => onToggleFlag(conv.id)}>{isFlagged ? '🚩' : '🏳️'}</button>
            <input
              className="pop-out-input"
              placeholder="Send system warning…"
              value={warningText}
              onChange={e => setWarningText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && warningText.trim()) { onSendWarning(conv.id, warningText); setWarningText(''); } }}
            />
            <button className="pop-out-send-btn" disabled={!warningText.trim()} onClick={() => { onSendWarning(conv.id, warningText); setWarningText(''); }}>⚠</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChatMonitoringPage() {
  const [conversations, setConversations] = useState([]);
  const [messagesDb,    setMessagesDb]    = useState(INITIAL_MESSAGES);

  // Panel system
  const [panelMode, setPanelMode] = useState('single'); // 'single' | 'split'
  const [panels, setPanels] = useState({
    A: { tabs: [], activeTab: null },
    B: { tabs: [], activeTab: null },
  });

  // Pop-outs
  const [popOuts, setPopOuts] = useState([]);

  // Context menu
  const [contextMenu, setContextMenu] = useState(null);

  // Search & filters
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Flags & tags
  const [flaggedIds,    setFlaggedIds]    = useState(new Set(['c1']));
  const [tags,          setTags]          = useState(DEFAULT_TAGS);
  const [convTags,      setConvTags]      = useState({ c1: ['t1', 't3'] });
  const [showTagModal,  setShowTagModal]  = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagLabel,   setNewTagLabel]   = useState('');
  const [newTagColor,   setNewTagColor]   = useState('#6366f1');
  const [tagAssignConvId, setTagAssignConvId] = useState(null);

  // Takedown modal
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [takedownConv,      setTakedownConv]      = useState(null);
  const [takedownPkgId,     setTakedownPkgId]     = useState(null);
  const [takedownPkgTitle,  setTakedownPkgTitle]  = useState('');
  const [takedownReason,    setTakedownReason]    = useState('');

  useEffect(() => { setConversations(mockConversations); }, []);

  // On load: auto-open the first flagged chat in Panel A
  useEffect(() => {
    if (conversations.length === 0) return;
    const firstFlagged = conversations.find(c => flaggedIds.has(c.id));
    const target = firstFlagged || conversations[0];
    openInPanel('A', target.id, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const markAsRead = useCallback((convId) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: false } : c));
  }, []);

  const openInPanel = useCallback((panelId, convId, addTab = true) => {
    setPanels(prev => {
      const panel = prev[panelId];
      const newTabs = panel.tabs.includes(convId)
        ? panel.tabs
        : addTab ? [...panel.tabs, convId] : [convId, ...panel.tabs.filter(t => t !== convId)];
      return { ...prev, [panelId]: { tabs: newTabs, activeTab: convId } };
    });
    markAsRead(convId);
  }, [markAsRead]);

  const handleTabChange = useCallback((panelId, convId) => {
    setPanels(prev => ({ ...prev, [panelId]: { ...prev[panelId], activeTab: convId } }));
  }, []);

  const handleTabClose = useCallback((panelId, convId) => {
    setPanels(prev => {
      const panel = prev[panelId];
      const newTabs = panel.tabs.filter(t => t !== convId);
      const newActive = panel.activeTab === convId
        ? (newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
        : panel.activeTab;
      return { ...prev, [panelId]: { tabs: newTabs, activeTab: newActive } };
    });
  }, []);

  // ─── Right-click context menu ──────────────────────────────────────────────
  const handleRightClick = useCallback((e, convId) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX + 4, window.innerWidth - 240);
    const y = Math.min(e.clientY + 4, window.innerHeight - 320);
    setContextMenu({ x, y, convId });
  }, []);

  const handleContextAction = useCallback((action, convId) => {
    setContextMenu(null);
    switch (action) {
      case 'panel-a':
        openInPanel('A', convId, true);
        break;
      case 'tab-a':
        openInPanel('A', convId, true);
        break;
      case 'panel-b':
        openInPanel('B', convId, true);
        break;
      case 'tab-b':
        openInPanel('B', convId, true);
        break;
      case 'split-b':
        setPanelMode('split');
        openInPanel('B', convId, false);
        break;
      case 'popout':
        setPopOuts(prev => prev.includes(convId) ? prev : [...prev, convId]);
        markAsRead(convId);
        break;
      case 'flag':
        toggleFlag(convId);
        break;
      case 'tag':
        setTagAssignConvId(convId === tagAssignConvId ? null : convId);
        break;
      default: break;
    }
  }, [openInPanel, markAsRead, tagAssignConvId]);

  // Left-click: open in Panel A as new tab
  const handleLeftClick = useCallback((convId) => {
    openInPanel('A', convId, true);
  }, [openInPanel]);

  // ─── Flags & Tags ─────────────────────────────────────────────────────────
  const toggleFlag = (id) => {
    setFlaggedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleConvTag = (convId, tagId) => {
    setConvTags(prev => {
      const ex = prev[convId] || [];
      return { ...prev, [convId]: ex.includes(tagId) ? ex.filter(i => i !== tagId) : [...ex, tagId] };
    });
  };

  const handleCreateTag = () => {
    if (!newTagLabel.trim()) return;
    setTags(prev => [...prev, { id: `t${Date.now()}`, label: newTagLabel.trim(), color: newTagColor }]);
    setNewTagLabel(''); setNewTagColor('#6366f1'); setShowCreateTag(false);
  };

  const handleDeleteTag = (tagId) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setConvTags(prev => { const u = { ...prev }; Object.keys(u).forEach(k => { u[k] = u[k].filter(id => id !== tagId); }); return u; });
  };

  // ─── Warnings ─────────────────────────────────────────────────────────────
  const handleSendWarning = useCallback((convId, text) => {
    if (!text?.trim()) return;
    const msg = { id: Date.now(), sender: 'system', text: text.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isWarning: true };
    setMessagesDb(prev => ({ ...prev, [convId]: [...(prev[convId] || []), msg] }));
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, lastMsg: `⚠ ${text.trim()}` } : c));
  }, []);

  // ─── Takedown ──────────────────────────────────────────────────────────────
  const handleInitiateTakedown = useCallback(async (conv) => {
    try {
      const packages = await api.getPackages();
      const match = packages.find(p => p.title.toLowerCase().includes(conv.package.toLowerCase()) || conv.package.toLowerCase().includes(p.title.toLowerCase()));
      if (match) { setTakedownConv(conv); setTakedownPkgId(match.id); setTakedownPkgTitle(match.title); setTakedownReason(''); setShowTakedownModal(true); }
      else alert(`Could not find package "${conv.package}" in the database.`);
    } catch (err) { alert('Error: ' + err.message); }
  }, []);

  const handleConfirmTakedown = async () => {
    if (!takedownPkgId || !takedownReason.trim()) return;
    try {
      await api.takedownPackage(takedownPkgId, takedownReason.trim());
      alert(`Package "${takedownPkgTitle}" taken down.`);
      setShowTakedownModal(false);
    } catch (err) { alert('Takedown failed: ' + err.message); }
  };

  // ─── Filtered Conversation List ────────────────────────────────────────────
  const filteredConversations = conversations.filter(c => {
    const q = search.toLowerCase();
    const matchQ = c.traveler.toLowerCase().includes(q) || c.agency.toLowerCase().includes(q) || c.package.toLowerCase().includes(q);
    if (filter === 'unread')   return matchQ && c.unread;
    if (filter === 'flagged')  return matchQ && flaggedIds.has(c.id);
    if (filter.startsWith('t')) return matchQ && (convTags[c.id] || []).includes(filter);
    return matchQ;
  });

  // Sort: flagged first, then unread, then others
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aFlag = flaggedIds.has(a.id) ? 0 : a.unread ? 1 : 2;
    const bFlag = flaggedIds.has(b.id) ? 0 : b.unread ? 1 : 2;
    return aFlag - bFlag;
  });

  // ─── Derived Stats ─────────────────────────────────────────────────────────
  const totalChats   = conversations.length;
  const flaggedCount = flaggedIds.size;
  const unreadCount  = conversations.filter(c => c.unread).length;
  const warningCount = Object.values(messagesDb).reduce((a, msgs) => a + msgs.filter(m => m.sender === 'system').length, 0);

  const TAG_COLORS = ['#ef4444','#f59e0b','#10b981','#0ea5e9','#6366f1','#8b5cf6','#ec4899','#14b8a6'];

  return (
    <div className="chat-page" onClick={() => setContextMenu(null)}>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="chat-page-header">
        <div>
          <h1 className="chat-page-title">Chat &amp; Message Monitoring</h1>
          <p className="chat-page-sub">Right-click any conversation for options • Monitor up to 4 chats simultaneously</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Panel mode toggle */}
          <div className="panel-mode-toggle">
            <button className={`panel-mode-btn ${panelMode === 'single' ? 'active' : ''}`} onClick={() => setPanelMode('single')} title="Single panel">◧ Single</button>
            <button className={`panel-mode-btn ${panelMode === 'split' ? 'active' : ''}`} onClick={() => setPanelMode('split')} title="Split panels">◫ Split</button>
          </div>
          <button className="btn-manage-tags" onClick={() => setShowTagModal(true)}>
            <IconTagsIcon /> Tags
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="chat-stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--blue"><IconChats /></div>
          <div className="stat-body"><span className="stat-label">Total Chats</span><span className="stat-value">{totalChats}</span><span className="stat-trend stat-trend--up">Active conversations</span></div>
        </div>
        <div className="stat-card stat-card--alert">
          <div className="stat-icon stat-icon--orange"><IconUnread /></div>
          <div className="stat-body"><span className="stat-label">Unread</span><span className="stat-value">{unreadCount}</span><span className="stat-trend stat-trend--neutral">Awaiting review</span></div>
        </div>
        <div className="stat-card stat-card--alert">
          <div className="stat-icon stat-icon--red"><IconFlagged /></div>
          <div className="stat-body"><span className="stat-label">Flagged</span><span className="stat-value">{flaggedCount}</span><span className="stat-trend stat-trend--neutral">Needs attention</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--plum"><IconWarnings /></div>
          <div className="stat-body"><span className="stat-label">Warnings Sent</span><span className="stat-value">{warningCount}</span><span className="stat-trend stat-trend--up">System alerts injected</span></div>
        </div>
      </div>

      {/* ─── Main Layout ─────────────────────────────────────────────────── */}
      <div className="chat-layout">
        {/* Conversation List */}
        <div className="chat-list-pane">
          <div className="chat-search-container">
            <input className="chat-search-input" placeholder="Search traveler, agency, tour…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="chat-filter-tabs">
            {[{k:'all',l:'All'},{k:'unread',l:`Unread${unreadCount>0?` (${unreadCount})`:''}`},{k:'flagged',l:`Flagged${flaggedCount>0?` (${flaggedCount})`:''}`}].map(t => (
              <button key={t.k} className={`chat-filter-tab ${filter===t.k?'active':''}`} onClick={() => setFilter(t.k)}>{t.l}</button>
            ))}
          </div>

          {/* Tag filter pills */}
          {tags.length > 0 && (
            <div className="chat-tag-filters">
              <span className="chat-tag-filter-label">Filter by tag:</span>
              <div className="chat-tag-pills">
                {tags.map(tag => (
                  <button key={tag.id} className={`chat-tag-pill ${filter===tag.id?'active':''}`}
                    style={{ background: filter===tag.id?tag.color:tag.color+'20', color: filter===tag.id?'#fff':tag.color, borderColor: filter===tag.id?tag.color:tag.color+'40' }}
                    onClick={() => setFilter(filter===tag.id?'all':tag.id)}>
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chat-list-hint">
            <span>💡 Right-click any chat for panel options</span>
          </div>

          {/* Conversation items */}
          <div className="chat-items-list">
            {sortedConversations.length === 0 ? (
              <div className="chat-empty-list">No conversations found</div>
            ) : sortedConversations.map(conv => {
              const isFlagged  = flaggedIds.has(conv.id);
              const convTagList = (convTags[conv.id] || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean);
              const isInPanelA = panels.A.tabs.includes(conv.id);
              const isInPanelB = panels.B.tabs.includes(conv.id);
              const isPopOut   = popOuts.includes(conv.id);
              return (
                <div key={conv.id}
                  className={`chat-list-item ${conv.unread?'unread':''} ${isFlagged?'flagged-item':''} ${panels.A.activeTab===conv.id||panels.B.activeTab===conv.id?'active':''}`}
                  onClick={() => handleLeftClick(conv.id)}
                  onContextMenu={e => handleRightClick(e, conv.id)}
                >
                  <div className="chat-item-header">
                    <div className="chat-item-avatars">
                      <div className="avatar avatar-sm avatar-blue" title={conv.traveler}>{conv.traveler.charAt(0)}</div>
                      <span className="chat-avatar-separator">↔</span>
                      <div className="avatar avatar-sm avatar-plum" title={conv.agency}>{conv.agency.charAt(0)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isInPanelA && <span className="conv-panel-badge panel-a">A</span>}
                      {isInPanelB && <span className="conv-panel-badge panel-b">B</span>}
                      {isPopOut   && <span className="conv-panel-badge panel-pop">⧉</span>}
                      <span className="chat-item-time">{conv.time}</span>
                    </div>
                  </div>
                  <div className="chat-item-meta">
                    <span className="chat-item-user-labels"><strong>{conv.traveler}</strong> &amp; <span>{conv.agency}</span></span>
                    <span className="chat-item-package-label">{conv.package}</span>
                  </div>
                  <p className="chat-item-snippet">{conv.lastMsg}</p>
                  {convTagList.length > 0 && (
                    <div className="chat-conv-tags">
                      {convTagList.map(t => <span key={t.id} className="chat-conv-tag" style={{ background: t.color+'22', color: t.color, borderColor: t.color+'44' }}>{t.label}</span>)}
                    </div>
                  )}
                  <div className="chat-item-indicators">
                    {conv.unread  && <span className="chat-unread-indicator">New</span>}
                    {isFlagged    && <span className="chat-flagged-indicator">🚩 Flagged</span>}
                  </div>

                  {/* Inline tag assignment */}
                  {tagAssignConvId === conv.id && (
                    <div className="chat-tag-assign-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="tag-dropdown-header"><span>Assign Tags</span><button className="tag-dropdown-close" onClick={() => setTagAssignConvId(null)}>✕</button></div>
                      <div className="tag-dropdown-list">
                        {tags.map(tag => (
                          <label key={tag.id} className="tag-dropdown-item">
                            <input type="checkbox" checked={(convTags[conv.id]||[]).includes(tag.id)} onChange={() => toggleConvTag(conv.id, tag.id)} />
                            <span className="tag-dot" style={{ background: tag.color }} />
                            <span>{tag.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panels area */}
        <div className={`chat-panels-area ${panelMode === 'split' ? 'split' : ''}`}>
          <ChatPanel
            panelId="A"
            tabs={panels.A.tabs}
            activeTabId={panels.A.activeTab}
            conversations={conversations}
            messagesDb={messagesDb}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            flaggedIds={flaggedIds}
            onToggleFlag={toggleFlag}
            onSendWarning={handleSendWarning}
            onInitiateTakedown={handleInitiateTakedown}
            convTags={convTags}
            tags={tags}
          />
          {panelMode === 'split' && (
            <ChatPanel
              panelId="B"
              tabs={panels.B.tabs}
              activeTabId={panels.B.activeTab}
              conversations={conversations}
              messagesDb={messagesDb}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              flaggedIds={flaggedIds}
              onToggleFlag={toggleFlag}
              onSendWarning={handleSendWarning}
              onInitiateTakedown={handleInitiateTakedown}
              convTags={convTags}
              tags={tags}
            />
          )}
        </div>
      </div>

      {/* ─── Context Menu ────────────────────────────────────────────────── */}
      <ConvContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} onAction={handleContextAction} panelMode={panelMode} />

      {/* ─── Pop-Out Windows ─────────────────────────────────────────────── */}
      {popOuts.map((convId, i) => {
        const conv = conversations.find(c => c.id === convId);
        if (!conv) return null;
        return (
          <PopOutWindow key={convId} conv={conv} messages={messagesDb[convId] || []} index={i}
            flaggedIds={flaggedIds}
            onToggleFlag={toggleFlag}
            onSendWarning={handleSendWarning}
            onClose={id => setPopOuts(prev => prev.filter(p => p !== id))}
            onDock={id => { setPopOuts(prev => prev.filter(p => p !== id)); openInPanel('A', id, true); }}
          />
        );
      })}

      {/* ─── Manage Tags Modal ────────────────────────────────────────────── */}
      {showTagModal && (
        <div className="pay-modal-overlay" onClick={() => { setShowTagModal(false); setShowCreateTag(false); }}>
          <div className="pay-modal chat-tags-modal" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-header">
              <h3>Manage Chat Tags</h3>
              <button className="pay-modal-close" onClick={() => { setShowTagModal(false); setShowCreateTag(false); }}>✕</button>
            </div>
            <p className="pay-modal-desc">Create labels to categorise and filter conversations.</p>
            <div className="tags-list">
              {tags.map(tag => (
                <div key={tag.id} className="tag-row">
                  <span className="tag-color-dot" style={{ background: tag.color }} />
                  <span className="tag-row-label">{tag.label}</span>
                  <span className="tag-row-usage">{Object.values(convTags).filter(ids => ids.includes(tag.id)).length} conv.</span>
                  <button className="tag-row-delete" onClick={() => handleDeleteTag(tag.id)}>✕</button>
                </div>
              ))}
              {tags.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '16px 0', fontSize: 13 }}>No tags yet.</div>}
            </div>
            <hr className="tags-divider" />
            {!showCreateTag ? (
              <button className="btn-create-tag-toggle" onClick={() => setShowCreateTag(true)}>+ Create New Tag</button>
            ) : (
              <div className="create-tag-form">
                <div className="create-tag-row">
                  <input className="create-tag-input" placeholder="Tag label…" value={newTagLabel} maxLength={40} onChange={e => setNewTagLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateTag(); }} autoFocus />
                  <input type="color" className="create-tag-color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} />
                </div>
                <div className="create-tag-color-presets">
                  {TAG_COLORS.map(c => <button key={c} className={`color-preset ${newTagColor===c?'selected':''}`} style={{ background: c }} onClick={() => setNewTagColor(c)} />)}
                </div>
                {newTagLabel.trim() && <div className="create-tag-preview">Preview: <span className="chat-conv-tag" style={{ background: newTagColor+'22', color: newTagColor, borderColor: newTagColor+'44' }}>{newTagLabel.trim()}</span></div>}
                <div className="pay-modal-actions" style={{ marginTop: 12 }}>
                  <button className="pay-btn pay-btn-neutral" onClick={() => { setShowCreateTag(false); setNewTagLabel(''); }}>Cancel</button>
                  <button className="pay-btn" disabled={!newTagLabel.trim()} onClick={handleCreateTag} style={{ background: 'var(--color-plum)', color: '#fff', border: 'none' }}>Create Tag</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Takedown Modal ───────────────────────────────────────────────── */}
      {showTakedownModal && (
        <div className="pay-modal-overlay" onClick={() => setShowTakedownModal(false)}>
          <div className="pay-modal" onClick={e => e.stopPropagation()}>
            <div className="pay-modal-header">
              <h3>Moderate Tour Package</h3>
              <button className="pay-modal-close" onClick={() => setShowTakedownModal(false)}>✕</button>
            </div>
            <p className="pay-modal-desc">Initiating takedown for <strong>{takedownPkgTitle}</strong>. Provide the policy violation reason.</p>
            <textarea className="pay-modal-textarea" rows={4} placeholder="Policy violation reasons…" value={takedownReason} onChange={e => setTakedownReason(e.target.value)} />
            <div className="pay-modal-actions">
              <button className="pay-btn pay-btn-neutral" onClick={() => setShowTakedownModal(false)}>Cancel</button>
              <button className="pay-btn pay-btn-danger" disabled={!takedownReason.trim()} onClick={handleConfirmTakedown}>Confirm Takedown</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
