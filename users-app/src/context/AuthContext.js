import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

// Mock users — swap with real API calls later
const MOCK_USERS = {
  'traveler@test.com': { id: 't1', name: 'Ahmed Hassan', email: 'traveler@test.com', role: 'traveler', status: 'active', initials: 'AH' },
  'agency@test.com':   { id: 'a1', name: 'Odyssey Travels', email: 'agency@test.com', role: 'agency',   status: 'approved', initials: 'OT' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS[email.toLowerCase()];
    setLoading(false);
    if (found && password.length >= 6) {
      if (found.status === 'suspended') {
        return { success: false, suspended: true };
      }
      if (found.status === 'pending') {
        return { success: false, pending: true };
      }
      await AsyncStorage.setItem('destin8_user', JSON.stringify(found));
      setUser(found);
      return { success: true, role: found.role };
    }
    return { success: false, error: 'Invalid email or password.' };
  };

  const logout = async () => {
    await AsyncStorage.removeItem('destin8_user');
    setUser(null);
  };

  const restoreSession = async () => {
    try {
      const saved = await AsyncStorage.getItem('destin8_user');
      if (saved) setUser(JSON.parse(saved));
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
