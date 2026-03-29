import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchModule } from '../../services/moduleService';
import { apiRequest } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

function ModuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [notes, setNotes] = useState({});

  // Load module data
  useEffect(() => {
    async function loadModule() {
      try {
        const data = await fetchModule(id);
        if (data.success) {
          setModule(data.module);
          // Initialize all topics as expanded
          if (data.module?.topics) {
            const initialExpanded = {};
            data.module.topics.forEach(topic => {
              if (topic.id) initialExpanded[topic.id] = true;
            });
            setExpandedTopics(initialExpanded);
          }
        } else {
          alert('Module not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to load module:', error);
        alert('Error loading module');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    loadModule();
  }, [id, navigate]);

  // Load user progress
  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await apiRequest('/api/progress', 'GET');
        if (data.success) {
          setProgress(data.progress || {});
          // Load notes for this module
          const notesKey = `notes_${id}`;
          if (data.progress[notesKey]) {
            setNotes(prev => ({ ...prev, [id]: data.progress[notesKey] }));
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    }
    if (module) loadProgress();
  }, [id, module]);

  // Save progress to backend (debounced)
  const saveProgress = useCallback(async (updates) => {
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);

    try {
      await apiRequest('/api/progress', 'POST', { progress: newProgress });
      console.log('✅ Progress saved');
    } catch (error) {
      console.error('Failed to save progress:', error);
      // revert? for simplicity we keep optimistic
    }
  }, [progress]);

  // Topic toggle
  const toggleTopic = useCallback((topicId) => {
    const key = `t_${topicId}`;
    const newValue = !progress[key];
    saveProgress({ [key]: newValue });
  }, [progress, saveProgress]);

  // Subtopic toggle
  const toggleSubtopic = useCallback((topicId, subIndex) => {
    const key = `s_${topicId}_${subIndex}`;
    const newValue = !progress[key];
    saveProgress({ [key]: newValue });
  }, [progress, saveProgress]);

  // Exercise toggle
  const toggleExercise = useCallback((exerciseIndex) => {
    const key = `e_${id}_${exerciseIndex}`;
    const newValue = !progress[key];
    saveProgress({ [key]: newValue });
  }, [id, progress, saveProgress]);

  // Notes change
  const handleNotesChange = useCallback((e) => {
    const value = e.target.value;
    setNotes(prev => ({ ...prev, [id]: value }));
    const key = `notes_${id}`;
    // Debounce save?
    saveProgress({ [key]: value });
  }, [id, saveProgress]);

  // Toggle topic expansion - default to true (expanded), toggle between true/false
  const toggleTopicExpand = (topicId) => {
    setExpandedTopics(prev => {
      const currentlyExpanded = prev[topicId] !== false; // undefined => true, true => true, false => false
      return { ...prev, [topicId]: !currentlyExpanded };
    });
  };

  // Calculate progress for the module
  const progressStats = useMemo(() => {
    if (!module) return { done: 0, total: 0, pct: 0 };
    let total = 0;
    let done = 0;

    module.topics.forEach(topic => {
      total++; // topic itself
      if (progress[`t_${topic.id}`]) done++;
      total += topic.subtopics.length;
      topic.subtopics.forEach((_, idx) => {
        if (progress[`s_${topic.id}_${idx}`]) done++;
      });
    });

    (module.exercises || []).forEach((_, idx) => {
      total++;
      if (progress[`e_${module.id}_${idx}`]) done++;
    });

    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [module, progress]);

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
        Loading module...
      </div>
    );
  }

  if (!module) return null;

  return (
    <div className="module-detail" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        background: 'var(--card)',
        padding: '20px',
        borderRadius: 'var(--r)',
        border: `1px solid var(--border)`
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '4rem' }}>{module.icon}</div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.6rem',
              color: 'var(--txt-dark)',
              fontWeight: 600
            }}>
              {module.title}
            </h1>
            <p style={{
              margin: '8px 0 0',
              fontSize: '1rem',
              color: 'var(--txt3)'
            }}>
              {module.subtitle}
            </p>
          </div>
        </div>
        <div style={{
          textAlign: 'right',
          padding: '12px',
          background: `${colors.lavender}22`,
          borderRadius: 'var(--r2)',
          minWidth: '100px'
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: colors.lavender }}>
            {progressStats.pct}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>COMPLETE</div>
        </div>
      </div>

      {/* Topics */}
      <div style={{ marginBottom: '24px' }}>
        <div className="sec-title" style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--txt-dark)'
        }}>
          Topics & Subtopics
        </div>
        {module.topics.map(topic => {
          const topicDone = !!progress[`t_${topic.id}`];
          const subDoneCount = topic.subtopics.reduce((count, _, idx) => count + (progress[`s_${topic.id}_${idx}`] ? 1 : 0), 0);
          const isExpanded = expandedTopics[topic.id] !== false; // default expanded

          return (
            <div
              key={topic.id}
              className="topic-card"
              style={{
                background: 'var(--card)',
                borderRadius: 'var(--r2)',
                marginBottom: '12px',
                border: `1px solid var(--border)`,
                overflow: 'hidden'
              }}
            >
              <div
                className="topic-header"
                onClick={() => toggleTopicExpand(topic.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: topicDone ? `${colors.lavender}22` : 'transparent',
                  transition: 'background 0.3s'
                }}
              >
                <input
                  type="checkbox"
                  checked={topicDone}
                  onChange={() => toggleTopic(topic.id)}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '12px',
                    accentColor: 'var(--lavender)'
                  }}
                />
                <span className="topic-title-txt" style={{
                  flex: 1,
                  fontWeight: 600,
                  color: 'var(--txt-dark)',
                  textDecoration: topicDone ? 'line-through' : 'none'
                }}>
                  {topic.title}
                </span>
                <span className="topic-count" style={{
                  fontSize: '0.85rem',
                  color: 'var(--txt3)',
                  marginRight: '12px'
                }}>
                  {subDoneCount}/{topic.subtopics.length}
                </span>
                <span className="topic-chevron" style={{
                  transition: 'transform 0.3s',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: 'var(--txt3)'
                }}>
                  ▾
                </span>
              </div>

              <div
                className="topic-body"
                style={{
                  padding: '8px 16px 16px',
                  display: isExpanded ? 'block' : 'none'
                }}
              >
                {(topic.subtopics || []).map((sub, idx) => {
                    const subDone = !!progress[`s_${topic.id}_${idx}`];
                    return (
                      <div key={idx} className="subtopic-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 0'
                      }}>
                        <input
                          type="checkbox"
                          checked={subDone}
                          onChange={() => toggleSubtopic(topic.id, idx)}
                          style={{
                            width: '18px',
                            height: '18px',
                            marginRight: '12px',
                            accentColor: 'var(--lavender)'
                          }}
                        />
                        <span className="sub-txt" style={{
                          color: 'var(--txt)',
                          textDecoration: subDone ? 'line-through' : 'none',
                          fontSize: '0.95rem'
                        }}>
                          {sub}
                        </span>
                      </div>
                    );
                  })}
                </div>
            </div>
          );
        })}
      </div>

      {/* Resources */}
      {module.resources && module.resources.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div className="sec-title" style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            marginBottom: '16px',
            color: 'var(--txt-dark)'
          }}>
            Learning Resources
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
            {module.resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="res-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px',
                  background: 'var(--bg2)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--r2)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--lavender2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--lavender)',
                  marginBottom: '4px',
                  textTransform: 'uppercase'
                }}>
                  {res.type}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--txt-dark)', marginBottom: '4px' }}>
                  {res.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>{res.label}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Exercises */}
      {module.exercises && module.exercises.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div className="sec-title" style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            marginBottom: '16px',
            color: 'var(--txt-dark)'
          }}>
            Practice Exercises
          </div>
          {module.exercises.map((ex, idx) => {
            const exDone = !!progress[`e_${module.id}_${idx}`];
            return (
              <div
                key={idx}
                className="ex-card"
                style={{
                  display: 'flex',
                  background: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--r2)',
                  marginBottom: '12px',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: exDone ? `${colors.lavender}22` : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={exDone}
                    onChange={() => toggleExercise(idx)}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginRight: '12px',
                      accentColor: 'var(--lavender)'
                    }}
                  />
                </div>
                <div className="ex-body" style={{ flex: 1, padding: '12px' }}>
                  <div className="ex-title" style={{
                    fontWeight: 600,
                    color: 'var(--txt-dark)',
                    textDecoration: exDone ? 'line-through' : 'none',
                    marginBottom: '4px'
                  }}>
                    {ex.title}
                  </div>
                  <div className="ex-desc" style={{
                    fontSize: '0.9rem',
                    color: 'var(--txt3)',
                    marginBottom: ex.url ? '8px' : 0,
                    lineHeight: '1.5'
                  }}>
                    {ex.desc}
                  </div>
                  {ex.url && (
                    <a
                      href={ex.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ex-link"
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--lavender2)',
                        textDecoration: 'none',
                        fontWeight: 500
                      }}
                    >
                      Open → {ex.url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: '24px' }}>
        <div className="sec-title" style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          marginBottom: '12px',
          color: 'var(--txt-dark)'
        }}>
          My Notes
        </div>
        <textarea
          className="notes-area"
          placeholder="Add your notes, key learnings, or bookmarks for this module..."
          value={notes[id] || ''}
          onChange={handleNotesChange}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--r2)',
            background: 'var(--bg2)',
            color: 'var(--txt)',
            fontSize: '1rem',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>
    </div>
  );
}

export default ModuleDetail;
