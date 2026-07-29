import { useLanguage } from '@/lib/i18n';

export default function BookingProgressBar({ step }) {
  const { t } = useLanguage();
  const STEPS = [t('booking.stepsDetails'), t('booking.stepsCase'), t('booking.stepsPayment')];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const active = num === step;
          const done = num < step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-medium transition-all font-body border ${
                  done ? 'bg-[var(--text)] text-[var(--ground)] border-[var(--text)]' :
                  active ? 'bg-[var(--surface)] text-[var(--text)] border-[var(--text)]' :
                  'bg-[var(--surface)] text-[var(--text-3)] border-[var(--line-2)]'
                }`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.08em] mt-1.5 whitespace-nowrap font-body ${
                  active ? 'text-[var(--text)]' : 'text-[var(--text-3)]'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-4 transition-all ${
                  done ? 'bg-[var(--text)]' : 'bg-[var(--surface-sunk)]'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}