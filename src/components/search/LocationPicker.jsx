import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { US_STATES, getCitiesForState } from '@/lib/usLocations';
import { useLanguage } from '@/lib/i18n';
import BottomSheet from '@/components/mobile/BottomSheet';

const AREA_LABEL_KEYS = {
  'Family Law': 'area.familyLaw',
  'Immigration': 'area.immigration',
  'Business Formation': 'area.businessFormation',
  'Personal Injury': 'area.personalInjury',
};

export default function LocationPicker({ area, open, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (open) {
      setStateCode('');
      setCity('');
    }
  }, [open, area]);

  const cities = getCitiesForState(stateCode);
  const canSubmit = stateCode && city;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(stateCode, city);
  };

  return (
    <BottomSheet open={open} onClose={onClose} desktopMaxWidth={520}>
      <div className="flex items-center justify-between px-6 pt-5 pb-2">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#0a5dc2] font-body">{t(AREA_LABEL_KEYS[area] || area)}</p>
        <button onClick={onClose} className="text-[#8A8578] hover:text-[#111418] transition-colors p-2 -mr-2" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 pb-8 pt-2">
        <h2 className="font-serif text-[28px] text-[#111418] leading-[1.1] mb-2">{t('locationPicker.title')}</h2>
        <p className="text-sm text-[#8A8578] font-body mb-6">{t('locationPicker.sub')}</p>

        <div className="mb-4">
          <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">{t('locationPicker.state')}</label>
          <select
            value={stateCode}
            onChange={e => { setStateCode(e.target.value); setCity(''); }}
            className="w-full border border-[#E5E2DC] bg-white px-4 py-3.5 text-sm text-[#111418] outline-none focus:border-[#111418] font-body appearance-none cursor-pointer"
          >
            <option value="">{t('locationPicker.state')}</option>
            {US_STATES.map(s => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">{t('locationPicker.city')}</label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            disabled={!stateCode}
            className="w-full border border-[#E5E2DC] bg-white px-4 py-3.5 text-sm text-[#111418] outline-none focus:border-[#111418] font-body appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">{t('locationPicker.city')}</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full px-6 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed font-body"
        >
          {t('locationPicker.seeAttorneys')}
        </button>
      </div>
    </BottomSheet>
  );
}