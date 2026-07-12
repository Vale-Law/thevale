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

  const handleSlot = async (slot) => {
    const bookingUrl = `/booking?attorney=${attorney.id}&slot=${encodeURIComponent(slot)}`;
    base44.analytics.track({ eventName: 'Lawyer Selected', properties: { attorney_id: attorney.id } });
    const authed = await base44.auth.isAuthenticated();
    if (authed) {
      navigate(bookingUrl);
    } else {
      openOnboarding(bookingUrl);
    }
  };

  return (
    <div className="bg-white border border-[#E5E2DC] p-6 sticky top-32">
      <div className="mb-5 pb-5 border-b border-[#E5E2DC]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-serif text-4xl text-[#111418]">${attorney.consult_fee}</span>
          <span className="text-sm text-[#8A8578] font-body">{t('booking.consultationFee')}</span>
        </div>
        {attorney.typical_retainer && (
          <p className="text-sm text-[#8A8578] font-body mt-1">
            {t('booking.typicalRetainer')} <span className="text-[#111418]">${attorney.typical_retainer.toLocaleString()}</span>
          </p>
        )}
        {monthlyAffirm && (
          <p className="text-xs text-[#0a5dc2] mt-1 font-body">
            {t('booking.financeRetainer')} ${monthlyAffirm}{t('booking.moWithAffirm')}
          </p>
        )}
      </div>

      <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-3 font-body">
        {t('booking.nextAvailable')}
      </p>
      {slots.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {slots.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleSlot(value)}
              className="text-xs px-3 py-2 border border-[#E5E2DC] text-[#111418] hover:bg-[#111418] hover:text-white hover:border-[#111418] transition-all duration-200 font-body text-left"
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#8A8578] text-center py-4 font-body">{t('booking.noSlots')}</p>
      )}

      <p className="text-[11px] text-[#8A8578] text-center mt-5 font-body leading-relaxed">
        {t('booking.notCharged')}
      </p>
    </div>
  );
}