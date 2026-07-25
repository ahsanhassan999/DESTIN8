import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use host IP address for local API calls to support emulators and physical devices (Expo Go)
let primaryUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.109:8000';
if (primaryUrl.includes('0.0.0.0')) {
  primaryUrl = primaryUrl.replace('0.0.0.0', Platform.OS === 'android' ? '10.0.2.2' : '192.168.0.109');
}

export let API_URL = primaryUrl;

// Candidate URLs to attempt in order if the primary fails
const CANDIDATE_URLS = Array.from(new Set([
  primaryUrl,
  'http://10.0.2.2:8000',
  'http://192.168.0.109:8000',
  'http://127.0.0.1:8000',
  'http://localhost:8000'
]));

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

  // Try current API_URL first, then fallback to other candidates if network fails/times out
  const urlsToTry = Array.from(new Set([API_URL, ...CANDIDATE_URLS]));
  let lastError = null;

  for (const baseUrl of urlsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // If connection succeeded, lock API_URL to this working baseUrl
      API_URL = baseUrl;

      if (!response.ok) {
        let errorMessage = 'An error occurred.';
        try {
          const errData = await response.json();
          errorMessage = errData.detail || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }

      // Handle JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      // If it's a HTTP response error (like 401 Unauthorized or 400 Bad Request), don't try other URLs, throw immediately
      if (err.message && err.message !== 'Network request failed' && err.name !== 'AbortError' && !err.message.includes('fetch')) {
        throw err;
      }
      // Otherwise, it was a network failure/timeout, loop to try next candidate URL
    }
  }

  throw new Error(
    `Cannot connect to backend server. Tried ${urlsToTry.join(', ')}. Please ensure backend is running.`
  );
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

  updateMe: async (name, phone) => {
    return await request('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ name, phone }),
    });
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    return await request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });
  },

  getAgencyBookings: async () => {
    return await request('/api/bookings/agency/my-bookings', {
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

  getAgencyReviews: async () => {
    return await request('/api/packages/agency/my-reviews', {
      method: 'GET',
    });
  },

  createPackage: async (pkgData) => {
    const imagesList = pkgData.imageUrls || (pkgData.image ? [pkgData.image] : []);
    return await request('/api/packages/agency/create', {
      method: 'POST',
      body: JSON.stringify({
        title: pkgData.title,
        destination: pkgData.destination,
        price: parseFloat(pkgData.price) || 0,
        duration_days: parseInt(pkgData.duration, 10) || 1,
        description: pkgData.description,
        included_services: JSON.stringify(pkgData.includedServices || []),
        cover_image: imagesList[0] || pkgData.cover_image || null,
        gallery_images: JSON.stringify(imagesList),
        departure_date: pkgData.departureDate || null,
        is_active: pkgData.is_active !== undefined ? pkgData.is_active : true,
        itinerary: JSON.stringify(pkgData.itinerary || pkgData.days || []),
        deposit_percentage: pkgData.deposit_percentage !== undefined ? parseInt(pkgData.deposit_percentage, 10) : 50,
        refund_deadline_days: pkgData.refund_deadline_days !== undefined ? parseInt(pkgData.refund_deadline_days, 10) : 7,
        best_season: pkgData.best_season || "Year-round",
        categories: pkgData.categories ? JSON.stringify(pkgData.categories) : '["mountains"]',
      }),
    });
  },

  updatePackage: async (id, pkgData) => {
    const imagesList = pkgData.imageUrls || (pkgData.image ? [pkgData.image] : undefined);
    return await request(`/api/packages/agency/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: pkgData.title,
        destination: pkgData.destination,
        price: pkgData.price ? parseFloat(pkgData.price) : undefined,
        duration_days: pkgData.duration ? parseInt(pkgData.duration, 10) : undefined,
        description: pkgData.description,
        included_services: pkgData.includedServices ? JSON.stringify(pkgData.includedServices) : undefined,
        cover_image: imagesList ? imagesList[0] : pkgData.cover_image,
        gallery_images: imagesList ? JSON.stringify(imagesList) : undefined,
        departure_date: pkgData.departureDate,
        is_active: pkgData.is_active,
        itinerary: (pkgData.itinerary || pkgData.days) ? JSON.stringify(pkgData.itinerary || pkgData.days) : undefined,
        deposit_percentage: pkgData.deposit_percentage !== undefined ? parseInt(pkgData.deposit_percentage, 10) : undefined,
        refund_deadline_days: pkgData.refund_deadline_days !== undefined ? parseInt(pkgData.refund_deadline_days, 10) : undefined,
        best_season: pkgData.best_season,
        categories: pkgData.categories ? JSON.stringify(pkgData.categories) : undefined,
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

  createBooking: async ({ packageId, numTravelers = 1, maleCount = 1, femaleCount = 0, travelDate = null, notes = null }) => {
    return await request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        package_id: packageId,
        num_travelers: numTravelers,
        male_count: maleCount,
        female_count: femaleCount,
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

  uploadImage: async (inputUri) => {
    if (!inputUri) return { url: '' };

    const imageUri = typeof inputUri === 'string' ? inputUri : (inputUri.uri || inputUri.url || String(inputUri));

    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      return { url: imageUri };
    }

    const savedUser = await AsyncStorage.getItem('destin8_user');
    let token = null;
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        token = parsed.access_token;
      } catch (_) {}
    }

    const formData = new FormData();
    const rawFilename = imageUri.split('/').pop() || `photo_${Date.now()}.jpg`;
    const filename = rawFilename.includes('.') ? rawFilename : `${rawFilename}.jpg`;
    const cleanExt = filename.split('.').pop().toLowerCase();
    
    let mimeType = 'image/jpeg';
    if (cleanExt === 'png') mimeType = 'image/png';
    else if (cleanExt === 'webp') mimeType = 'image/webp';
    else if (cleanExt === 'gif') mimeType = 'image/gif';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    });

    const urlsToTry = Array.from(new Set([API_URL, 'http://192.168.0.109:8000', 'http://10.0.2.2:8000', 'http://127.0.0.1:8000']));
    let lastErr = null;

    for (const baseUrl of urlsToTry) {
      try {
        const uploadUrl = `${baseUrl}/api/packages/upload`;
        const data = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrl);
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const json = JSON.parse(xhr.responseText);
                resolve(json);
              } catch (e) {
                reject(new Error('Invalid JSON response from server'));
              }
            } else {
              let errMsg = `Upload failed with status ${xhr.status}`;
              try {
                const json = JSON.parse(xhr.responseText);
                errMsg = json.detail || errMsg;
              } catch (_) {}
              reject(new Error(errMsg));
            }
          };
          xhr.onerror = () => reject(new Error('Network request failed'));
          xhr.ontimeout = () => reject(new Error('Upload timed out'));
          xhr.send(formData);
        });

        let url = data.url;
        if (url && typeof url === 'string' && url.startsWith('/')) {
          url = `${baseUrl}${url}`;
        }
        return { url };
      } catch (err) {
        lastErr = err;
        if (err.message && err.message !== 'Network request failed' && !err.message.includes('Network')) {
          throw err;
        }
      }
    }

    throw lastErr || new Error('Upload failed');
  },
};
