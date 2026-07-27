import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
        <div className="flex items-center justify-center py-32"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>
      </Shell>
    );
  }

  if (!state.valid) {
    return (
      <Shell>
        <div className="max-w-[520px] mx-auto px-6 py-24 text-center">
          <h1 className="font-serif text-2xl text-[#111418] mb-3">This link has expired or was already used.</h1>
          <p className="text-sm text-[#8A8578] font-body">If you still need to change your appointment, contact the office directly.</p>
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
          <CheckCircle2 className="w-12 h-12 text-[#0a5dc2] mx-auto mb-6" />
          <h1 className="font-serif text-2xl text-[#111418] mb-2">
            {state.purpose === 'confirm' && 'Your appointment is confirmed.'}
            {state.purpose === 'cancel' && 'Your appointment has been cancelled.'}
            {state.purpose === 'reschedule' && 'Your appointment has been moved.'}
          </h1>
          <p className="text-sm text-[#8A8578] font-body">A confirmation has been sent to your email.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-[560px] mx-auto px-6 py-16">
        <div className="bg-white border border-[#E5E2DC] p-6 mb-6">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-2">Your appointment</p>
          <p className="font-serif text-xl text-[#111418] mb-1">{b?.attorney_name}</p>
          <p className="text-sm text-[#8A8578] font-body flex items-center gap-1.5"><CalendarClock className="w-4 h-4" /> {when}</p>
        </div>

        {error && <p className="text-sm text-red-600 font-body mb-4">{error}</p>}

        {state.purpose === 'confirm' && (
          <button onClick={() => act({})} disabled={busy} className="w-full py-3.5 bg-[#111418] text-white text-sm font-body hover:bg-[#0a5dc2] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirm my appointment
          </button>
        )}

        {state.purpose === 'cancel' && (
          <button onClick={() => act({})} disabled={busy} className="w-full py-3.5 border border-red-300 text-red-600 text-sm font-body hover:bg-red-50 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Cancel this appointment
          </button>
        )}

        {state.purpose === 'reschedule' && (
          <div>
            <p className="text-sm text-[#111418] font-body mb-4">Pick a new time:</p>
            {days.length === 0 ? (
              <p className="text-sm text-[#8A8578] font-body">No open times right now.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {days.map(([dayKey, slots]) => (
                  <div key={dayKey}>
                    <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">{new Date(slots[0].start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((s) => (
                        <button
                          key={s.start}
                          onClick={() => setSelected(s)}
                          className={`border py-2.5 text-sm font-body transition-colors ${selected?.start === s.start ? 'border-[#0a5dc2] text-[#0a5dc2]' : 'border-[#E5E2DC] text-[#111418] hover:border-[#0a5dc2]'}`}
                        >
                          {new Date(s.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => act({ slotStart: selected.start, slotEnd: selected.end })}
              disabled={busy || !selected}
              className="w-full py-3.5 bg-[#111418] text-white text-sm font-body hover:bg-[#0a5dc2] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Move my appointment
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
