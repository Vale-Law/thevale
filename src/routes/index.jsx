import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import PageNotFound from '@/lib/PageNotFound';

import publicRoutes from './public';
import attorneyRoutes from './attorney';

/**
 * Root router, extracted byte-for-byte out of the old src/App.jsx's
 * `AuthenticatedApp` component (same loading gate, same route tree, same
 * catch-all). Composes routes/public.jsx (consumer/public/admin routes +
 * the new stub/dev routes) and routes/attorney.jsx (the attorney-portal
 * routes) into one <Routes> tree.
 *
 * public.jsx/attorney.jsx each export a JSX Fragment of <Route> elements
 * (not a component call) so react-router's <Routes> child-walker
 * (createRoutesFromChildren) can flatten them exactly as if they were
 * written inline here — Fragments are recursed into, but arbitrary
 * component elements are not.
 */
export default function AppRoutes() {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--ground)]">
        <div className="w-6 h-6 border-2 border-[var(--line-2)] border-t-[var(--text)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {publicRoutes}
      {attorneyRoutes}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
