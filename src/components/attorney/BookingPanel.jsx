import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Video, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useOnboarding } from '@/lib/onboardingContext';
import { useLanguage } from '@/lib/i18n';

export default function BookingPanel({ attorney }) {
  const navigate = useNavigate();
  const { openOnboarding } = useOnboarding();
  const { t } = useLanguage();
  const areas = (attorney.practice_areas && attorney.practice_areas.length)
    ? attorney.practice_areas
    : (attorney.practice_area ? [attorney.practice_area] : []);
  const [reason, setReason] = useState(areas[0] || '');
  const [consultType, setConsultType] = useState('in-person');
  const [clientType, setClientType] = useState('new');
  const [windowStart, setWindowStart] = useState(() => startOfDay(new Date()));
  // Default to the first day that actually has a bookable slot -- slots
  // rarely start today (24h min-notice), so defaulting to today greeted
  // every visitor with "No slots available" until they clicked around.
  const [selectedDay, setSelectedDay] = useState(() => {
    const future = (attorney.available_slots || [])
      .map((s) => new Date(s))
      .filter((d) => !isNaN(d) && d > new Date());
    if (!future.length) return startOfDay(new Date());
    return startOfDay(new Date(Math.min(...future.map((d) => d.getTime()))));
  });

  const monthlyAffirm = attorney.typical_retainer ? Math.round(attorney.typical_retainer / 12) : null;

  const dayBuckets = useMemo(() => {
    const byDay = new Map();
    (attorney.available_slots || []).forEach((s) => {
      const d = new Date(s);
      if (isNaN(d)) return;
      const key = startOfDay(d).getTime();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(s);
    });
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = startOfDay(addDays(windowStart, i));
      days.push({ day, slots: (byDay.get(day.getTime()) || []).sort((a, b) => new Date(a) - new Date(b)) });
    }
    return days;
  }, [attorney.available_slots, windowStart]);

  const selectedSlots = dayBuckets.find((d) => isSameDay(d.day, selectedDay))?.slots || [];

  const handleSlot = async (slot) => {
    const bookingUrl = `/booking?attorney=${attorney.id}&slot=${encodeURIComponent(slot)}`;
    base44.analytics.track({ eventName: 'Lawyer Selected', properties: { attorney_id: attorney.id } });
    const authed = await base44.auth.isAuthenticated();
    if (authed) navigate(bookingUrl);
    else openOnboarding(bookingUrl);
  };

  const shiftWindow = (dir) => setWindowStart((d) => addDays(d, dir * 7));

  return (
    <div className="bg-[var(--surface)] border border-[var(--line-2)] rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col">
      <div className="p-5 pb-4 border-b border-[var(--line-2)]">
        <h2 className="font-serif text-lg text-[var(--text)] mb-3">Book a consultation</h2>
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl text-[var(--text)]">${attorney.consult_fee}</span>
          <span className="text-sm text-[var(--text-3)] font-body">{t('booking.consultationFee')}</span>
        </div>
        {attorney.typical_retainer && (
          <p className="text-sm text-[var(--text-3)] font-body mt-1">{t('booking.typicalRetainer')} <span className="text-[var(--text)]">${attorney.typical_retainer.toLocaleString()}</span></p>
        )}
        {monthlyAffirm && (
          <p className="text-xs text-[var(--accent)] mt-1 font-body">{t('booking.financeRetainer')} ${monthlyAffirm}{t('booking.moWithAffirm')}</p>
        )}
      </div>

      <div className="p-5 space-y-5">
        {areas.length > 0 && (
          <div>
            <label className="text-xs text-[var(--text-3)] font-body block mb-1.5">Consultation reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-11 border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm rounded-lg outline-none focus:border-[var(--accent)] font-body">
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs text-[var(--text-3)] font-body block mb-1.5">Consultation type</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setConsultType('in-person')} className={`h-10 rounded-lg border text-sm font-body flex items-center justify-center gap-1.5 transition-colors ${consultType === 'in-person' ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-on)]' : 'border-[var(--line-2)] text-[var(--text)] hover:border-[var(--text)]'}`}>
              <Building2 className="w-4 h-4" /> In person
            </button>
            <button onClick={() => setConsultType('video')} className={`h-10 rounded-lg border text-sm font-body flex items-center justify-center gap-1.5 transition-colors ${consultType === 'video' ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-on)]' : 'border-[var(--line-2)] text-[var(--text)] hover:border-[var(--text)]'}`}>
              <Video className="w-4 h-4" /> Video
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-[var(--text-3)] font-body block mb-1.5">New or returning client</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setClientType('new')} className={`h-10 rounded-lg border text-sm font-body transition-colors ${clientType === 'new' ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-on)]' : 'border-[var(--line-2)] text-[var(--text)] hover:border-[var(--text)]'}`}>New client</button>
            <button onClick={() => setClientType('returning')} className={`h-10 rounded-lg border text-sm font-body transition-colors ${clientType === 'returning' ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-on)]' : 'border-[var(--line-2)] text-[var(--text)] hover:border-[var(--text)]'}`}>Returning client</button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[var(--text-3)] font-body">Available appointments</label>
            <div className="flex gap-1">
              <button onClick={() => shiftWindow(-1)} className="w-7 h-7 rounded-full border border-[var(--line-2)] flex items-center justify-center text-[var(--text)] hover:border-[var(--text)]"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => shiftWindow(1)} className="w-7 h-7 rounded-full border border-[var(--line-2)] flex items-center justify-center text-[var(--text)] hover:border-[var(--text)]"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dayBuckets.map((d, i) => {
              const has = d.slots.length > 0;
              const selected = isSameDay(d.day, selectedDay);
              return (
                <button key={i} disabled={!has} onClick={() => setSelectedDay(d.day)} className={`flex flex-col items-center py-2 rounded-lg border text-xs font-body transition-colors ${selected ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]' : has ? 'border-[var(--line-2)] text-[var(--text)] hover:border-[var(--text)]' : 'border-transparent text-[var(--text-4)] cursor-not-allowed'}`}>
                  <span className="uppercase">{format(d.day, 'EEE')}</span>
                  <span className="text-[11px] mt-0.5">{format(d.day, 'MMM d')}</span>
                  <span className="mt-1">{has ? d.slots.length : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--text-3)] font-body mb-2">{format(selectedDay, 'EEEE, MMM d')}</p>
          {selectedSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {selectedSlots.map((s) => (
                <button key={s} onClick={() => handleSlot(s)} className="h-10 rounded-lg border border-[var(--line-2)] text-sm text-[var(--text)] font-body hover:border-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--ground)] transition-all">
                  {format(new Date(s), 'h:mm a')}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-3)] font-body py-3 text-center">{t('booking.noSlots')}</p>
          )}
        </div>

        <p className="text-xs text-[var(--text-3)] font-body leading-relaxed text-center">
          Brief is not a law firm. Booking a consultation does not create an attorney-client relationship.
        </p>
      </div>
    </div>
  );
}