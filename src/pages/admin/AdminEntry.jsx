import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

/**
 * Entry point for /admin.
 *  - admin user  → straight to the admin dashboard
 *  - non-admin   → a standalone "enable admin access" screen (founder self-promote)
 */
export default function AdminEntry() {
  const { user, effectiveRole, isLoadingAuth, checkUserAuth } = useAuth();
  const [promoting, setPromoting] = useState(false);

  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
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
      alert('Could not enable admin access. Please contact Base44 support to set your role to admin.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#EAF2FB] flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-[#0a5dc2]" />
        </div>
        <h1 className="font-serif text-2xl font-medium text-[#111418] mb-3">Admin access required</h1>
        <p className="text-sm text-[#8A8578] font-body mb-8 leading-relaxed">
          This area is for Brief's admin team. If you're the founder, you can enable admin access for your account.
        </p>
        <button
          onClick={promote}
          disabled={promoting}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-colors font-body disabled:opacity-40"
        >
          {promoting && <Loader2 className="w-4 h-4 animate-spin" />}
          Enable admin access
        </button>
      </div>
    </div>
  );
}