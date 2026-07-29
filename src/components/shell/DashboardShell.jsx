import { useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Settings as SettingsIcon, ChevronDown, Sun, Moon } from 'lucide-react';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { useAuth } from '@/lib/AuthContext';
import { useThemeOverride } from '@/lib/useThemeOverride';

const LOGO = { light: '/brand/logo-light.png', dark: '/brand/logo-dark.png' };

// `theme="tokens"` opts a caller into tokens.css (light/dark aware) --
// used by both AttorneyShell and AdminShell now that admin's own pages
// are DS v2-retrofitted. `theme="legacy"` is unused by any live caller as
// of this change (kept only so an old integration doesn't silently break)
// and keeps rendering the original wide labeled sidebar.
//
// `accent` is deliberately NOT a bare `var(--accent)` reference in the
// tokens theme: the whole attorney route tree (src/routes/attorney.jsx)
// is wrapped in LegacyAccentScope, which re-pins --accent to a bare HSL
// triplet ("215 87% 40%", meant for hsl(var(--accent)) in legacy shadcn
// components) for every descendant, including this shell. Using that
// bare triplet directly as a `color`/`backgroundColor` value is invalid
// CSS and silently drops -- there is no CSS-only escape from an ancestor
// override on an inherited custom property. useThemeOverride() below
// picks tokens.css's own light/dark --accent hex directly instead.
const THEME = {
  legacy: {
    pageBg: '#F7F8FA', surfaceBg: '#FFFFFF', line: '#E5E2DC',
    text: '#111418', textMuted: '#8A8578', textFaint: '#B8B4AC',
    accent: '#0a5dc2', accentSoftBg: '#EAF2FB', hoverBg: '#F4F2EE',
    fontHuman: undefined, bodyFont: "'Poppins', ui-sans-serif, system-ui, sans-serif",
  },
  tokens: {
    pageBg: 'var(--ground)', surfaceBg: 'var(--surface)', line: 'var(--line)',
    text: 'var(--text)', textMuted: 'var(--text-3)', textFaint: 'var(--text-4)',
    accentSoftBg: 'var(--surface-sunk)', hoverBg: 'var(--surface-sunk)',
    fontHuman: 'var(--font-human)', bodyFont: 'var(--font-system)',
  },
};

