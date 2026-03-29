import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSelector from '../common/ThemeSelector';
import { fetchUser as fetchAdminUser } from '../../services/adminService';

function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const { toggleMode, mode } = useTheme();
  const { user, logout } = useAuth();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      alert('Logout failed: ' + result.error);
    }
  };

  // Check if current user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const data = await fetchAdminUser(user.uid);
        setIsAdmin(data && data.user && data.user.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdmin();
  }, [user]);

  return (
    <>
      <div className="topbar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: 'var(--card)',
        borderBottom: `1px solid var(--border)`,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="tb-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Hamburger menu for mobile */}
          <button
            className="hamburger-menu"
            onClick={onMenuToggle}
            title="Toggle menu"
            style={{
              display: 'none', // Hidden on desktop, shown via CSS media query
              padding: '8px',
              background: 'var(--bg2)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              lineHeight: 1
            }}
          >
            ☰
          </button>
          <div
            className="tb-logo"
            onClick={() => navigate('/')}
            title="Go to Home"
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--pink2), var(--lavender2), var(--mint2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'opacity 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <span className="logo-dot">✦</span> SwatiArc
          </div>
        </div>
        <div className="tb-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Admin link - only show if user is admin */}
          {user && !checkingAdmin && isAdmin && (
            <a
              href="/admin"
              style={{
                padding: '8px 16px',
                background: 'var(--lavender)',
                color: 'white',
                borderRadius: 'var(--r2)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'background 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--lavender2)'}
              onMouseOut={(e) => e.target.style.background = 'var(--lavender)'}
            >
              Admin
            </a>
          )}

          {/* Sun/Moon toggle for day/night */}
          <button
            className="theme-mode-toggle"
            onClick={toggleMode}
            title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            style={{
              padding: '8px',
              background: 'var(--bg2)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.3s'
            }}
          >
            {mode === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Theme selector (palette) */}
          <button
            className="theme-toggle"
            onClick={() => setShowThemeModal(true)}
            title="Choose Theme"
            style={{
              padding: '8px',
              background: 'var(--bg2)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg className="theme-icon" viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" fill="currentColor" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
          </button>

          {/* Logout button */}
          <button
            className="tb-logout"
            onClick={handleLogout}
            title="Logout"
            style={{
              padding: '8px',
              background: 'var(--bg2)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="lock-icon">🔒</span>
          </button>
        </div>
      </div>

      <ThemeSelector isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </>
  );
}

export default Header;
