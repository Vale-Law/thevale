import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button, Card, Field, Tab, StatusDot } from '@/components/primitives';
import { Loader2, CheckCircle2, XCircle, Clock, UserX, Mail, Phone } from 'lucide-react';

const STATUSES = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'no_show', label: 'No-show' },
];

function bookingSlot(b) {
  return b.slot_start || b.slot;
}

export default function AttorneyBookingsPage() {
  const { user, firmAttorneyIds } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [active, setActive] = useState(null);
  const cardRefs = useRef([]);

  // Firm-wide, not just this login's own attorney row -- an office manager
  // or a firm's second attorney both need to see every booking the firm
  // takes, matching the firm_members-scoped RLS already on `bookings`.
  const load = useCallback(async () => {
    if (!firmAttorneyIds?.length) { setLoading(false); return; }
    try {
      const { data, error } = await supabase.from('bookings').select('*').in('attorney_id', firmAttorneyIds);
      if (error) throw error;
      setBookings((data || []).sort((a, b) => new Date(bookingSlot(b)) - new Date(bookingSlot(a))));
    } finally {
      setLoading(false);
    }
  }, [firmAttorneyIds]);

  useEffect(() => { load(); }, [load]);

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = bookings.filter((b) => b.status === s.key).length;
    return acc;
  }, {});
  counts.declined = bookings.filter((b) => b.status === 'declined').length;

  const visible = bookings.filter((b) => b.status === tab);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, visible.length);
  }, [visible.length]);

  const handleCardKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      cardRefs.current[idx + 1]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      cardRefs.current[idx - 1]?.focus();
    }
    // Enter/Space open the card natively (it's a <button>); Escape-to-close
    // on the detail Sheet comes for free from Radix Dialog's own handling.
  };

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Attorney Portal</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Bookings</h1>
      </div>

      {/* Status tabs — StatusDot, label, and count together, never color alone */}
      <div className="flex flex-wrap gap-1 mb-5 border-b border-[var(--line)]">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm ds-type-body-m border-b-2 -mb-px transition-colors"
            style={{ borderColor: tab === s.key ? 'var(--text)' : 'transparent', color: tab === s.key ? 'var(--text)' : 'var(--text-3)' }}
          >
            <StatusDot status={s.key} />
            {s.label}
            <span className="text-xs text-[var(--text-4)]">({counts[s.key] || 0})</span>
          </button>
        ))}
        {counts.declined > 0 && (
          <button
            onClick={() => setTab('declined')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm ds-type-body-m border-b-2 -mb-px transition-colors"
            style={{ borderColor: tab === 'declined' ? 'var(--text)' : 'transparent', color: tab === 'declined' ? 'var(--text)' : 'var(--text-3)' }}
          >
            <StatusDot /> Declined <span className="text-xs text-[var(--text-4)]">({counts.declined})</span>
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <Card tone="recessed" className="text-center text-sm text-[var(--text-3)] ds-type-body-m">
          Nothing here. Share your booking link to open the pipeline.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((b, idx) => (
            <BookingCard
              key={b.id}
              b={b}
              onOpen={() => setActive(b)}
              cardRef={(el) => { cardRefs.current[idx] = el; }}
              onKeyDown={(e) => handleCardKeyDown(e, idx)}
            />
          ))}
        </div>
      )}

      <BookingDetailPanel
        booking={active}
        actorId={user?.id}
        onClose={() => setActive(null)}
        onChanged={(updated) => {
          setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          setActive(updated);
        }}
      />
    </div>
  );
}

function BookingCard({ b, onOpen, cardRef, onKeyDown }) {
  const slot = bookingSlot(b);
  return (
    <Card tone="raised" density="compact" className="p-0 overflow-hidden">
      <button
        ref={cardRef}
        onClick={onOpen}
        onKeyDown={onKeyDown}
        className="relative w-full text-left pt-6 px-4 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ground)] rounded-[var(--radius-m)]"
      >
        <Tab status={b.status} />
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-[var(--text)] truncate" style={{ fontFamily: 'var(--font-human)' }}>{b.client_name}</span>
          <span className="flex items-center gap-1.5 text-xs ds-type-body-m shrink-0 text-[var(--text-3)]">
            <StatusDot status={b.status} />
            {STATUSES.find((s) => s.key === b.status)?.label || b.status}
          </span>
        </div>
        {slot && <p className="text-sm text-[var(--text-3)] ds-type-body-m">{format(new Date(slot), 'EEE, MMM d · h:mm a')}</p>}
        {b.issue_description && <p className="text-xs text-[var(--text-3)] ds-type-body-m mt-2 line-clamp-2 italic">"{b.issue_description}"</p>}
      </button>
    </Card>
  );
}

