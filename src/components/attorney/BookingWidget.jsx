import { useNavigate } from 'react-router-dom';
import { format, addDays, startOfDay } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useOnboarding } from '@/lib/onboardingContext';
import { useLanguage } from '@/lib/i18n';

function getDisplaySlots(slots) {
  if (!slots || slots.length === 0) return [];
  return slots.slice(0, 8).map(s => {
    const d = new Date(s);
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const slotDay = startOfDay(d);
    let prefix = format(d, 'EEE');
    if (slotDay.getTime() === today.getTime()) prefix = 'Today';
    else if (slotDay.getTime() === tomorrow.getTime()) prefix = 'Tmrw';
    return { label: `${prefix} ${format(d, 'h:mm a')}`, value: s };
  });
}

export default function BookingWidget({ attorney }) {
  const navigate = useNavigate();
  const { openOnboarding } = useOnboarding();
  const { t } = useLanguage();
  const slots = getDisplaySlots(attorney.available_slots);
  const monthlyAffirm = attorney.typical_retainer ? Math.round(attorney.typical_retainer / 12) : null;

  // Wave 0 lock: route to the Stripe-backed public booking page, same as
  // BookingPanel — the legacy /booking flow inserted a booking client-side
  // without ever charging.
  const handleSlot = async (slot) => {
    const bookingUrl = `/book/${attorney.slug || 'unavailable'}`;
    base44.analytics.track({ eventName: 'Lawyer Selected', properties: { attorney_id: attorney.id, slot } });
    const authed = await base44.auth.isAuthenticated();
    if (authed) {
      navigate(bookingUrl);
    } else {
      openOnboarding(bookingUrl);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--line-2)] p-6 sticky top-32">
      <div className="mb-5 pb-5 border-b border-[var(--line-2)]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-4xl text-[var(--text)]">${attorney.consult_fee}</span>
          <span className="text-sm text-[var(--text-3)] font-body">{t('booking.consultationFee')}</span>
        </div>
        {attorney.typical_retainer && (
          <p className="text-sm text-[var(--text-3)] font-body mt-1">
            {t('booking.typicalRetainer')} <span className="text-[var(--text)]">${attorney.typical_retainer.toLocaleString()}</span>
          </p>
        )}
        {monthlyAffirm && (
          <p className="text-xs text-[var(--accent)] mt-1 font-body">
            {t('booking.financeRetainer')} ${monthlyAffirm}{t('booking.moWithAffirm')}
          </p>
        )}
      </div>

      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-3 font-body">
        {t('booking.nextAvailable')}
      </p>
      {slots.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {slots.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleSlot(value)}
              className="text-xs px-3 py-2 border border-[var(--line-2)] text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--ground)] hover:border-[var(--text)] transition-all duration-200 font-body text-left"
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-3)] text-center py-4 font-body">{t('booking.noSlots')}</p>
      )}

      <p className="text-[11px] text-[var(--text-3)] text-center mt-5 font-body leading-relaxed">
        {t('booking.notCharged')}
      </p>
    </div>
  );
}