import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

/**
 * Effective role derivation:
 *  - admin   → user.role === 'admin'
 *  - attorney→ user.account_type === 'attorney'
 *  - client  → everyone else (including the platform default 'user' role)
 */
export function deriveRole(user) {
  if (!user) return 'guest';
  if (user.role === 'admin') return 'admin';
  if (user.account_type === 'attorney') return 'attorney';
  return 'client';
}

export function isAttorneyVerified(attorney) {
  if (!attorney) return false;
  return attorney.verification_status === 'verified' || attorney.verified === true;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [attorney, setAttorney] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const loadAttorneyFor = useCallback(async (currentUser) => {
    if (!currentUser || currentUser.account_type !== 'attorney') {
      setAttorney(null);
      return;
    }
    try {
      const list = await base44.entities.Attorney.filter({ user_id: currentUser.id });
      setAttorney(list[0] || null);
    } catch (e) {
      setAttorney(null);
    }
  }, []);

  const reloadAttorney = useCallback(async () => {
    if (user) await loadAttorneyFor(user);
  }, [user, loadAttorneyFor]);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      await loadAttorneyFor(currentUser);
    } catch (error) {
      setUser(null);
      setAttorney(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [loadAttorneyFor]);

  useEffect(() => {
    checkUserAuth();
    // Keep auth state in sync across tabs, OAuth redirects, and sign-out.
    // Skip TOKEN_REFRESHED — it fires silently in the background and
    // shouldn't re-trigger the loading state app-wide.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'TOKEN_REFRESHED') checkUserAuth();
    });
    return () => subscription.subscription.unsubscribe();
  }, [checkUserAuth]);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setAttorney(null);
    setIsAuthenticated(false);
    base44.auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const effectiveRole = useMemo(() => deriveRole(user), [user]);
  const attorneyVerified = useMemo(() => isAttorneyVerified(attorney), [attorney]);

  return (
    <AuthContext.Provider value={{
      user,
      attorney,
      effectiveRole,
      attorneyVerified,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      reloadAttorney,
      loadAttorneyFor,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
