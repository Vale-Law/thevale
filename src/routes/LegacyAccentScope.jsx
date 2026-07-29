import { Outlet } from 'react-router-dom';

/**
 * Historical layout wrapper, now a passthrough. The shadcn-style components
 * (src/components/ui/**) no longer consume --accent as an HSL triplet —
 * they read --ui-accent (see src/index.css + tailwind.config.js), so the
 * Design System v2 hex --accent from src/styles/tokens.css is safe to
 * inherit everywhere and no re-pinning is needed. Kept as a component so
 * the route trees don't need restructuring.
 */
export default function LegacyAccentScope() {
  return <Outlet />;
}
