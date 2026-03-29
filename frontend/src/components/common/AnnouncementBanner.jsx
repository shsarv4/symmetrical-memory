import React, { useEffect, useState } from 'react';
import { fetchAnnouncements } from '../../services/announcementService';
import { useTheme } from '../../contexts/ThemeContext';

function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAnnouncements();
        if (data.success) {
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Failed to load announcements:', error);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [announcements.length]);


  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const typeStyles = {
    info: { accent: colors.sky2 || '#67e8f9', icon: 'ℹ️', name: 'INFO' },
    warning: { accent: colors.gold2 || '#fcd34d', icon: '⚠️', name: 'WARNING' },
    success: { accent: colors.mint2 || '#86efac', icon: '✅', name: 'SUCCESS' },
    update: { accent: colors.lavender2 || '#b8a0ff', icon: '🔄', name: 'UPDATE' }
  };

  const style = typeStyles[current.type] || typeStyles.info;

  // Scrolling text content
  const scrollContent = (
    <>
      <span style={{
        display: 'inline-block',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'white',
        background: 'rgba(0,0,0,0.2)',
        padding: '3px 10px',
        borderRadius: '10px',
        marginRight: '10px',
        letterSpacing: '0.5px'
      }}>
        {style.name}
      </span>
      <strong style={{
        color: 'white',
        fontSize: '1rem',
        fontWeight: 600,
        marginRight: '8px'
      }}>
        {current.title}
      </strong>
      <span style={{
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.95rem'
      }}>
        {current.message}
      </span>
    </>
  );

  return (
    <div
      className="announcement-banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        background: style.accent,
        borderBottom: `3px solid ${style.accent}`,
        padding: '0',
        overflow: 'hidden',
        boxShadow: `0 2px 8px ${style.accent}40`
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Type Icon - static */}
        <span style={{
          fontSize: '1.3rem',
          flexShrink: 0,
          zIndex: 2
        }}>
          {style.icon}
        </span>

        {/* Scrolling text container */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          height: '24px'
        }}>
          <div
            key={`scroll-${currentIndex}-${current.id}`}
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              width: 'max-content',
              animation: 'scroll-left 20s linear infinite',
            }}
          >
            <span style={{ flexShrink: 0, marginRight: '80px' }}>{scrollContent}</span>
            <span style={{ flexShrink: 0, marginRight: '80px' }}>{scrollContent}</span>
          </div>
        </div>
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default AnnouncementBanner;
