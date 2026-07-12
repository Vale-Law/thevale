import { createContext, useContext, useState, useCallback } from 'react';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');

  const openOnboarding = useCallback((url) => {
    setPendingUrl(url || '/');
    setOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setOpen(false);
    setPendingUrl('');
  }, []);

  return (
    <OnboardingContext.Provider value={{ open, pendingUrl, openOnboarding, closeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}