// tokens.css's own --accent values (src/styles/tokens.css), duplicated
// here only because LegacyAccentScope makes the CSS variable itself
// unusable for direct color/backgroundColor assignment inside the
// attorney route tree.
const ACCENT_HEX = { light: '#6B8A5E', dark: '#8FAF80' };

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function RailItem({ item, active, c }) {
  const Icon = item.icon;
  if (item.disabled) {
    return (
      <div
        title={item.disabledNote || item.label}
        className="w-11 h-11 rounded-[var(--radius-m)] flex items-center justify-center cursor-not-allowed select-none"
        style={{ color: c.textFaint }}
      >
        <Icon className="w-5 h-5" />
      </div>
    );
  }
  return (
    <Link
      to={item.to}
      title={item.label}
      className="w-11 h-11 rounded-[var(--radius-m)] flex items-center justify-center transition-colors"
      style={{
        backgroundColor: active ? c.accentSoftBg : 'transparent',
        color: active ? c.accent : c.textMuted,
        boxShadow: active ? `inset 0 0 0 1px ${c.accent}` : 'none',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = c.hoverBg; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <Icon className="w-5 h-5" />
    </Link>
  );
}

function NavItem({ item, active, c }) {
  const Icon = item.icon;
  if (item.disabled) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-not-allowed select-none"
        style={{ color: c.textFaint }}
        title={item.disabledNote || ''}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span className="text-sm">{item.label}</span>
        {item.disabledNote && (
          <span className="ml-auto text-[10px] leading-tight text-right max-w-[90px]" style={{ color: c.textFaint }}>
            {item.disabledNote}
          </span>
        )}
      </div>
    );
  }
  return (
    <Link
      to={item.to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm"
      style={{
        backgroundColor: active ? c.accentSoftBg : 'transparent',
        color: active ? c.accent : c.text,
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = c.hoverBg; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
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
  theme = 'legacy',
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef(null);
  const { isDark, toggle } = useThemeOverride();
  const c = {
    ...(THEME[theme] || THEME.legacy),
    accent: theme === 'tokens' ? (isDark ? ACCENT_HEX.dark : ACCENT_HEX.light) : THEME.legacy.accent,
  };
  const logoSrc = theme === 'tokens' && isDark ? LOGO.dark : LOGO.light;

  const initials = getInitials(user?.full_name);
  const handleLogout = () => logout('/');

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  // `legacy` has no live caller as of this change (both AttorneyShell and
  // AdminShell now pass theme="tokens") -- kept verbatim as a fallback
  // rather than deleted, so nothing depending on it silently breaks.
  if (theme !== 'tokens') {
    return (
      <div className="min-h-screen" style={{ backgroundColor: c.pageBg, fontFamily: c.bodyFont }}>
        <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 z-30" style={{ backgroundColor: c.surfaceBg, borderRight: `1px solid ${c.line}` }}>
          <Link to={homePath} className="flex items-center gap-2 px-5 h-16" style={{ borderBottom: `1px solid ${c.line}` }}>
            <img src={logoSrc} alt="Brief" className="h-9 w-auto object-contain" />
            <span className="text-[10px] uppercase tracking-[0.12em] leading-tight" style={{ color: c.textMuted }}>
              {portalLabel}
            </span>
          </Link>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.to + item.label} item={item} active={isActive(item)} c={c} />
            ))}
          </nav>
          <div className="p-3" style={{ borderTop: `1px solid ${c.line}` }}>
            <div className="px-2 mb-2">
              <p className="text-xs font-medium truncate" style={{ color: c.text }}>{user?.full_name || user?.email}</p>
              {user?.email && user?.full_name && (
                <p className="text-[11px] truncate" style={{ color: c.textMuted }}>{user.email}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {settingsPath && (
                <button
                  onClick={() => navigate(settingsPath)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs transition-colors"
                  style={{ color: c.text }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hoverBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <SettingsIcon className="w-4 h-4" style={{ color: c.textMuted }} />
                  Settings
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs transition-colors"
                style={{ color: c.text }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <LogOut className="w-4 h-4" style={{ color: c.textMuted }} />
                Log out
              </button>
            </div>
          </div>
        </aside>
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 safe-pt" style={{ backgroundColor: c.surfaceBg, borderBottom: `1px solid ${c.line}` }}>
          <div className="flex items-center justify-between px-4 h-14">
            <Link to={homePath} className="flex items-center gap-2">
              <img src={logoSrc} alt="Brief" className="h-8 w-auto object-contain" />
              <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: c.textMuted }}>{portalLabel}</span>
            </Link>
            <div ref={triggerRef} className="relative">
              <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-1.5" aria-label="Account">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: c.accentSoftBg, color: c.accent, fontFamily: c.fontHuman }}>
                  {initials}
                </span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: c.textMuted }} />
              </button>
              <FloatingPanel open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={triggerRef} align="right" minWidth={190} theme="legacy">
                <div className="py-1" style={{ fontFamily: c.bodyFont }}>
                  <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${c.line}` }}>
                    <p className="text-sm truncate" style={{ color: c.text }}>{user?.full_name || user?.email}</p>
                    {user?.email && user?.full_name && <p className="text-[11px] truncate" style={{ color: c.textMuted }}>{user.email}</p>}
                  </div>
                  {settingsPath && (
                    <button onClick={() => { setMenuOpen(false); navigate(settingsPath); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: c.text }}>
                      <SettingsIcon className="w-4 h-4" style={{ color: c.textMuted }} /> Settings
                    </button>
                  )}
                  <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: c.text, borderTop: `1px solid ${c.line}` }}>
                    <LogOut className="w-4 h-4" style={{ color: c.textMuted }} /> Log out
                  </button>
                </div>
              </FloatingPanel>
            </div>
          </div>
        </header>
        <div className="lg:pl-60">
          <div className="lg:min-h-screen pt-14 lg:pt-0 pb-16 lg:pb-0">
            {loading ? (
              <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: c.accent }} /></div>
            ) : (
              <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-6 lg:py-10"><Outlet /></div>
            )}
          </div>
        </div>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30" style={{ backgroundColor: c.surfaceBg, borderTop: `1px solid ${c.line}`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex items-stretch justify-around h-14">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = !item.disabled && isActive(item);
              if (item.disabled) {
                return (
                  <div key={item.to + item.label} className="flex-1 flex flex-col items-center justify-center gap-0.5" style={{ color: c.textFaint }} title={item.disabledNote || ''}>
                    <Icon className="w-5 h-5" />
                    <span className="text-[9px] leading-none truncate max-w-full px-1">{item.label}</span>
                  </div>
                );
              }
              return (
                <Link key={item.to + item.label} to={item.to} className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors" style={{ color: active ? c.accent : c.textMuted }}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] leading-none truncate max-w-full px-1" style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen ds-portal-bg" style={{ backgroundColor: c.pageBg, fontFamily: c.bodyFont }}>
      {/* Desktop icon rail */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-20 z-30" style={{ backgroundColor: c.surfaceBg, borderRight: `1px solid ${c.line}` }}>
        <Link to={homePath} className="flex items-center justify-center h-20" style={{ borderBottom: `1px solid ${c.line}` }} title="Brief">
          <img src={logoSrc} alt="Brief" className="h-9 w-auto object-contain" />
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-2 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <RailItem key={item.to + item.label} item={item} active={isActive(item)} c={c} />
          ))}
        </nav>

        <div className="py-4 flex flex-col items-center gap-2">
          <button
            onClick={toggle}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            className="w-11 h-11 rounded-[var(--radius-m)] flex items-center justify-center transition-colors"
            style={{ color: c.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-11 h-11 rounded-[var(--radius-m)] flex items-center justify-center transition-colors"
            style={{ color: c.textMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 safe-pt" style={{ backgroundColor: c.surfaceBg, borderBottom: `1px solid ${c.line}` }}>
        <div className="flex items-center justify-between px-4 h-14">
          <Link to={homePath} className="flex items-center gap-2">
            <img src={logoSrc} alt="Brief" className="h-8 w-auto object-contain" />
            <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: c.textMuted }}>
              {portalLabel}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-[var(--radius-s)] flex items-center justify-center transition-colors"
              style={{ color: c.textMuted }}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div ref={triggerRef} className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-1.5"
                aria-label="Account"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: c.accentSoftBg, color: c.accent, fontFamily: c.fontHuman }}
                >
                  {initials}
                </span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: c.textMuted }} />
              </button>
              <FloatingPanel open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={triggerRef} align="right" minWidth={190} theme="tokens">
                {/* Rendered via a portal straight to document.body, so it sits
                    outside this component's DOM tree -- fontFamily on the
                    shell's own root div won't inherit down to it. Set it
                    explicitly here instead. */}
                <div className="py-1" style={{ fontFamily: c.bodyFont }}>
                  <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${c.line}` }}>
                    <p className="text-sm truncate" style={{ color: c.text }}>{user?.full_name || user?.email}</p>
                    {user?.email && user?.full_name && (
                      <p className="text-[11px] truncate" style={{ color: c.textMuted }}>{user.email}</p>
                    )}
                  </div>
                  {settingsPath && (
                    <button
                      onClick={() => { setMenuOpen(false); navigate(settingsPath); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: c.text }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hoverBg; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <SettingsIcon className="w-4 h-4" style={{ color: c.textMuted }} /> Settings
                    </button>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: c.text, borderTop: `1px solid ${c.line}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hoverBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <LogOut className="w-4 h-4" style={{ color: c.textMuted }} /> Log out
                  </button>
                </div>
              </FloatingPanel>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="lg:pl-20 relative z-10">
        <div className="lg:min-h-screen pt-14 lg:pt-0 pb-16 lg:pb-0">
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: c.accent }} />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-6 lg:py-8">
              <Outlet />
            </div>
          )}
        </div>
      </div>

      {/* Mobile / tablet bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30"
        style={{ backgroundColor: c.surfaceBg, borderTop: `1px solid ${c.line}`, paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = !item.disabled && isActive(item);
            if (item.disabled) {
              return (
                <div
                  key={item.to + item.label}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5"
                  style={{ color: c.textFaint }}
                  title={item.disabledNote || ''}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] leading-none truncate max-w-full px-1">{item.label}</span>
                </div>
              );
            }
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
                style={{ color: active ? c.accent : c.textMuted }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] leading-none truncate max-w-full px-1" style={{ fontWeight: active ? 600 : 400 }}>
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
