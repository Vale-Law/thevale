import { Navigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardCheck, Scale, CalendarClock, Users, MessageSquare } from 'lucide-react';
import DashboardShell from '@/components/shell/DashboardShell';
import { useAuth } from '@/lib/AuthContext';
import { homeForRole } from '@/lib/roleUtils';

export default function AdminShell() {
  const { user, effectiveRole, attorney, isLoadingAuth } = useAuth();

  if (isLoadingAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ground)]">
        <div className="w-6 h-6 border-2 border-[var(--line)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (effectiveRole !== 'admin') {
    return <Navigate to={homeForRole(effectiveRole, attorney)} replace />;
  }

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/applications', label: 'Applications', icon: ClipboardCheck },
    { to: '/admin/attorneys', label: 'Attorneys', icon: Scale },
    { to: '/admin/bookings', label: 'Bookings', icon: CalendarClock },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  ];

  return (
    <DashboardShell
      portalLabel="Admin"
      homePath="/admin/dashboard"
      navItems={navItems}
      theme="tokens"
    />
  );
}