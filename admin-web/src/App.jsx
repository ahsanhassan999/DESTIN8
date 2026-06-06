import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AgencyApprovalsPage from './pages/AgencyApprovalsPage';
import UserDirectoryPage from './pages/UserDirectoryPage';
import PackageModerationPage from './pages/PackageModerationPage';
import ChatMonitoringPage from './pages/ChatMonitoringPage';
import PaymentsPage from './pages/PaymentsPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="agencies" element={<AgencyApprovalsPage />} />
            <Route path="users" element={<UserDirectoryPage />} />
            <Route path="packages" element={<PackageModerationPage />} />
            <Route path="chat" element={<ChatMonitoringPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
