import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminStats, fetchUsers } from '../../services/adminService';
import { fetchAIModel, updateAIModel } from '../../services/modelService';
import { useAuth } from '../../contexts/AuthContext';
import CountUp from '../common/CountUp';

function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [aiModel, setAIModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Check if user is actually an admin by checking Firestore user doc role
    // For now, we rely on route check; we can also verify via API if needed
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, usersData, modelData] = await Promise.all([
          fetchAdminStats(),
          fetchUsers(),
          fetchAIModel()
        ]);
        if (statsData.success) setStats(statsData.stats);
        if (usersData.success) setUsers(usersData.users);
        if (modelData.success) {
          setAIModel(modelData.model);
        }
      } catch (err) {
        setError('Failed to load admin data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRoleChange = async (uid, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to ${newRole === 'admin' ? 'grant' : 'revoke'} admin rights?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${uid}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      } else {
        alert('Failed to update role: ' + data.error);
      }
    } catch (error) {
      console.error('Role update error:', error);
      alert('Error updating role');
    }
  };

  const handleModelChange = async (newModel) => {
    // If called from event, extract value
    if (newModel && newModel.target) {
      newModel = newModel.target.value;
    }

    if (!newModel || !newModel.trim()) {
      setMessage({ text: 'Model ID cannot be empty', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await updateAIModel(newModel.trim());
      if (res.success) {
        setAIModel(newModel.trim());
        setMessage({ text: res.message, type: 'success' });
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      setMessage({ text: 'Failed to update model: ' + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

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
        Loading admin dashboard...
      </div>
    );
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  return (
    <div className="admin-panel" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--txt-dark)', margin: 0 }}>
          👑 Admin Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/admin/modules')}
            style={{
              padding: '10px 16px',
              background: 'var(--lavender)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r2)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Manage Modules
          </button>
          <button
            onClick={() => navigate('/admin/announcements')}
            style={{
              padding: '10px 16px',
              background: 'var(--mint2)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r2)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Manage Announcements
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: 'var(--r2)',
            border: `1px solid var(--border)`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lavender)' }}>
              <CountUp value={stats.totalUsers} />
            </div>
            <div style={{ color: 'var(--txt3)', fontSize: '0.9rem' }}>Total Users</div>
          </div>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: 'var(--r2)',
            border: `1px solid var(--border)`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--mint2)' }}>
              <CountUp value={stats.totalModules} />
            </div>
            <div style={{ color: 'var(--txt3)', fontSize: '0.9rem' }}>Modules</div>
          </div>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: 'var(--r2)',
            border: `1px solid var(--border)`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--sky2)' }}>
              <CountUp value={stats.activeAnnouncements} />
            </div>
            <div style={{ color: 'var(--txt3)', fontSize: '0.9rem' }}>Active Announcements</div>
          </div>
          <div style={{
            background: 'var(--card)',
            padding: '20px',
            borderRadius: 'var(--r2)',
            border: `1px solid var(--border)`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gold2)' }}>
              <CountUp value={stats.usersWithProgress} />
            </div>
            <div style={{ color: 'var(--txt3)', fontSize: '0.9rem' }}>Users with Progress</div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--r)',
        border: `1px solid var(--border)`,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid var(--border)`,
          fontWeight: 600,
          color: 'var(--txt-dark)'
        }}>
          Users ({users.length})
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg2)' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--txt2)', fontSize: '0.9rem' }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--txt2)', fontSize: '0.9rem' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--txt2)', fontSize: '0.9rem' }}>Last Login</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--txt2)', fontSize: '0.9rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid} style={{ borderTop: `1px solid var(--border)` }}>
                <td style={{ padding: '12px 16px', color: 'var(--txt)' }}>
                  {u.email}
                  {u.uid === user?.uid && (
                    <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--txt-light)' }}>(you)</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: u.role === 'admin' ? 'var(--lavender)' : 'var(--bg2)',
                    color: u.role === 'admin' ? 'white' : 'var(--txt)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--txt3)', fontSize: '0.9rem' }}>
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {u.uid !== user?.uid && (
                    <button
                      onClick={() => handleRoleChange(u.uid, u.role)}
                      style={{
                        padding: '6px 12px',
                        background: u.role === 'admin' ? 'var(--pink2)' : 'var(--mint2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--r2)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Model Setting */}
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--r)',
        border: `1px solid var(--border)`,
        padding: '20px',
        marginTop: '24px'
      }}>
        <div style={{
          paddingBottom: '12px',
          borderBottom: `1px solid var(--border)`,
          marginBottom: '16px',
          fontWeight: 600,
          color: 'var(--txt-dark)',
          fontSize: '1.1rem'
        }}>
          🤖 AI Assistant Model
        </div>

        {message.text && (
          <div style={{
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            fontSize: '0.9rem'
          }}>
            {message.text}
          </div>
        )}

        <div style={{ maxWidth: '500px' }}>
          <div style={{ marginBottom: '12px', color: 'var(--txt2)', fontSize: '0.9rem' }}>
            Enter the OpenRouter model ID to use (e.g., <code>mistralai/mixtral-8x7b-instruct</code>, <code>anthropic/claude-3.5-sonnet</code>):
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={aiModel || ''}
              onChange={(e) => setAIModel(e.target.value)}
              onBlur={handleModelChange}
              placeholder="mistralai/mixtral-8x7b-instruct"
              disabled={saving}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--r2)',
                border: `1px solid var(--border)`,
                background: 'var(--bg2)',
                color: 'var(--txt)',
                fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'text',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />

            <button
              onClick={() => handleModelChange(aiModel)}
              disabled={saving || !aiModel}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '6px 12px',
                background: saving || !aiModel ? 'var(--txt3)' : 'var(--lavender)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: saving || !aiModel ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div style={{
            marginTop: '12px',
            fontSize: '0.8rem',
            color: 'var(--txt3)'
          }}>
            Current model: <strong style={{ fontFamily: 'monospace' }}>{aiModel || 'Not set'}</strong>
          </div>

          <div style={{
            marginTop: '8px',
            fontSize: '0.75rem',
            color: 'var(--txt3)',
            fontStyle: 'italic'
          }}>
            Tip: Save the model ID to Firestore. Changes apply immediately to all chatbots.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
