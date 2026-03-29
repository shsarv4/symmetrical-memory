import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CountUp from './CountUp';

// Motivational quotes array
const QUOTES = [
  "🌟 The journey of a thousand miles begins with a single step.",
  "💪 Every expert was once a beginner. Keep going!",
  "📚 Learning is a lifelong adventure. Enjoy the ride!",
  "🎯 Small progress every day leads to big results.",
  "🚀 You're capable of amazing things. Keep pushing!",
  "🌱 Growth happens outside your comfort zone.",
  "🔥 The only bad workout is the one that didn't happen.",
  "📝 Today's effort is tomorrow's success.",
  "🌈 Your hard work today is an investment in your future.",
  "⭐ Success is the sum of small efforts repeated day in and day out.",
  "🏆 Champions are made from something they have deep inside them.",
  "💡 The more you learn, the more you earn.",
  "🎓 Education is the most powerful weapon you can use to change the world.",
  "🦋 What the caterpillar thought was the end, the butterfly knew was the beginning.",
  "🌄 Every sunrise is an invitation to brighten your future."
];

function ProgressDashboard({ modules, progress: externalProgress }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(externalProgress || {});
  const [loading, setLoading] = useState(!externalProgress); // Only show loading if no external progress
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Cycle quotes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync externalProgress when it changes
  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
      if (loading) setLoading(false);
    }
  }, [externalProgress]);

  // Initial load - only fetch if externalProgress not provided
  useEffect(() => {
    if (externalProgress !== undefined) {
      return; // Skip fetch if parent provides progress
    }

    async function loadProgress() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress || {});
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [user, externalProgress]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!modules || modules.length === 0) {
      return { totalModules: 0, totalTopics: 0, completedTopics: 0, totalExercises: 0, completedExercises: 0 };
    }

    let totalModules = 0;
    let totalTopics = 0;
    let completedTopics = 0;
    let totalExercises = 0;
    let completedExercises = 0;

    modules.forEach(module => {
      if (!module) return;
      totalModules++;

      // Topics
      if (module.topics && Array.isArray(module.topics)) {
        totalTopics += module.topics.length;
        module.topics.forEach(topic => {
          if (topic?.id && progress[`t_${topic.id}`]) completedTopics++;
          // Subtopics
          if (topic?.subtopics && Array.isArray(topic.subtopics)) {
            totalExercises += topic.subtopics.length;
            topic.subtopics.forEach((_, idx) => {
              if (progress[`s_${topic.id}_${idx}`]) completedExercises++;
            });
          }
        });
      }
      // Exercises (module-level)
      if (module.exercises && Array.isArray(module.exercises)) {
        totalExercises += module.exercises.length;
        module.exercises.forEach((_, idx) => {
          if (progress[`e_${module.id}_${idx}`]) completedExercises++;
        });
      }
    });

    const completionPct = totalTopics + totalExercises > 0
      ? Math.round(((completedTopics + completedExercises) / (totalTopics + totalExercises)) * 100)
      : 0;

    return {
      totalModules,
      totalTopics,
      completedTopics,
      totalExercises,
      completedExercises,
      completionPct
    };
  }, [modules, progress]);

  // Calculate per-module progress
  const moduleProgressData = useMemo(() => {
    if (!modules || modules.length === 0) return [];

    return modules.map(module => {
      let moduleTotal = 0;
      let moduleCompleted = 0;

      if (module.topics && Array.isArray(module.topics)) {
        moduleTotal += module.topics.length;
        module.topics.forEach(topic => {
          if (topic?.id && progress[`t_${topic.id}`]) moduleCompleted++;
          if (topic?.subtopics && Array.isArray(topic.subtopics)) {
            moduleTotal += topic.subtopics.length;
            topic.subtopics.forEach((_, idx) => {
              if (progress[`s_${topic.id}_${idx}`]) moduleCompleted++;
            });
          }
        });
      }

      if (module.exercises && Array.isArray(module.exercises)) {
        moduleTotal += module.exercises.length;
        module.exercises.forEach((_, idx) => {
          if (progress[`e_${module.id}_${idx}`]) moduleCompleted++;
        });
      }

      const pct = moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 0;
      return {
        module,
        total: moduleTotal,
        completed: moduleCompleted,
        pct
      };
    });
  }, [modules, progress]);

  if (loading) {
    return (
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--r)',
        border: `1px solid var(--border)`,
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center',
        color: 'var(--txt3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        <div className="spinner" style={{
          width: 40,
          height: 40,
          border: '4px solid var(--lavender)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '12px'
        }}></div>
        Loading your progress...
      </div>
    );
  }

  const { totalModules, totalTopics, completedTopics, totalExercises, completedExercises, completionPct } = stats;

  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: 'var(--r)',
      border: `1px solid var(--border)`,
      padding: '16px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px var(--card-shadow)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--txt-dark)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          📊 Your Progress
        </h2>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--txt3)',
          fontStyle: 'italic',
          maxWidth: '50%',
          textAlign: 'right',
          lineHeight: '1.3'
        }}>
          "{QUOTES[quoteIndex]}"
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: 'var(--bg2)',
          padding: '8px',
          borderRadius: 'var(--r2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Modules
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--lavender)' }}>
            <CountUp value={totalModules} />
          </div>
        </div>

        <div style={{
          background: 'var(--bg2)',
          padding: '8px',
          borderRadius: 'var(--r2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Topics
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--mint2)' }}>
            <CountUp value={completedTopics} /> / {totalTopics}
          </div>
        </div>

        <div style={{
          background: 'var(--bg2)',
          padding: '8px',
          borderRadius: 'var(--r2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Exercises
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--sky2)' }}>
            <CountUp value={completedExercises} /> / {totalExercises}
          </div>
        </div>
      </div>

      {/* Progress Circles Row - Responsive */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Overall Completion Circle */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'var(--bg2)',
          borderRadius: 'var(--r2)',
          border: `1px solid var(--border)`,
          minHeight: '160px'
        }}>
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            marginBottom: '6px'
          }}>
            <svg viewBox="0 0 36 36" style={{
              width: '100%',
              height: '100%',
              transform: 'rotate(-90deg)'
            }}>
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--border2)"
                strokeWidth="2"
              />
              {/* Progress circle */}
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--lavender)"
                strokeWidth="2"
                strokeDasharray={`${completionPct}, 100`}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 1s ease-out',
                  filter: 'drop-shadow(0 0 3px var(--lavender))'
                }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--txt-dark)',
              lineHeight: 1
            }}>
              {completionPct}%
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--txt2)', fontWeight: 500 }}>
            Overall Completion
          </div>
        </div>

        {/* Modules Started Circle */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'linear-gradient(135deg, var(--lavender)15, var(--mint2)15)',
          borderRadius: 'var(--r2)',
          border: `1px solid var(--border)`,
          minHeight: '160px'
        }}>
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            marginBottom: '6px'
          }}>
            <svg viewBox="0 0 36 36" style={{
              width: '100%',
              height: '100%',
              transform: 'rotate(-90deg)'
            }}>
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--border2)"
                strokeWidth="2"
              />
              {/* Progress circle for modules started */}
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="var(--mint2)"
                strokeWidth="2"
                strokeDasharray={`${totalModules > 0 ? Math.round((modules.filter(m => m.topics?.some(t => progress[`t_${t.id}`])).length / totalModules) * 100) : 0}, 100`}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 1s ease-out',
                  filter: 'drop-shadow(0 0 3px var(--mint2))'
                }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--txt-dark)',
              lineHeight: 1
            }}>
              {Object.keys(progress).filter(k => k.startsWith('t_')).length > 0 ? (
                modules.filter(m => m.topics?.some(t => progress[`t_${t.id}`])).length
              ) : (
                0
              )}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--txt2)', fontWeight: 500 }}>
            Modules Started
          </div>
        </div>
      </div>

      {/* Module-by-Module Progress */}
      {moduleProgressData.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--txt-dark)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            📈 Module Progress
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            {moduleProgressData.map(({ module, total, completed, pct }) => (
              <div
                key={module.id}
                style={{
                  background: 'var(--bg2)',
                  padding: '12px',
                  borderRadius: 'var(--r2)',
                  border: `1px solid var(--border)`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--txt-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{module.icon}</span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '120px'
                    }}>{module.title}</span>
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: pct === 100 ? 'var(--mint2)' : 'var(--lavender)'
                  }}>
                    {pct}%
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--border2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: pct === 100
                      ? 'linear-gradient(90deg, var(--mint2), var(--sky2))'
                      : 'linear-gradient(90deg, var(--lavender), var(--pink2))',
                    borderRadius: '4px',
                    transition: 'width 0.8s ease-out',
                    boxShadow: pct > 0 ? '0 0 6px var(--lavender)' : 'none'
                  }} />
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--txt3)',
                  marginTop: '6px',
                  textAlign: 'right'
                }}>
                  {completed}/{total} completed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completionPct === 0 && (
        <div style={{
          marginTop: '12px',
          padding: '10px',
          background: 'linear-gradient(135deg, var(--pink2)15, var(--lavender)15)',
          borderRadius: 'var(--r2)',
          fontSize: '0.85rem',
          color: 'var(--txt-dark)',
          textAlign: 'center',
          fontWeight: 500
        }}>
          ✨ Your learning journey awaits! Start exploring modules to see your progress here.
        </div>
      )}

      {completionPct >= 80 && (
        <div style={{
          marginTop: '12px',
          padding: '10px',
          background: 'linear-gradient(135deg, var(--mint2)22, var(--sky2)22)',
          borderRadius: 'var(--r2)',
          fontSize: '0.85rem',
          color: 'var(--txt-dark)',
          textAlign: 'center',
          fontWeight: 500
        }}>
          🎉 Outstanding! You're crushing your learning goals!
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
