import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User, CalendarClock, LogOut } from 'lucide-react';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function AccountMenu() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  if (!isAuthenticated || !user) {
    return (
      <Link to="/login" className="text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors">
        Log in
      </Link>
    );
  }

  const firstName = (user.full_name || '').split(' ')[0] || user.email;
  const initials = getInitials(user.full_name);
  const close = () => setOpen(false);
  const handleLogout = () => { close(); base44.auth.logout('/'); };

  return (
    <div ref={triggerRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors font-body"
      >
        <span className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-serif text-xs">
          {initials}
        </span>
        <span className="hidden xl:inline max-w-[120px] truncate">{firstName}</span>
        <ChevronDown
          className="w-3.5 h-3.5 opacity-60"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}
        />
      </button>

      <FloatingPanel open={open} onClose={close} triggerRef={triggerRef} align="right" minWidth={200}>
        <div className="py-1">
          <div className="px-4 py-2.5 border-b border-[var(--line-2)]">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body">{t('account.signedInAs')}</p>
            <p className="text-sm text-[var(--text)] font-body truncate">{user.full_name || user.email}</p>
          </div>
          <Link
            to="/account"
            onClick={close}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--ground)] transition-colors font-body"
          >
            <User className="w-4 h-4 text-[var(--text-3)]" /> {t('account.myAccount')}
          </Link>
          <Link
            to="/account?section=bookings"
            onClick={close}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--ground)] transition-colors font-body"
          >
            <CalendarClock className="w-4 h-4 text-[var(--text-3)]" /> {t('account.myBookings')}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--ground)] transition-colors font-body border-t border-[var(--line-2)]"
          >
            <LogOut className="w-4 h-4 text-[var(--text-3)]" /> {t('account.logout')}
          </button>
        </div>
      </FloatingPanel>
    </div>
  );
}