import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Floating hearts animation on click
  const createHeart = (e) => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = '❤️';
    heart.style.left = `${e.clientX}px`;
    heart.style.top = `${e.clientY}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 3000);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    if (e) createHeart(e);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div id="lockScreen" className="lock-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      {/* Background shapes */}
      <div className="bg-shapes" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`shape shape-${i}`} style={{
            position: 'absolute',
            borderRadius: '50%',
            opacity: 0.4,
            animation: 'float-shape 20s infinite ease-in-out',
            width: i===1?400:i===2?300:i===3?250:i===4?200:350,
            height: i===1?400:i===2?300:i===3?250:i===4?200:350,
            background: `radial-gradient(circle, var(--${i===1?'pink2':i===2?'lavender':i===3?'mint2':i===4?'gold':'sky'}) 0%, transparent 70%)`,
            top: i===1?'-100px':i===2?'50%':i===3?'10%':i===4?'30%':undefined,
            bottom: i===5?'-150px':undefined,
            left: i===1?'-100px':i===4?'10%':i===3?'20%':undefined,
            right: i===2?'-150px':i===5?'-100px':undefined,
            animationDelay: `${i* -5}s`
          }}></div>
        ))}
      </div>

      <div className="lock-wrap" style={{ textAlign: 'center', maxWidth: '420px', width: '90%' }}>
        {/* Logo */}
        <div className="lock-logo" style={{ marginBottom: '12px' }}>
          <svg className="logo-illustration" viewBox="0 0 120 120" width="80" height="80" style={{ display: 'block', margin: '0 auto' }}>
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#f9a8d4', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#b8a0ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#86efac', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" fill="url(#logoGrad)" opacity="0.15" />
            <path d="M60 25 L70 45 L90 45 L75 58 L82 78 L60 66 L38 78 L45 58 L30 45 L50 45 Z" fill="url(#logoGrad)" opacity="0.9">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </path>
            <circle cx="60" cy="60" r="8" fill="white" />
            <circle cx="60" cy="60" r="4" fill="url(#logoGrad)">
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
          <span className="logo-text" style={{
            display: 'block',
            marginTop: '8px',
            fontSize: '1.6rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--pink2), var(--lavender2), var(--mint2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>SwatiArc</span>
        </div>

        <div className="lock-sub" style={{
          fontSize: '1rem',
          color: 'var(--txt3)',
          marginBottom: '24px',
          maxWidth: '320px',
          margin: '0 auto 24px'
        }}>
          Hii Swati, My Developer is happy to see you here. please login kr lijiye (wo kya hai na security protocol ka chakkar).
        </div>

        <div className="lock-card" style={{
          background: 'var(--card)',
          padding: '24px',
          borderRadius: 'var(--r)',
          boxShadow: '0 8px 32px var(--card-shadow)',
          border: `1px solid var(--border)`
        }}>
          {error && (
            <div className="lock-err" style={{ color: '#e53e3e', marginBottom: '12px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <input
            className="lock-field"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '12px',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              fontSize: '1rem',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              transition: 'border 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--lavender2)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />

          <input
            className="lock-field"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '16px',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--r2)',
              fontSize: '1rem',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              outline: 'none',
              transition: 'border 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--lavender2)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />

          <button className="lock-btn shimmer" onClick={handleLogin} style={{
            width: '100%',
            padding: '12px 20px',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, var(--lavender), var(--lavender2))',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r2)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span className="btn-text">Enter Your World</span>
            <svg className="btn-arrow" viewBox="0 0 24 24" width="16" height="16">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>

          <button className="lock-btn lock-btn-secondary" onClick={() => navigate('/setup')} style={{
            width: '100%',
            padding: '12px 20px',
            background: 'transparent',
            color: 'var(--txt)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--r2)',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            <span className="btn-text">Create New Account</span>
          </button>

          <div className="lock-hint" style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--txt3)' }}>
            First time here? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/setup'); }} style={{ color: 'var(--lavender2)', textDecoration: 'underline' }}>Begin your adventure ✨</a>
          </div>
        </div>

        {/* Decorative Sparkles */}
        <svg className="decor-sparkle decor-1" viewBox="0 0 40 40" width="35" height="35" style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          animation: 'sparkle 3s infinite'
        }}>
          <defs>
            <linearGradient id="sparkle1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f9a8d4' }} />
              <stop offset="100%" style={{ stopColor: '#b8a0ff' }} />
            </linearGradient>
          </defs>
          <path d="M20 5 L24 16 L35 20 L24 24 L20 35 L16 24 L5 20 L16 16 Z" fill="url(#sparkle1)" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" />
          </path>
        </svg>
        {/* More sparkles omitted for brevity, can add similarly */}
      </div>
    </div>
  );
}

export default LoginScreen;
