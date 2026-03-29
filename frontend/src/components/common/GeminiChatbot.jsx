import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function GeminiChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch conversation history on mount and when user changes
  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/gemini/conversations', {
        
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Convert conversation history to message format
          const historyMessages = data.conversations.flatMap(conv => [
            { role: 'user', text: conv.userMessage, timestamp: conv.timestamp },
            { role: 'assistant', text: conv.aiResponse, timestamp: conv.timestamp }
          ]);
          setMessages(historyMessages);
        }
      } else {
        console.error('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: new Date() }]);
    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', text: '', timestamp: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        aiResponse += chunk;

        // Update the last message with new content
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: aiResponse };
          return newMessages;
        });
      }
    } catch (err) {
      setError(err.message);
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter((msg, idx) => idx !== prev.length - 1 || msg.role !== 'assistant' || msg.text));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversations = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/gemini/conversations/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error clearing conversations:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="gemini-assistant">
      {/* Chat Panel */}
      <div className={`gemini-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="gemini-header">
          <div className="gemini-title">
            <span style={{ marginRight: '8px' }}>🤖</span>
            <span style={{ fontWeight: 600, color: 'white' }}>Sarv AI</span>
          </div>
          <div className="gemini-header-actions">
            <button
              className="gemini-clear"
              onClick={clearConversations}
              title="Clear chat history"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                color: 'white',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Clear
            </button>
            <button
              className="gemini-close"
              onClick={() => setIsOpen(false)}
              title="Close"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="gemini-messages">
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--txt3)',
              fontSize: '0.9rem'
            }}>
              <p style={{ marginBottom: '10px' }}>👋 Hi! I'm sarv, your AI learning assistant.</p>
              <p>Ask me anything about your courses!</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`gemini-msg ${msg.role}`}>
              <div className="gemini-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="gemini-text">
                {msg.text || <span className="gemini-typing">
                  <span></span><span></span><span></span>
                </span>}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="gemini-msg assistant">
              <div className="gemini-avatar">🤖</div>
              <div className="gemini-text">
                <span className="gemini-typing">
                  <span></span><span></span><span></span>
                </span>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              background: 'rgba(255, 0, 0, 0.1)',
              borderRadius: '12px',
              color: '#ff6b6b',
              fontSize: '0.85rem',
              margin: '10px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="gemini-input-area">
          <textarea
            id="geminiInput"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows="2"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              background: 'var(--bg)',
              color: 'var(--txt)',
              fontSize: '0.95rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          <button
            className="gemini-send"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              position: 'absolute',
              right: '16px',
              bottom: '16px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isLoading || !input.trim() ? 'var(--txt3)' : 'var(--lavender)',
              border: 'none',
              color: 'white',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s'
            }}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        className="gemini-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Assistant"
        style={{
          animation: 'pulse-glow 3s ease-in-out infinite',
          boxShadow: '0 0 15px var(--lavender), 0 0 30px var(--lavender)'
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" />
          <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="gemini-label">AI Assistant</span>
      </button>
    </div>
  );
}

export default GeminiChatbot;
