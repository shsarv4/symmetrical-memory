import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEMES } from '../../utils/constants';

function ThemeSelector({ isOpen, onClose }) {
  const { themeName, setTheme, themes, mode } = useTheme();

  if (!isOpen) return null;

  // Get current theme colors for dynamic styling
  const currentTheme = THEMES[themeName] || THEMES.aurora;
  const themeColors = currentTheme[mode] || currentTheme.light;

  return (
    <div className={`modal-ov open`} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div className="modal-box theme-modal-box" style={{
        background: 'var(--card)',
        borderRadius: 'var(--r)',
        border: `1px solid var(--border)`,
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--txt)',
            fontSize: '1.2rem'
          }}
        >
          ✕
        </button>

        <div className="modal-illustration" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <svg viewBox="0 0 100 100" width="80" height="80">
            <defs>
              <linearGradient id="themeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: mode === 'dark' ? themeColors.pink2 || themeColors.pink : themeColors.pink }} />
                <stop offset="50%" style={{ stopColor: mode === 'dark' ? themeColors.lavender2 || themeColors.lavender : themeColors.lavender }} />
                <stop offset="100%" style={{ stopColor: mode === 'dark' ? themeColors.mint2 || themeColors.mint : themeColors.mint }} />
              </linearGradient>
            </defs>
            <g className="theme-animation">
              {/* Floating sparkles */}
              <circle cx="25" cy="25" r="3" fill={themeColors.gold || '#fcd34d'} opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="75" cy="30" r="2" fill={themeColors.rose2 || themeColors.rose || '#fda4af'} opacity="0.7">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="70" r="2.5" fill={themeColors.sky2 || themeColors.sky || '#67e8f9'} opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="20" cy="75" r="2" fill={themeColors.gold2 || themeColors.gold || '#fcd34d'} opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2.2s" repeatCount="indefinite" />
              </circle>
              {/* Main decorative element */}
              <circle cx="50" cy="50" r="30" fill="url(#themeGrad)" opacity="0.25">
                <animate attributeName="r" values="28;33;28" dur="3s" repeatCount="indefinite" />
              </circle>
              <path d="M30 50 L45 35 L55 45 L65 30" stroke="url(#themeGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <animate attributeName="stroke-dasharray" values="0 100;50 50;100 0;0 100" dur="4s" repeatCount="indefinite" />
              </path>
              <circle cx="50" cy="50" r="5" fill={themeColors.gold || (mode === 'dark' ? '#fcd34d' : '#fef3c7')}>
                <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
        </div>

        <div className="modal-title" style={{
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--txt-dark)',
          marginBottom: '4px'
        }}>
          Choose Your Theme
        </div>
        <div className="modal-sub" style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--txt2)',
          marginBottom: '20px'
        }}>
          PICK A STYLE THAT FEELS LIKE YOU
        </div>

        <div className="theme-options" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {themes.map(themeKey => {
            const isActive = themeKey === themeName;
            const theme = THEMES[themeKey];
            const colors = theme[mode] || theme.light;
            return (
              <div
                key={themeKey}
                className={`theme-option ${isActive ? 'active' : ''}`}
                data-theme={themeKey}
                onClick={() => setTheme(themeKey)}
                style={{
                  padding: '12px',
                  background: 'var(--bg2)',
                  border: `2px solid ${isActive ? colors.pink2 || colors.lavender : 'var(--border)'}`,
                  borderRadius: 'var(--r2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 12px ${colors.pink2 || colors.lavender}40` : 'none',
                  opacity: isActive ? 1 : 0.85
                }}
              >
                <div
                  className={`theme-preview ${themeKey}-preview`}
                  style={{
                    width: '100%',
                    height: '55px',
                    borderRadius: 'var(--r2)',
                    marginBottom: '10px',
                    background: `linear-gradient(135deg, ${colors.pink} 0%, ${colors.lavender} 50%, ${colors.mint} 100%)`,
                    border: `1px solid ${colors.border2 || colors.border}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Show color dots */}
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '6px',
                    display: 'flex',
                    gap: '4px'
                  }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.lavender, border: '1px solid white' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.pink, border: '1px solid white' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.mint, border: '1px solid white' }}></div>
                  </div>
                </div>
                <div
                  className="theme-name"
                  style={{
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? colors.pink2 || colors.pink : 'var(--txt)',
                    textTransform: 'capitalize',
                    transition: 'color 0.2s'
                  }}
                >
                  {theme[mode]?.name || theme.light.name}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="modal-btn"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: 'var(--lavender)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r2)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.target.style.background = 'var(--lavender2)'}
          onMouseOut={e => e.target.style.background = 'var(--lavender)'}
        >
          <span>Done</span>
        </button>
      </div>
    </div>
  );
}

export default ThemeSelector;

