import { Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarClock, CalendarCheck, UserCircle2 } from 'lucide-react';
import DashboardShell from '@/components/shell/DashboardShell';
import SubscriptionGate from '@/components/billing/SubscriptionGate';
import { useAuth } from '@/lib/AuthContext';
import { isAttorneyVerified, homeForRole } from '@/lib/roleUtils';

export default function AttorneyShell() {
  const { user, effectiveRole, attorney, isLoadingAuth, subscriptionStatus } = useAuth();

  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ground)]">
        <div className="w-6 h-6 border-2 border-[var(--line)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (effectiveRole !== 'attorney' && effectiveRole !== 'staff') {
    return <Navigate to={homeForRole(effectiveRole, attorney)} replace />;
  }

  // Item 4a: portal access gated on the firm's platform subscription.
  // 'active'/'trialing'/'past_due' pass through (past_due is a deliberate
  // grace period -- SubscriptionGate still shows a banner for it via
  // DashboardShell's own children, not a lockout). Anything else ('none',
  // 'incomplete', 'canceled', 'unpaid') blocks with a subscribe screen.
  if (subscriptionStatus && !['active', 'trialing', 'past_due'].includes(subscriptionStatus)) {
    return <SubscriptionGate status={subscriptionStatus} />;
  }

  // Staff have no personal attorney row and no verification state -- they
  // land straight on the firm's pipeline, same as a verified attorney, and
  // only get the two pipeline-facing nav items (Availability and Profile
  // are individual-attorney settings, out of scope for the office role).
  const isStaff = effectiveRole === 'staff';
  const verified = isStaff || isAttorneyVerified(attorney);
  const homePath = verified ? '/attorney-dashboard' : '/attorney-pending';
  const lockedNote = 'Unlocks after verification';

  const navItems = isStaff
    ? [
        { to: '/attorney-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/attorney/bookings', label: 'Bookings', icon: CalendarClock },
      ]
    : [
        { to: verified ? '/attorney-dashboard' : '/attorney-pending', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/attorney/bookings', label: 'Bookings', icon: CalendarClock, disabled: !verified, disabledNote: verified ? undefined : lockedNote },
        { to: '/attorney/availability', label: 'Availability', icon: CalendarCheck, disabled: !verified, disabledNote: verified ? undefined : lockedNote },
        { to: '/attorney/profile', label: 'Profile', icon: UserCircle2 },
      ];

  return (
    <DashboardShell
      portalLabel="Attorney Portal"
      homePath={homePath}
      navItems={navItems}
      settingsPath={isStaff ? '/attorney-dashboard' : '/attorney/profile'}
      theme="tokens"
    />
  );
}