import React from 'react';
import ModuleCard from './ModuleCard';

function ModuleList({ modules = [], progress = {}, loading: externalLoading }) {
  // Only consider loading from modules array length if externalLoading not provided
  const internalLoading = modules.length === 0;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--txt3)' }}>
        <div className="spinner" style={{
          width: 50,
          height: 50,
          border: '4px solid var(--lavender)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        Loading modules...
      </div>
    );
  }

  return (
    <div className="module-list">
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          color: 'var(--txt-dark)',
          margin: 0
        }}>
          ✨ Your Learning Modules
        </h1>
      </div>

      {modules.length === 0 ? (
        <div style={{
          background: 'var(--card)',
          padding: '40px',
          borderRadius: 'var(--r)',
          textAlign: 'center',
          color: 'var(--txt3)'
        }}>
          <p>No modules available yet.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {modules
            .filter(mod => mod && mod.id)
            .map((mod, index) => (
              <ModuleCard key={mod.id} module={mod} progress={progress} cardIndex={index} />
            ))}
        </div>
      )}
    </div>
  );
}

export default ModuleList;
