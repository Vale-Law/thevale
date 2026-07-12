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
import AttorneyDashboard from './pages/AttorneyDashboard';
import Financing from './pages/Financing';
import ForAttorneys from './pages/ForAttorneys';
import AreasOfHelp from './pages/AreasOfHelp';
import LearnIndex from './pages/LearnIndex';
import LearnImmigration from './pages/LearnImmigration';
import LearnPersonalInjury from './pages/LearnPersonalInjury';
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
      <Route path="/" element={<Home />} />
      <Route path="/attorney/:id" element={<AttorneyProfile />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/attorney-dashboard" element={<AttorneyDashboard />} />
      <Route path="/financing" element={<Financing />} />
      <Route path="/for-attorneys" element={<ForAttorneys />} />
      <Route path="/areas-of-help" element={<AreasOfHelp />} />
      <Route path="/learn" element={<LearnIndex />} />
      <Route path="/learn/immigration-law" element={<LearnImmigration />} />
      <Route path="/learn/personal-injury-law" element={<LearnPersonalInjury />} />
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
