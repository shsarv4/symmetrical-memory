import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function SetupScreen() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !pass1 || !pass2) {
      setError('Please fill all fields');
      return;
    }

    if (pass1 !== pass2) {
      setError('Passwords do not match');
      return;
    }

    if (pass1.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(email, pass1);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div id="setupScreen" className="setup-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9998
    }}>
      <div className="setup-wrap" style={{
        background: 'var(--card)',
        padding: '32px',
        borderRadius: 'var(--r)',
        boxShadow: '0 8px 32px var(--card-shadow)',
        border: `1px solid var(--border)`,
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Illustration */}
        <div className="setup-illustration" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <svg viewBox="0 0 200 200" width="150" height="150">
            <defs>
              <linearGradient id="setupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f9a8d4' }} />
                <stop offset="50%" style={{ stopColor: '#b8a0ff' }} />
                <stop offset="100%" style={{ stopColor: '#86efac' }} />
              </linearGradient>
            </defs>
            <g className="floating-illustration">
              <circle cx="100" cy="60" r="20" fill="url(#setupGrad)" opacity="0.8" />
              <path d="M80 90 Q100 85 120 90" stroke="url(#setupGrad)" strokeWidth="8" fill="none" strokeLinecap="round" />
              <rect x="60" y="120" width="20" height="40" rx="3" fill="url(#setupGrad)" opacity="0.7" />
              <rect x="120" y="120" width="20" height="40" rx="3" fill="url(#setupGrad)" opacity="0.7" />
              <rect x="85" y="110" width="30" height="25" rx="2" fill="url(#setupGrad)" opacity="0.9" />
              <path d="M85 110 L115 110" stroke="white" strokeWidth="2" />
              <path d="M85 117 L115 117" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <g className="sparkles-group">
                <path d="M40 40 L45 50 L40 60 L35 50 Z" fill="#f9a8d4">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M160 30 L165 40 L160 50 L155 40 Z" fill="#b8a0ff">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                </path>
                <path d="M170 120 L175 130 L170 140 L165 130 Z" fill="#86efac">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" begin="1s" />
                </path>
              </g>
            </g>
          </svg>
        </div>

        <div className="setup-title" style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--pink2), var(--lavender2))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          marginBottom: '4px'
        }}>
          Welcome, Swati! ✨
        </div>
        <div className="setup-sub" style={{
          fontSize: '0.95rem',
          color: 'var(--txt3)',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          // Since its your first time please give 1 min our your to set up me IN 3 SIMPLE STEPS
        </div>

        {/* Instructions */}
        <div className="instructions-steps" style={{ marginBottom: '24px' }}>
          <div className="step-item" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <span className="step-number" style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--lavender)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>1</span>
            <div className="step-content">
              <strong style={{ display: 'block', marginBottom: '4px' }}>Create Your Account</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--txt3)', margin: 0 }}>Enter your email and choose a password. Your account is stored securely in Firebase.</p>
            </div>
          </div>
          <div className="step-item" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <span className="step-number" style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--lavender)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>2</span>
            <div className="step-content">
              <strong style={{ display: 'block', marginBottom: '4px' }}>Automatic Cloud Sync</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--txt3)', margin: 0 }}>Your progress is automatically saved to Firebase. Access from any device by logging in.</p>
            </div>
          </div>
          <div className="step-item" style={{ display: 'flex', gap: '12px' }}>
            <span className="step-number" style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--lavender)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>3</span>
            <div className="step-content">
              <strong style={{ display: 'block', marginBottom: '4px' }}>Start Learning!</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--txt3)', margin: 0 }}>Access 13 complete modules with videos, exercises, and notes. Track your progress in real-time.</p>
            </div>
          </div>
        </div>

        <div className="setup-section fade-in delay-2" style={{ marginTop: '24px' }}>
          <div className="setup-section-title" style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            marginBottom: '12px',
            color: 'var(--txt-dark)'
          }}>
            Create Your Account
          </div>

          {error && (
            <div className="setup-msg err" style={{ color: '#e53e3e', marginBottom: '12px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <label className="sf-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt2)' }}>EMAIL ADDRESS</label>
          <input
            className="sf-input"
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />

          <label className="sf-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt2)' }}>PASSWORD (min 6 characters)</label>
          <input
            className="sf-input"
            type="password"
            placeholder="choose something memorable"
            value={pass1}
            onChange={(e) => setPass1(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />

          <label className="sf-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt2)' }}>CONFIRM PASSWORD</label>
          <input
            className="sf-input"
            type="password"
            placeholder="type it again"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />

          <div className="sf-hint" style={{
            fontSize: '0.85rem',
            color: 'var(--txt3)',
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>
            Your account is stored securely in Firebase. Progress is automatically saved to the cloud.
            <br />
            <em>This is the only login method - no local-only mode.</em>
          </div>
        </div>

        <button
          className="setup-btn shimmer"
          onClick={handleSetup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, var(--lavender), var(--lavender2))',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r2)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginTop: '16px'
          }}
        >
          <span className="btn-text">{loading ? 'Creating...' : 'Start My Learning Journey →'}</span>
        </button>
      </div>
    </div>
  );
}

export default SetupScreen;
