import React, { createContext, useState, useEffect, useContext } from 'react';
import { initializeFirebase, getAuth } from '../services/firebase';
import { loadAppConfig } from '../services/configService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        // Load config first
        const appConfig = await loadAppConfig();
        setConfig(appConfig);

        // Initialize Firebase
        if (appConfig?.firebase) {
          initializeFirebase(appConfig.firebase);

          // Set up auth state listener
          const auth = getAuth();
          const unsubscribe = auth.onAuthStateChanged(
            (user) => {
              setUser(user);
              setLoading(false);
            },
            (error) => {
              console.error('Auth state error:', error);
              setError(error.message);
              setLoading(false);
            }
          );

          // Cleanup listener on unmount
          return () => unsubscribe();
        } else {
          throw new Error('Firebase configuration missing');
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    init();
  }, []);

  const login = async (email, password) => {
    const auth = getAuth();
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      setUser(userCredential.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password) => {
    const auth = getAuth();
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      setUser(userCredential.user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    const auth = getAuth();
    try {
      await auth.signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    config,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
