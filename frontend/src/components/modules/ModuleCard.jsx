import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

function ModuleCard({ module, progress = {}, cardIndex = 0 }) {
  const navigate = useNavigate();
  const { colors } = useTheme();

  // Calculate module-specific progress
  const moduleProgress = useMemo(() => {
    let total = 0;
    let completed = 0;

    // Topics
    if (module?.topics && Array.isArray(module.topics)) {
      total += module.topics.length;
      module.topics.forEach(topic => {
        if (topic?.id && progress[`t_${topic.id}`]) completed++;
        // Subtopics
        if (topic?.subtopics && Array.isArray(topic.subtopics)) {
          total += topic.subtopics.length;
          topic.subtopics.forEach((_, idx) => {
            if (progress[`s_${topic.id}_${idx}`]) completed++;
          });
        }
      });
    }

    // Module-level exercises
    if (module?.exercises && Array.isArray(module.exercises)) {
      total += module.exercises.length;
      module.exercises.forEach((_, idx) => {
        if (progress[`e_${module.id}_${idx}`]) completed++;
      });
    }

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, pct };
  }, [module, progress]);

  // Cycle through different pastel card background colors
  const cardColors = [
    colors.cardPrimary || colors.card2 || '#fef5ff',  // Lavender-tinted
    colors.cardSecondary || colors.card2 || '#fff0f5', // Pink-tinted
    colors.cardTertiary || colors.card2 || '#f0f9ff',  // Blue-tinted
    colors.cardQuaternary || colors.card2 || '#f0fdf4', // Green-tinted
    colors.cardQuinary || colors.card2 || '#fff9e6',   // Gold-tinted
    colors.cardSenary || colors.card2 || '#ffe8f0'     // Rose-tinted
  ];
  const cardBg = cardColors[cardIndex % cardColors.length];

  return (
    <div
      className="module-card"
      onClick={() => navigate(`/module/${module.id}`)}
      style={{
        background: cardBg,
        borderRadius: 'var(--r)',
        padding: '20px',
        border: `1px solid ${colors.border2 || 'var(--border2)'}`,
        boxShadow: `0 4px 12px ${colors.cardShadow || 'rgba(0,0,0,0.08)'}`,
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '180px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 12px 24px ${colors.cardShadow || 'var(--card-shadow)'}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${colors.cardShadow || 'var(--card-shadow)'}`;
      }}
    >
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '12px',
        display: 'inline-block',
        transition: 'transform 0.3s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.animation = 'wave 1s ease-in-out infinite'}
      onMouseLeave={(e) => e.currentTarget.style.animation = 'none'}
      >
        {module.icon}
      </div>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '1.2rem',
        fontWeight: 600,
        color: 'var(--txt-dark)'
      }}>
        {module.title}
      </h3>
      <p style={{
        margin: '0 0 8px 0',
        fontSize: '0.9rem',
        color: 'var(--txt3)',
        lineHeight: '1.4'
      }}>
        {module.subtitle}
      </p>

      {/* Mini progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'var(--bg2)',
        borderRadius: '0 0 var(--r) var(--r)'
      }}>
        <div style={{
          height: '100%',
          width: `${moduleProgress.pct}%`,
          background: moduleProgress.pct === 100 ? 'var(--mint2)' : 'var(--lavender)',
          transition: 'width 0.6s ease-out',
          boxShadow: moduleProgress.pct > 0 ? '0 0 6px var(--lavender)' : 'none',
          borderRadius: '0 0 var(--r) var(--r)'
        }} />
      </div>

      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        fontSize: '0.8rem',
        color: 'var(--txt-light)'
      }}>
        {module.topics?.length || 0} topics
      </div>
    </div>
  );
}

export default ModuleCard;
