import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

const STROKE = {
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function ArchIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 21V11a7 7 0 0 1 14 0v10"
        stroke="currentColor"
        fill={active ? 'currentColor' : 'none'}
        {...STROKE}
      />
    </svg>
  );
}

function CompassIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" strokeWidth="1.5" opacity="0.4" />
      <path
        d="M16 8L14 14L8 16L10 10Z"
        stroke="currentColor"
        fill={active ? 'currentColor' : 'none'}
        {...STROKE}
      />
    </svg>
  );
}

function CalendarIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="7" width="16" height="13" rx="3.5" stroke="currentColor" fill="none" {...STROKE} />
      <path d="M8.5 4v3.5M15.5 4v3.5" stroke="currentColor" fill="none" {...STROKE} />
      <circle cx="12" cy="13.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

function AvatarIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" fill={active ? 'currentColor' : 'none'} {...STROKE} />
      <circle cx="12" cy="10.5" r="3.2" stroke="currentColor" fill={active ? '#ffffff' : 'none'} {...STROKE} />
    </svg>
  );
}

const ICONS = { home: ArchIcon, browse: CompassIcon, bookings: CalendarIcon, account: AvatarIcon };

export default function MobileTabBar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const loc = useLocation();
  const reduced = useReducedMotion();
  const params = new URLSearchParams(loc.search);
  const isBrowse = params.get('browse') === '1';

  const tabs = [
    {
      key: 'home',
      label: t('tab.home'),
      active: loc.pathname === '/' && !isBrowse,
      onClick: () => navigate('/'),
    },
    {
      key: 'browse',
      label: t('tab.explore'),
      active: loc.pathname === '/areas-of-help',
      onClick: () => navigate('/areas-of-help'),
    },
    {
      key: 'bookings',
      label: t('tab.upcoming'),
      active: loc.pathname === '/bookings',
      onClick: () => navigate('/bookings'),
    },
    {
      key: 'account',
      label: t('tab.you'),
      active: loc.pathname === '/account',
      onClick: () => navigate('/account'),
    },
  ];

  const spring = reduced ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38, mass: 0.7 };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[1100] bg-[var(--surface)] rounded-t-2xl border-t border-[var(--line-2)] shadow-[0_-2px_12px_rgba(17,20,24,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around h-[60px]">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.key];
          const active = tab.active;
          return (
            <motion.button
              key={tab.key}
              type="button"
              onClick={tab.onClick}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] py-1"
              style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}
            >
              {active && (
                <motion.span
                  layoutId="tabIndicator"
                  className="absolute top-0 left-0 right-0 mx-auto h-[3px] w-6 rounded-full bg-[var(--accent)]"
                  transition={spring}
                />
              )}
              <motion.div
                animate={{ scale: active && !reduced ? 1.1 : 1 }}
                whileTap={reduced ? undefined : { scale: 0.85 }}
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Icon active={active} />
              </motion.div>
              <span
                className="text-[10px] font-body leading-none"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text-3)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}