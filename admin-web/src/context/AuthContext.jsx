import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock admin user for frontend-only mode
const MOCK_ADMIN = {
  id: 'admin-1',
  name: 'DESTIN8 Admin',
  email: 'admin@destin8.com',
  role: 'admin',
  initials: 'DA',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('destin8_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    // Mock auth — accept known credentials
    if (email === 'admin@destin8.com' && password === 'Admin@123') {
      localStorage.setItem('destin8_admin', JSON.stringify(MOCK_ADMIN));
      setUser(MOCK_ADMIN);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
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
