import React, { useEffect, useState } from 'react';
import { fetchModules, createModule, updateModule, deleteModule } from '../../services/moduleService';
import { useTheme } from '../../contexts/ThemeContext';

function AdminModules() {
  const { colors } = useTheme();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', subtitle: '', icon: '📚', accent: '#c084fc',
    topics: [{ id: '', title: '', subtopics: [''] }],
    resources: [],
    exercises: [],
    order: 0
  });

  const load = async () => {
    try {
      const data = await fetchModules();
      if (data.success) {
        setModules(data.modules.sort((a,b) => (a.order||0)-(b.order||0)));
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setEditing('new');
    setForm({
      title: '', subtitle: '', icon: '📚', accent: '#c084fc',
      topics: [{ id: `t${Date.now()}`, title: '', subtopics: [''] }],
      resources: [], exercises: [], order: modules.length
    });
  };

  const startEdit = (mod) => {
    setEditing(mod.id);
    setForm({
      title: mod.title,
      subtitle: mod.subtitle,
      icon: mod.icon,
      accent: mod.accent,
      topics: mod.topics.length ? mod.topics : [{ id: '', title: '', subtopics: [''] }],
      resources: mod.resources || [],
      exercises: mod.exercises || [],
      order: mod.order || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      topics: form.topics.map(t => ({
        id: t.id || `t${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: t.title,
        subtopics: t.subtopics.filter(s => s.trim())
      })).filter(t => t.title.trim())
    };

    const isNew = editing === 'new';
    const res = isNew ? await createModule(payload) : await updateModule(editing, payload);

    if (res.success) {
      setEditing(null);
      load();
    } else {
      alert('Failed to save module');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this module?')) return;
    const res = await deleteModule(id);
    if (res.success) load();
  };

  const addTopic = () => {
    setForm({
      ...form,
      topics: [...form.topics, { id: `t${Date.now()}`, title: '', subtopics: [''] }]
    });
  };

  const removeTopic = (index) => {
    if (form.topics.length > 1) {
      setForm({
        ...form,
        topics: form.topics.filter((_, i) => i !== index)
      });
    }
  };

  const updateTopic = (index, field, value) => {
    const newTopics = [...form.topics];
    newTopics[index][field] = value;
    setForm({ ...form, topics: newTopics });
  };

  const addSubtopic = (topicIndex) => {
    const newTopics = [...form.topics];
    newTopics[topicIndex].subtopics.push('');
    setForm({ ...form, topics: newTopics });
  };

  const updateSubtopic = (topicIndex, subtopicIndex, value) => {
    const newTopics = [...form.topics];
    newTopics[topicIndex].subtopics[subtopicIndex] = value;
    setForm({ ...form, topics: newTopics });
  };

  const removeSubtopic = (topicIndex, subtopicIndex) => {
    const newTopics = [...form.topics];
    newTopics[topicIndex].subtopics = newTopics[topicIndex].subtopics.filter((_, i) => i !== subtopicIndex);
    setForm({ ...form, topics: newTopics });
  };

  const addResource = () => {
    setForm({
      ...form,
      resources: [...form.resources, { type: 'video', label: '', title: '', url: '' }]
    });
  };

  const removeResource = (index) => {
    setForm({
      ...form,
      resources: form.resources.filter((_, i) => i !== index)
    });
  };

  const updateResource = (index, field, value) => {
    const newResources = [...form.resources];
    newResources[index][field] = value;
    setForm({ ...form, resources: newResources });
  };

  const addExercise = () => {
    setForm({
      ...form,
      exercises: [...form.exercises, { title: '', url: '', desc: '' }]
    });
  };

  const removeExercise = (index) => {
    setForm({
      ...form,
      exercises: form.exercises.filter((_, i) => i !== index)
    });
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...form.exercises];
    newExercises[index][field] = value;
    setForm({ ...form, exercises: newExercises });
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
            📚 Module Manager
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--txt3)', fontSize: '0.9rem' }}>
            Create and manage learning modules
          </p>
        </div>
        <button
          onClick={startCreate}
          style={{
            padding: '12px 24px',
            background: `linear-gradient(135deg, ${colors.lavender}, ${colors.lavender2})`,
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
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 182, 255, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>＋</span> Add Module
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
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Topics</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.id} style={{ borderTop: `1px solid var(--border)` }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--txt-dark)', fontSize: '1rem' }}>{m.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--txt3)' }}>{m.subtitle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--txt)' }}>
                  {m.topics?.length || 0} topics
                </td>
                <td style={{ padding: '16px', color: 'var(--txt)' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'var(--bg2)',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {m.order || 0}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(m)}
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
                      onClick={() => handleDelete(m.id)}
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
            ))}
          </tbody>
        </table>

        {modules.length === 0 && (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: 'var(--txt3)'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No modules yet</p>
            <p style={{ fontSize: '0.9rem' }}>Click "Add Module" to create your first module</p>
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
            maxWidth: '700px',
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
              background: `linear-gradient(135deg, ${colors.lavender}15, ${colors.pink}15)`
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.4rem',
                color: 'var(--txt-dark)',
                fontWeight: 700
              }}>
                {editing === 'new' ? '＋ Create New Module' : '✏️ Edit Module'}
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

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Basic Info Section */}
              <div style={{
                background: 'var(--bg2)',
                padding: '20px',
                borderRadius: 'var(--r2)',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  margin: '0 0 16px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--lavender)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                      Module Title *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      placeholder="e.g., Python Programming"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `2px solid var(--border)`,
                        borderRadius: 'var(--r2)',
                        fontSize: '1rem',
                        background: 'var(--card)',
                        color: 'var(--txt)',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                      Subtitle *
                    </label>
                    <input
                      value={form.subtitle}
                      onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                      required
                      placeholder="e.g., Basics → OOP → File Handling"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `2px solid var(--border)`,
                        borderRadius: 'var(--r2)',
                        fontSize: '1rem',
                        background: 'var(--card)',
                        color: 'var(--txt)'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / span 1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                      Icon (emoji)
                    </label>
                    <input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="📚"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `2px solid var(--border)`,
                        borderRadius: 'var(--r2)',
                        fontSize: '1.5rem',
                        background: 'var(--card)',
                        color: 'var(--txt)'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / span 1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={form.accent}
                      onChange={(e) => setForm({ ...form, accent: e.target.value })}
                      style={{
                        width: '100%',
                        height: '44px',
                        border: `2px solid var(--border)`,
                        borderRadius: 'var(--r2)',
                        cursor: 'pointer',
                        background: 'var(--card)'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      min="0"
                      style={{
                        width: '100px',
                        padding: '10px 12px',
                        border: `2px solid var(--border)`,
                        borderRadius: 'var(--r2)',
                        fontSize: '1rem',
                        background: 'var(--card)',
                        color: 'var(--txt)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Topics Section */}
              <div style={{
                background: 'var(--bg2)',
                padding: '20px',
                borderRadius: 'var(--r2)',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: colors.mint,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Topics & Subtopics
                  </h3>
                  <button
                    type="button"
                    onClick={addTopic}
                    style={{
                      padding: '6px 12px',
                      background: colors.mint,
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--r2)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    + Add Topic
                  </button>
                </div>

                {form.topics.map((topic, ti) => (
                  <div
                    key={ti}
                    style={{
                      background: 'var(--card)',
                      border: `2px solid var(--border)`,
                      borderRadius: 'var(--r2)',
                      padding: '16px',
                      marginBottom: '12px',
                      position: 'relative'
                    }}
                  >
                    {form.topics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTopic(ti)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'var(--pink2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    )}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                        Topic Title *
                      </label>
                      <input
                        value={topic.title}
                        onChange={(e) => updateTopic(ti, 'title', e.target.value)}
                        required
                        placeholder="Enter topic title"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid var(--border)`,
                          borderRadius: 'var(--r2)',
                          fontSize: '1rem',
                          background: 'var(--card)',
                          color: 'var(--txt)'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                        Subtopics
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        {topic.subtopics.map((sub, si) => (
                          <div
                            key={si}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'var(--bg2)',
                              padding: '6px 10px',
                              borderRadius: 'var(--r2)',
                              border: `1px solid var(--border)`
                            }}
                          >
                            <input
                              value={sub}
                              onChange={(e) => updateSubtopic(ti, si, e.target.value)}
                              placeholder="Subtopic"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                fontSize: '0.9rem',
                                color: 'var(--txt)',
                                minWidth: '100px',
                                outline: 'none'
                              }}
                            />
                            {topic.subtopics.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSubtopic(ti, si)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--pink2)',
                                  cursor: 'pointer',
                                  fontSize: '1.2rem',
                                  padding: '0 4px',
                                  lineHeight: 1
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSubtopic(ti)}
                          style={{
                            background: 'transparent',
                            border: `1px dashed var(--border)`,
                            borderRadius: 'var(--r2)',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            color: 'var(--txt3)',
                            fontSize: '0.9rem'
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resources Section */}
              <div style={{
                background: 'var(--bg2)',
                padding: '20px',
                borderRadius: 'var(--r2)',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: colors.pink,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Learning Resources
                  </h3>
                  <button
                    type="button"
                    onClick={addResource}
                    style={{
                      padding: '6px 12px',
                      background: colors.pink,
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--r2)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    + Add Resource
                  </button>
                </div>

                {form.resources.map((res, ri) => (
                  <div
                    key={ri}
                    style={{
                      background: 'var(--card)',
                      border: `2px solid var(--border)`,
                      borderRadius: 'var(--r2)',
                      padding: '16px',
                      marginBottom: '12px'
                    }}
                  >
                    {form.resources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResource(ri)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'var(--pink2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ×
                      </button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                          Type
                        </label>
                        <select
                          value={res.type}
                          onChange={(e) => updateResource(ri, 'type', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: `2px solid var(--border)`,
                            borderRadius: 'var(--r2)',
                            fontSize: '1rem',
                            background: 'var(--card)',
                            color: 'var(--txt)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="video">🎬 Video</option>
                          <option value="article">📄 Article</option>
                          <option value="link">🔗 Link</option>
                          <option value="document">📑 Document</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                          Label (e.g., YouTube, Docs)
                        </label>
                        <input
                          value={res.label}
                          onChange={(e) => updateResource(ri, 'label', e.target.value)}
                          placeholder="YouTube"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: `2px solid var(--border)`,
                            borderRadius: 'var(--r2)',
                            fontSize: '1rem',
                            background: 'var(--card)',
                            color: 'var(--txt)'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                        Title *
                      </label>
                      <input
                        value={res.title}
                        onChange={(e) => updateResource(ri, 'title', e.target.value)}
                        required
                        placeholder="Resource title"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid var(--border)`,
                          borderRadius: 'var(--r2)',
                          fontSize: '1rem',
                          background: 'var(--card)',
                          color: 'var(--txt)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                        URL *
                      </label>
                      <input
                        value={res.url}
                        onChange={(e) => updateResource(ri, 'url', e.target.value)}
                        required
                        placeholder="https://example.com/video"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid var(--border)`,
                          borderRadius: 'var(--r2)',
                          fontSize: '1rem',
                          background: 'var(--card)',
                          color: 'var(--txt)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Exercises Section */}
              <div style={{
                background: 'var(--bg2)',
                padding: '20px',
                borderRadius: 'var(--r2)',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: colors.gold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Practice Exercises
                  </h3>
                  <button
                    type="button"
                    onClick={addExercise}
                    style={{
                      padding: '6px 12px',
                      background: colors.gold,
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--r2)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    + Add Exercise
                  </button>
                </div>

                {form.exercises.map((ex, ei) => (
                  <div
                    key={ei}
                    style={{
                      background: 'var(--card)',
                      border: `2px solid var(--border)`,
                      borderRadius: 'var(--r2)',
                      padding: '16px',
                      marginBottom: '12px',
                      position: 'relative'
                    }}
                  >
                    {form.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(ei)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'var(--pink2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ×
                      </button>
                    )}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                        Title *
                      </label>
                      <input
                        value={ex.title}
                        onChange={(e) => updateExercise(ei, 'title', e.target.value)}
                        required
                        placeholder="Exercise title"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid var(--border)`,
                          borderRadius: 'var(--r2)',
                          fontSize: '1rem',
                          background: 'var(--card)',
                          color: 'var(--txt)'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                        Description
                      </label>
                      <textarea
                        value={ex.desc}
                        onChange={(e) => updateExercise(ei, 'desc', e.target.value)}
                        placeholder="Exercise description"
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid var(--border)`,
                          borderRadius: 'var(--r2)',
                          fontSize: '1rem',
                          background: 'var(--card)',
                          color: 'var(--txt)',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                        URL (optional)
                      </label>
                      <input
                        value={ex.url}
                        onChange={(e) => updateExercise(ei, 'url', e.target.value)}
                        placeholder="https://example.com/exercise"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `2px solid var(--border)`,
                          borderRadius: 'var(--r2)',
                          fontSize: '1rem',
                          background: 'var(--card)',
                          color: 'var(--txt)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 32px',
                    background: `linear-gradient(135deg, ${colors.lavender}, ${colors.lavender2})`,
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
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 182, 255, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminModules;
