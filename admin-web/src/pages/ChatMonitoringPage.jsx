import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useChatPopOut } from '../context/ChatPopOutContext';

// ─── Resolve Real IDs Helper ──────────────────────────────────────────────────
export const getChatDetails = (conv) => {
  if (!conv) return { chatId: '', travelerId: '', travelerName: '', agencyId: '', agencyName: '', packageId: '', packageName: '' };
  return {
    chatId: conv.id,
    travelerName: conv.traveler,
    travelerId: conv.traveler_id || '',
    agencyName: conv.agency,
    agencyId: conv.agency_id || '',
    packageName: conv.package,
    packageId: conv.package_id || ''
  };
};
import './ChatMonitoringPage.css';

const PRESET_WARNINGS = [
  'Security Check: Sharing direct phone numbers or bank details is prohibited.',
  'Payment Alert: Keep all booking payments inside the platform.',
  'Moderation Notice: Inappropriate language detected. Please maintain professional communication.',
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconChats()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>; }
function IconFlagged()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>; }
function IconUnread()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconWarnings() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
export function IconTagsIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
export function IconFilter()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>; }
export function IconInfo()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>; }
function IconMinimize() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function IconMaximize() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>; }
function IconExpand()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>; }
function IconDock()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>; }
function IconClose()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }


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
        <span className="ctx-icon"><IconTagsIcon /></span> Assign tags…
      </button>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ panelId, tabs, activeTabId, conversations, messagesDb, onTabChange, onTabClose, flaggedIds, onToggleFlag, onSendWarning, onInitiateTakedown, convTags, tags, toggleConvTag }) {
  const [warningText, setWarningText] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef(null);

  const activeConv    = conversations.find(c => c.id === activeTabId);
  const activeMessages = messagesDb[activeTabId] || [];
  const details = getChatDetails(activeConv);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  useEffect(() => {
    setShowTagDropdown(false);
    setShowInfo(false);
  }, [activeTabId]);

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
              <button className={`btn-flag ${showTagDropdown ? 'btn-flag-active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowTagDropdown(prev => !prev); }}>
                <IconTagsIcon /> Tag
              </button>
              <button className={`btn-flag ${showInfo ? 'btn-flag-active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowInfo(prev => !prev); }}>
                <IconInfo /> Info
              </button>

              {showTagDropdown && (
                <div className="chat-tag-assign-dropdown chat-tag-assign-dropdown--panel" onClick={e => e.stopPropagation()}>
                  <div className="tag-dropdown-header"><span>Assign Tags</span><button className="tag-dropdown-close" onClick={() => setShowTagDropdown(false)}>✕</button></div>
                  <div className="tag-dropdown-list">
                    {tags.map(tag => (
                      <label key={tag.id} className="tag-dropdown-item">
                        <input type="checkbox" checked={(convTags[activeTabId] || []).includes(tag.id)} onChange={() => toggleConvTag(activeTabId, tag.id)} />
                        <span className="tag-dot" style={{ background: tag.color }} />
                        <span>{tag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
            {showInfo ? (
              <div className="chat-room-info-tab" onClick={e => e.stopPropagation()}>
                <div className="info-tab-header">
                  <span className="info-tab-title">Chat Information</span>
                  <button className="btn-info-close" onClick={() => setShowInfo(false)}>✕ Close & Return to Chat</button>
                </div>
                <div className="info-tab-content-grid">
                  <div className="info-tab-section">
                    <span className="info-tab-section-title">Record IDs</span>
                    <div className="info-id-group">
                      <div className="info-id-item">
                        <span className="info-id-label">Chat ID</span>
                        <span className="info-id-val">{details.chatId}</span>
                      </div>
                      <div className="info-id-item">
                        <span className="info-id-label">Traveler Name</span>
                        <span className="info-id-val" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{details.travelerName}</span>
                      </div>
                      <div className="info-id-item">
                        <span className="info-id-label">Traveler ID</span>
                        <span className="info-id-val">{details.travelerId}</span>
                      </div>
                      <div className="info-id-item">
                        <span className="info-id-label">Agency Name</span>
                        <span className="info-id-val" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{details.agencyName}</span>
                      </div>
                      <div className="info-id-item">
                        <span className="info-id-label">Agency ID</span>
                        <span className="info-id-val">{details.agencyId}</span>
                      </div>
                      <div className="info-id-item">
                        <span className="info-id-label">Tour Package Name</span>
                        <span className="info-id-val" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{details.packageName}</span>
                      </div>
                      <div className="info-id-item">
                        <span className="info-id-label">Package ID</span>
                        <span className="info-id-val">{details.packageId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="info-tab-section info-tab-section--moderation">
                    <span className="info-tab-section-title">Moderation Actions</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 12px' }}>
                      Flag this conversation for review or initiate an immediate package takedown if policy violations are detected.
                    </p>
                    <button className="btn-moderate-pkg" style={{ width: '100%', padding: '10px 14px', fontSize: '0.78rem' }} onClick={() => onInitiateTakedown(activeConv)}>
                      Moderate Tour
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
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
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PopOutWindow({ conv, messages, flaggedIds, onToggleFlag, onSendWarning, onClose, onDock, index, onInitiateTakedown, tags, convTags, toggleConvTag }) {
  const [warningText, setWarningText] = useState('');
  const [minimized, setMinimized]     = useState(false);
  const [showInfo, setShowInfo]       = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const messagesEndRef  = useRef(null);

  const [windowWidth, setWindowWidth] = useState(300);
  const [windowHeight, setWindowHeight] = useState(400);
  const { setFullTranscriptConvId } = useChatPopOut();

  const startResize = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowWidth;
    const startHeight = windowHeight;

    const handleMouseMove = (moveEvent) => {
      if (direction === 'n' || direction === 'nw') {
        const deltaY = startY - moveEvent.clientY;
        setWindowHeight(Math.max(180, Math.min(800, startHeight + deltaY)));
      }
      if (direction === 'w' || direction === 'nw') {
        const deltaX = startX - moveEvent.clientX;
        setWindowWidth(Math.max(260, Math.min(600, startWidth + deltaX)));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [windowWidth, windowHeight]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const isFlagged = flaggedIds.has(conv.id);
  const details = getChatDetails(conv);

  return (
    <div
      className={`pop-out-window ${minimized ? 'pop-out-minimized' : ''}`}
      style={{
        width: `${windowWidth}px`,
        height: minimized ? '38px' : `${windowHeight}px`
      }}
    >
      {/* Resize Handles (only active when not minimized) */}
      {!minimized && (
        <>
          <div className="pop-out-resize-handle n" onMouseDown={e => startResize(e, 'n')} />
          <div className="pop-out-resize-handle w" onMouseDown={e => startResize(e, 'w')} />
          <div className="pop-out-resize-handle nw" onMouseDown={e => startResize(e, 'nw')} />
        </>
      )}

      {/* Clickable header to toggle minimize */}
      <div className="pop-out-header" onClick={() => setMinimized(m => !m)}>
        <div className="pop-out-title">
          <span className="pop-out-live-dot" />
          <div className="avatar avatar-xs avatar-blue">{conv.traveler.charAt(0)}</div>
          <span>{conv.traveler} ↔ {conv.agency.split(' ')[0]}</span>
          {isFlagged && <span style={{ fontSize: '0.65rem' }}>🚩</span>}
        </div>
        <div className="pop-out-controls" onClick={e => e.stopPropagation()}>
          <button className="pop-out-btn" title="Open Full Transcript" onClick={() => setFullTranscriptConvId(conv.id)}>
            <IconExpand />
          </button>
          <button className="pop-out-btn" title={minimized ? 'Restore' : 'Minimize'} onClick={() => setMinimized(m => !m)}>
            {minimized ? <IconMaximize /> : <IconMinimize />}
          </button>
          <button className="pop-out-btn" title="Dock to Panel A" onClick={() => onDock(conv.id)}>
            <IconDock />
          </button>
          <button className="pop-out-btn pop-out-close-btn" title="Close" onClick={() => onClose(conv.id)}>
            <IconClose />
          </button>
        </div>
      </div>

      {!minimized && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative' }}>
          <div className="pop-out-pkg">{conv.package}</div>
          
          {showInfo ? (
            <div className="pop-out-info-overlay" onClick={e => e.stopPropagation()}>
              <div className="pop-out-info-header">
                <h4>Chat Information</h4>
                <button className="pop-out-info-close" onClick={() => setShowInfo(false)}>✕</button>
              </div>
              <div className="pop-out-info-content">
                <div className="pop-out-id-item">
                  <span className="pop-out-id-label">Chat ID</span>
                  <span className="pop-out-id-val">{details.chatId}</span>
                </div>
                <div className="pop-out-id-item">
                  <span className="pop-out-id-label">Traveler Name</span>
                  <span className="pop-out-id-val" style={{ fontWeight: 600 }}>{details.travelerName}</span>
                </div>
                <div className="pop-out-id-item">
                  <span className="pop-out-id-label">Traveler ID</span>
                  <span className="pop-out-id-val">{details.travelerId}</span>
                </div>
                <div className="pop-out-id-item">
                  <span className="pop-out-id-label">Agency Name</span>
                  <span className="pop-out-id-val" style={{ fontWeight: 600 }}>{details.agencyName}</span>
                </div>
                <div className="pop-out-id-item">
                  <span className="pop-out-id-label">Agency ID</span>
                  <span className="pop-out-id-val">{details.agencyId}</span>
                </div>
                <div className="pop-out-id-item">
                  <span className="pop-out-id-label">Tour Package Name</span>
                  <span className="pop-out-id-val" style={{ fontWeight: 600 }}>{details.packageName}</span>
                </div>
                <div className="pop-out-id-item">
                  <span className="pop-out-id-label">Package ID</span>
                  <span className="pop-out-id-val">{details.packageId}</span>
                </div>
                
                <div className="pop-out-moderation-section">
                  <button className="btn-moderate-pkg" style={{ width: '100%', marginTop: 8 }} onClick={() => onInitiateTakedown(conv)}>
                    Moderate Tour
                  </button>
                </div>
              </div>
            </div>
          ) : (
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
          )}

          {showTagDropdown && (
            <div className="pop-out-tag-dropdown" onClick={e => e.stopPropagation()}>
              <div className="tag-dropdown-header">
                <span>Assign Tags</span>
                <button className="tag-dropdown-close" onClick={() => setShowTagDropdown(false)}>✕</button>
              </div>
              <div className="tag-dropdown-list">
                {tags.map(tag => (
                  <label key={tag.id} className="tag-dropdown-item">
                    <input type="checkbox" checked={(convTags[conv.id] || []).includes(tag.id)} onChange={() => toggleConvTag(conv.id, tag.id)} />
                    <span className="tag-dot" style={{ background: tag.color }} />
                    <span>{tag.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pop-out-footer">
            <button className={`pop-out-flag-btn ${isFlagged ? 'pop-out-flag-btn--red-active' : ''}`} onClick={() => onToggleFlag(conv.id)} title="Flag / Unflag">{isFlagged ? '🚩' : '🏳️'}</button>
            <button className={`pop-out-flag-btn ${showTagDropdown ? 'active' : ''}`} onClick={() => { setShowTagDropdown(prev => !prev); setShowInfo(false); }} title="Assign Tags"><IconTagsIcon /></button>
            <button className={`pop-out-flag-btn ${showInfo ? 'active' : ''}`} onClick={() => { setShowInfo(prev => !prev); setShowTagDropdown(false); }} title="Chat Info"><IconInfo /></button>
            <input
              className="pop-out-input"
              placeholder="Send system warning…"
              value={warningText}
              onChange={e => setWarningText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && warningText.trim()) { onSendWarning(conv.id, warningText); setWarningText(''); } }}
            />
            <button className="pop-out-send-btn" disabled={!warningText.trim()} onClick={() => { onSendWarning(conv.id, warningText); setWarningText(''); }}>⚠</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChatMonitoringPage() {
  const {
    conversations,
    setConversations,
    messagesDb,
    flaggedIds,
    tags,
    setTags,
    convTags,
    setConvTags,
    toggleFlag,
    toggleConvTag,
    handleSendWarning,
    popOuts,
    openPopOut,
    handleInitiateTakedown,
    setActivePanelChats,
  } = useChatPopOut();

  const [searchParams] = useSearchParams();
  const dockId = searchParams.get('dock');

  // Panel system
  const [panelMode, setPanelMode] = useState('single'); // 'single' | 'split'
  const [panels, setPanels] = useState({
    A: { tabs: [], activeTab: null },
    B: { tabs: [], activeTab: null },
  });

  // Synchronize active panel tabs with context for message polling
  useEffect(() => {
    setActivePanelChats({
      A: panels.A.activeTab,
      B: panelMode === 'split' ? panels.B.activeTab : null
    });
  }, [panels.A.activeTab, panels.B.activeTab, panelMode, setActivePanelChats]);

  // Context menu
  const [contextMenu, setContextMenu] = useState(null);

  // Search & filters
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const getFilterLabel = (f) => {
    if (f === 'all') return 'All';
    if (f === 'unread') return 'Unread';
    if (f === 'flagged') return 'Flagged';
    const tag = tags.find(t => t.id === f);
    return tag ? tag.label : 'Filter';
  };

  // Flags & tags modal state (context menu tags are global)
  const [showTagModal,  setShowTagModal]  = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagLabel,   setNewTagLabel]   = useState('');
  const [newTagColor,   setNewTagColor]   = useState('#6366f1');
  const [tagAssignConvId, setTagAssignConvId] = useState(null);


  const autoOpenedRef = useRef(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const markAsRead = useCallback((convId) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: false } : c));
  }, [setConversations]);

  const openInPanel = useCallback((panelId, convId, addTab = true) => {
    setPanels(prev => {
      const panel = prev[panelId];
      if (panel.tabs.includes(convId)) {
        return { ...prev, [panelId]: { ...panel, activeTab: convId } };
      }
      let newTabs;
      if (addTab) {
        newTabs = [...panel.tabs, convId];
      } else {
        if (panel.activeTab && panel.tabs.includes(panel.activeTab)) {
          newTabs = panel.tabs.map(t => t === panel.activeTab ? convId : t);
        } else {
          newTabs = [convId];
        }
      }
      return { ...prev, [panelId]: { tabs: newTabs, activeTab: convId } };
    });
    markAsRead(convId);
  }, [markAsRead]);

  // On load: auto-open the docked search param chat or the first flagged chat
  useEffect(() => {
    if (conversations.length === 0 || autoOpenedRef.current) return;
    if (dockId && conversations.some(c => c.id === dockId)) {
      openInPanel('A', dockId, false);
    } else {
      const firstFlagged = conversations.find(c => flaggedIds.has(c.id));
      const target = firstFlagged || conversations[0];
      openInPanel('A', target.id, false);
    }
    autoOpenedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, dockId, openInPanel]);

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
        openInPanel('A', convId, false);
        break;
      case 'tab-a':
        openInPanel('A', convId, true);
        break;
      case 'panel-b':
        openInPanel('B', convId, false);
        break;
      case 'tab-b':
        openInPanel('B', convId, true);
        break;
      case 'split-b':
        setPanelMode('split');
        openInPanel('B', convId, false);
        break;
      case 'popout':
        openPopOut(convId);
        break;
      case 'flag':
        toggleFlag(convId);
        break;
      case 'tag':
        setTagAssignConvId(convId === tagAssignConvId ? null : convId);
        break;
      default: break;
    }
  }, [openInPanel, tagAssignConvId, openPopOut, toggleFlag]);

  // Left-click: open normally by replacing the active tab
  const handleLeftClick = useCallback((convId) => {
    openInPanel('A', convId, false);
  }, [openInPanel]);

  const handleCreateTag = () => {
    if (!newTagLabel.trim()) return;
    setTags(prev => [...prev, { id: `t${Date.now()}`, label: newTagLabel.trim(), color: newTagColor }]);
    setNewTagLabel(''); setNewTagColor('#6366f1'); setShowCreateTag(false);
  };

  const handleDeleteTag = (tagId) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setConvTags(prev => { const u = { ...prev }; Object.keys(u).forEach(k => { u[k] = u[k].filter(id => id !== tagId); }); return u; });
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

  // ─── Activity status derived from time string ─────────────────────────────
  const getActivityStatus = (timeStr) => {
    if (!timeStr) return 'inactive';
    const t = timeStr.toLowerCase();
    if (t === 'just now' || t === 'now') return 'active';
    if (t.includes('min'))   return 'active';   // within the hour
    if (t.includes('1 hr') || t.includes('2 hr') || t.includes('3 hr')) return 'recent';
    if (t.includes('hr'))    return 'idle';      // several hours ago
    return 'inactive';                            // yesterday / days ago
  };

  const ACTIVITY_META = {
    active:   { label: 'Active now',  dot: '#22c55e', pulse: true  },
    recent:   { label: 'Recent',      dot: '#f59e0b', pulse: false },
    idle:     { label: 'A few hrs ago', dot: '#94a3b8', pulse: false },
    inactive: { label: null,          dot: '#cbd5e1', pulse: false },
  };

  return (
    <div className="chat-page" onClick={() => { setContextMenu(null); setShowFilterDropdown(false); }}>

      {/* ─── Compact Toolbar ─────────────────────────────────────────────── */}
      <div className="chat-toolbar">
        {/* Inline stats */}
        <div className="chat-toolbar-stats">
          <div className="chat-tstat chat-tstat--blue">
            <div className="chat-tstat-icon"><IconChats /></div>
            <span className="chat-tstat-val">{totalChats}</span>
            <span className="chat-tstat-label">Total</span>
          </div>
          <div className="chat-tstat-divider" />
          <div className={`chat-tstat ${unreadCount > 0 ? 'chat-tstat--orange' : ''}`}>
            <div className="chat-tstat-icon"><IconUnread /></div>
            <span className="chat-tstat-val">{unreadCount}</span>
            <span className="chat-tstat-label">Unread</span>
          </div>
          <div className="chat-tstat-divider" />
          <div className={`chat-tstat ${flaggedCount > 0 ? 'chat-tstat--red' : ''}`}>
            <div className="chat-tstat-icon"><IconFlagged /></div>
            <span className="chat-tstat-val">{flaggedCount}</span>
            <span className="chat-tstat-label">Flagged</span>
          </div>
          <div className="chat-tstat-divider" />
          <div className="chat-tstat chat-tstat--plum">
            <div className="chat-tstat-icon"><IconWarnings /></div>
            <span className="chat-tstat-val">{warningCount}</span>
            <span className="chat-tstat-label">Warnings</span>
          </div>
        </div>

        {/* Controls */}
        <div className="chat-toolbar-controls">
          <span className="chat-toolbar-hint">Right-click chat for options</span>
          <div className="panel-mode-toggle">
            <button className={`panel-mode-btn ${panelMode === 'single' ? 'active' : ''}`} onClick={() => setPanelMode('single')}>◧ Single</button>
            <button className={`panel-mode-btn ${panelMode === 'split'  ? 'active' : ''}`} onClick={() => setPanelMode('split')}>◫ Split</button>
          </div>
          <button className="btn-manage-tags" onClick={() => setShowTagModal(true)}><IconTagsIcon /> Tags</button>
        </div>
      </div>

      {/* ─── Main Layout ─────────────────────────────────────────────────── */}
      <div className="chat-layout">
        {/* Conversation List */}
        <div className="chat-list-pane">
          <div className="chat-search-container">
            <input className="chat-search-input" placeholder="Search traveler, agency, tour…" value={search} onChange={e => setSearch(e.target.value)} />
            <div className="chat-filter-dropdown-wrap">
              <button className={`btn-filter-trigger ${filter !== 'all' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(prev => !prev); }}>
                <IconFilter /> {filter === 'all' ? 'Filter' : getFilterLabel(filter)}
              </button>
              {showFilterDropdown && (
                <div className="chat-filter-dropdown" onClick={e => e.stopPropagation()}>
                  <div className="filter-section">
                    <span className="filter-section-title">Status</span>
                    <button className={`filter-option ${filter === 'all' ? 'active' : ''}`} onClick={() => { setFilter('all'); setShowFilterDropdown(false); }}>All Chats</button>
                    <button className={`filter-option ${filter === 'unread' ? 'active' : ''}`} onClick={() => { setFilter('unread'); setShowFilterDropdown(false); }}>Unread ({unreadCount})</button>
                    <button className={`filter-option ${filter === 'flagged' ? 'active' : ''}`} onClick={() => { setFilter('flagged'); setShowFilterDropdown(false); }}>Flagged ({flaggedCount})</button>
                  </div>
                  {tags.length > 0 && (
                    <>
                      <div className="filter-divider" />
                      <div className="filter-section">
                        <span className="filter-section-title">Tags</span>
                        {tags.map(tag => (
                          <button
                            key={tag.id}
                            className={`filter-option filter-option--tag ${filter === tag.id ? 'active' : ''}`}
                            onClick={() => { setFilter(filter === tag.id ? 'all' : tag.id); setShowFilterDropdown(false); }}
                          >
                            <span className="tag-dot" style={{ background: tag.color }} />
                            <span>{tag.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="chat-list-hint">
            <span>💡 Right-click any chat for panel options</span>
          </div>

          {/* Conversation items */}
          <div className="chat-items-list">
            {sortedConversations.length === 0 ? (
              <div className="chat-empty-list">No conversations found</div>
            ) : sortedConversations.map(conv => {
              const isFlagged    = flaggedIds.has(conv.id);
              const convTagList  = (convTags[conv.id] || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean);
              const isInPanelA   = panels.A.tabs.includes(conv.id);
              const isInPanelB   = panels.B.tabs.includes(conv.id);
              const isPopOut     = popOuts.includes(conv.id);
              const activity     = getActivityStatus(conv.time);
              const actMeta      = ACTIVITY_META[activity];
              const isActive     = activity === 'active';
              return (
                <div key={conv.id}
                  className={`chat-list-item ${conv.unread ? 'unread' : ''} ${isFlagged ? 'flagged-item' : ''} ${isActive ? 'conv-live' : ''} ${panels.A.activeTab === conv.id || panels.B.activeTab === conv.id ? 'active' : ''}`}
                  onClick={() => handleLeftClick(conv.id)}
                  onContextMenu={e => handleRightClick(e, conv.id)}
                >
                  {/* Row 1: avatars + activity dot + time + badges */}
                  <div className="chat-item-row1">
                    <div className="chat-item-avatars">
                      <div className="avatar avatar-sm avatar-blue" title={conv.traveler}>{conv.traveler.charAt(0)}</div>
                      <span className="chat-avatar-separator">↔</span>
                      <div className="avatar avatar-sm avatar-plum" title={conv.agency}>{conv.agency.charAt(0)}</div>
                    </div>
                    <div className="chat-item-right-meta">
                      {isInPanelA && <span className="conv-panel-badge panel-a">A</span>}
                      {isInPanelB && <span className="conv-panel-badge panel-b">B</span>}
                      {isPopOut   && <span className="conv-panel-badge panel-pop">⧉</span>}
                      {isFlagged  && <span className="chat-flag-chip">🚩</span>}
                      {conv.unread && <span className="chat-unread-dot" />}
                    </div>
                  </div>

                  {/* Row 2: names */}
                  <div className="chat-item-names">
                    <strong>{conv.traveler}</strong>
                    <span className="chat-item-sep">↔</span>
                    <span>{conv.agency}</span>
                  </div>

                  {/* Row 3: package + activity status */}
                  <div className="chat-item-row3">
                    <span className="chat-item-package-label">{conv.package}</span>
                    <div className="chat-activity-status">
                      <span
                        className={`chat-activity-dot ${actMeta.pulse ? 'pulsing' : ''}`}
                        style={{ background: actMeta.dot }}
                      />
                      <span className="chat-activity-label" style={{ color: actMeta.dot }}>
                        {isActive ? 'Active now' : conv.time}
                      </span>
                    </div>
                  </div>

                  {/* Row 4: last message snippet */}
                  <p className="chat-item-snippet">{conv.lastMsg}</p>

                  {/* Tags (only if assigned) */}
                  {convTagList.length > 0 && (
                    <div className="chat-conv-tags">
                      {convTagList.map(t => <span key={t.id} className="chat-conv-tag" style={{ background: t.color + '22', color: t.color, borderColor: t.color + '44' }}>{t.label}</span>)}
                    </div>
                  )}

                  {/* Inline tag assignment dropdown */}
                  {tagAssignConvId === conv.id && (
                    <div className="chat-tag-assign-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="tag-dropdown-header"><span>Assign Tags</span><button className="tag-dropdown-close" onClick={() => setTagAssignConvId(null)}>✕</button></div>
                      <div className="tag-dropdown-list">
                        {tags.map(tag => (
                          <label key={tag.id} className="tag-dropdown-item">
                            <input type="checkbox" checked={(convTags[conv.id] || []).includes(tag.id)} onChange={() => toggleConvTag(conv.id, tag.id)} />
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
            toggleConvTag={toggleConvTag}
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
              toggleConvTag={toggleConvTag}
            />
          )}
        </div>
      </div>

      {/* ─── Context Menu ────────────────────────────────────────────────── */}
      <ConvContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} onAction={handleContextAction} panelMode={panelMode} />



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


    </div>
  );
}
