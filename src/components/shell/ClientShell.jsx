import { Navigate, Outlet, useLocation } from 'react-router-dom';
import MobileShell from '@/components/mobile/MobileShell';
import { useAuth } from '@/lib/AuthContext';
import { homeForRole } from '@/lib/roleUtils';

/**
 * Wraps client (and guest) pages with the marketing mobile shell.
 * Attorneys and admins are redirected to their own dashboard.
 */
export default function ClientShell() {
  const { user, effectiveRole, attorney, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="w-6 h-6 border-2 border-[#E5E2DC] border-t-[#111418] rounded-full animate-spin" />
      </div>
    );
  }

  if (user && (effectiveRole === 'attorney' || effectiveRole === 'admin')) {
    // Allow auth-helper routes to run their own redirect logic.
    const authHelpers = ['/auth-redirect', '/auth/client-google'];
    if (!authHelpers.includes(location.pathname)) {
      return <Navigate to={homeForRole(effectiveRole, attorney)} replace />;
    }
  }

  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  );
}