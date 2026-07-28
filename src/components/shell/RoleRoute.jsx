import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isAttorneyVerified } from '@/lib/roleUtils';
import { homeForRole } from '@/lib/roleUtils';

/**
 * Page-level access control.
 * - `allow`       : roles permitted to view this page (array)
 * - `requireVerified` : attorney must be verified (else → pending)
 * - `requirePending`  : attorney must be pending/rejected (else → dashboard)
 */
export default function RoleRoute({ allow, requireVerified, requirePending, children }) {
  const { user, effectiveRole, attorney, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (!allow.includes(effectiveRole)) {
    return <Navigate to={homeForRole(effectiveRole, attorney)} replace />;
  }

  if (effectiveRole === 'attorney') {
    const verified = isAttorneyVerified(attorney);
    if (requireVerified && !verified) return <Navigate to="/attorney-pending" replace />;
    if (requirePending && verified) return <Navigate to="/attorney-dashboard" replace />;
  }

  return children;
}