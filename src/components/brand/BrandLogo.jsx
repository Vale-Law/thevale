import { useState, useEffect } from 'react';

// One logo, everywhere. Picks the light/dark asset off prefers-color-scheme
// (the app's only theme signal — nothing writes data-theme or .dark), so
// callers stop hardcoding logo-light.png on surfaces that flip dark.
// The PNGs are trimmed tight to the mark; standard sizes:
//   header h-12 · footer h-10 · mobile bars h-10 · auth h-12 · portal rails h-9
const LOGO = { light: '/brand/logo-light.png', dark: '/brand/logo-dark.png' };

export function usePrefersDark() {
  const [prefersDark, setPrefersDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setPrefersDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return prefersDark;
}

export default function BrandLogo({ className = 'h-12 w-auto object-contain', ...rest }) {
  const prefersDark = usePrefersDark();
  return <img src={prefersDark ? LOGO.dark : LOGO.light} alt="Brief" className={className} {...rest} />;
}
