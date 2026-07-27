import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2, XCircle, Clock, UserX, Mail, Phone } from 'lucide-react';

const STATUSES = [
  { key: 'pending', label: 'Pending', dot: 'bg-yellow-500', text: 'text-yellow-700' },
  { key: 'confirmed', label: 'Confirmed', dot: 'bg-green-500', text: 'text-green-700' },
  { key: 'completed', label: 'Completed', dot: 'bg-blue-500', text: 'text-blue-700' },
  { key: 'no_show', label: 'No-show', dot: 'bg-red-500', text: 'text-red-700' },
];

function bookingSlot(b) {
  return b.slot_start || b.slot;
}

export default function AttorneyBookingsPage() {
  const { attorney } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [active, setActive] = useState(null);

  const load = useCallback(() => {
    if (!attorney?.id) return;
    base44.entities.Booking.filter({ attorney_id: attorney.id })
      .then((list) => setBookings(list.sort((a, b) => new Date(bookingSlot(b)) - new Date(bookingSlot(a)))))
      .finally(() => setLoading(false));
  }, [attorney?.id]);

  useEffect(() => { load(); }, [load]);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = bookings.filter((b) => b.status === s.key).length;
    return acc;
  }, {});
  counts.declined = bookings.filter((b) => b.status === 'declined').length;

  const visible = bookings.filter((b) => b.status === tab);

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Attorney Portal</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Bookings</h1>
      </div>

      {/* Status tabs — Tab, label, and count together, never color alone */}
      <div className="flex flex-wrap gap-1 mb-5 border-b border-[#E5E2DC]">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body border-b-2 -mb-px transition-colors ${tab === s.key ? 'border-[#111418] text-[#111418]' : 'border-transparent text-[#8A8578] hover:text-[#111418]'}`}
          >
            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
            {s.label}
            <span className="text-xs text-[#8A8578]">({counts[s.key] || 0})</span>
          </button>
        ))}
        {counts.declined > 0 && (
          <button
            onClick={() => setTab('declined')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body border-b-2 -mb-px transition-colors ${tab === 'declined' ? 'border-[#111418] text-[#111418]' : 'border-transparent text-[#8A8578] hover:text-[#111418]'}`}
          >
            <span className="w-2 h-2 rounded-full bg-gray-400" /> Declined <span className="text-xs text-[#8A8578]">({counts.declined})</span>
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-[#E5E2DC] p-10 text-center text-sm text-[#8A8578] font-body">
          Nothing here. Share your booking link to open the pipeline.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((b) => (
            <BookingCard key={b.id} b={b} onOpen={() => setActive(b)} />
          ))}
        </div>
      )}

      <BookingDetailPanel
        booking={active}
        onClose={() => setActive(null)}
        onChanged={(updated) => {
          setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          setActive(updated);
        }}
      />
    </div>
  );
}

function BookingCard({ b, onOpen }) {
  const statusMeta = STATUSES.find((s) => s.key === b.status);
  const slot = bookingSlot(b);
  return (
    <button onClick={onOpen} className="text-left bg-white border border-[#E5E2DC] p-4 hover:border-[#0a5dc2] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-serif text-[#111418] truncate">{b.client_name}</span>
        <span className={`flex items-center gap-1.5 text-xs font-body shrink-0 ml-2 ${statusMeta?.text || 'text-[#8A8578]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta?.dot || 'bg-gray-400'}`} />
          {statusMeta?.label || b.status}
        </span>
      </div>
      {slot && <p className="text-sm text-[#8A8578] font-body">{format(new Date(slot), 'EEE, MMM d · h:mm a')}</p>}
      {b.issue_description && <p className="text-xs text-[#8A8578] font-body mt-2 line-clamp-2 italic">"{b.issue_description}"</p>}
    </button>
  );
}

