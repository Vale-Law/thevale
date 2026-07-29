import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Card, StatusDot } from '@/components/primitives';

// Status text colors on the DS semantic tokens. declined has no dedicated
// token (same as the attorney dashboard's treatment) -- muted text.
const STATUS_COLOR = {
  pending: 'var(--pending)',
  confirmed: 'var(--confirmed)',
  completed: 'var(--completed)',
  declined: 'var(--text-3)',
  no_show: 'var(--noshow)',
  disputed: 'var(--oxblood)',
};

// All six v1.2 states (Shared Contract 2.3) -- no_show and disputed were
// missing from the old filter list entirely.
const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'declined', 'no_show', 'disputed'];

function slotOf(b) {
  return b.slot_start || b.slot;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    base44.entities.Booking.list('-created_date', 300)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const filtered = status === 'all' ? bookings : bookings.filter(b => b.status === status);

  return (
    <div>
      <div className="mb-5 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Bookings</h1>
      </div>

      <div className="flex flex-wrap gap-1 mb-5 border-b border-[var(--line)]">
        {FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2.5 text-sm ds-type-body-m capitalize transition-colors ${
              status === s
                ? 'border-b-2 border-[var(--accent)] text-[var(--text)]'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card tone="raised" className="p-10 text-center text-sm text-[var(--text-3)] ds-type-body-m">No bookings.</Card>
      ) : (
        <Card tone="raised" className="p-0 divide-y divide-[var(--line)] overflow-hidden">
          {filtered.map(b => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{b.client_name}</p>
                <p className="text-xs text-[var(--text-3)] ds-type-body-m">
                  Attorney: {b.attorney_name || '—'} · {b.client_email}
                </p>
                {slotOf(b) && (
                  <p className="text-xs text-[var(--text)] ds-type-body-m mt-0.5">
                    {format(new Date(slotOf(b)), 'EEE, MMM d · h:mm a')}
                  </p>
                )}
                {b.case_summary && (
                  <p className="text-xs text-[var(--text-3)] ds-type-body-m mt-1 line-clamp-1">{b.case_summary}</p>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5">
                <StatusDot status={b.status} className="h-1.5 w-1.5" />
                <span
                  className="text-[11px] uppercase tracking-[0.14em] ds-type-body-m"
                  style={{ color: STATUS_COLOR[b.status] || 'var(--text-3)' }}
                >
                  {(b.status || '').replace('_', ' ')}
                </span>
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
