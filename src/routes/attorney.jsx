import { Route } from 'react-router-dom';

import AttorneyShell from '@/components/shell/AttorneyShell';
import RoleRoute from '@/components/shell/RoleRoute';

import AttorneyDashboardPage from '@/pages/attorney/AttorneyDashboard';
import AttorneyPendingPage from '@/pages/attorney/AttorneyPending';
import AttorneyBookingsPage from '@/pages/attorney/AttorneyBookings';
import AttorneyAvailabilityPage from '@/pages/attorney/AttorneyAvailability';
import AttorneyProfilePage from '@/pages/attorney/AttorneyProfile';

import LegacyAccentScope from './LegacyAccentScope';

/**
 * Attorney-portal route tree, relocated byte-for-byte out of the old
 * src/App.jsx (same components, same AttorneyShell layout, same RoleRoute
 * guards, same paths). This is the file the firm-surfaces team owns going
 * forward.
 *
 * NOTE: src/App.jsx's original comment block only ever called these "the
 * attorney dashboard routes" without enumerating them; the live code had
 * five routes under the AttorneyShell layout, not four -- /attorney-pending
 * shares the exact same layout element and role guard as the other four,
 * so it is included here too. Dropping it would be a behavior change
 * (RoleRoute's requirePending redirect target would 404).
 *
 * Wrapped in LegacyAccentScope so the shadcn-style chrome these pages/shell
 * still depend on (src/components/ui/**, via hsl(var(--accent))) keeps
 * resolving the legacy accent color. See ./legacy-accent-scope.css.
 */
export default (
  <Route element={<LegacyAccentScope />}>
    <Route element={<AttorneyShell />}>
      <Route path="/attorney-dashboard" element={<RoleRoute allow={['attorney']} requireVerified><AttorneyDashboardPage /></RoleRoute>} />
      <Route path="/attorney-pending" element={<RoleRoute allow={['attorney']} requirePending><AttorneyPendingPage /></RoleRoute>} />
      <Route path="/attorney/bookings" element={<RoleRoute allow={['attorney']} requireVerified><AttorneyBookingsPage /></RoleRoute>} />
      <Route path="/attorney/availability" element={<RoleRoute allow={['attorney']} requireVerified><AttorneyAvailabilityPage /></RoleRoute>} />
      <Route path="/attorney/profile" element={<RoleRoute allow={['attorney']}><AttorneyProfilePage /></RoleRoute>} />
    </Route>
  </Route>
);
