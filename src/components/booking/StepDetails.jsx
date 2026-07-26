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
        <p className="font-serif text-2xl text-[#111418] mb-1">{t('booking.aboutCase')}</p>
        <p className="text-sm text-[#8A8578] font-body">{t('booking.aboutCaseSub')}</p>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-3">{t('booking.urgency')}</label>
        <div className="flex flex-wrap gap-2">
          {URGENCY_OPTIONS.map(u => (
            <button
              key={u.value}
              onClick={() => update('urgency', u.value)}
              className={`px-4 py-2 text-sm border transition-all font-body ${
                form.urgency === u.value
                  ? 'bg-[#111418] text-white border-[#111418]'
                  : 'border-[#E5E2DC] text-[#8A8578] hover:border-[#111418] hover:text-[#111418]'
              }`}
            >
              {t(u.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">
          {t('booking.description')}
        </label>
        <textarea
          value={form.issue}
          onChange={e => update('issue', e.target.value)}
          placeholder={t('booking.descriptionPlaceholder')}
          rows={5}
          className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] transition-colors resize-none font-body bg-white"
        />
        <p className="text-[11px] text-[#8A8578] mt-1.5 font-body flex items-center gap-1">
          <span>🔒</span> {t('booking.privilege')}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 border border-[#E5E2DC] text-[#111418] text-sm font-medium hover:border-[#111418] transition-colors font-body"
        >
          {t('booking.back')}
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 font-body"
        >
          {t('booking.continue')}
        </button>
      </div>
    </div>
  );
}