function BookingDetailPanel({ booking, actorId, onClose, onChanged }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!booking?.id) { setNotes([]); return; }
    base44.entities.StaffNote.filter({ booking_id: booking.id }).then(setNotes).catch(() => setNotes([]));
  }, [booking?.id]);

  if (!booking) return null;
  const slot = bookingSlot(booking);

  const setStatus = async (status) => {
    setBusy(status);
    try {
      const fromStatus = booking.status;
      const fields = { status };
      if (status === 'confirmed') { fields.confirmed_at = new Date().toISOString(); fields.confirmed_by = 'staff'; }
      if (status === 'declined') { fields.issue_description = null; fields.case_summary = null; fields.description_purged = true; }
      const updated = await base44.entities.Booking.update(booking.id, fields);
      await base44.entities.BookingStatusEvent.create({
        booking_id: booking.id,
        from_status: fromStatus,
        to_status: status,
        actor_id: actorId || null,
        actor_role: 'staff',
      });
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
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-[var(--surface)]">
        <SheetHeader>
          <SheetTitle className="text-xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{booking.client_name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <div className="flex items-center gap-2">
            <StatusDot status={booking.status} />
            <p className="text-sm text-[var(--text)] ds-type-body-m capitalize">{booking.status.replace('_', '-')}</p>
          </div>

          {slot && (
            <div>
              <p className="ds-type-label text-[var(--text-3)] mb-1">Consultation</p>
              <p className="text-sm text-[var(--text)] ds-type-body-m">{format(new Date(slot), 'EEEE, MMMM d')} at {format(new Date(slot), 'h:mm a')}</p>
            </div>
          )}

          <div>
            <p className="ds-type-label text-[var(--text-3)] mb-1.5">Contact</p>
            <a href={`mailto:${booking.client_email}`} className="text-sm text-[var(--text)] ds-type-body-m flex items-center gap-2 hover:text-[var(--accent)]">
              <Mail className="w-3.5 h-3.5 text-[var(--text-3)]" /> {booking.client_email}
            </a>
            {booking.client_phone && (
              <a href={`tel:${booking.client_phone}`} className="text-sm text-[var(--text)] ds-type-body-m flex items-center gap-2 mt-1 hover:text-[var(--accent)]">
                <Phone className="w-3.5 h-3.5 text-[var(--text-3)]" /> {booking.client_phone}
              </a>
            )}
          </div>

          {booking.issue_description && (
            <div
              className="rounded-[var(--radius-m)] px-5 py-4"
              style={{ backgroundColor: 'var(--surface-sunk)' }}
            >
              <p className="ds-type-label text-[var(--text-3)] mb-1">In their words — read only</p>
              <p className="text-sm text-[var(--text)] italic" style={{ fontFamily: 'var(--font-human)' }}>"{booking.issue_description}"</p>
            </div>
          )}
          {booking.description_purged && (
            <p className="text-xs text-[var(--text-3)] ds-type-body-m">This client's description was removed after cancellation.</p>
          )}

          <div className="pt-4 border-t border-[var(--line)]">
            <p className="ds-type-label text-[var(--text-3)] mb-2">Staff notes — only your firm sees this</p>
            <div className="space-y-2 mb-3">
              {notes.map((n) => (
                <div key={n.id} className="rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
                  <p className="text-sm text-[var(--text)] ds-type-body-m">{n.body}</p>
                  <p className="text-[11px] text-[var(--text-4)] ds-type-body-m mt-1">{format(new Date(n.created_at), 'MMM d, h:mm a')}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-xs text-[var(--text-3)] ds-type-body-m">No notes yet.</p>}
            </div>
            <Field
              label="Add a note for the team"
              type="textarea"
              rows={2}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Anything the firm should know…"
            />
            <Button
              variant="secondary"
              size="compact"
              className="mt-2"
              onClick={addNote}
              disabled={busy === 'note' || !newNote.trim()}
            >
              {busy === 'note' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add note'}
            </Button>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex flex-wrap gap-2">
            {booking.status === 'pending' && (
              <>
                <Button variant="primary" size="compact" disabled={!!busy} onClick={() => setStatus('confirmed')}>
                  {busy === 'confirmed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Confirm
                </Button>
                <Button variant="destructive" size="compact" disabled={!!busy} onClick={() => setStatus('declined')}>
                  {busy === 'declined' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Decline
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <>
                <Button variant="primary" size="compact" disabled={!!busy} onClick={() => setStatus('completed')}>
                  {busy === 'completed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />} Mark completed
                </Button>
                {/* No-show is only ever set by this explicit staff action —
                    never inferred automatically from time passing. Button's
                    destructive variant already requires a confirming
                    second click before firing. */}
                <Button variant="destructive" size="compact" disabled={!!busy} onClick={() => setStatus('no_show')}>
                  {busy === 'no_show' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />} Mark no-show
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
