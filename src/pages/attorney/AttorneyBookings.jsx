import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

const urgencyColors = { Urgent: 'text-red-600', Soon: 'text-yellow-600', 'Just exploring': 'text-green-600' };
const statusColors = { pending: 'text-yellow-600', confirmed: 'text-green-600', completed: 'text-blue-600', declined: 'text-red-600' };

export default function AttorneyBookingsPage() {
  const { attorney } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!attorney?.id) return;
    base44.entities.Booking.filter({ attorney_id: attorney.id })
      .then(list => setBookings(list.sort((a, b) => new Date(b.slot) - new Date(a.slot))))
      .finally(() => setLoading(false));
  }, [attorney?.id]);

  const act = async (id, status) => {
    setBusy(id + status);
    try {
      await base44.entities.Booking.update(id, { status });
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    } finally {
      setBusy('');
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.slot) >= now && b.status !== 'declined');
  const past = bookings.filter(b => new Date(b.slot) < now || b.status === 'declined');

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Attorney Portal</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Bookings</h1>
      </div>

      <Section title={`Upcoming (${upcoming.length})`}>
        {upcoming.length === 0 ? (
          <Empty text="No upcoming consultations." />
        ) : upcoming.map(b => (
          <BookingCard key={b.id} b={b} busy={busy} onAct={act} />
        ))}
      </Section>

      <div className="mt-8">
        <Section title={`Past (${past.length})`}>
          {past.length === 0 ? (
            <Empty text="No past consultations." />
          ) : past.map(b => (
            <BookingCard key={b.id} b={b} busy={busy} onAct={act} readonly />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-serif text-lg text-[#111418] mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="bg-white border border-[#E5E2DC] p-8 text-center text-sm text-[#8A8578] font-body">{text}</div>;
}

function BookingCard({ b, busy, onAct, readonly }) {
  return (
    <div className="bg-white border border-[#E5E2DC] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          {b.case_summary && (
            <div className="mb-2 bg-[#EAF2FB] border-l-2 border-[#0a5dc2] px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#0a5dc2] font-body mb-0.5">Case Summary</p>
              <p className="text-sm text-[#111418] font-body">{b.case_summary}</p>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-serif text-lg text-[#111418]">{b.client_name}</span>
            <span className={`text-xs uppercase tracking-[0.08em] font-body ${statusColors[b.status] || ''}`}>{b.status}</span>
            {b.urgency && <span className={`text-xs font-body ${urgencyColors[b.urgency] || ''}`}>{b.urgency}</span>}
          </div>
          <p className="text-sm text-[#8A8578] font-body">{b.client_email}{b.client_phone ? ` · ${b.client_phone}` : ''}</p>
          {b.slot && (
            <p className="text-sm text-[#111418] font-body">
              {format(new Date(b.slot), 'EEEE, MMMM d')} at {format(new Date(b.slot), 'h:mm a')}
            </p>
          )}
          <p className="text-xs text-[#8A8578] font-body capitalize">Payment: {b.payment_method}</p>
          {b.issue_description && (
            <p className="text-sm text-[#8A8578] mt-2 font-body italic">"{b.issue_description}"</p>
          )}
        </div>
        {!readonly && b.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onAct(b.id, 'confirmed')}
              disabled={!!busy}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#111418] text-white text-xs font-body hover:bg-[#0a5dc2] transition-colors disabled:opacity-40"
            >
              {busy === b.id + 'confirmed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Confirm
            </button>
            <button
              onClick={() => onAct(b.id, 'declined')}
              disabled={!!busy}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E2DC] text-[#8A8578] text-xs font-body hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              {busy === b.id + 'declined' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Decline
            </button>
          </div>
        )}
        {readonly && b.status === 'completed' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-body"><Clock className="w-3.5 h-3.5" /> Completed</span>
        )}
      </div>
    </div>
  );
}