import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useChatPopOut } from '../context/ChatPopOutContext';
import { PopOutWindow, IconTagsIcon, IconInfo, getChatDetails } from '../pages/ChatMonitoringPage';
import './AdminLayout.css';

const PRESET_WARNINGS = [
  'Security Check: Sharing direct phone numbers or bank details is prohibited.',
  'Payment Alert: Keep all booking payments inside the platform.',
  'Moderation Notice: Inappropriate language detected. Please maintain professional communication.',
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [warningText, setWarningText] = useState('');

  const navigate = useNavigate();
  const {
    popOuts,
    conversations,
    messagesDb,
    flaggedIds,
    toggleFlag,
    handleSendWarning,
    closePopOut,
    tags,
    convTags,
    toggleConvTag,
    showTakedownModal,
    setShowTakedownModal,
    takedownPkgTitle,
    takedownReason,
    setTakedownReason,
    handleInitiateTakedown,
    handleConfirmTakedown,
    fullTranscriptConvId,
    setFullTranscriptConvId
  } = useChatPopOut();

  const transcriptConv = conversations.find(c => c.id === fullTranscriptConvId);
  const transcriptMessages = messagesDb[fullTranscriptConvId] || [];
  const filteredTranscriptMessages = transcriptMessages.filter(msg =>
    msg.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  const modalMessagesEndRef = useRef(null);
  const transcriptLength = transcriptMessages.length;

  useEffect(() => {
    if (fullTranscriptConvId) {
      modalMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [fullTranscriptConvId, transcriptLength]);

  const handleCloseTranscript = () => {
    setFullTranscriptConvId(null);
    setTranscriptSearch('');
    setShowInfo(false);
    setShowTagDropdown(false);
    setWarningText('');
  };

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="admin-main">
        <TopBar />
        <main className="admin-content" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* Docked popout chats container - Facebook / Gmail style */}
      {popOuts.length > 0 && (
        <div className="docked-chats-container">
          {popOuts.map((convId, i) => {
            const conv = conversations.find(c => c.id === convId);
            if (!conv) return null;
            return (
              <PopOutWindow
                key={convId}
                conv={conv}
                messages={messagesDb[convId] || []}
                index={i}
                flaggedIds={flaggedIds}
                onToggleFlag={toggleFlag}
                onSendWarning={handleSendWarning}
                onClose={closePopOut}
                onDock={(id) => {
                  closePopOut(id);
                  navigate(`/chat?dock=${id}`);
                }}
                tags={tags}
                convTags={convTags}
                toggleConvTag={toggleConvTag}
                onInitiateTakedown={handleInitiateTakedown}
              />
            );
          })}
        </div>
      )}

      {/* Takedown Modal - Global */}
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

      {/* Full Transcript Modal - Global */}
      {fullTranscriptConvId && transcriptConv && (
        <div className="pay-modal-overlay" onClick={handleCloseTranscript}>
          <div className="pay-modal transcript-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90vw', height: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            
            {/* Room Header */}
            <div className="chat-room-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', borderRadius: '20px 20px 0 0' }}>
              <div className="chat-room-info">
                <div className="chat-users-meta">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{transcriptConv.traveler}</h3>
                  <span className="chat-meta-divider">↔</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{transcriptConv.agency}</h3>
                </div>
                <div className="chat-pkg-meta" style={{ fontSize: '0.78rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Enquiry: <strong>{transcriptConv.package}</strong></span>
                  {transcriptConv.sale_stage && (
                    <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: transcriptConv.sale_stage === 'postsale' ? '#D1FAE5' : '#EFF1F2', color: transcriptConv.sale_stage === 'postsale' ? '#10B981' : '#595C5D' }}>
                      {transcriptConv.sale_stage}
                    </span>
                  )}
                </div>
                {/* Conv tags */}
                {(convTags[fullTranscriptConvId] || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {(convTags[fullTranscriptConvId] || []).map(tid => {
                      const t = tags.find(x => x.id === tid);
                      return t ? <span key={tid} className="chat-conv-tag" style={{ background: t.color + '20', color: t.color, borderColor: t.color + '44' }}>{t.label}</span> : null;
                    })}
                  </div>
                )}
              </div>
              <div className="chat-room-actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {!showInfo && (
                  <input
                    className="chat-search-input"
                    style={{ width: '160px', height: '30px', padding: '0 10px', fontSize: '0.78rem' }}
                    placeholder="Search transcript..."
                    value={transcriptSearch}
                    onChange={e => setTranscriptSearch(e.target.value)}
                  />
                )}
                <button className={`btn-flag ${flaggedIds.has(transcriptConv.id) ? 'btn-flag-active' : ''}`} onClick={() => toggleFlag(transcriptConv.id)}>
                  {flaggedIds.has(transcriptConv.id) ? '🚩 Flagged' : '🏳️ Flag'}
                </button>
                <button className={`btn-flag ${showTagDropdown ? 'btn-flag-active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowTagDropdown(prev => !prev); }}>
                  <IconTagsIcon /> Tag
                </button>
                <button className={`btn-flag ${showInfo ? 'btn-flag-active' : ''}`} onClick={(e) => { e.stopPropagation(); setShowInfo(prev => !prev); }}>
                  <IconInfo /> Info
                </button>
                <button className="btn-flag" onClick={handleCloseTranscript} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✕ Close
                </button>

                {showTagDropdown && (
                  <div className="chat-tag-assign-dropdown chat-tag-assign-dropdown--panel" onClick={e => e.stopPropagation()} style={{ right: 0, marginTop: '6px' }}>
                    <div className="tag-dropdown-header"><span>Assign Tags</span><button className="tag-dropdown-close" onClick={() => setShowTagDropdown(false)}>✕</button></div>
                    <div className="tag-dropdown-list">
                      {tags.map(tag => (
                        <label key={tag.id} className="tag-dropdown-item">
                          <input type="checkbox" checked={(convTags[fullTranscriptConvId] || []).includes(tag.id)} onChange={() => toggleConvTag(fullTranscriptConvId, tag.id)} />
                          <span className="tag-dot" style={{ background: tag.color }} />
                          <span>{tag.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Room Body (Info Tab or Timeline) */}
            <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
              {showInfo ? (
                <div className="chat-room-info-tab" onClick={e => e.stopPropagation()} style={{ padding: '20px', width: '100%' }}>
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
                          <span className="info-id-val">{getChatDetails(transcriptConv).chatId}</span>
                        </div>
                        <div className="info-id-item">
                          <span className="info-id-label">Traveler Name</span>
                          <span className="info-id-val" style={{ fontWeight: 600 }}>{getChatDetails(transcriptConv).travelerName}</span>
                        </div>
                        <div className="info-id-item">
                          <span className="info-id-label">Traveler ID</span>
                          <span className="info-id-val">{getChatDetails(transcriptConv).travelerId}</span>
                        </div>
                        <div className="info-id-item">
                          <span className="info-id-label">Agency Name</span>
                          <span className="info-id-val" style={{ fontWeight: 600 }}>{getChatDetails(transcriptConv).agencyName}</span>
                        </div>
                        <div className="info-id-item">
                          <span className="info-id-label">Agency ID</span>
                          <span className="info-id-val">{getChatDetails(transcriptConv).agencyId}</span>
                        </div>
                        <div className="info-id-item">
                          <span className="info-id-label">Tour Package Name</span>
                          <span className="info-id-val" style={{ fontWeight: 600 }}>{getChatDetails(transcriptConv).packageName}</span>
                        </div>
                        <div className="info-id-item">
                          <span className="info-id-label">Package ID</span>
                          <span className="info-id-val">{getChatDetails(transcriptConv).packageId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="info-tab-section info-tab-section--moderation">
                      <span className="info-tab-section-title">Moderation Actions</span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 12px' }}>
                        Flag this conversation for review or initiate an immediate package takedown if policy violations are detected.
                      </p>
                      <button className="btn-moderate-pkg" style={{ width: '100%', padding: '10px 14px', fontSize: '0.78rem' }} onClick={() => handleInitiateTakedown(transcriptConv)}>
                        Moderate Tour
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>

                  <div className="chat-messages-body">
                    <div className="chat-alert-banner">🛡️ Administrator read-only monitoring mode</div>
                    <div className="chat-messages-timeline" style={{ padding: '16px 20px' }}>
                      {filteredTranscriptMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px 0', fontSize: '0.8rem' }}>
                          {transcriptSearch ? 'No messages matching search query.' : 'No messages in this conversation.'}
                        </div>
                      ) : (
                        filteredTranscriptMessages.map(msg => {
                          if (msg.sender === 'system') return (
                            <div key={msg.id} className="msg-row msg-system-warning" style={{ alignSelf: 'center', width: '100%', maxWidth: '90%' }}>
                              <div className="system-warning-bubble" style={{ padding: '8px 12px' }}>
                                <span className="system-warning-icon" style={{ fontSize: '0.65rem' }}>⚠️ SECURITY WARNING</span>
                                <p className="system-warning-text" style={{ fontSize: '0.72rem', margin: '2px 0' }}>{msg.text}</p>
                                <span className="system-warning-time" style={{ fontSize: '0.55rem' }}>{msg.time}</span>
                              </div>
                            </div>
                          );
                          const isTraveler = msg.sender === 'traveler';
                          return (
                            <div key={msg.id} className={`msg-row ${isTraveler ? 'msg-row-left' : 'msg-row-right'}`} style={{ maxWidth: '85%', alignSelf: isTraveler ? 'flex-start' : 'flex-end', display: 'flex', gap: '8px', flexDirection: isTraveler ? 'row' : 'row-reverse' }}>
                              <div className={`avatar avatar-xs ${isTraveler ? 'avatar-blue' : 'avatar-plum'}`} style={{ flexShrink: 0 }}>
                                {isTraveler ? transcriptConv.traveler.charAt(0) : transcriptConv.agency.charAt(0)}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isTraveler ? 'flex-start' : 'flex-end' }}>
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-faint)', marginBottom: '2px' }}>
                                  {isTraveler ? transcriptConv.traveler : transcriptConv.agency} ({isTraveler ? 'Traveler' : 'Agency'})
                                </span>
                                <div className="msg-bubble" style={{ padding: '8px 12px', borderRadius: '12px', background: isTraveler ? '#EBF3FE' : 'var(--color-lavender-light)', color: isTraveler ? '#1E3A8A' : '#4A2E80' }}>
                                  <p className="msg-text" style={{ fontSize: '0.78rem', margin: 0 }}>{msg.text}</p>
                                  <span className="msg-time" style={{ fontSize: '0.55rem', marginTop: '4px', textAlign: 'right', display: 'block', opacity: 0.6 }}>{msg.time}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={modalMessagesEndRef} />
                    </div>
                  </div>

                  {/* Room Footer */}
                  <div className="chat-room-footer" style={{ borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                    <div className="preset-warnings-row">
                      <span className="presets-label">Quick:</span>
                      {PRESET_WARNINGS.map((p, i) => (
                        <button key={i} className="preset-btn" onClick={() => handleSendWarning(transcriptConv.id, p)}>
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
                        onKeyDown={e => { if (e.key === 'Enter' && warningText.trim()) { handleSendWarning(transcriptConv.id, warningText); setWarningText(''); } }}
                      />
                      <button className="btn-send-warning" disabled={!warningText.trim()} onClick={() => { handleSendWarning(transcriptConv.id, warningText); setWarningText(''); }}>Send Warning</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
