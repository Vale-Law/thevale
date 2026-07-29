import { useState, useEffect } from 'react';

// One logo, everywhere. Dark detection honors the dashboard shells' manual
// data-theme override (src/lib/useThemeOverride.js writes it on <html> and
// it persists across SPA navigation), falling back to prefers-color-scheme.
// The PNGs are trimmed tight to the mark; standard sizes:
//   header h-12 · footer h-10 · mobile bars h-10 · auth h-12 · portal rails h-9
const LOGO = { light: '/brand/logo-light.png', dark: '/brand/logo-dark.png' };

function readIsDark() {
  if (typeof window === 'undefined') return false;
  const override = document.documentElement.getAttribute('data-theme');
  if (override === 'dark') return true;
  if (override === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function usePrefersDark() {
  const [isDark, setIsDark] = useState(readIsDark);
  useEffect(() => {
    const update = () => setIsDark(readIsDark());
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      mql.removeEventListener('change', update);
      observer.disconnect();
    };
  }, []);
  return isDark;
}

export default function BrandLogo({ className = 'h-12 w-auto object-contain', ...rest }) {
  const isDark = usePrefersDark();
  return <img src={isDark ? LOGO.dark : LOGO.light} alt="Brief" className={className} {...rest} />;
}
