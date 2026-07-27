import { Outlet } from 'react-router-dom';
import './legacy-accent-scope.css';

/**
 * Layout-only route wrapper. Re-pins --accent back to the legacy HSL
 * triplet (src/index.css) for every route nested under it, so the
 * pre-existing shadcn-style components (src/components/ui/**, which
 * consume --accent via hsl(var(--accent))) keep resolving a valid color
 * once src/styles/tokens.css's hex --accent becomes the :root default.
 *
 * See legacy-accent-scope.css for the full cascade explanation. Only
 * wrap existing/legacy route trees with this -- new routes (the
 * primitive gallery, the /book and /manage stubs) must NOT be nested
 * under it, so they get the Design System v2 accent directly from :root.
 */
export default function LegacyAccentScope() {
  return (
    <div className="legacy-accent-scope">
      <Outlet />
    </div>
  );
}
