import { Route } from 'react-router-dom';

import Home from '@/pages/Home';
import AttorneyProfile from '@/pages/AttorneyProfile';
import Booking from '@/pages/Booking';
import Confirmation from '@/pages/Confirmation';
import Financing from '@/pages/Financing';
import ForAttorneys from '@/pages/ForAttorneys';
import AreasOfHelp from '@/pages/AreasOfHelp';
import LearnIndex from '@/pages/LearnIndex';
import LearnImmigration from '@/pages/LearnImmigration';
import LearnPersonalInjury from '@/pages/LearnPersonalInjury';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SignupRole from '@/pages/SignupRole';
import AttorneyApplication from '@/pages/AttorneyApplication';
import AuthRedirect from '@/pages/AuthRedirect';
import ClientGoogleComplete from '@/pages/ClientGoogleComplete';
import Account from '@/pages/Account';
import Bookings from '@/pages/Bookings';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';

import ClientShell from '@/components/shell/ClientShell';
import AdminShell from '@/components/shell/AdminShell';
import RoleRoute from '@/components/shell/RoleRoute';

import AdminEntry from '@/pages/admin/AdminEntry';
import AdminDashboardPage from '@/pages/admin/AdminDashboard';
import AdminApplicationsPage from '@/pages/admin/AdminApplications';
import AdminApplicationDetailPage from '@/pages/admin/AdminApplicationDetail';
import AdminAttorneysPage from '@/pages/admin/AdminAttorneys';
import AdminBookingsPage from '@/pages/admin/AdminBookings';
import AdminUsersPage from '@/pages/admin/AdminUsers';
// Add page imports here

import PrimitiveGallery from '@/pages/dev/PrimitiveGallery';

import LegacyAccentScope from './LegacyAccentScope';

/**
 * Every route that isn't one of the four (five, see routes/attorney.jsx)
 * attorney-portal routes: consumer/public/marketing routes + admin routes,
 * relocated byte-for-byte out of the old src/App.jsx. Admin routes have no
 * other owner in this project's file-boundary split, so they're folded in
 * here (approved project-owner judgment call, not an oversight).
 *
 * Also adds:
 *  - /dev/primitives: renders the Design System v2 primitive gallery so it
 *    can be visually gated before the primitives ship anywhere real. Not
 *    auth-gated -- harmless static gallery, fine to be reachable in prod
 *    for now. Deliberately left OUTSIDE LegacyAccentScope so it gets the
 *    new hex --accent from tokens.css, not the legacy HSL re-pin.
 *  - /book/:slug and /manage/:token: reserved stub routes for future units
 *    (the real booking-page/manage-page work is out of scope for this
 *    unit) -- placeholders only, also outside LegacyAccentScope.
 *
 * The legacy consumer + admin routes ARE wrapped in LegacyAccentScope so
 * the shadcn-style chrome they depend on (src/components/ui/**, via
 * hsl(var(--accent))) keeps resolving the legacy accent color once
 * tokens.css's hex --accent becomes the :root default. See
 * ./legacy-accent-scope.css.
 */
export default (
  <>
    <Route element={<LegacyAccentScope />}>
      {/* Public legal pages — no login required */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Client + public/auth routes (marketing shell) */}
      <Route element={<ClientShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/attorney/:id" element={<AttorneyProfile />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/financing" element={<Financing />} />
        <Route path="/for-attorneys" element={<ForAttorneys />} />
        <Route path="/areas-of-help" element={<AreasOfHelp />} />
        <Route path="/learn" element={<LearnIndex />} />
        <Route path="/learn/immigration-law" element={<LearnImmigration />} />
        <Route path="/learn/personal-injury-law" element={<LearnPersonalInjury />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<SignupRole />} />
        <Route path="/signup/attorney" element={<AttorneyApplication />} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />
        <Route path="/auth/client-google" element={<ClientGoogleComplete />} />
        <Route path="/account" element={<Account />} />
        <Route path="/bookings" element={<Bookings />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminEntry />} />
      <Route element={<AdminShell />}>
        <Route path="/admin/dashboard" element={<RoleRoute allow={['admin']}><AdminDashboardPage /></RoleRoute>} />
        <Route path="/admin/applications" element={<RoleRoute allow={['admin']}><AdminApplicationsPage /></RoleRoute>} />
        <Route path="/admin/applications/:id" element={<RoleRoute allow={['admin']}><AdminApplicationDetailPage /></RoleRoute>} />
        <Route path="/admin/attorneys" element={<RoleRoute allow={['admin']}><AdminAttorneysPage /></RoleRoute>} />
        <Route path="/admin/bookings" element={<RoleRoute allow={['admin']}><AdminBookingsPage /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute allow={['admin']}><AdminUsersPage /></RoleRoute>} />
      </Route>
    </Route>

    {/* Dev-only design-system verification gallery — new Design System v2
        accent (tokens.css), not the legacy re-pin. */}
    <Route path="/dev/primitives" element={<PrimitiveGallery />} />

    {/* Stub routes reserved for future units — placeholders only. */}
    <Route path="/book/:slug" element={<div>Coming soon</div>} />
    <Route path="/manage/:token" element={<div>Coming soon</div>} />
  </>
);
