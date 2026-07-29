import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// Date + user header card (Base44 export's DashboardTopBar, restyled onto
// DS v2 tokens). Reads only the already-loaded auth user -- no new query.
export default function PortalTopBar() {
  const { user } = useAuth();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--pending)' }} />
        <p className="ds-type-label text-[var(--text)] normal-case tracking-[0.08em]">{today.toUpperCase()}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-[var(--text)] leading-tight" style={{ fontFamily: 'var(--font-human)' }}>{user?.full_name || 'Attorney'}</p>
          <p className="text-[11px] text-[var(--text-3)] leading-tight">{user?.email}</p>
        </div>
        <span
          className="w-9 h-9 rounded-[var(--radius-full)] flex items-center justify-center text-xs shrink-0"
          style={{ backgroundColor: 'var(--surface-sunk)', color: 'var(--accent)' }}
        >
          {initials(user?.full_name)}
        </span>
      </div>
    </div>
  );
}
