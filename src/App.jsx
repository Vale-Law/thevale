import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { OnboardingProvider } from './lib/onboardingContext';
import { LanguageProvider } from './lib/i18n';
import OnboardingModal from './components/onboarding/OnboardingModal';

import Home from './pages/Home';
import AttorneyProfile from './pages/AttorneyProfile';
import Booking from './pages/Booking';
import Confirmation from './pages/Confirmation';
import Financing from './pages/Financing';
import ForAttorneys from './pages/ForAttorneys';
import AreasOfHelp from './pages/AreasOfHelp';
import LearnIndex from './pages/LearnIndex';
import LearnImmigration from './pages/LearnImmigration';
import LearnPersonalInjury from './pages/LearnPersonalInjury';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SignupRole from './pages/SignupRole';
import AttorneyApplication from './pages/AttorneyApplication';
import AuthRedirect from './pages/AuthRedirect';
import ClientGoogleComplete from './pages/ClientGoogleComplete';
import Account from './pages/Account';
import Bookings from './pages/Bookings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

import ClientShell from '@/components/shell/ClientShell';
import AttorneyShell from '@/components/shell/AttorneyShell';
import AdminShell from '@/components/shell/AdminShell';
import RoleRoute from '@/components/shell/RoleRoute';

import AttorneyDashboardPage from '@/pages/attorney/AttorneyDashboard';
import AttorneyPendingPage from '@/pages/attorney/AttorneyPending';
import AttorneyBookingsPage from '@/pages/attorney/AttorneyBookings';
import AttorneyAvailabilityPage from '@/pages/attorney/AttorneyAvailability';
import AttorneyProfilePage from '@/pages/attorney/AttorneyProfile';

import AdminEntry from '@/pages/admin/AdminEntry';
import AdminDashboardPage from '@/pages/admin/AdminDashboard';
import AdminApplicationsPage from '@/pages/admin/AdminApplications';
import AdminApplicationDetailPage from '@/pages/admin/AdminApplicationDetail';
import AdminAttorneysPage from '@/pages/admin/AdminAttorneys';
import AdminBookingsPage from '@/pages/admin/AdminBookings';
import AdminUsersPage from '@/pages/admin/AdminUsers';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAF9F7]">
        <div className="w-6 h-6 border-2 border-[#E5E2DC] border-t-[#111418] rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
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

      {/* Attorney dashboard routes */}
      <Route element={<AttorneyShell />}>
        <Route path="/attorney-dashboard" element={<RoleRoute allow={['attorney']} requireVerified><AttorneyDashboardPage /></RoleRoute>} />
        <Route path="/attorney-pending" element={<RoleRoute allow={['attorney']} requirePending><AttorneyPendingPage /></RoleRoute>} />
        <Route path="/attorney/bookings" element={<RoleRoute allow={['attorney']} requireVerified><AttorneyBookingsPage /></RoleRoute>} />
        <Route path="/attorney/availability" element={<RoleRoute allow={['attorney']} requireVerified><AttorneyAvailabilityPage /></RoleRoute>} />
        <Route path="/attorney/profile" element={<RoleRoute allow={['attorney']}><AttorneyProfilePage /></RoleRoute>} />
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

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <LanguageProvider>
            <OnboardingProvider>
              <AuthenticatedApp />
              <OnboardingModal />
            </OnboardingProvider>
          </LanguageProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;