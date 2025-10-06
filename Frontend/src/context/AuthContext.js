// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ROLES } from '../constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Waits until the Firestore user doc exists or until timeout.
 * Returns the document snapshot if found, otherwise null.
 */
const waitForUserDoc = async (uid, { maxAttempts = 12, intervalMs = 300 } = {}) => {
  const ref = doc(db, 'users', uid);
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) return snap;
    } catch (err) {
      // transient Firestore error — we'll retry
      console.warn('waitForUserDoc getDoc error (will retry):', err?.message || err);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
    attempts++;
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // firebase.User | null
  const [loading, setLoading] = useState(true); // while we determine auth + role
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // whenever auth state changes, treat as "loading" until we've resolved role
      setLoading(true);
      setUser(firebaseUser);

      if (!firebaseUser) {
        // logged out — clear state and stop loading
        if (!cancelled) {
          setUserRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Try a single immediate read first
        const immediateSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (immediateSnap.exists()) {
          if (!cancelled) {
            const data = immediateSnap.data();
            setUserRole(data?.role || ROLES.CHILD);
            setLoading(false);
          }
          return;
        }

        // If not present instantly, wait/poll for the doc to appear (signup case)
        const snap = await waitForUserDoc(firebaseUser.uid, { maxAttempts: 15, intervalMs: 300 }); // ~4.5s max
        if (snap && snap.exists()) {
          if (!cancelled) {
            const data = snap.data();
            setUserRole(data?.role || ROLES.CHILD);
            setLoading(false);
          }
          return;
        }

        // Timed out waiting for the user doc — fall back to a safe default role
        // (This avoids indefinite loading if something is wrong)
        if (!cancelled) {
          console.warn('Timed out waiting for user doc; defaulting to CHILD role');
          setUserRole(ROLES.CHILD);
          setLoading(false);
        }
      } catch (err) {
        console.error('AuthProvider: error resolving user role:', err);
        if (!cancelled) {
          // fallback safe defaults
          setUserRole(ROLES.CHILD);
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const value = {
    user,
    userRole,
    loading,
    isAuthenticated: !!user,
    logout
  };

  // Only render children once we've finished loading initial auth+role,
  // which prevents early route redirects before role is known.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
