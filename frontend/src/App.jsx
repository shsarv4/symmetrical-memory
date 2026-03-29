import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LoginScreen from './components/auth/LoginScreen';
import SetupScreen from './components/auth/SetupScreen';
import HomePage from './components/HomePage';
import ModuleList from './components/modules/ModuleList';
import ModuleDetail from './components/modules/ModuleDetail';
import AdminPanel from './components/admin/AdminPanel';
import AdminModules from './components/admin/AdminModules';
import AdminAnnouncements from './components/admin/AdminAnnouncements';
import AnnouncementBanner from './components/common/AnnouncementBanner';
import ParticleBackground from './components/common/ParticleBackground';
import ProgressDashboard from './components/common/ProgressDashboard';
import { fetchUser as fetchAdminUser } from './services/adminService';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-gradient-start)'
      }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--lavender)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin Route component (requires auth + admin role)
function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  // Derived state: we're checking if user exists and we haven't determined admin status yet
  const checking = user ? isAdmin === null : false;

  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }

    async function verifyAdmin() {
      try {
        // Attempt to fetch user data via admin endpoint - only admins can do this
        const data = await fetchAdminUser(user.uid);
        // If successful and role is admin, grant access
        if (data && data.user && data.user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Admin verification error:', error);
        setIsAdmin(false);
      }
    }

    verifyAdmin();
  }, [user]);

  if (authLoading || checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/setup" element={<SetupScreen />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <ParticleBackground />
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/module/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ParticleBackground />
              <ModuleDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout>
              <ParticleBackground />
              <AdminPanel />
            </Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/modules"
        element={
          <AdminRoute>
            <Layout>
              <AdminModules />
            </Layout>
          </AdminRoute>
        }
      />

      <Route
        path="/admin/announcements"
        element={
          <AdminRoute>
            <Layout>
              <AdminAnnouncements />
            </Layout>
          </AdminRoute>
        }
      />

      {/* Fallback: redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
