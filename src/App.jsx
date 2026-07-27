import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { OnboardingProvider } from './lib/onboardingContext';
import { LanguageProvider } from './lib/i18n';
import OnboardingModal from './components/onboarding/OnboardingModal';

import AppRoutes from '@/routes';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <LanguageProvider>
            <OnboardingProvider>
              <AppRoutes />
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
