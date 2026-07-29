import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { format } from 'date-fns';
import { Loader2, MessageSquarePlus, Copy, Check } from 'lucide-react';
import { Button, Card, StatusDot } from '@/components/primitives';

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

// Feedback is only meaningful once a consultation reached a terminal
// state -- same gate api/feedback-link.js enforces server-side.
const FEEDBACK_ELIGIBLE = ['completed', 'no_show'];

function slotOf(b) {
  return b.slot_start || b.slot;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  // Feedback-link minting state, keyed by booking id.
  const [linkBusy, setLinkBusy] = useState('');
  const [links, setLinks] = useState({});
  const [linkError, setLinkError] = useState({});
  const [copied, setCopied] = useState('');

  const requestFeedback = async (booking) => {
    setLinkBusy(booking.id);
    setLinkError(prev => ({ ...prev, [booking.id]: '' }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/feedback-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLinkError(prev => ({ ...prev, [booking.id]: body.error || 'Could not create a feedback link.' }));
        return;
      }
      setLinks(prev => ({ ...prev, [booking.id]: body.url }));
    } catch {
      setLinkError(prev => ({ ...prev, [booking.id]: 'Could not create a feedback link.' }));
    } finally {
      setLinkBusy('');
    }
  };

  const copyLink = async (bookingId) => {
    try {
      await navigator.clipboard.writeText(links[bookingId]);
      setCopied(bookingId);
      setTimeout(() => setCopied(c => (c === bookingId ? '' : c)), 2000);
    } catch {
      // Clipboard unavailable (insecure context / denied permission) --
      // the link is already on screen and selectable, so this is not fatal.
    }
  };

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
            <div key={b.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
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
                <div className="flex items-center gap-3">
                  {FEEDBACK_ELIGIBLE.includes(b.status) && !links[b.id] && (
                    <Button
                      variant="secondary"
                      size="compact"
                      onClick={() => requestFeedback(b)}
                      disabled={linkBusy === b.id}
                      className="text-xs"
                    >
                      {linkBusy === b.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <MessageSquarePlus className="w-3.5 h-3.5" />}
                      Request feedback
                    </Button>
                  )}
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
              </div>

              {links[b.id] && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-s)] bg-[var(--surface-sunk)] px-3 py-2">
                  <span className="ds-type-label text-[var(--text-3)]">Feedback link</span>
                  <code className="text-xs text-[var(--text)] break-all min-w-0 flex-1">{links[b.id]}</code>
                  <Button variant="ghost" size="compact" onClick={() => copyLink(b.id)} className="text-xs">
                    {copied === b.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === b.id ? 'Copied' : 'Copy'}
                  </Button>
                  <span className="w-full text-xs text-[var(--text-3)] ds-type-body-m">
                    Single-use, expires in 30 days. Send this to {b.client_email || 'the client'}.
                  </span>
                </div>
              )}
              {linkError[b.id] && (
                <p className="mt-2 text-xs ds-type-body-m" style={{ color: 'var(--noshow)' }}>{linkError[b.id]}</p>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
