import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/primitives';

/**
 * Entry point for /admin.
 *  - admin user  → straight to the admin dashboard
 *  - non-admin   → a standalone "enable admin access" screen (founder self-promote)
 *
 * Renders outside AdminShell/DashboardShell, so it takes its colors
 * straight from tokens.css's :root scope — light/dark aware on its own.
 */
export default function AdminEntry() {
  const { user, effectiveRole, isLoadingAuth, checkUserAuth } = useAuth();
  const [promoting, setPromoting] = useState(false);

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

  const promote = async () => {
    setPromoting(true);
    try {
      await base44.entities.User.update(user.id, { role: 'admin' });
      await checkUserAuth();
      window.location.href = '/admin/dashboard';
    } catch (e) {
      setPromoting(false);
      alert('Could not enable admin access. Please contact support to set your role to admin.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ground)] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-[var(--radius-full)] bg-[var(--surface-sunk)] flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-[var(--accent)]" />
        </div>
        <h1 className="text-2xl text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-human)' }}>Admin access required</h1>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mb-8 leading-relaxed">
          This area is for Brief's admin team. If you're the founder, you can enable admin access for your account.
        </p>
        <Button variant="primary" onClick={promote} disabled={promoting}>
          {promoting && <Loader2 className="w-4 h-4 animate-spin" />}
          Enable admin access
        </Button>
      </div>
    </div>
  );
}
