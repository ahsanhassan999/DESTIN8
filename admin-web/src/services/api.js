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
};
