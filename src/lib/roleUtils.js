import { deriveRole, isAttorneyVerified } from '@/lib/AuthContext';

/** Where a given role should land / be redirected to. */
export function homeForRole(role, attorney) {
  if (role === 'admin') return '/admin';
  if (role === 'attorney') {
    return isAttorneyVerified(attorney) ? '/attorney-dashboard' : '/attorney-pending';
  }
  // Office staff have no personal attorney row and no verification gate —
  // they land straight on the firm's pipeline once an owner has added them.
  if (role === 'staff') return '/attorney-dashboard';
  return '/';
}

export { deriveRole, isAttorneyVerified };