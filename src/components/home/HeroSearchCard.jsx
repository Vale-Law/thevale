import { useState } from 'react';
import { US_STATES, getCitiesForState } from '@/lib/usLocations';
import { Search, MapPin, ChevronDown, ArrowRight, Briefcase } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { detectPracticeArea } from '@/lib/conciergeUtils';

const PRACTICE_AREAS = ['Family Law', 'Personal Injury', 'Immigration', 'Criminal Defense', 'Business & Tax', 'Estate & Wills'];
const AREA_LABEL_KEYS = {
  'Family Law': 'practiceIcons.familyLaw',
  'Personal Injury': 'practiceIcons.personalInjury',
  'Immigration': 'practiceIcons.immigration',
  'Criminal Defense': 'practiceIcons.criminalDefense',
  'Business & Tax': 'practiceIcons.businessTax',
  'Estate & Wills': 'practiceIcons.estateWills',
};

export default function HeroSearchCard({ onSearch }) {
  const { t } = useLanguage();
  const [area, setArea] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [searchText, setSearchText] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);

  const cities = getCitiesForState(stateCode);

  const handleSearch = () => {
    // Typed text counts too: "immigration" in the box goes straight to
    // Immigration instead of being ignored in favor of the pill selector.
    const resolved = area || detectPracticeArea(searchText);
    onSearch(resolved, stateCode, city, searchText.trim());
  };

  return (
    <div className="relative rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-2xl p-4 sm:p-5">
      {/* Temple artwork backdrop, veiled by a translucent surface wash so the
          inputs stay readable in both light and dark mode. Rounded on the
          layers themselves (not overflow-hidden on the root) so the absolute
          dropdown panels below aren't clipped. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl bg-cover"
        style={{ backgroundImage: "url('/images/hero-temple.jpg')", backgroundPosition: 'center 30%' }}
      />
      <div aria-hidden="true" className="absolute inset-0 rounded-2xl backdrop-blur-[3px]" style={{ background: 'var(--ground-glass)' }} />
      <div className="relative">
      {/* Main search field */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 px-2">
          <Search className="w-4 h-4 text-[var(--text-3)] shrink-0" />
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('hero.searchPlaceholder')}
            className="w-full bg-transparent outline-none text-sm text-[var(--text)] font-body placeholder:text-[var(--text-3)]"
          />
        </div>
        <button
          onClick={handleSearch}
          aria-label={t('hero.search')}
          className="w-10 h-10 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-press)] transition-colors flex items-center justify-center text-[var(--accent-on)] shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pill selectors */}
      <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
        {/* Location pill */}
        <div className="relative">
          <button
            onClick={() => setLocationOpen(o => !o)}
            className="flex items-center gap-1.5 pl-3 pr-2 py-2 text-sm font-body text-[var(--text)] border border-[var(--line-2)] rounded-full hover:border-[var(--text)] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[var(--text-3)]" />
            {city ? `${city}, ${stateCode}` : t('hero.selectLocation')}
            <ChevronDown className="w-3 h-3 text-[var(--text-3)]" />
          </button>
          {locationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLocationOpen(false)} />
              <div className="absolute z-50 mt-2 bg-[var(--surface)] border border-[var(--line-2)] rounded-xl shadow-xl p-3 w-60 left-0">
                <select
                  value={stateCode}
                  onChange={e => { setStateCode(e.target.value); setCity(''); }}
                  className="w-full border border-[var(--line-2)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none font-body appearance-none cursor-pointer mb-2"
                >
                  <option value="">{t('hero.selectState')}</option>
                  {US_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  disabled={!stateCode}
                  className="w-full border border-[var(--line-2)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none font-body appearance-none cursor-pointer disabled:opacity-40"
                >
                  <option value="">{t('hero.selectCity')}</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Practice area pill */}
        <div className="relative">
          <button
            onClick={() => setAreaOpen(o => !o)}
            className="flex items-center gap-1.5 pl-3 pr-2 py-2 text-sm font-body text-[var(--text)] border border-[var(--line-2)] rounded-full hover:border-[var(--text)] transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-[var(--text-3)]" />
            {area ? t(AREA_LABEL_KEYS[area] || area) : t('hero.addDetails')}
            <ChevronDown className="w-3 h-3 text-[var(--text-3)]" />
          </button>
          {areaOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAreaOpen(false)} />
              <div className="absolute z-50 mt-2 bg-[var(--surface)] border border-[var(--line-2)] rounded-xl shadow-xl p-2 w-56 max-h-64 overflow-auto left-0">
                {PRACTICE_AREAS.map(a => (
                  <button
                    key={a}
                    onClick={() => { setArea(a); setAreaOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-body text-[var(--text)] rounded-lg hover:bg-[var(--ground)] transition-colors"
                  >
                    {t(AREA_LABEL_KEYS[a] || a)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}