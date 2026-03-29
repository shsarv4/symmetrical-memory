import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchModules } from '../../services/moduleService';
import { useTheme } from '../../contexts/ThemeContext';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModules() {
      try {
        const data = await fetchModules();
        if (data.success) {
          setModules(data.modules);
        }
      } catch (error) {
        console.error('Failed to load modules:', error);
      } finally {
        setLoading(false);
      }
    }
    loadModules();
  }, []);

  const handleModuleClick = (moduleId) => {
    navigate(`/module/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="sidebar" style={{
        width: '280px',
        background: 'var(--card)',
        borderRight: `1px solid var(--border)`,
        padding: '20px',
        minHeight: 'calc(100vh - 60px)'
      }}>
        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--txt3)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} style={{
      width: '280px',
      background: 'var(--card)',
      borderRight: `1px solid var(--border)`,
      padding: '20px',
      minHeight: 'calc(100vh - 60px)',
      overflowY: 'auto'
    }}>
      <div style={{
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--txt-dark)',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: `1px solid var(--border)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        ✨ Course Modules
        {/* Close button for mobile */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: 'var(--txt3)',
            padding: '4px',
            display: 'none' // default hidden
          }}
        >
          ✕
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {modules.map(module => (
          <div
            key={module.id}
            onClick={() => {
              handleModuleClick(module.id);
              onClose(); // Close mobile sidebar after navigation
            }}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--r2)',
              background: location.pathname === `/module/${module.id}` ? 'var(--lavender)' : 'transparent',
              color: location.pathname === `/module/${module.id}` ? 'white' : 'var(--txt)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: location.pathname === `/module/${module.id}` ? 'none' : `1px solid transparent`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== `/module/${module.id}`) {
                e.currentTarget.style.background = 'var(--lavender2)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== `/module/${module.id}`) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{module.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{module.title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{module.subtitle}</div>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
