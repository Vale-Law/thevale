import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function StepInfo({ data, onChange, onNext }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(data);
  const valid = form.name.trim() && form.email.trim();

  const update = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-serif text-2xl text-[var(--text)] mb-1">{t('booking.yourDetails')}</p>
        <p className="text-sm text-[var(--text-3)] font-body">{t('booking.detailsSub')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body block mb-1.5">{t('booking.fullNameLabel')}</label>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder={t('booking.placeholderName')}
            className="w-full border border-[var(--line-2)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors font-body bg-[var(--surface)]"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body block mb-1.5">{t('booking.emailLabel')}</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-[var(--line-2)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors font-body bg-[var(--surface)]"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body block mb-1.5">{t('booking.phoneOptional')}</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full border border-[var(--line-2)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--text)] transition-colors font-body bg-[var(--surface)]"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-4 bg-[var(--text)] text-[var(--ground)] text-sm font-medium hover:bg-[var(--accent)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed font-body"
      >
        {t('booking.continue')}
      </button>
    </div>
  );
}