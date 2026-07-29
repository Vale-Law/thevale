import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function StepPayment({ attorney, data, onChange, onConfirm, onBack, loading }) {
  const { t } = useLanguage();
  const fee = attorney?.consult_fee || 0;

  // Financing is coming soon — only "Pay in full" is available for now.
  const options = [
    {
      id: 'full',
      label: t('booking.payFull'),
      summary: `$${fee} ${t('booking.today')}`,
      detail: t('booking.payFullDetail'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-serif text-2xl text-[var(--text)] mb-1">{t('booking.choosePayment')}</p>
        <p className="text-sm text-[var(--text-3)] font-body">{t('booking.paymentSub')}</p>
      </div>

      <div className="space-y-2">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange({ ...data, payment: opt.id })}
            className={`w-full text-left p-4 border transition-all duration-200 ${
              data.payment === opt.id
                ? 'border-[var(--text)] bg-[var(--surface)]'
                : 'border-[var(--line-2)] bg-[var(--surface)] hover:border-[var(--line-2)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 border-2 flex-shrink-0 transition-all ${
                  data.payment === opt.id ? 'border-[var(--text)] bg-[var(--text)]' : 'border-[var(--line-2)]'
                }`} />
                <div>
                  <span className="text-sm font-medium text-[var(--text)] font-body">{opt.label}</span>
                </div>
              </div>
              <span className="text-sm text-[var(--text)] font-medium font-body">{opt.summary}</span>
            </div>
            {data.payment === opt.id && (
              <p className="text-xs text-[var(--text-3)] mt-2 ml-7 font-body">{opt.detail}</p>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[var(--accent-soft)] px-4 py-3 text-xs text-[var(--text-3)] font-body">
        {t('booking.notChargedBar')}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 border border-[var(--line-2)] text-[var(--text)] text-sm font-medium hover:border-[var(--text)] transition-colors font-body"
        >
          {t('booking.back')}
        </button>
        <button
          onClick={onConfirm}
          disabled={!data.payment || loading}
          className="flex-1 py-4 bg-[var(--text)] text-[var(--ground)] text-sm font-medium hover:bg-[var(--accent)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('booking.confirmBooking')}
        </button>
      </div>
    </div>
  );
}