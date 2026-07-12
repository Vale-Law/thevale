import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from './translations';
import { base44 } from '@/api/base44Client';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'brief_language';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const [languageManuallySet, setLanguageManuallySet] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch { /* ignore */ }
  }, [language]);

  // Save to user profile when they change language and are logged in
  useEffect(() => {
    if (!languageManuallySet) return;
    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        base44.auth.updateMe({ preferredLanguage: language }).catch(() => {});
      }
    });
  }, [language, languageManuallySet]);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    setLanguageManuallySet(true);
  }, []);

  const t = useCallback((key) => {
    const dict = translations[language] || translations.en;
    return dict[key] ?? translations.en[key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, languageManuallySet }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}