import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

const URGENCY_OPTIONS = [
  { value: 'Urgent', labelKey: 'booking.urgencyUrgent' },
  { value: 'Soon', labelKey: 'booking.urgencySoon' },
  { value: 'Just exploring', labelKey: 'booking.urgencyExploring' },
];

export default function StepDetails({ data, onChange, onNext, onBack }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(data);

  const update = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-serif text-2xl text-[var(--text)] mb-1">{t('booking.aboutCase')}</p>
        <p className="text-sm text-[var(--text-3)] font-body">{t('booking.aboutCaseSub')}</p>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body block mb-3">{t('booking.urgency')}</label>
        <div className="flex flex-wrap gap-2">
          {URGENCY_OPTIONS.map(u => (
            <button
              key={u.value}
              onClick={() => update('urgency', u.value)}
              className={`px-4 py-2 text-sm border transition-all font-body ${
                form.urgency === u.value
                  ? 'bg-[var(--text)] text-[var(--ground)] border-[var(--text)]'
                  : 'border-[var(--line-2)] text-[var(--text-3)] hover:border-[var(--text)] hover:text-[var(--text)]'
              }`}
            >
              {t(u.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body block mb-1.5">
          {t('booking.description')}
        </label>
        <textarea
          value={form.issue}
          onChange={e => update('issue', e.target.value)}
          placeholder={t('booking.descriptionPlaceholder')}
          rows={5}
          className="w-full border border-[var(--line-2)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors resize-none font-body bg-[var(--surface)]"
        />
        <p className="text-[11px] text-[var(--text-3)] mt-1.5 font-body flex items-center gap-1">
          <span>🔒</span> {t('booking.privilege')}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 border border-[var(--line-2)] text-[var(--text)] text-sm font-medium hover:border-[var(--text)] transition-colors font-body"
        >
          {t('booking.back')}
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 bg-[var(--text)] text-[var(--ground)] text-sm font-medium hover:bg-[var(--accent)] transition-all duration-300 font-body"
        >
          {t('booking.continue')}
        </button>
      </div>
    </div>
  );
}