function BookingDetailPanel({ booking, onClose, onChanged }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!booking?.id) { setNotes([]); return; }
    base44.entities.StaffNote.filter({ booking_id: booking.id }).then(setNotes).catch(() => setNotes([]));
  }, [booking?.id]);

  if (!booking) return null;
  const slot = bookingSlot(booking);

  const setStatus = async (status, extra = {}) => {
    setBusy(status);
    try {
      const fields = { status, ...extra };
      if (status === 'confirmed') { fields.confirmed_at = new Date().toISOString(); fields.confirmed_by = 'staff'; }
      const updated = await base44.entities.Booking.update(booking.id, fields);
      onChanged(updated);
    } finally {
      setBusy('');
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setBusy('note');
    try {
      const note = await base44.entities.StaffNote.create({ booking_id: booking.id, body: newNote.trim() });
      setNotes((prev) => [...prev, note]);
      setNewNote('');
    } finally {
      setBusy('');
    }
  };

  return (
    <Sheet open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl text-[#111418]">{booking.client_name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-1">Status</p>
            <p className="text-sm text-[#111418] font-body capitalize">{booking.status.replace('_', '-')}</p>
          </div>

          {slot && (
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-1">Consultation</p>
              <p className="text-sm text-[#111418] font-body">{format(new Date(slot), 'EEEE, MMMM d')} at {format(new Date(slot), 'h:mm a')}</p>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-1.5">Contact</p>
            <p className="text-sm text-[#111418] font-body flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#8A8578]" /> {booking.client_email}</p>
            {booking.client_phone && <p className="text-sm text-[#111418] font-body flex items-center gap-2 mt-1"><Phone className="w-3.5 h-3.5 text-[#8A8578]" /> {booking.client_phone}</p>}
          </div>

          {booking.issue_description && (
            <div className="bg-[#EAF2FB] border-l-2 border-[#0a5dc2] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#0a5dc2] font-body mb-1">In their words — read only</p>
              <p className="text-sm text-[#111418] font-body italic">"{booking.issue_description}"</p>
            </div>
          )}
          {booking.description_purged && (
            <p className="text-xs text-[#8A8578] font-body">This client's description was removed after cancellation.</p>
          )}

          <div className="pt-4 border-t border-[#E5E2DC]">
            <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">Staff notes — only your firm sees this</p>
            <div className="space-y-2 mb-3">
              {notes.map((n) => (
                <div key={n.id} className="bg-[#FAF9F7] border border-[#E5E2DC] px-3 py-2">
                  <p className="text-sm text-[#111418] font-body">{n.body}</p>
                  <p className="text-[10px] text-[#8A8578] font-body mt-1">{format(new Date(n.created_at), 'MMM d, h:mm a')}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-xs text-[#8A8578] font-body">No notes yet.</p>}
            </div>
            <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} placeholder="Add a note for the team…" />
            <button onClick={addNote} disabled={busy === 'note' || !newNote.trim()} className="mt-2 px-4 py-2 border border-[#E5E2DC] text-sm font-body hover:border-[#0a5dc2] transition-colors disabled:opacity-40">
              {busy === 'note' ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'Add note'}
            </button>
          </div>

          <div className="pt-4 border-t border-[#E5E2DC] flex flex-wrap gap-2">
            {booking.status === 'pending' && (
              <>
                <ActionButton onClick={() => setStatus('confirmed')} busy={busy === 'confirmed'} icon={CheckCircle2} label="Confirm" />
                <ActionButton onClick={() => setStatus('declined')} busy={busy === 'declined'} icon={XCircle} label="Decline" tone="muted" />
              </>
            )}
            {booking.status === 'confirmed' && (
              <>
                <ActionButton onClick={() => setStatus('completed')} busy={busy === 'completed'} icon={Clock} label="Mark completed" />
                <ActionButton onClick={() => setStatus('no_show')} busy={busy === 'no_show'} icon={UserX} label="Mark no-show" tone="destructive" />
              </>
            )}
          </div>
          {/* No-show is only ever set by this explicit staff action — never
              inferred automatically from time passing. */}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActionButton({ onClick, busy, icon: Icon, label, tone }) {
  const toneClass = tone === 'destructive'
    ? 'border-red-300 text-red-600 hover:bg-red-50'
    : tone === 'muted'
    ? 'border-[#E5E2DC] text-[#8A8578] hover:border-red-300 hover:text-red-600'
    : 'bg-[#111418] text-white border-[#111418] hover:bg-[#0a5dc2]';
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-body transition-colors disabled:opacity-40 ${toneClass}`}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}
