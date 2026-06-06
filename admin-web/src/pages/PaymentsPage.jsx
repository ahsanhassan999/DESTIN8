import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import './PaymentsPage.css';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `PKR ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const StatusBadge = ({ status, type = 'txn' }) => {
  const configs = {
    txn: {
      success: { label: 'Success', cls: 'badge-success' },
      failed:  { label: 'Failed',  cls: 'badge-danger'  },
    },
    payout: {
      paid:    { label: 'Paid',    cls: 'badge-success' },
      pending: { label: 'Pending', cls: 'badge-warning' },
      failed:  { label: 'Failed',  cls: 'badge-danger'  },
    },
    bank: {
      verified:      { label: '✓ Verified',    cls: 'badge-success' },
      pending:       { label: '⏳ Pending',     cls: 'badge-warning' },
      rejected:      { label: '✕ Rejected',    cls: 'badge-danger'  },
      not_submitted: { label: '— Not Set',     cls: 'badge-neutral' },
    },
  };
  const cfg = (configs[type] || configs.txn)[status] || { label: status, cls: 'badge-neutral' };
  return <span className={`pay-badge ${cfg.cls}`}>{cfg.label}</span>;
};

// ─── SVG Icons matching Dashboard Page styles ─────────────────────────────────
function IconRevenue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}

function IconDeposits() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="2" y1="10" x2="22" y2="10"></line>
    </svg>
  );
}

function IconPayouts() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M9 8h1m5 0h1M9 12h1m5 0h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
    </svg>
  );
}

function IconPending() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function IconTransactions() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );
}

// ─── Revenue Stats Cards ───────────────────────────────────────────────────────
function RevenueCards({ stats, loading }) {
  const cards = [
    {
      icon: <IconRevenue />,
      iconColor: 'plum',
      label: 'Platform Revenue',
      value: fmt(stats.total_platform_revenue),
      sub: 'Total commissions earned',
      accent: 'var(--color-plum)',
    },
    {
      icon: <IconDeposits />,
      iconColor: 'blue',
      label: 'Deposits Collected',
      value: fmt(stats.total_deposits_collected),
      sub: 'Paid by travelers',
      accent: '#0ea5e9',
    },
    {
      icon: <IconPayouts />,
      iconColor: 'green',
      label: 'Agency Payouts Sent',
      value: fmt(stats.total_agency_payouts_sent),
      sub: 'Net paid to agencies',
      accent: 'var(--color-success)',
    },
    {
      icon: <IconPending />,
      iconColor: 'orange',
      label: 'Pending Payouts',
      value: fmt(stats.pending_payout_amount),
      sub: `${stats.pending_payout_count || 0} transactions pending`,
      accent: 'var(--color-warning)',
    },
    {
      icon: <IconTransactions />,
      iconColor: 'indigo',
      label: 'Total Transactions',
      value: (stats.total_transactions || 0).toLocaleString(),
      sub: 'Successful payments',
      accent: '#6366f1',
    },
  ];

  return (
    <div className="pay-cards-grid">
      {cards.map((c) => (
        <div key={c.label} className="pay-stat-card" style={{ '--accent': c.accent }}>
          <div className={`pay-stat-icon pay-stat-icon--${c.iconColor}`}>{c.icon}</div>
          <div className="pay-stat-body">
            <div className="pay-stat-value">{loading ? '—' : c.value}</div>
            <div className="pay-stat-label">{c.label}</div>
            <div className="pay-stat-sub">{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── All Transactions Table ────────────────────────────────────────────────────
function TransactionsTable({ transactions, loading, onMarkPaid, markingPaid }) {
  const [search, setSearch] = useState('');
  const [txnFilter, setTxnFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = !q || t.transaction_ref?.toLowerCase().includes(q)
      || t.package_title?.toLowerCase().includes(q)
      || t.agency_name?.toLowerCase().includes(q)
      || t.traveler_name?.toLowerCase().includes(q);
    const matchTxn = txnFilter === 'all' || t.status === txnFilter;
    const matchPay = payFilter === 'all' || t.payout_status === payFilter;
    return matchQ && matchTxn && matchPay;
  });

  return (
    <div className="pay-section">
      <div className="pay-section-header">
        <div>
          <h2 className="pay-section-title">All Transactions</h2>
          <p className="pay-section-sub">{filtered.length} of {transactions.length} records</p>
        </div>
        <div className="pay-filters">
          <input
            className="pay-search"
            placeholder="Search ref, package, agency, traveler…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="pay-select" value={txnFilter} onChange={(e) => setTxnFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <select className="pay-select" value={payFilter} onChange={(e) => setPayFilter(e.target.value)}>
            <option value="all">All Payouts</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="pay-table-wrap">
        <table className="pay-table">
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Package</th>
              <th>Agency</th>
              <th>Traveler</th>
              <th>Deposit Paid</th>
              <th>Platform Fee</th>
              <th>Agency Payout</th>
              <th>Txn Status</th>
              <th>Payout Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="pay-empty"><div className="pay-spinner" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="pay-empty">No transactions found</td></tr>
            ) : filtered.map((t) => (
              <tr key={t.id}>
                <td><span className="pay-ref">{t.transaction_ref}</span></td>
                <td className="pay-bold">{t.package_title}</td>
                <td>{t.agency_name}</td>
                <td>
                  <div>{t.traveler_name}</div>
                  <div className="pay-sub-text">{t.traveler_email}</div>
                </td>
                <td className="pay-amount">{fmt(t.amount_paid)}</td>
                <td className="pay-fee">{fmt(t.commission_deducted)}</td>
                <td className="pay-payout">{fmt(t.payout_amount)}</td>
                <td><StatusBadge status={t.status} type="txn" /></td>
                <td><StatusBadge status={t.payout_status} type="payout" /></td>
                <td className="pay-date">{new Date(t.created_at).toLocaleDateString()}</td>
                <td>
                  {t.status === 'success' && t.payout_status === 'pending' ? (
                    <button
                      className="pay-btn-sm pay-btn-primary"
                      onClick={() => onMarkPaid(t.id)}
                      disabled={markingPaid === t.id}
                    >
                      {markingPaid === t.id ? '…' : 'Mark Paid'}
                    </button>
                  ) : (
                    <span className="pay-sub-text">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Agency Payouts Section ────────────────────────────────────────────────────
function AgencyPayoutsSection({ payouts, loading }) {
  const [search, setSearch] = useState('');
  const filtered = payouts.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.agency_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
  });

  return (
    <div className="pay-section">
      <div className="pay-section-header">
        <div>
          <h2 className="pay-section-title">Agency Payouts</h2>
          <p className="pay-section-sub">Per-agency earnings breakdown</p>
        </div>
        <input
          className="pay-search"
          placeholder="Search agency…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="pay-table-wrap">
        <table className="pay-table">
          <thead>
            <tr>
              <th>Agency</th>
              <th>Email</th>
              <th>Bank</th>
              <th>Account #</th>
              <th>Verification</th>
              <th>Transactions</th>
              <th>Platform Fees Paid</th>
              <th>Total Earned</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="pay-empty"><div className="pay-spinner" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="pay-empty">No agencies found</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.agency_id}>
                <td>
                  <div className="pay-bold">{p.agency_name}</div>
                  <div className="pay-sub-text">{p.owner_name}</div>
                </td>
                <td>{p.email}</td>
                <td>{p.bank_name || <span className="pay-sub-text">—</span>}</td>
                <td className="pay-mono">{p.account_number ? `...${p.account_number.slice(-6)}` : '—'}</td>
                <td><StatusBadge status={p.bank_verification_status} type="bank" /></td>
                <td className="pay-center">{p.transaction_count}</td>
                <td className="pay-fee">{fmt(p.total_fees_paid)}</td>
                <td className="pay-payout pay-bold">{fmt(p.total_earned)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bank Verification Queue ───────────────────────────────────────────────────
function BankVerificationSection({ verifications, loading, onVerify, onReject, processing }) {
  const [rejectModal, setRejectModal] = useState(null); // { agency_id, agency_name }
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  const filtered = verifications.filter((v) =>
    filterStatus === 'all' || v.bank_verification_status === filterStatus
  );

  const pendingCount = verifications.filter((v) => v.bank_verification_status === 'pending').length;

  return (
    <div className="pay-section">
      <div className="pay-section-header">
        <div>
          <h2 className="pay-section-title">
            Bank Account Verification
            {pendingCount > 0 && <span className="pay-badge-count">{pendingCount}</span>}
          </h2>
          <p className="pay-section-sub">Review and approve/reject agency bank accounts before payouts are processed</p>
        </div>
        <select className="pay-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Banks</option>
          <option value="pending">Pending Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="pay-table-wrap">
        <table className="pay-table">
          <thead>
            <tr>
              <th>Agency</th>
              <th>Bank Name</th>
              <th>Account Title</th>
              <th>IBAN / Account</th>
              <th>Branch Code</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="pay-empty"><div className="pay-spinner" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="pay-empty">
                  {filterStatus === 'pending' ? '✓ No pending bank verifications' : 'No records found'}
                </td>
              </tr>
            ) : filtered.map((v) => (
              <tr key={v.agency_id}>
                <td>
                  <div className="pay-bold">{v.agency_name}</div>
                  <div className="pay-sub-text">{v.email}</div>
                </td>
                <td>{v.bank_name}</td>
                <td>{v.account_title}</td>
                <td className="pay-mono">{v.account_number}</td>
                <td className="pay-mono">{v.branch_code}</td>
                <td>
                  <div>
                    <StatusBadge status={v.bank_verification_status} type="bank" />
                    {v.bank_rejection_reason && (
                      <div className="pay-rejection-reason">↳ {v.bank_rejection_reason}</div>
                    )}
                  </div>
                </td>
                <td className="pay-date">{new Date(v.submitted_at).toLocaleDateString()}</td>
                <td>
                  {v.bank_verification_status !== 'verified' && (
                    <button
                      className="pay-btn-sm pay-btn-success"
                      onClick={() => onVerify(v.agency_id)}
                      disabled={processing === v.agency_id}
                      style={{ marginRight: 6 }}
                    >
                      {processing === v.agency_id ? '…' : '✓ Verify'}
                    </button>
                  )}
                  {v.bank_verification_status !== 'rejected' && (
                    <button
                      className="pay-btn-sm pay-btn-danger"
                      onClick={() => { setRejectModal(v); setRejectReason(''); }}
                      disabled={processing === v.agency_id}
                    >
                      ✕ Reject
                    </button>
                  )}
                  {v.bank_verification_status === 'verified' && (
                    <span className="pay-sub-text">Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="pay-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pay-modal-header">
              <h3>Reject Bank Account</h3>
              <button className="pay-modal-close" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <p className="pay-modal-desc">
              Rejecting <strong>{rejectModal.agency_name}</strong>'s bank account (<span className="pay-mono">{rejectModal.account_number}</span>).
              Please provide a clear reason so the agency can fix and resubmit.
            </p>
            <textarea
              className="pay-modal-textarea"
              placeholder="Rejection reason (required)…"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className="pay-modal-actions">
              <button className="pay-btn pay-btn-neutral" onClick={() => setRejectModal(null)}>Cancel</button>
              <button
                className="pay-btn pay-btn-danger"
                disabled={!rejectReason.trim() || processing === rejectModal.agency_id}
                onClick={() => {
                  onReject(rejectModal.agency_id, rejectReason.trim());
                  setRejectModal(null);
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [agencyPayouts, setAgencyPayouts] = useState([]);
  const [bankVerifications, setBankVerifications] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const [markingPaid, setMarkingPaid] = useState(null);
  const [processingBank, setProcessingBank] = useState(null);

  const [activeTab, setActiveTab] = useState('transactions');

  const loadAll = useCallback(async () => {
    setLoadingStats(true);
    api.getPaymentStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));

    setLoadingTxns(true);
    api.getAllTransactions().then(setTransactions).catch(console.error).finally(() => setLoadingTxns(false));

    setLoadingPayouts(true);
    api.getAgencyPayouts().then(setAgencyPayouts).catch(console.error).finally(() => setLoadingPayouts(false));

    setLoadingBanks(true);
    api.getBankVerifications().then(setBankVerifications).catch(console.error).finally(() => setLoadingBanks(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleMarkPaid = async (txnId) => {
    setMarkingPaid(txnId);
    try {
      await api.markPayoutPaid(txnId);
      setTransactions((prev) =>
        prev.map((t) => t.id === txnId ? { ...t, payout_status: 'paid' } : t)
      );
      // Update stats
      api.getPaymentStats().then(setStats).catch(console.error);
    } catch (err) {
      alert(err.message || 'Failed to mark payout as paid.');
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleVerify = async (agencyId) => {
    setProcessingBank(agencyId);
    try {
      await api.verifyBankAccount(agencyId, 'verify');
      setBankVerifications((prev) =>
        prev.map((v) => v.agency_id === agencyId ? { ...v, bank_verification_status: 'verified', bank_rejection_reason: null } : v)
      );
      setAgencyPayouts((prev) =>
        prev.map((p) => p.agency_id === agencyId ? { ...p, bank_verification_status: 'verified' } : p)
      );
    } catch (err) {
      alert(err.message || 'Failed to verify bank account.');
    } finally {
      setProcessingBank(null);
    }
  };

  const handleReject = async (agencyId, reason) => {
    setProcessingBank(agencyId);
    try {
      await api.verifyBankAccount(agencyId, 'reject', reason);
      setBankVerifications((prev) =>
        prev.map((v) => v.agency_id === agencyId ? { ...v, bank_verification_status: 'rejected', bank_rejection_reason: reason } : v)
      );
      setAgencyPayouts((prev) =>
        prev.map((p) => p.agency_id === agencyId ? { ...p, bank_verification_status: 'rejected' } : p)
      );
    } catch (err) {
      alert(err.message || 'Failed to reject bank account.');
    } finally {
      setProcessingBank(null);
    }
  };

  const pendingBankCount = bankVerifications.filter((v) => v.bank_verification_status === 'pending').length;
  const pendingPayoutCount = stats.pending_payout_count || 0;

  const TABS = [
    { id: 'transactions', label: 'Transactions', badge: pendingPayoutCount > 0 ? pendingPayoutCount : null },
    { id: 'payouts', label: 'Agency Payouts', badge: null },
    { id: 'banks', label: 'Bank Verifications', badge: pendingBankCount > 0 ? pendingBankCount : null },
  ];

  return (
    <div className="pay-page">
      {/* Page Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Payments &amp; Financials</h1>
          <p className="pay-page-sub">Platform revenue, agency payouts, and bank account verification</p>
        </div>
        <button className="pay-btn pay-btn-outline" onClick={loadAll}>↻ Refresh</button>
      </div>

      {/* Section 1: Revenue Overview */}
      <RevenueCards stats={stats} loading={loadingStats} />

      {/* Tabs */}
      <div className="pay-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`pay-tab ${activeTab === tab.id ? 'pay-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge && <span className="pay-tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Section 2: All Transactions */}
      {activeTab === 'transactions' && (
        <TransactionsTable
          transactions={transactions}
          loading={loadingTxns}
          onMarkPaid={handleMarkPaid}
          markingPaid={markingPaid}
        />
      )}

      {/* Section 3: Agency Payouts */}
      {activeTab === 'payouts' && (
        <AgencyPayoutsSection payouts={agencyPayouts} loading={loadingPayouts} />
      )}

      {/* Section 4: Bank Verifications */}
      {activeTab === 'banks' && (
        <BankVerificationSection
          verifications={bankVerifications}
          loading={loadingBanks}
          onVerify={handleVerify}
          onReject={handleReject}
          processing={processingBank}
        />
      )}
    </div>
  );
}
