import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('destin8_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      if (response && response.role === 'admin') {
        const adminUser = {
          id: response.user_id,
          name: response.name,
          email: email,
          role: response.role,
          initials: response.name ? response.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD',
          access_token: response.access_token,
        };
        localStorage.setItem('destin8_admin', JSON.stringify(adminUser));
        setUser(adminUser);
        return { success: true };
      } else {
        return { success: false, error: 'Access denied: Admin role required.' };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('destin8_admin');
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
