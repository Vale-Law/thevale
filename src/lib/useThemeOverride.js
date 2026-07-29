import { useState, useEffect, useCallback } from 'react';

// Manual light/dark override for the dashboard shells (attorney + admin).
// tokens.css already defines [data-theme="dark"]/[data-theme="light"]
// blocks that outrank the prefers-color-scheme media query -- nothing in
// the app has ever written that attribute before (DS v2 §16 calls for "a
// manual override available" as part of the quality floor; this closes
// that gap). Purely a visual preference: no booking data, query, or
// business logic involved.
const STORAGE_KEY = 'brief-theme-override';

function applyOverride(value) {
  if (value === 'light' || value === 'dark') {
    document.documentElement.setAttribute('data-theme', value);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function usePrefersDark() {
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

export function useThemeOverride() {
  const [override, setOverride] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const prefersDark = usePrefersDark();

  useEffect(() => { applyOverride(override); }, [override]);

  const isDark = override === 'light' ? false : override === 'dark' ? true : prefersDark;

  const toggle = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setOverride(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private-browsing storage denial, non-fatal */ }
  }, [isDark]);

  return { isDark, toggle };
}
