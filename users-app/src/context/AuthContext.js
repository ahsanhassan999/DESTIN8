import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password, remember = true) => {
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      setLoading(false);
      
      if (data.status === 'suspended') {
        return { success: false, suspended: true };
      }
      if (data.status === 'pending') {
        return { success: false, pending: true };
      }
      
      // Compute initials
      const getInitials = (name) => {
        if (!name) return 'AH';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
      };
      
      const initials = getInitials(data.name);
      const sessionUser = { ...data, initials, rememberMe: remember };
      
      await AsyncStorage.setItem('destin8_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return { success: true, role: data.role };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const registerTraveler = async ({ name, email, password, confirmPassword }) => {
    setLoading(true);
    try {
      const data = await api.registerTraveler(name.trim(), email.trim(), password, confirmPassword);
      setLoading(false);
      
      const getInitials = (name) => {
        if (!name) return 'AH';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
      };
      
      const initials = getInitials(data.name);
      const sessionUser = { ...data, initials };
      
      await AsyncStorage.setItem('destin8_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return { success: true, role: data.role };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Failed to create traveler account.' };
    }
  };

  const registerAgency = async ({ agencyName, ownerName, email, password, confirmPassword, phone, businessAddress, licenseNumber }) => {
    setLoading(true);
    try {
      const data = await api.registerAgency(
        agencyName.trim(),
        ownerName.trim(),
        email.trim(),
        password,
        confirmPassword,
        phone.trim(),
        businessAddress.trim(),
        licenseNumber.trim()
      );
      setLoading(false);
      
      if (data.status === 'pending') {
        return { success: true, pending: true };
      }
      
      const getInitials = (name) => {
        if (!name) return 'OT';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
      };
      
      const initials = getInitials(data.name);
      const sessionUser = { ...data, initials };
      
      await AsyncStorage.setItem('destin8_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return { success: true, role: data.role };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Failed to create agency account.' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('destin8_user');
    setUser(null);
  };

  const restoreSession = async () => {
    try {
      const saved = await AsyncStorage.getItem('destin8_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // If "Keep me signed in" was not checked, log out on restart
        if (parsed.rememberMe === false) {
          await logout();
          return;
        }

        setUser(parsed);
        
        // Fetch fresh profile status to sync with admin changes
        try {
          const fresh = await api.getMe();
          const getInitials = (name) => {
            if (!name) return 'AH';
            const parts = name.trim().split(' ');
            if (parts.length >= 2) {
              return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0].slice(0, 2).toUpperCase();
          };
          const initials = getInitials(fresh.name);
          const updatedUser = { ...parsed, ...fresh, initials };
          
          if (updatedUser.status === 'suspended') {
            await logout();
          } else {
            await AsyncStorage.setItem('destin8_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } catch (_) {
          // If me fails (e.g., token expired), log out the user to be safe
          await logout();
        }
      }
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, restoreSession, registerTraveler, registerAgency }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
