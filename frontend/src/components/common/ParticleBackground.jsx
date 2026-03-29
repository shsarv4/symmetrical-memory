import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

function ParticleBackground() {
  const { colors } = useTheme();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing particles
    container.innerHTML = '';

    // Create particles
    const particleCount = 20;
    const colorsList = [colors.pink2, colors.lavender, colors.mint2, colors.gold, colors.sky2];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 12 + 6}px;
        height: ${Math.random() * 12 + 6}px;
        background: ${colorsList[Math.floor(Math.random() * colorsList.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.2};
        pointer-events: none;
        animation: float-particle ${Math.random() * 10 + 10}s linear infinite, spin ${Math.random() * 20 + 10}s linear infinite;
        animation-delay: ${-Math.random() * 20}s;
      `;
      container.appendChild(particle);
    }

    // Add keyframes if not present
    if (!document.getElementById('particle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'particle-keyframes';
      style.textContent = `
        @keyframes float-particle {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-100vh) rotate(360deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    }, [colors]);

  return (
    <div
      ref={containerRef}
      className="particles"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    />
  );
}

export default ParticleBackground;
