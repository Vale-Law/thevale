import { Navigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

/**
 * Entry point for /admin.
 *  - admin user  → straight to the admin dashboard
 *  - non-admin   → a dead-end "admin access required" screen
 *
 * The founder self-promote button that used to live here (any logged-in
 * user could set their own role to 'admin') was removed in the Wave 0
 * lockdown — admin is now granted only by the service-role SQL in
 * supabase/migrations/20260815170100_wave0_grant_founder_admin.sql, and
 * profiles.role is pinned by trigger besides.
 *
 * Renders outside AdminShell/DashboardShell, so it takes its colors
 * straight from tokens.css's :root scope — light/dark aware on its own.
 */
export default function AdminEntry() {
  const { user, effectiveRole, isLoadingAuth } = useAuth();

  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ground)]">
        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (effectiveRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--ground)] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-[var(--radius-full)] bg-[var(--surface-sunk)] flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-[var(--accent)]" />
        </div>
        <h1 className="text-2xl text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-human)' }}>Admin access required</h1>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m leading-relaxed">
          This area is for Brief's admin team. Admin access is granted by the
          operations team — this account doesn't have it.
        </p>
      </div>
    </div>
  );
}
