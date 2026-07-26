import { useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { useAuth } from '@/lib/AuthContext';

const LOGO = 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/03090a7d8_A685878D-8D1E-4B4E-BD14-35608619A7D7.PNG';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  if (item.disabled) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#B8B4AC] cursor-not-allowed select-none"
        title={item.disabledNote || ''}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span className="text-sm font-body">{item.label}</span>
        {item.disabledNote && (
          <span className="ml-auto text-[10px] text-[#B8B4AC] font-body leading-tight text-right max-w-[90px]">
            {item.disabledNote}
          </span>
        )}
      </div>
    );
  }
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-body text-sm ${
        active
          ? 'bg-[#EAF2FB] text-[#0a5dc2] font-medium'
          : 'text-[#111418] hover:bg-[#F4F2EE]'
      }`}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export default function DashboardShell({
  portalLabel,
  homePath,
  navItems,
  settingsPath,
  loading = false,
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef(null);

  const initials = getInitials(user?.full_name);
  const handleLogout = () => logout('/');

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-[#E5E2DC] z-30">
        <Link to={homePath} className="flex items-center gap-2 px-5 h-16 border-b border-[#E5E2DC]">
          <img src={LOGO} alt="Brief" className="h-9 w-auto object-contain" />
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body leading-tight">
            {portalLabel}
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.to + item.label} item={item} active={isActive(item)} />
          ))}
        </nav>

        <div className="border-t border-[#E5E2DC] p-3">
          <div className="px-2 mb-2">
            <p className="text-xs text-[#111418] font-body font-medium truncate">
              {user?.full_name || user?.email}
            </p>
            {user?.email && user?.full_name && (
              <p className="text-[11px] text-[#8A8578] font-body truncate">{user.email}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {settingsPath && (
              <button
                onClick={() => navigate(settingsPath)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs text-[#111418] hover:bg-[#F4F2EE] font-body transition-colors"
              >
                <SettingsIcon className="w-4 h-4 text-[#8A8578]" />
                Settings
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs text-[#111418] hover:bg-[#F4F2EE] font-body transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#8A8578]" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#E5E2DC] safe-pt">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to={homePath} className="flex items-center gap-2">
            <img src={LOGO} alt="Brief" className="h-8 w-auto object-contain" />
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body">
              {portalLabel}
            </span>
          </Link>
          <div ref={triggerRef} className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-1.5"
              aria-label="Account"
            >
              <span className="w-8 h-8 rounded-full bg-[#EAF2FB] text-[#0a5dc2] flex items-center justify-center font-serif text-xs">
                {initials}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8A8578]" />
            </button>
            <FloatingPanel open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={triggerRef} align="right" minWidth={190}>
              <div className="py-1">
                <div className="px-4 py-2.5 border-b border-[#E5E2DC]">
                  <p className="text-sm text-[#111418] font-body truncate">{user?.full_name || user?.email}</p>
                  {user?.email && user?.full_name && (
                    <p className="text-[11px] text-[#8A8578] font-body truncate">{user.email}</p>
                  )}
                </div>
                {settingsPath && (
                  <button
                    onClick={() => { setMenuOpen(false); navigate(settingsPath); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] hover:bg-[#FAF9F7] font-body transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-[#8A8578]" /> Settings
                  </button>
                )}
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#111418] hover:bg-[#FAF9F7] font-body transition-colors border-t border-[#E5E2DC]"
                >
                  <LogOut className="w-4 h-4 text-[#8A8578]" /> Log out
                </button>
              </div>
            </FloatingPanel>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="lg:pl-60">
        <div className="lg:min-h-screen pt-14 lg:pt-0 pb-16 lg:pb-0">
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-6 lg:py-10">
              <Outlet />
            </div>
          )}
        </div>
      </div>

      {/* Mobile / tablet bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E2DC]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = !item.disabled && isActive(item);
            if (item.disabled) {
              return (
                <div
                  key={item.to + item.label}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#B8B4AC]"
                  title={item.disabledNote || ''}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-body leading-none truncate max-w-full px-1">{item.label}</span>
                </div>
              );
            }
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
                style={{ color: active ? '#0a5dc2' : '#8A8578' }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-body leading-none truncate max-w-full px-1" style={{ fontWeight: active ? 600 : 400 }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}