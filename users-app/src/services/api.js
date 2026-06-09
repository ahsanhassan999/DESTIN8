import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use host IP address for local API calls to support emulators and physical devices (Expo Go)
export const API_URL = 'http://192.168.0.103:8000';

async function request(endpoint, options = {}) {
  const savedUser = await AsyncStorage.getItem('destin8_user');
  let token = null;
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
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

  // Handle empty responses (like status 204 or delete responses)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

export const api = {
  // Auth
  login: async (email, password) => {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  registerTraveler: async (name, email, password, confirmPassword) => {
    return await request('/api/auth/register/traveler', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirm_password: confirmPassword }),
    });
  },

  registerAgency: async (agencyName, ownerName, email, password, confirmPassword, phone, businessAddress, licenseNumber) => {
    return await request('/api/auth/register/agency', {
      method: 'POST',
      body: JSON.stringify({
        agency_name: agencyName,
        owner_name: ownerName,
        email,
        password,
        confirm_password: confirmPassword,
        phone,
        business_address: businessAddress,
        license_number: licenseNumber,
      }),
    });
  },

  getMe: async () => {
    return await request('/api/auth/me', {
      method: 'GET',
    });
  },

  // Packages (Browse & Detail)
  getPackages: async (destination = '') => {
    const query = destination ? `?destination=${encodeURIComponent(destination)}` : '';
    return await request(`/api/packages${query}`, {
      method: 'GET',
    });
  },

  getPackage: async (id) => {
    return await request(`/api/packages/${id}`, {
      method: 'GET',
    });
  },

  // Agency package management
  getMyPackages: async () => {
    return await request('/api/packages/agency/my-packages', {
      method: 'GET',
    });
  },

  createPackage: async (pkgData) => {
    return await request('/api/packages/agency/create', {
      method: 'POST',
      body: JSON.stringify({
        title: pkgData.title,
        destination: pkgData.destination,
        price: parseFloat(pkgData.price) || 0,
        duration_days: parseInt(pkgData.duration, 10) || 1,
        description: pkgData.description,
        included_services: JSON.stringify(pkgData.includedServices || []),
        cover_image: pkgData.imageUrls?.[0] || pkgData.image || null,
        departure_date: pkgData.departureDate || null,
        is_active: pkgData.is_active !== undefined ? pkgData.is_active : true,
        itinerary: JSON.stringify(pkgData.itinerary || pkgData.days || []),
        deposit_percentage: pkgData.deposit_percentage !== undefined ? parseInt(pkgData.deposit_percentage, 10) : 50,
        refund_deadline_days: pkgData.refund_deadline_days !== undefined ? parseInt(pkgData.refund_deadline_days, 10) : 7,
      }),
    });
  },

  updatePackage: async (id, pkgData) => {
    return await request(`/api/packages/agency/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: pkgData.title,
        destination: pkgData.destination,
        price: pkgData.price ? parseFloat(pkgData.price) : undefined,
        duration_days: pkgData.duration ? parseInt(pkgData.duration, 10) : undefined,
        description: pkgData.description,
        included_services: pkgData.includedServices ? JSON.stringify(pkgData.includedServices) : undefined,
        cover_image: pkgData.imageUrls?.[0] || pkgData.image || undefined,
        departure_date: pkgData.departureDate,
        is_active: pkgData.is_active,
        itinerary: (pkgData.itinerary || pkgData.days) ? JSON.stringify(pkgData.itinerary || pkgData.days) : undefined,
        deposit_percentage: pkgData.deposit_percentage !== undefined ? parseInt(pkgData.deposit_percentage, 10) : undefined,
        refund_deadline_days: pkgData.refund_deadline_days !== undefined ? parseInt(pkgData.refund_deadline_days, 10) : undefined,
      }),
    });
  },

  deletePackage: async (id) => {
    return await request(`/api/packages/agency/${id}`, {
      method: 'DELETE',
    });
  },

  // Wishlist
  getWishlist: async () => {
    return await request('/api/packages/wishlist/my', {
      method: 'GET',
    });
  },

  addToWishlist: async (packageId) => {
    return await request(`/api/packages/wishlist/${packageId}`, {
      method: 'POST',
    });
  },

  removeFromWishlist: async (packageId) => {
    return await request(`/api/packages/wishlist/${packageId}`, {
      method: 'DELETE',
    });
  },

  // Reviews
  getReviews: async (packageId) => {
    return await request(`/api/packages/${packageId}/reviews`, {
      method: 'GET',
    });
  },

  submitReview: async (packageId, rating, comment) => {
    return await request(`/api/packages/${packageId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  // Bookings
  getMyBookings: async () => {
    return await request('/api/bookings/mine', { method: 'GET' });
  },

  createBooking: async ({ packageId, numTravelers = 1, travelDate = null, notes = null }) => {
    return await request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        package_id: packageId,
        num_travelers: numTravelers,
        travel_date: travelDate,
        notes,
      }),
    });
  },

  cancelBooking: async (bookingId, cancelReason) => {
    const query = cancelReason ? `?cancel_reason=${encodeURIComponent(cancelReason)}` : '';
    return await request(`/api/bookings/${bookingId}${query}`, { method: 'DELETE' });
  },

  payBooking: async (bookingId, paymentData) => {
    return await request(`/api/bookings/${bookingId}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getSavedCards: async () => {
    return await request('/api/bookings/saved-cards', { method: 'GET' });
  },

  deleteSavedCard: async (cardId) => {
    return await request(`/api/bookings/saved-cards/${cardId}`, { method: 'DELETE' });
  },

  getBankDetails: async () => {
    return await request('/api/bookings/agency/bank-details', { method: 'GET' });
  },

  updateBankDetails: async (bankData) => {
    return await request('/api/bookings/agency/bank-details', {
      method: 'PATCH',
      body: JSON.stringify(bankData),
    });
  },

  getAgencyWallet: async () => {
    return await request('/api/bookings/agency/wallet', { method: 'GET' });
  },

  getTravelerPayments: async () => {
    return await request('/api/bookings/traveler/payments', { method: 'GET' });
  },

  // Chat
  getConversations: async () => {
    return await request('/api/chat/conversations', { method: 'GET' });
  },

  getMessages: async (conversationId) => {
    return await request(`/api/chat/conversations/${conversationId}/messages`, { method: 'GET' });
  },

  sendMessage: async (conversationId, text) => {
    return await request(`/api/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  createConversation: async (packageId) => {
    return await request('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ package_id: packageId }),
    });
  },

  submitSupportTicket: async (ticketData) => {
    return await request('/api/packages/tickets', {
      method: 'POST',
      body: JSON.stringify({
        package_id: ticketData.package_id || null,
        ticket_type: ticketData.ticket_type,
        subject: ticketData.subject,
        description: ticketData.description,
        proposed_changes: ticketData.proposed_changes || null,
        compensation_offer: ticketData.compensation_offer || null,
      }),
    });
  },

  getSupportTickets: async () => {
    return await request('/api/packages/tickets', { method: 'GET' });
  },
};
