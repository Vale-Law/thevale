import { Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarClock, CalendarCheck, UserCircle2 } from 'lucide-react';
import DashboardShell from '@/components/shell/DashboardShell';
import { useAuth } from '@/lib/AuthContext';
import { isAttorneyVerified, homeForRole } from '@/lib/roleUtils';

export default function AttorneyShell() {
  const { user, effectiveRole, attorney, isLoadingAuth } = useAuth();

  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-6 h-6 border-2 border-[#E5E2DC] border-t-[#111418] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (effectiveRole !== 'attorney') {
    return <Navigate to={homeForRole(effectiveRole, attorney)} replace />;
  }

  const verified = isAttorneyVerified(attorney);
  const homePath = verified ? '/attorney-dashboard' : '/attorney-pending';
  const lockedNote = 'Unlocks after verification';

  const navItems = [
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
      settingsPath="/attorney/profile"
    />
  );
}