import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
];

function formatPhone(input) {
  const digits = input.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function PhoneStep({ onComplete }) {
  const { t } = useLanguage();
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = phone.replace(/\D/g, '').length >= 10;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fullPhone = `${countryCode} ${phone}`;
      await base44.auth.updateMe({ phone: fullPhone });
    } catch (e) {
      // proceed even if updateMe fails
    }
    base44.analytics.track({ eventName: 'Phone Number Submitted', properties: { country_code: countryCode } });
    setLoading(false);
    onComplete();
  };

  return (
    <div key="phone" className="px-6 py-8 animate-fade-up">
      <h2 className="font-serif text-[28px] text-[#111418] leading-tight mb-2">{t('onboarding.verifyPhone')}</h2>
      <p className="text-sm text-[#8A8578] font-body mb-6 leading-relaxed">
        {t('onboarding.phoneDesc')}
      </p>

      <div className="flex gap-2 mb-6">
        <select
          value={countryCode}
          onChange={e => setCountryCode(e.target.value)}
          className="border border-[#E5E2DC] bg-white px-3 py-3 text-sm text-[#111418] outline-none focus:border-[#0a5dc2] font-body"
          style={{ borderRadius: 8 }}
        >
          {COUNTRIES.map(c => (
            <option key={c.code + c.name} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
          placeholder="(555) 555-5555"
          className="flex-1 border border-[#E5E2DC] bg-white px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#0a5dc2] font-body"
          style={{ borderRadius: 8 }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="w-full py-3.5 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
        style={{ borderRadius: 8 }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('onboarding.continue')}
      </button>

      <button
        onClick={onComplete}
        className="w-full text-center text-sm text-[#8A8578] hover:text-[#111418] mt-3 font-body transition-colors"
      >
        {t('onboarding.skipForNow')}
      </button>
    </div>
  );
}