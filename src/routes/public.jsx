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
import HowBriefVerifies from '@/pages/verify/HowBriefVerifies';
import ConsultationFeedback from '@/pages/feedback/ConsultationFeedback';
import AdminFeedbackPage from '@/pages/admin/AdminFeedback';
import BookingPage from '@/pages/BookingPage';
import ManageBooking from '@/pages/ManageBooking';

import LegacyAccentScope from './LegacyAccentScope';
import LawyerHome from '@/pages/LawyerHome';

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
 *  - /book/:slug and /manage/:token: the public booking page and client
 *    self-service flow. No login, no ClientShell (this is the attorney's
 *    own page, not Brief's), and outside LegacyAccentScope so it renders
 *    with Design System v2 tokens rather than the legacy accent re-pin.
 *
 * The legacy consumer routes ARE wrapped in LegacyAccentScope so the
 * shadcn-style chrome they depend on (src/components/ui/**, via
 * hsl(var(--accent))) keeps resolving the legacy accent color once
 * tokens.css's hex --accent becomes the :root default. See
 * ./legacy-accent-scope.css.
 *
 * The admin routes moved OUTSIDE LegacyAccentScope in Sprint v1.2 Track
 * B's W1.8: every admin page is now retrofitted to Design System v2
 * tokens (direct var(--accent) color usage, which the legacy HSL re-pin
 * would silently invalidate), and the admin tree imports nothing from
 * src/components/ui/** except FloatingPanel, which is accent-free --
 * verified by grep before the move. Same rule as /dev/primitives and
 * /book: DS v2 trees must not nest under the re-pin.
 */
export default (
  <>
    <Route element={<LegacyAccentScope />}>
      {/* Public legal pages — no login required */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Client + public/auth routes (marketing shell) */}
      <Route element={<ClientShell />}>
        {/* Root = lawyer-focused landing (Brief as the booking platform
            for practices); the client marketplace that used to live here
            moved to /bookings. The client's own appointments page moved
            from /bookings to /my-bookings to free the path. */}
        <Route path="/" element={<LawyerHome />} />
        <Route path="/bookings" element={<Home />} />
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
        <Route path="/my-bookings" element={<Bookings />} />
      </Route>

    </Route>

    {/* Admin routes — Design System v2 (tokens.css) end to end since the
        W1 retrofit, so they sit outside LegacyAccentScope on purpose. */}
    <Route path="/admin" element={<AdminEntry />} />
    <Route element={<AdminShell />}>
      <Route path="/admin/dashboard" element={<RoleRoute allow={['admin']}><AdminDashboardPage /></RoleRoute>} />
      <Route path="/admin/applications" element={<RoleRoute allow={['admin']}><AdminApplicationsPage /></RoleRoute>} />
      <Route path="/admin/applications/:id" element={<RoleRoute allow={['admin']}><AdminApplicationDetailPage /></RoleRoute>} />
      <Route path="/admin/attorneys" element={<RoleRoute allow={['admin']}><AdminAttorneysPage /></RoleRoute>} />
      <Route path="/admin/bookings" element={<RoleRoute allow={['admin']}><AdminBookingsPage /></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute allow={['admin']}><AdminUsersPage /></RoleRoute>} />
      <Route path="/admin/feedback" element={<RoleRoute allow={['admin']}><AdminFeedbackPage /></RoleRoute>} />
    </Route>

    {/* Public "How Brief Verifies" trust page (F-05, Sprint v1.2 Track B
        W2.2) — Design System v2 tokens, outside LegacyAccentScope. */}
    <Route path="/verify" element={<HowBriefVerifies />} />

    {/* Token-authenticated internal feedback form (F-03, Track B W3) — no
        login, DS v2 tokens, outside LegacyAccentScope. */}
    <Route path="/feedback/:token" element={<ConsultationFeedback />} />

    {/* Dev-only design-system verification gallery — new Design System v2
        accent (tokens.css), not the legacy re-pin. */}
    <Route path="/dev/primitives" element={<PrimitiveGallery />} />

    {/* Public attorney booking page + client self-service — no login,
        no ClientShell, no LegacyAccentScope (attorney's own page, not
        Brief's; renders with Design System v2 tokens directly). */}
    <Route path="/book/:slug" element={<BookingPage />} />
    <Route path="/manage/:token" element={<ManageBooking />} />
  </>
);
