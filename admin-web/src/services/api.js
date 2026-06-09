export const API_URL = 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const savedAdmin = localStorage.getItem('destin8_admin');
  let token = null;
  if (savedAdmin) {
    try {
      const parsed = JSON.parse(savedAdmin);
      token = parsed.access_token;
    } catch (_) {}
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = 'An error occurred.';
    try {
      const errData = await response.json();
      errorMessage = errData.detail || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

export const api = {
  login: async (email, password) => {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getStats: async () => {
    return await request('/api/admin/stats', {
      method: 'GET',
    });
  },

  getAgencies: async (status = '') => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await request(`/api/admin/agencies${query}`, {
      method: 'GET',
    });
  },

  updateAgencyStatus: async (agencyId, status, reason = null) => {
    return await request(`/api/admin/agencies/${agencyId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  getUsers: async (role = '') => {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return await request(`/api/admin/users${query}`, {
      method: 'GET',
    });
  },

  suspendUser: async (userId, reason) => {
    return await request(`/api/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  activateUser: async (userId) => {
    return await request(`/api/admin/users/${userId}/activate`, {
      method: 'PATCH',
    });
  },

  deleteUser: async (userId) => {
    return await request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  createAdminUser: async (data) => {
    return await request('/api/admin/users/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPackages: async () => {
    return await request('/api/admin/packages', {
      method: 'GET',
    });
  },

  takedownPackage: async (packageId, reason) => {
    return await request(`/api/admin/packages/${packageId}/takedown`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  restorePackage: async (packageId) => {
    return await request(`/api/admin/packages/${packageId}/restore`, {
      method: 'PATCH',
    });
  },

  // ─── Payments ──────────────────────────────────────────────────────────────
  getPaymentStats: async () => {
    return await request('/api/admin/payments/stats', { method: 'GET' });
  },

  getAllTransactions: async () => {
    return await request('/api/admin/payments/transactions', { method: 'GET' });
  },

  getAgencyPayouts: async () => {
    return await request('/api/admin/payments/agency-payouts', { method: 'GET' });
  },

  getBankVerifications: async () => {
    return await request('/api/admin/payments/bank-verifications', { method: 'GET' });
  },

  verifyBankAccount: async (agencyId, action, reason = null) => {
    return await request(`/api/admin/payments/bank-verifications/${agencyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, reason }),
    });
  },

  markPayoutPaid: async (txnId) => {
    return await request(`/api/admin/payments/transactions/${txnId}/mark-paid`, {
      method: 'PATCH',
    });
  },

  // ─── Chat Supervision ──────────────────────────────────────────────────────
  getAdminConversations: async () => {
    return await request('/api/admin/chat/conversations', { method: 'GET' });
  },

  getAdminMessages: async (convId) => {
    return await request(`/api/admin/chat/conversations/${convId}/messages`, { method: 'GET' });
  },

  sendSystemWarning: async (convId, text) => {
    return await request(`/api/admin/chat/conversations/${convId}/system-warning`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  toggleAdminFlag: async (convId, isFlagged, reason = null) => {
    return await request(`/api/admin/chat/conversations/${convId}/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ is_flagged: isFlagged, reason }),
    });
  },

  getAdminTags: async () => {
    return await request('/api/admin/chat/tags', { method: 'GET' });
  },

  createAdminTag: async (name, color) => {
    return await request('/api/admin/chat/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },

  deleteAdminTag: async (tagId) => {
    return await request(`/api/admin/chat/tags/${tagId}`, { method: 'DELETE' });
  },

  updateConvTags: async (convId, tagIds) => {
    return await request(`/api/admin/chat/conversations/${convId}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tag_ids: tagIds }),
    });
  },

  // ─── Support Tickets ───────────────────────────────────────────────────────
  getAdminTickets: async (status = '') => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await request(`/api/admin/tickets${query}`, { method: 'GET' });
  },

  actionAdminTicket: async (ticketId, action, notes = '') => {
    return await request(`/api/admin/tickets/${ticketId}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ action, notes }),
    });
  },
};

