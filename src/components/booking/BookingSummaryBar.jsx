import { ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n';

export default function BookingSummaryBar({ attorney, slot }) {
  const { t } = useLanguage();
  if (!attorney) return null;
  const slotDate = slot ? new Date(slot) : null;

  return (
    <div className="border border-[var(--line-2)] bg-[var(--surface)] p-4 mb-6 flex items-center gap-4">
      <img
        src={attorney.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(attorney.name)}&background=E7EAE2&color=55704A&size=80`}
        alt={attorney.name}
        className="w-14 h-14 object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg text-[var(--text)]">{attorney.name}</span>
          {attorney.verified && <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />}
        </div>
        <p className="text-sm text-[var(--text-3)] font-body">{attorney.practice_area}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {slotDate ? (
          <>
            <p className="text-sm font-medium text-[var(--text)] font-body">{format(slotDate, 'EEE, MMM d')}</p>
            <p className="text-sm text-[var(--text-3)] font-body">{format(slotDate, 'h:mm a')}</p>
          </>
        ) : (
          <p className="text-sm text-[var(--text-3)] font-body">{t('booking.noSlot')}</p>
        )}
        <p className="text-xs text-[var(--accent)] mt-0.5 font-body">${attorney.consult_fee}</p>
      </div>
    </div>
  );
}