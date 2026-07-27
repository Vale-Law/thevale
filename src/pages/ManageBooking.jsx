import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, TimeSlot } from '@/components/primitives';
import MinimalFooter from '@/components/layout/MinimalFooter';
import { Loader2, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';

// Self-service reschedule/cancel/confirm — no login, no raw booking IDs in
// the URL. GET /api/manage is a read-only lookup (safe for email
// link-preview crawlers to prefetch); the actual mutation only happens on
// the POST triggered by the button below.
export default function ManageBooking() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, valid: false, purpose: null, booking: null, slots: [] });
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/manage?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => setState({ loading: false, ...data }))
      .catch(() => setState({ loading: false, valid: false }));
  }, [token]);

  const days = useMemo(() => {
    if (!state.slots?.length) return [];
    const byDay = new Map();
    for (const s of state.slots) {
      const key = new Date(s.start).toDateString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(s);
    }
    return Array.from(byDay.entries());
  }, [state.slots]);

  const act = async (extra) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      setDone(data);
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (state.loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
      </Shell>
    );
  }

  if (!state.valid) {
    return (
      <Shell>
        <div className="max-w-[520px] mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-human)' }}>This link has expired or was already used.</h1>
          <p className="text-sm text-[var(--text-3)] ds-type-body-m">If you still need to change your appointment, contact the office directly.</p>
        </div>
      </Shell>
    );
  }

  const b = state.booking;
  const when = b?.slot_start ? `${new Date(b.slot_start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${new Date(b.slot_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : '—';

  if (done) {
    return (
      <Shell>
        <div className="max-w-[520px] mx-auto px-6 py-24 text-center">
          <CheckCircle2 className="w-12 h-12 text-[var(--accent)] mx-auto mb-6" />
          <h1 className="text-2xl text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-human)' }}>
            {state.purpose === 'confirm' && 'Your appointment is confirmed.'}
            {state.purpose === 'cancel' && 'Your appointment has been cancelled.'}
            {state.purpose === 'reschedule' && 'Your appointment has been moved.'}
          </h1>
          <p className="text-sm text-[var(--text-3)] ds-type-body-m">A confirmation has been sent to your email.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-[560px] mx-auto px-6 py-16">
        <Card tone="raised" className="mb-6">
          <p className="ds-type-label text-[var(--text-3)] mb-2">Your appointment</p>
          <p className="text-xl text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-human)' }}>{b?.attorney_name}</p>
          <p className="text-sm text-[var(--text-3)] ds-type-body-m flex items-center gap-1.5"><CalendarClock className="w-4 h-4" /> {when}</p>
        </Card>

        {error && <p className="text-sm text-[var(--noshow)] ds-type-body-m mb-4">{error}</p>}

        {state.purpose === 'confirm' && (
          <Button variant="primary" className="w-full" disabled={busy} onClick={() => act({})}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirm my appointment
          </Button>
        )}

        {state.purpose === 'cancel' && (
          <Button variant="destructive" className="w-full" disabled={busy} onClick={() => act({})}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Cancel this appointment
          </Button>
        )}

        {state.purpose === 'reschedule' && (
          <div>
            <p className="text-sm text-[var(--text)] ds-type-body-m mb-4">Pick a new time:</p>
            {days.length === 0 ? (
              <p className="text-sm text-[var(--text-3)] ds-type-body-m">No open times right now.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {days.map(([dayKey, slots]) => (
                  <div key={dayKey}>
                    <p className="ds-type-label text-[var(--text-3)] mb-2">{new Date(slots[0].start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((s) => (
                        <TimeSlot key={s.start} selected={selected?.start === s.start} onClick={() => setSelected(s)}>
                          {new Date(s.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </TimeSlot>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="primary"
              className="w-full"
              disabled={busy || !selected}
              onClick={() => act({ slotStart: selected.start, slotEnd: selected.end })}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Move my appointment
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <div className="flex-1">{children}</div>
      <MinimalFooter />
    </div>
  );
}
