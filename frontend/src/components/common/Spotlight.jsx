import React, { useEffect, useState } from 'react';

function Spotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="spotlight"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: `radial-gradient(circle, var(--lavender)22 0%, transparent 70%)`,
        width: '400px',
        height: '400px',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        position: 'fixed',
        zIndex: 9998,
        opacity: 0.6,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
}

export default Spotlight;
