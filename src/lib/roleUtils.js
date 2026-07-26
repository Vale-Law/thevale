import { deriveRole, isAttorneyVerified } from '@/lib/AuthContext';

/** Where a given role should land / be redirected to. */
export function homeForRole(role, attorney) {
  if (role === 'admin') return '/admin';
  if (role === 'attorney') {
    return isAttorneyVerified(attorney) ? '/attorney-dashboard' : '/attorney-pending';
  }
  return '/bookings';
}

export { deriveRole, isAttorneyVerified };