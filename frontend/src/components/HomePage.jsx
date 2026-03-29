import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProgressDashboard from './common/ProgressDashboard';
import ModuleList from './modules/ModuleList';
import { fetchModules } from '../services/moduleService';

function HomePage() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [modulesLoading, setModulesLoading] = useState(true);

  // Function to fetch all data
  const fetchData = useCallback(async () => {
    try {
      // Fetch modules using service (includes auth)
      const modulesResult = await fetchModules();
      if (modulesResult.success) {
        setModules(modulesResult.modules || []);
      } else {
        console.error('Failed to fetch modules:', modulesResult.error);
        setModules([]);
      }

      // Fetch user progress using the same api pattern
      if (user) {
        try {
          const token = await user.getIdToken();
          const progressRes = await fetch('/api/progress', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setProgress(progressData.progress || {});
          }
        } catch (e) {
          console.error('Failed to fetch progress:', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setModules([]);
    } finally {
      setModulesLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch progress when page becomes visible or gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refetch progress (but not modules, as they rarely change)
        if (user) {
          user.getIdToken().then(token => {
            return fetch('/api/progress', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }).then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed');
          }).then(data => {
            setProgress(data.progress || {});
          }).catch(() => {
            // Silently fail - will try again later
          });
        }
      }
    };

    const handleFocus = () => {
      if (user) {
        user.getIdToken().then(token => {
          return fetch('/api/progress', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }).then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed');
        }).then(data => {
          setProgress(data.progress || {});
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Show main spinner only for initial modules load
  if (modulesLoading && modules.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        color: 'var(--txt3)',
        textAlign: 'center'
      }}>
        <div className="spinner" style={{
          width: 50,
          height: 50,
          border: '4px solid var(--lavender)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <ProgressDashboard modules={modules} progress={progress} />
      <ModuleList modules={modules} progress={progress} />
    </div>
  );
}

export default HomePage;
