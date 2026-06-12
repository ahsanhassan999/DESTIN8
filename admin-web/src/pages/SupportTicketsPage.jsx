import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './SupportTicketsPage.css';

const TABS = [
  { id: 'all', label: 'All Tickets' },
  { id: 'pending', label: 'Pending Approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'closed', label: 'Closed' },
];

const PRESETS = [
  '#ef4444', // Red
  '#f59e0b', // Orange
  '#d97706', // Dark Yellow/Amber
  '#10b981', // Green
  '#0ea5e9', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#967BB6', // Lavender (Brand)
];

// Simple character-by-character diff algorithm
function diffText(oldStr, newStr) {
  oldStr = oldStr || '';
  newStr = newStr || '';
  
  const dp = Array(oldStr.length + 1).fill(0).map(() => Array(newStr.length + 1).fill(0));
  for (let i = 1; i <= oldStr.length; i++) {
    for (let j = 1; j <= newStr.length; j++) {
      if (oldStr[i - 1] === newStr[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const chunks = [];
  let i = oldStr.length;
  let j = newStr.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
      chunks.push({ type: 'unchanged', val: oldStr[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      chunks.push({ type: 'added', val: newStr[j - 1] });
      j--;
    } else {
      chunks.push({ type: 'removed', val: oldStr[i - 1] });
      i--;
    }
  }
  chunks.reverse();

  const merged = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (last && last.type === chunk.type) {
      last.val += chunk.val;
    } else {
      merged.push({ ...chunk });
    }
  }
  return merged;
}

function CharacterDiff({ oldText, newText }) {
  const chunks = diffText(String(oldText || ''), String(newText || ''));
  return (
    <span className="diff-text-wrapper">
      {chunks.map((chunk, idx) => {
        if (chunk.type === 'added') {
          return <span key={idx} className="diff-added">{chunk.val}</span>;
        } else if (chunk.type === 'removed') {
          return <span key={idx} className="diff-removed">{chunk.val}</span>;
        }
        return <span key={idx} className="diff-unchanged">{chunk.val}</span>;
      })}
    </span>
  );
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState({});

  // Tag creation state
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#967BB6');
  const [showTagManager, setShowTagManager] = useState(false);

  // Modal Details State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const loadTickets = async () => {
    try {
      const data = await api.getAdminTickets();
      setTickets(data);
      // Update the selected ticket in place if details modal is open
      if (selectedTicket) {
        const updated = data.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err);
      showToast(err.message || 'Failed to load tickets.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await api.getTicketTags();
      setAllTags(data);
    } catch (err) {
      console.error('Failed to load ticket tags:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadTickets();
    loadTags();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (ticketId, action) => {
    try {
      const ticketNotes = notes[ticketId] || '';
      await api.actionAdminTicket(ticketId, action, ticketNotes);
      showToast(`Ticket successfully marked as ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'closed'}.`);
      setNotes(prev => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
      setShowDetailsModal(false);
      setSelectedTicket(null);
      loadTickets();
    } catch (err) {
      showToast(err.message || 'Failed to process ticket action.', 'danger');
    }
  };

  const handleNotesChange = (ticketId, value) => {
    setNotes(prev => ({
      ...prev,
      [ticketId]: value,
    }));
  };

  const parseJsonArray = (val) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return [];
      }
    }
    if (Array.isArray(val)) return val;
    return [];
  };

  const parseChanges = (proposedChangesStr) => {
    if (!proposedChangesStr) return null;
    try {
      return JSON.parse(proposedChangesStr);
    } catch (e) {
      return null;
    }
  };

  // Ticket tags updates
  const handleToggleTicketTag = async (tag) => {
    if (!selectedTicket) return;
    const isAssigned = selectedTicket.tags.some(t => t.id === tag.id);
    let newTags;
    if (isAssigned) {
      newTags = selectedTicket.tags.filter(t => t.id !== tag.id);
    } else {
      newTags = [...selectedTicket.tags, tag];
    }
    
    // Optimistic update
    setSelectedTicket(prev => ({
      ...prev,
      tags: newTags
    }));

    try {
      const tagIds = newTags.map(t => t.id);
      await api.updateTicketTags(selectedTicket.id, tagIds);
      // Reload list in background
      const data = await api.getAdminTickets();
      setTickets(data);
    } catch (err) {
      showToast(err.message || 'Failed to update tags.', 'danger');
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      const created = await api.createTicketTag(newTagName.trim(), newTagColor);
      setAllTags(prev => [...prev, created]);
      setNewTagName('');
      showToast('Tag created successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to create tag.', 'danger');
    }
  };

  const handleDeleteTag = async (tagId, e) => {
    e.stopPropagation();
    try {
      await api.deleteTicketTag(tagId);
      setAllTags(prev => prev.filter(t => t.id !== tagId));
      setSelectedTicket(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tags: prev.tags.filter(t => t.id !== tagId)
        };
      });
      loadTickets();
      showToast('Tag deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete tag.', 'danger');
    }
  };

  // Itinerary Diffs Compiler
  const getItineraryDiffs = (oldItinStr, newItinStr) => {
    const oldItin = parseJsonArray(oldItinStr);
    const newItin = parseJsonArray(newItinStr);
    
    const diffs = [];
    const maxDays = Math.max(oldItin.length, newItin.length);
    
    for (let idx = 0; idx < maxDays; idx++) {
      const oldDay = oldItin[idx];
      const newDay = newItin[idx];
      const dayNum = idx + 1;
      
      if (oldDay && newDay) {
        const dayChanges = [];
        if (oldDay.title !== newDay.title) {
          dayChanges.push({ field: 'Activity Title', oldVal: oldDay.title, newVal: newDay.title });
        }
        const oldDesc = oldDay.desc || oldDay.description || '';
        const newDesc = newDay.desc || newDay.description || '';
        if (oldDesc !== newDesc) {
          dayChanges.push({ field: 'Activity Description', oldVal: oldDesc, newVal: newDesc });
        }
        if (oldDay.accommodation !== newDay.accommodation) {
          dayChanges.push({ field: 'Accommodation / Stay', oldVal: oldDay.accommodation || 'None', newVal: newDay.accommodation || 'None' });
        }
        if (oldDay.location !== newDay.location) {
          dayChanges.push({ field: 'Location', oldVal: oldDay.location || 'None', newVal: newDay.location || 'None' });
        }
        
        const oldTrans = Array.isArray(oldDay.transport) ? oldDay.transport.join(', ') : (oldDay.transport || 'None');
        const newTrans = Array.isArray(newDay.transport) ? newDay.transport.join(', ') : (newDay.transport || 'None');
        if (oldTrans !== newTrans) {
          dayChanges.push({ field: 'Transport / Vehicle', oldVal: oldTrans, newVal: newTrans });
        }
        
        if (dayChanges.length > 0) {
          diffs.push({ type: 'modified', dayNum, changes: dayChanges });
        }
      } else if (newDay) {
        diffs.push({ type: 'added', dayNum, dayData: newDay });
      } else if (oldDay) {
        diffs.push({ type: 'removed', dayNum, dayData: oldDay });
      }
    }
    return diffs;
  };

  // Compile general changes diff list
  const getPackageDiffs = (current, changes) => {
    if (!changes) return [];
    const fields = [];
    Object.entries(changes).map(([key, val]) => {
      if (key === 'itinerary') return; // Handled separately
      
      let oldVal = current ? current[key] : null;
      let newVal = val;

      if (key === 'included_services') {
        const parsedOld = parseJsonArray(oldVal);
        const parsedNew = parseJsonArray(newVal);
        oldVal = parsedOld.join(', ');
        newVal = parsedNew.join(', ');
      } else if (key === 'price') {
        oldVal = current ? `${parseFloat(current.price).toLocaleString()} PKR` : '—';
        newVal = `${parseFloat(val).toLocaleString()} PKR`;
      } else if (key === 'deposit_percentage') {
        oldVal = current ? `${current.deposit_percentage}%` : '—';
        newVal = `${val}%`;
      } else if (key === 'refund_deadline_days') {
        oldVal = current ? (current.refund_deadline_days === 0 ? 'Flexible' : `${current.refund_deadline_days} Days`) : '—';
        newVal = val === 0 ? 'Flexible' : `${val} Days`;
      } else if (typeof val === 'boolean') {
        oldVal = oldVal ? 'Yes' : 'No';
        newVal = newVal ? 'Yes' : 'No';
      }

      if (String(oldVal) !== String(newVal)) {
        fields.push({
          key: key.replace(/_/g, ' '),
          oldVal: oldVal === null || oldVal === undefined ? '—' : String(oldVal),
          newVal: newVal === null || newVal === undefined ? '—' : String(newVal)
        });
      }
    });
    return fields;
  };

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return t.status === 'open' || t.status === 'pending_approval';
    return t.status === activeTab;
  });

  const searchedTickets = filteredTickets.filter(t => {
    const s = search.toLowerCase();
    return (
      t.id.toLowerCase().includes(s) ||
      t.subject.toLowerCase().includes(s) ||
      t.description.toLowerCase().includes(s) ||
      t.user_name.toLowerCase().includes(s) ||
      (t.package_title && t.package_title.toLowerCase().includes(s)) ||
      (t.tags && t.tags.some(tag => tag.name.toLowerCase().includes(s)))
    );
  });

  const getTabCount = (tabId) => {
    if (tabId === 'all') return tickets.length;
    if (tabId === 'pending') {
      return tickets.filter(t => t.status === 'open' || t.status === 'pending_approval').length;
    }
    return tickets.filter(t => t.status === tabId).length;
  };

  return (
    <div className="tickets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support & Exception Tickets</h1>
          <p className="page-subtitle">Moderate package modifications, compensation details, and support tickets</p>
        </div>
      </div>

      <div className="users-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label} <span className="tab-count">{getTabCount(tab.id)}</span>
            </button>
          ))}
        </div>

        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '0 16px', height: '40px', minWidth: '280px' }}>
          <SearchIcon />
          <input
            placeholder="Search tickets, agency, or tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--color-text)', width: '100%', fontSize: '14px' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Agency</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ display: 'inline-block', width: 30, height: 30, border: '3px solid var(--color-surface-hover)', borderTopColor: 'var(--color-plum)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </td>
                </tr>
              ) : searchedTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No tickets found.</td>
                </tr>
              ) : searchedTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => { setSelectedTicket(ticket); setShowDetailsModal(true); }} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                    #{ticket.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar avatar-sm avatar-plum">{(ticket.user_name || 'U').charAt(0)}</div>
                      <span style={{ fontSize: 13 }}>{ticket.user_name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.subject}
                  </td>
                  <td>
                    <span className={`badge-type ${ticket.ticket_type}`}>
                      {ticket.ticket_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {ticket.tags && ticket.tags.map(tag => (
                        <span key={tag.id} className="tag-badge" style={{ backgroundColor: tag.color }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ticket.status === 'open' || ticket.status === 'pending_approval' ? 'badge-pending' : ticket.status === 'approved' ? 'badge-approved' : ticket.status === 'rejected' ? 'badge-rejected' : 'badge-suspended'}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); setShowDetailsModal(true); }}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Review Details Modal */}
      {showDetailsModal && selectedTicket && (() => {
        const isCompensation = selectedTicket.ticket_type === 'compensation_request';
        const isPackageEdit = selectedTicket.ticket_type === 'package_edit_request';
        const showApprove = isCompensation || isPackageEdit;
        const parsedChanges = parseChanges(selectedTicket.proposed_changes);
        const isPending = selectedTicket.status === 'open' || selectedTicket.status === 'pending_approval';

        // Diff Compilations
        const generalDiffs = showApprove && parsedChanges ? getPackageDiffs(selectedTicket.package_details, parsedChanges) : [];
        const itineraryDiffs = showApprove && parsedChanges && parsedChanges.itinerary 
          ? getItineraryDiffs(selectedTicket.package_details?.itinerary, parsedChanges.itinerary) 
          : [];

        // Merged / Proposed package view for traveler preview mockup
        const mergedPackage = {
          ...selectedTicket.package_details,
          ...(parsedChanges || {})
        };
        const itineraryDays = parseJsonArray(mergedPackage.itinerary);
        const includedServices = parseJsonArray(mergedPackage.included_services);

        return (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDetailsModal(false)}>
            <div className="modal details-modal ticket-details-modal" style={{ maxHeight: '90vh', width: '95%', maxWidth: '960px', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title" style={{ fontSize: '20px' }}>Review Ticket #{selectedTicket.id.slice(0, 8).toUpperCase()}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Submitted by {selectedTicket.user_name} on {new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                  <XIcon />
                </button>
              </div>

              {/* Tagging Section inside Modal */}
              <div className="ticket-tagger-section card" style={{ padding: 16, marginBottom: 20, border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: 13, color: 'var(--color-text-muted)' }}>TICKET TAGS:</span>
                    {selectedTicket.tags && selectedTicket.tags.map(tag => (
                      <span key={tag.id} className="tag-badge-removable" style={{ backgroundColor: tag.color }}>
                        {tag.name}
                        <button type="button" onClick={() => handleToggleTicketTag(tag)} className="tag-remove-x">×</button>
                      </span>
                    ))}
                    <button type="button" onClick={() => setShowTagManager(!showTagManager)} className="btn btn-sm btn-secondary" style={{ borderRadius: '16px', padding: '2px 10px', fontSize: '11px' }}>
                      {showTagManager ? 'Close Tags' : '+ Assign / Create Tag'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge-type ${selectedTicket.ticket_type}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
                      {selectedTicket.ticket_type.replace(/_/g, ' ')}
                    </span>
                    <span className={`badge-status ${selectedTicket.status}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
                      {selectedTicket.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {showTagManager && (
                  <div className="tag-manager-drawer" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-surface-dim)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--color-plum)' }}>Select Tags to Toggle:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {allTags.map(tag => {
                        const isAssigned = selectedTicket.tags.some(t => t.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTicketTag(tag)}
                            className={`tag-toggle-pill ${isAssigned ? 'assigned' : ''}`}
                            style={{ '--tag-color': tag.color }}
                          >
                            <span className="dot" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                            {!tag.is_seeded && (
                              <span onClick={(e) => handleDeleteTag(tag.id, e)} className="delete-tag-btn">×</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <form onSubmit={handleCreateTag} className="create-tag-inline-form">
                      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--color-plum)' }}>Create New Custom Tag:</h4>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter tag name..."
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          style={{ width: '200px', height: '32px', fontSize: '13px', padding: '4px 10px' }}
                          required
                        />
                        <div style={{ display: 'flex', gap: 4 }}>
                          {PRESETS.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewTagColor(color)}
                              className={`tag-color-preset ${newTagColor === color ? 'selected' : ''}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <button type="submit" className="btn btn-sm btn-primary" style={{ padding: '6px 12px' }}>
                          Create Tag
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Support Description Box */}
              <div className="ticket-info-grid" style={{ display: 'grid', gridTemplateColumns: isCompensation && selectedTicket.compensation_offer ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="ticket-desc-box" style={{ background: 'var(--color-lavender-dim)', border: '1px solid rgba(82, 57, 111, 0.08)' }}>
                  <div className="ticket-box-title" style={{ color: 'var(--color-plum)' }}>Justification / Reason for Request</div>
                  <p className="ticket-desc-text" style={{ fontSize: '14px', lineHeight: '1.5' }}>{selectedTicket.description}</p>
                </div>
                {isCompensation && selectedTicket.compensation_offer && (
                  <div className="ticket-compensation-box" style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                    <div className="ticket-box-title" style={{ color: 'var(--color-success)' }}>Traveler Compensation Offer</div>
                    <p className="ticket-desc-text" style={{ fontSize: '14px', lineHeight: '1.5' }}>{selectedTicket.compensation_offer}</p>
                  </div>
                )}
              </div>

              {/* Dynamic Changes Diff (High contrast comparison) */}
              {showApprove && parsedChanges && (generalDiffs.length > 0 || itineraryDiffs.length > 0) ? (
                <div className="changes-diff-section card" style={{ border: '1.5px solid var(--color-warning)', background: '#FFFDF9', marginBottom: '24px', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚠️ Highlighted Proposed Changes Diff (Previous vs Proposed)
                  </h3>

                  {/* General Fields Diff */}
                  {generalDiffs.length > 0 && (
                    <div style={{ marginBottom: itineraryDiffs.length > 0 ? 20 : 0 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>General Fields</h4>
                      <table className="changes-table diff-table">
                        <thead>
                          <tr>
                            <th>Field</th>
                            <th>Previous / Live Value</th>
                            <th>Proposed New Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generalDiffs.map(diff => (
                            <tr key={diff.key} className="row-changed">
                              <td className="field-column" style={{ textTransform: 'capitalize' }}>{diff.key}</td>
                              <td>
                                <span className="change-removed" style={{ textDecoration: 'none' }}>
                                  <CharacterDiff oldText={diff.oldVal} newText="" />
                                </span>
                              </td>
                              <td>
                                <span className="change-added">
                                  <CharacterDiff oldText={diff.oldVal} newText={diff.newVal} />
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Itinerary Daily Diff */}
                  {itineraryDiffs.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Itinerary Timeline Changes</h4>
                      <div className="itinerary-diffs-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {itineraryDiffs.map(diff => (
                          <div key={diff.dayNum} className="itin-diff-card" style={{ border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: '8px', padding: '12px', backgroundColor: '#FFFFFF' }}>
                            <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--color-warning)', marginBottom: '8px' }}>
                              Day {diff.dayNum} {diff.type === 'added' ? '(Added)' : diff.type === 'removed' ? '(Removed)' : '(Modified)'}
                            </div>
                            {diff.type === 'modified' && (
                              <table className="changes-table" style={{ fontSize: '12px' }}>
                                <thead>
                                  <tr>
                                    <th style={{ width: '20%' }}>Day Property</th>
                                    <th>Previous / Live Value</th>
                                    <th>Proposed New Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {diff.changes.map((c, cIdx) => (
                                    <tr key={cIdx} className="row-changed">
                                      <td style={{ fontWeight: 'bold' }}>{c.field}</td>
                                      <td>
                                        <span className="change-removed" style={{ textDecoration: 'none' }}>
                                          <CharacterDiff oldText={c.oldVal} newText="" />
                                        </span>
                                      </td>
                                      <td>
                                        <span className="change-added">
                                          <CharacterDiff oldText={c.oldVal} newText={c.newVal} />
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                            {diff.type === 'added' && (
                              <div style={{ fontSize: '13px', paddingLeft: '8px', borderLeft: '2.5px solid var(--color-success)' }}>
                                <div style={{ fontWeight: '600' }}>{diff.dayData.title}</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: 2 }}>{diff.dayData.desc || diff.dayData.description}</div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: 4 }}>
                                  Location: {diff.dayData.location || '—'} | Accommodation: {diff.dayData.accommodation || '—'} | Transport: {Array.isArray(diff.dayData.transport) ? diff.dayData.transport.join(', ') : diff.dayData.transport}
                                </div>
                              </div>
                            )}
                            {diff.type === 'removed' && (
                              <div style={{ fontSize: '13px', paddingLeft: '8px', borderLeft: '2.5px solid var(--color-danger)', textDecoration: 'line-through', opacity: 0.7 }}>
                                <div style={{ fontWeight: '600' }}>{diff.dayData.title}</div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: 4 }}>
                                  Location: {diff.dayData.location || '—'} | Accommodation: {diff.dayData.accommodation || '—'} | Transport: {Array.isArray(diff.dayData.transport) ? diff.dayData.transport.join(', ') : diff.dayData.transport}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : showApprove ? (
                <div className="changes-diff-section card" style={{ border: '1px solid var(--color-success)', background: '#F6FDF9', marginBottom: '24px', padding: '16px', textAlign: 'center', color: 'var(--color-success)', fontWeight: '600' }}>
                  No difference found. This edit request contains the same values as the currently live version.
                </div>
              ) : null}

              {/* Complete Traveler Package View Mockup */}
              {selectedTicket.package_id && (
                <div className="traveler-package-view-section card" style={{ padding: '24px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1.5px solid var(--color-plum)', paddingBottom: '6px', color: 'var(--color-plum)' }}>
                    👁️ Traveler Package View Mockup (Proposed Draft Version)
                  </h3>

                  {mergedPackage.cover_image && (
                    <img
                      src={mergedPackage.cover_image.startsWith('http') ? mergedPackage.cover_image : `http://localhost:8000${mergedPackage.cover_image}`}
                      alt={mergedPackage.title}
                      style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text)' }}>{mergedPackage.title}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      <span className="badge badge-agency" style={{ fontSize: '10.5px' }}>Agency: {selectedTicket.user_name}</span>
                      <span className="badge badge-active" style={{ fontSize: '10.5px' }}>Proposed Traveler View</span>
                    </div>
                  </div>

                  <div className="details-stats" style={{ marginBottom: 20 }}>
                    <div className="details-stat-card">
                      <div className="details-stat-val">PKR {mergedPackage.price ? parseFloat(mergedPackage.price).toLocaleString() : '—'}</div>
                      <div className="details-stat-lbl">Price</div>
                    </div>
                    <div className="details-stat-card">
                      <div className="details-stat-val">{mergedPackage.duration_days}</div>
                      <div className="details-stat-lbl">Days</div>
                    </div>
                    <div className="details-stat-card">
                      <div className="details-stat-val" style={{ fontSize: '13px', paddingTop: '6px' }}>
                        {mergedPackage.departure_date || 'Flexible'}
                      </div>
                      <div className="details-stat-lbl">Departure</div>
                    </div>
                    <div className="details-stat-card">
                      <div className="details-stat-val" style={{ fontSize: '13px', paddingTop: '6px' }}>
                        {mergedPackage.best_season || 'Year-round'}
                      </div>
                      <div className="details-stat-lbl">Best Season</div>
                    </div>
                  </div>

                  <div className="details-section" style={{ marginBottom: 20 }}>
                    <h5 className="details-section-title" style={{ fontSize: '12px', fontWeight: 'bold' }}>Overview</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-faint)', textTransform: 'uppercase' }}>Destination</span>
                        <div style={{ fontSize: '13.5px', fontWeight: '600', marginTop: 2 }}>📍 {mergedPackage.destination}</div>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-faint)', textTransform: 'uppercase' }}>Description</span>
                        <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: 2, whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                          {mergedPackage.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {includedServices.length > 0 && (
                    <div className="details-section" style={{ marginBottom: 20 }}>
                      <h5 className="details-section-title" style={{ fontSize: '12px', fontWeight: 'bold' }}>Included Services</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {includedServices.map((service, idx) => (
                          <span key={idx} style={{ background: 'var(--color-lavender-light)', color: 'var(--color-plum)', padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '500' }}>
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {itineraryDays.length > 0 && (
                    <div className="details-section" style={{ marginBottom: 0 }}>
                      <h5 className="details-section-title" style={{ fontSize: '12px', fontWeight: 'bold' }}>Itinerary Timeline</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid var(--color-surface-dim)', paddingLeft: '16px', marginLeft: '8px' }}>
                        {itineraryDays.map((day, idx) => (
                          <div key={day.id || idx} style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-23px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-plum)', border: '2px solid var(--color-surface)' }} />
                            <div style={{ fontWeight: '700', fontSize: '10.5px', color: 'var(--color-text-faint)', textTransform: 'uppercase' }}>
                              Day {idx + 1}
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text)', marginTop: '2px' }}>
                              {day.title || `Day ${idx + 1}`}
                            </div>
                            {(day.desc || day.description) && (
                              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                                {day.desc || day.description}
                              </p>
                            )}
                            {(day.accommodation || day.location || (day.transport && day.transport.length > 0)) && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-faint)' }}>
                                {day.location && <span>📍 {day.location}</span>}
                                {day.accommodation && <span>🏨 Stay: {day.accommodation}</span>}
                                {day.transport && day.transport.length > 0 && (
                                  <span>🚗 {Array.isArray(day.transport) ? day.transport.join(', ') : day.transport}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resolution Form / Actions */}
              <div className="modal-resolution-section" style={{ borderTop: '1px solid var(--color-surface-dim)', paddingTop: '20px' }}>
                {isPending ? (
                  <div className="ticket-resolution-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: '700', color: 'var(--color-plum)' }}>Resolution Notes (Optional)</label>
                      <textarea
                        className="ticket-notes-input"
                        placeholder="Provide comments, reasons, or review notes for approval/rejection..."
                        rows={3}
                        value={notes[selectedTicket.id] || ''}
                        onChange={e => handleNotesChange(selectedTicket.id, e.target.value)}
                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>
                    <div className="modal-footer" style={{ marginTop: '10px' }}>
                      {showApprove ? (
                        <>
                          <button onClick={() => handleAction(selectedTicket.id, 'approve')} className="btn btn-success">
                            Approve & Merge Changes
                          </button>
                          <button onClick={() => handleAction(selectedTicket.id, 'reject')} className="btn btn-danger">
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleAction(selectedTicket.id, 'close')} className="btn btn-primary">
                            Close Ticket
                          </button>
                          <button onClick={() => handleAction(selectedTicket.id, 'reject')} className="btn btn-danger">
                            Reject
                          </button>
                        </>
                      )}
                      <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={`ticket-resolution-notes ${selectedTicket.status}`} style={{ margin: 0 }}>
                    <div className="ticket-box-title" style={{ color: selectedTicket.status === 'approved' ? 'var(--color-success)' : selectedTicket.status === 'rejected' ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                      Ticket Status: {selectedTicket.status.toUpperCase()}
                    </div>
                    {selectedTicket.admin_notes && (
                      <div style={{ marginTop: '8px' }}>
                        <span className="details-grid-label" style={{ fontSize: '10px' }}>Resolution Notes / admin comments</span>
                        <p className="ticket-desc-text" style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {selectedTicket.admin_notes}
                        </p>
                      </div>
                    )}
                    <div className="modal-footer" style={{ borderTop: 'none', marginTop: 16, paddingTop: 0 }}>
                      <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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

function XIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-faint)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
