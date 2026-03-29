import React, { useEffect, useState } from 'react';
import { fetchAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../services/announcementService';
import { useTheme } from '../../contexts/ThemeContext';

function AdminAnnouncements() {
  const { colors } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', message: '', type: 'info', active: true, startDate: '', endDate: ''
  });

  const load = async () => {
    try {
      const data = await fetchAllAnnouncements();
      if (data.success) setAnnouncements(data.announcements);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      active: Boolean(form.active),
      startDate: form.startDate || null,
      endDate: form.endDate || null
    };

    const isNew = editing === 'new';
    const res = isNew ? await createAnnouncement(payload) : await updateAnnouncement(editing.id, payload);

    if (res.success) {
      setEditing(null);
      setForm({ title: '', message: '', type: 'info', active: true, startDate: '', endDate: '' });
      load();
    } else {
      alert('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    const res = await deleteAnnouncement(id);
    if (res.success) load();
  };

  const getTypeStyle = (type) => {
    const styles = {
      info: { bg: colors.sky2 || '#67e8f9', icon: 'ℹ️' },
      warning: { bg: colors.gold2 || '#fcd34d', icon: '⚠️' },
      success: { bg: colors.mint2 || '#86efac', icon: '✅' },
      update: { bg: colors.lavender2 || '#b8a0ff', icon: '🔄' }
    };
    return styles[type] || styles.info;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        background: 'var(--card)',
        borderRadius: 'var(--r)',
        margin: '20px'
      }}>
        <div className="spinner" style={{
          width: 40, height: 40,
          border: '4px solid var(--lavender)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '20px',
        background: 'var(--card)',
        borderRadius: 'var(--r)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '1.6rem',
            color: 'var(--txt-dark)',
            fontWeight: 700
          }}>
            📢 Announcement Manager
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--txt3)', fontSize: '0.9rem' }}>
            Create and manage site-wide announcements
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          style={{
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${colors.mint}, ${colors.mint2})`,
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r2)',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(134, 239, 172, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>＋</span> New Announcement
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg2)' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(a => {
              const typeStyle = getTypeStyle(a.type);
              return (
                <tr key={a.id} style={{ borderTop: `1px solid var(--border)` }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--txt-dark)' }}>
                    {a.title}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--txt)', fontSize: '0.9rem', maxWidth: '300px' }}>
                    {a.message.length > 80 ? a.message.substring(0, 80) + '...' : a.message}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: typeStyle.bg + '30',
                      color: typeStyle.bg,
                      border: `1px solid ${typeStyle.bg}`,
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      <span>{typeStyle.icon}</span>
                      {a.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {a.active ? (
                      <span style={{
                        padding: '4px 12px',
                        background: colors.mint + '30',
                        color: colors.mint,
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        ● Active
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 12px',
                        background: 'var(--bg2)',
                        color: 'var(--txt3)',
                        borderRadius: '12px',
                        fontSize: '0.85rem'
                      }}>
                        ○ Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setEditing(a)}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--bg2)',
                          color: 'var(--lavender)',
                          border: `1px solid var(--border)`,
                          borderRadius: 'var(--r2)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'var(--lavender)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'var(--bg2)';
                          e.currentTarget.style.color = 'var(--lavender)';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--pink2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--r2)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {announcements.length === 0 && (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: 'var(--txt3)'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No announcements yet</p>
            <p style={{ fontSize: '0.9rem' }}>Click "New Announcement" to create one</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {editing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card)',
            borderRadius: 'var(--r)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid var(--border)`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: `linear-gradient(135deg, ${colors.sky}15, ${colors.mint}15)`
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.4rem',
                color: 'var(--txt-dark)',
                fontWeight: 700
              }}>
                {editing === 'new' ? '＋ Create Announcement' : '✏️ Edit Announcement'}
              </h2>
              <button
                onClick={() => setEditing(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--txt3)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--bg2)';
                  e.currentTarget.style.color = 'var(--txt-dark)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'var(--txt3)';
                }}
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--txt-dark)', fontSize: '0.95rem' }}>
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Enter announcement title"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `2px solid var(--border)`,
                    borderRadius: 'var(--r2)',
                    fontSize: '1rem',
                    background: 'var(--card)',
                    color: 'var(--txt)',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--txt-dark)', fontSize: '0.95rem' }}>
                  Message *
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows="4"
                  placeholder="Enter announcement message"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: `2px solid var(--border)`,
                    borderRadius: 'var(--r2)',
                    fontSize: '1rem',
                    background: 'var(--card)',
                    color: 'var(--txt)',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--txt-dark)', fontSize: '0.95rem' }}>
                  Announcement Type
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px'
                }}>
                  {['info', 'warning', 'success', 'update'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, type })}
                      style={{
                        padding: '12px',
                        background: form.type === type
                          ? getTypeStyle(type).bg + '30'
                          : 'var(--bg2)',
                        color: form.type === type
                          ? getTypeStyle(type).bg
                          : 'var(--txt)',
                        border: `2px ${form.type === type ? 'solid' : 'dashed'} ${getTypeStyle(type).bg}`,
                        borderRadius: 'var(--r2)',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (form.type !== type) {
                          e.currentTarget.style.background = 'var(--bg2)';
                          e.currentTarget.style.borderColor = getTypeStyle(type).bg + '80';
                        }
                      }}
                    >
                      <span>{getTypeStyle(type).icon}</span>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'var(--bg2)',
                  borderRadius: 'var(--r2)',
                  border: `2px solid var(--border)`,
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="active" style={{ fontWeight: 500, color: 'var(--txt)', fontSize: '0.95rem', cursor: 'pointer' }}>
                    Active (announcement will be visible to users)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '20px',
                borderTop: `1px solid var(--border)`
              }}>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--bg2)',
                    color: 'var(--txt)',
                    border: `2px solid var(--border)`,
                    borderRadius: 'var(--r2)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--border)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'var(--bg2)';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 32px',
                    background: `linear-gradient(135deg, ${colors.mint}, ${colors.mint2})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--r2)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(134, 239, 172, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnnouncements;
