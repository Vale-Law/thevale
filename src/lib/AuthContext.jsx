import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

/**
 * Effective role derivation:
 *  - admin   → user.role === 'admin'
 *  - attorney→ user.account_type === 'attorney'
 *  - staff   → user.role === 'staff' (office staff added to a firm; see
 *              firm_members and add_firm_staff_by_email())
 *  - client  → everyone else (including the platform default 'user' role)
 */
export function deriveRole(user) {
  if (!user) return 'guest';
  if (user.role === 'admin') return 'admin';
  if (user.account_type === 'attorney') return 'attorney';
  if (user.role === 'staff') return 'staff';
  return 'client';
}

export function isAttorneyVerified(attorney) {
  if (!attorney) return false;
  return attorney.verification_status === 'verified' || attorney.verified === true;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [attorney, setAttorney] = useState(null);
  const [firmAttorneyIds, setFirmAttorneyIds] = useState([]);
  const [firmId, setFirmId] = useState(null);
  // null = not loaded yet, 'none' = firm has never subscribed (no row).
  // Gating (AttorneyShell.jsx) treats 'active'/'trialing'/'past_due' as
  // portal-accessible (past_due is a deliberate grace period, not a
  // cutoff) and everything else -- 'none', 'incomplete', 'canceled',
  // 'unpaid' -- as blocked.
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Loads the logged-in user's own attorney row (attorney role only) and the
  // full set of attorney IDs in their firm (attorney or staff role) — the
  // pipeline (AttorneyBookings/AttorneyDashboard) reads firm-wide, not just
  // the individual attorney's own bookings, matching the firm_members-scoped
  // RLS that already governs `bookings` at the database level.
  const loadFirmFor = useCallback(async (currentUser) => {
    const role = deriveRole(currentUser);
    if (!currentUser || (role !== 'attorney' && role !== 'staff')) {
      setAttorney(null);
      setFirmAttorneyIds([]);
      setFirmId(null);
      setSubscriptionStatus(null);
      return;
    }
    try {
      let ownAttorney = null;
      if (role === 'attorney') {
        const list = await base44.entities.Attorney.filter({ user_id: currentUser.id });
        ownAttorney = list[0] || null;
      }
      setAttorney(ownAttorney);

      const { data: membership } = await supabase
        .from('firm_members')
        .select('firm_id')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      const resolvedFirmId = membership?.firm_id || ownAttorney?.firm_id || null;
      setFirmId(resolvedFirmId);

      if (!resolvedFirmId) {
        setFirmAttorneyIds(ownAttorney ? [ownAttorney.id] : []);
        setSubscriptionStatus('none');
        return;
      }
      const { data: firmAttorneys } = await supabase.from('attorneys').select('id').eq('firm_id', resolvedFirmId);
      setFirmAttorneyIds((firmAttorneys || []).map((a) => a.id));

      const { data: subscription } = await supabase
        .from('firm_subscriptions')
        .select('status')
        .eq('firm_id', resolvedFirmId)
        .maybeSingle();
      setSubscriptionStatus(subscription?.status || 'none');
    } catch (e) {
      setAttorney(null);
      setFirmAttorneyIds([]);
      setFirmId(null);
      setSubscriptionStatus(null);
    }
  }, []);

  const reloadAttorney = useCallback(async () => {
    if (user) await loadFirmFor(user);
  }, [user, loadFirmFor]);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      await loadFirmFor(currentUser);
    } catch (error) {
      setUser(null);
      setAttorney(null);
      setFirmAttorneyIds([]);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [loadFirmFor]);

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
    setFirmAttorneyIds([]);
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
      firmAttorneyIds,
      firmId,
      subscriptionStatus,
      effectiveRole,
      attorneyVerified,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      reloadAttorney,
      loadFirmFor,
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
