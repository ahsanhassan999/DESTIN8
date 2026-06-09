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

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [notes, setNotes] = useState({});

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load support tickets:', err);
      showToast(err.message || 'Failed to load tickets.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
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

  const parseChanges = (proposedChangesStr) => {
    if (!proposedChangesStr) return null;
    try {
      return JSON.parse(proposedChangesStr);
    } catch (e) {
      return null;
    }
  };

  const renderChangesTable = (changes) => {
    if (!changes) return null;
    return (
      <table className="changes-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Proposed Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(changes).map(([key, val]) => {
            let displayVal = val;
            if (val === null || val === undefined) displayVal = '—';
            else if (key === 'included_services') {
              try {
                const parsed = JSON.parse(val);
                displayVal = Array.isArray(parsed) ? parsed.join(', ') : val;
              } catch (_) {}
            } else if (key === 'itinerary') {
              try {
                const parsed = JSON.parse(val);
                displayVal = Array.isArray(parsed) ? `${parsed.length} Days Activity (Itinerary Updated)` : val;
              } catch (_) {}
            } else if (key === 'price') {
              displayVal = `${parseFloat(val).toLocaleString()} PKR`;
            } else if (key === 'deposit_percentage') {
              displayVal = `${val}%`;
            } else if (key === 'refund_deadline_days') {
              displayVal = val === 0 ? 'Flexible (0 Days)' : `${val} Days`;
            } else if (typeof val === 'boolean') {
              displayVal = val ? 'Yes' : 'No';
            }

            // Map standard keys to user friendly labels
            const keyLabel = key.replace('_', ' ');

            return (
              <tr key={key}>
                <td className="field-column">{keyLabel}</td>
                <td>
                  <span className="change-added">{String(displayVal)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Status mapping to tab filters
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
      (t.package_title && t.package_title.toLowerCase().includes(s))
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
    <div className="tickets-container">
      {toast && <div className={`toast-msg ${toast.type}`}>{toast.msg}</div>}

      <div className="tickets-header">
        <h1>Support & Exception Tickets</h1>
        <p>Review and approve exception requests, compensation agreements, or general support tickets.</p>
      </div>

      <div className="tickets-filter-row">
        <div className="tickets-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ticket-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
              <span className="ticket-tab-badge">{getTabCount(tab.id)}</span>
            </button>
          ))}
        </div>

        <div className="tickets-search-wrap">
          <input
            type="text"
            className="tickets-search-input"
            placeholder="Search by ID, agency or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="tickets-search-icon">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="tickets-loading">
          <div className="spinner"></div>
          <p>Fetching tickets from platform...</p>
        </div>
      ) : searchedTickets.length === 0 ? (
        <div className="tickets-empty">
          <p>No tickets found in this tab.</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {searchedTickets.map(ticket => {
            const isCompensation = ticket.ticket_type === 'compensation_request';
            const parsedChanges = parseChanges(ticket.proposed_changes);
            const isPending = ticket.status === 'open' || ticket.status === 'pending_approval';

            return (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-card-header">
                  <div className="ticket-meta-left">
                    <div className="ticket-id-row">
                      <span className="ticket-id">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                      <span className="ticket-date">Submitted: {new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                    <div className="ticket-user-info">
                      Agency: <span>{ticket.user_name}</span> (ID: {ticket.user_id})
                    </div>
                  </div>

                  <div className="ticket-meta-right">
                    <span className={`badge-type ${ticket.ticket_type}`}>
                      {ticket.ticket_type.replace('_', ' ')}
                    </span>
                    <span className={`badge-status ${ticket.status}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="ticket-card-body">
                  <h3 className="ticket-subject">{ticket.subject}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    <div className="ticket-desc-box">
                      <div className="ticket-box-title">Explanation / Reason for Exception</div>
                      <p className="ticket-desc-text">{ticket.description}</p>
                    </div>

                    {isCompensation && ticket.compensation_offer && (
                      <div className="ticket-compensation-box">
                        <div className="ticket-box-title">Traveler Compensation Strategy</div>
                        <p className="ticket-desc-text">{ticket.compensation_offer}</p>
                      </div>
                    )}

                    {isCompensation && parsedChanges && (
                      <div className="proposed-changes-container">
                        <div className="ticket-box-title">Proposed Package Edits</div>
                        {renderChangesTable(parsedChanges)}
                      </div>
                    )}
                  </div>
                </div>

                {isPending ? (
                  <div className="ticket-resolution-actions">
                    <div className="ticket-box-title">Resolution Notes (Optional)</div>
                    <textarea
                      className="ticket-notes-input"
                      placeholder="Add comments or review notes..."
                      value={notes[ticket.id] || ''}
                      onChange={e => handleNotesChange(ticket.id, e.target.value)}
                    />
                    <div className="ticket-btn-row">
                      {isCompensation ? (
                        <>
                          <button
                            onClick={() => handleAction(ticket.id, 'approve')}
                            className="ticket-btn approve"
                          >
                            Approve & Merge Changes
                          </button>
                          <button
                            onClick={() => handleAction(ticket.id, 'reject')}
                            className="ticket-btn reject"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAction(ticket.id, 'close')}
                            className="ticket-btn close"
                          >
                            Close Ticket
                          </button>
                          <button
                            onClick={() => handleAction(ticket.id, 'reject')}
                            className="ticket-btn reject"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  ticket.admin_notes && (
                    <div className={`ticket-resolution-notes ${ticket.status}`}>
                      <div className="ticket-box-title">Admin Notes</div>
                      <p className="ticket-desc-text" style={{ fontSize: '13px', color: '#595c5d' }}>
                        {ticket.admin_notes}
                      </p>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
