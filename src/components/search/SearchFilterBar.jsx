import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { US_STATES, getCitiesForState } from '@/lib/usLocations';
import { useLanguage } from '@/lib/i18n';
import FloatingPanel from '@/components/ui/FloatingPanel';

const PRACTICE_AREAS = ['Family Law', 'Immigration', 'Business Formation', 'Personal Injury'];
const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Vietnamese', 'Arabic', 'Portuguese'];

function Pill({ label, active, badge, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-4 py-2 font-body text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0"
      style={{
        borderRadius: 999,
        border: `1px solid ${active ? '#111418' : '#E5E2DC'}`,
        background: active ? '#111418' : '#fff',
        color: active ? '#FAF9F7' : '#111418',
      }}
    >
      {label || children}
      {badge != null && badge > 0 && (
        <span
          className="inline-flex items-center justify-center font-body"
          style={{
            background: active ? 'rgba(255,255,255,0.25)' : '#0a5dc2',
            color: '#fff',
            borderRadius: 999,
            fontSize: 10,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function DropdownPill({ label, active, badge, children, minWidth = 220 }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  return (
    <div ref={triggerRef} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-4 py-2 font-body text-sm transition-all duration-200 whitespace-nowrap"
        style={{
          borderRadius: 999,
          border: `1px solid ${active ? '#111418' : '#E5E2DC'}`,
          background: active ? '#111418' : '#fff',
          color: active ? '#FAF9F7' : '#111418',
        }}
      >
        {label}
        {badge != null && badge > 0 && (
          <span
            className="inline-flex items-center justify-center font-body"
            style={{
              background: active ? 'rgba(255,255,255,0.25)' : '#0a5dc2',
              color: '#fff',
              borderRadius: 999,
              fontSize: 10,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
            }}
          >
            {badge}
          </span>
        )}
        <ChevronDown className="w-3 h-3 opacity-60" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }} />
      </button>
      <FloatingPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} minWidth={minWidth}>
        {children}
      </FloatingPanel>
    </div>
  );
}

export default function SearchFilterBar({ filters, onChange, attorneys }) {
  const { t } = useLanguage();
  const [localState, setLocalState] = useState(filters.state || '');
  const [localCity, setLocalCity] = useState(filters.city || '');

  const cities = getCitiesForState(localState);

  useEffect(() => {
    setLocalState(filters.state || '');
    setLocalCity(filters.city || '');
  }, [filters.state, filters.city]);

  const hasAnyFilter = (
    (filters.areas || []).length > 0 ||
    (filters.languages || []).length > 0 ||
    filters.maxFee < 500 ||
    filters.minRating !== 'all' ||
    !!filters.state ||
    !!filters.city ||
    !!filters.speaksSpanish ||
    !!filters.spanishStaff ||
    !!filters.translationAvail
  );

  const toggleArea = (area) => {
    const areas = filters.areas || [];
    onChange({ ...filters, areas: areas.includes(area) ? areas.filter(a => a !== area) : [...areas, area] });
  };

  const toggleLang = (lang) => {
    const langs = filters.languages || [];
    onChange({ ...filters, languages: langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang] });
  };

  const handleStateChange = (stateCode) => {
    setLocalState(stateCode);
    setLocalCity('');
    onChange({ ...filters, state: stateCode, city: '', location: '' });
  };

  const handleCityChange = (city) => {
    setLocalCity(city);
    onChange({ ...filters, city, location: city && localState ? `${city}, ${localState}` : '' });
  };

  const clearAll = () => {
    setLocalState('');
    setLocalCity('');
    onChange({ location: '', state: '', city: '', areas: [], languages: [], maxFee: 500, minRating: 'all', speaksSpanish: false, spanishStaff: false, translationAvail: false });
  };

  const ratingLabels = {
    all: t('filter.anyRating'),
    '4': `4+ ${t('filter.starsPlus')}`,
    '4.5': `4.5+ ${t('filter.starsPlus')}`,
  };

  return (
    <div
      className="sticky z-40 bg-[#F5F0E8]/90 backdrop-blur-md border-b border-[#E5E2DC]"
      style={{ top: 'var(--header-height, 104px)' }}
    >
      <div className="px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        {/* Location dropdown */}
        <DropdownPill label={filters.city ? `${filters.city}, ${filters.state}` : t('filter.location')} active={!!filters.city}>
          <div className="p-3 space-y-2 w-56">
            <select
              value={localState}
              onChange={e => handleStateChange(e.target.value)}
              className="w-full border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#111418] outline-none focus:border-[#111418] font-body appearance-none cursor-pointer"
            >
              <option value="">{t('filter.selectState')}</option>
              {US_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            <select
              value={localCity}
              onChange={e => handleCityChange(e.target.value)}
              disabled={!localState}
              className="w-full border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#111418] outline-none focus:border-[#111418] font-body appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{t('filter.selectCity')}</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </DropdownPill>

        {/* Practice area */}
        <DropdownPill label={t('filter.practiceArea')} active={(filters.areas || []).length > 0} badge={(filters.areas || []).length || null}>
          <div className="p-3 space-y-1">
            {PRACTICE_AREAS.map(area => (
              <label key={area} className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded hover:bg-[#FAF9F7] transition-colors">
                <input type="checkbox" checked={(filters.areas || []).includes(area)} onChange={() => toggleArea(area)} className="accent-[#111418]" />
                <span className="text-sm font-body text-[#111418]">{area}</span>
              </label>
            ))}
          </div>
        </DropdownPill>

        {/* Language */}
        <DropdownPill label={t('filter.language')} active={(filters.languages || []).length > 0 || !!filters.speaksSpanish || !!filters.spanishStaff || !!filters.translationAvail} badge={((filters.languages || []).length + (filters.speaksSpanish ? 1 : 0) + (filters.spanishStaff ? 1 : 0) + (filters.translationAvail ? 1 : 0)) || null}>
          <div className="p-3 space-y-1 w-56">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#8A8578] font-body px-2 pt-1 pb-0.5">{t('filter.language')}</p>
            {LANGUAGES.map(lang => (
              <label key={lang} className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded hover:bg-[#FAF9F7] transition-colors">
                <input type="checkbox" checked={(filters.languages || []).includes(lang)} onChange={() => toggleLang(lang)} className="accent-[#111418]" />
                <span className="text-sm font-body text-[#111418]">{lang}</span>
              </label>
            ))}
            <div className="border-t border-[#E5E2DC] my-1" />
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#8A8578] font-body px-2 pt-1 pb-0.5">Español</p>
            <label className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded hover:bg-[#FAF9F7] transition-colors">
              <input type="checkbox" checked={!!filters.speaksSpanish} onChange={() => onChange({ ...filters, speaksSpanish: !filters.speaksSpanish })} className="accent-[#111418]" />
              <span className="text-sm font-body text-[#111418]">{t('filter.speaksSpanish')}</span>
            </label>
            <label className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded hover:bg-[#FAF9F7] transition-colors">
              <input type="checkbox" checked={!!filters.spanishStaff} onChange={() => onChange({ ...filters, spanishStaff: !filters.spanishStaff })} className="accent-[#111418]" />
              <span className="text-sm font-body text-[#111418]">{t('filter.spanishStaff')}</span>
            </label>
            <label className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded hover:bg-[#FAF9F7] transition-colors">
              <input type="checkbox" checked={!!filters.translationAvail} onChange={() => onChange({ ...filters, translationAvail: !filters.translationAvail })} className="accent-[#111418]" />
              <span className="text-sm font-body text-[#111418]">{t('filter.translationAvail')}</span>
            </label>
          </div>
        </DropdownPill>

        {/* Max fee */}
        <DropdownPill label={filters.maxFee < 500 ? `≤ $${filters.maxFee}` : t('filter.maxFee')} active={filters.maxFee < 500}>
          <div className="p-4 w-56">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-[#8A8578] font-body uppercase tracking-[0.08em]">{t('filter.maxConsultation')}</span>
              <span className="font-serif text-[#111418]">${filters.maxFee}</span>
            </div>
            <input
              type="range" min={50} max={500} step={10} value={filters.maxFee}
              onChange={e => onChange({ ...filters, maxFee: Number(e.target.value) })}
              className="w-full accent-[#111418]"
            />
            <div className="flex justify-between text-xs text-[#8A8578] font-body mt-1">
              <span>$50</span><span>$500+</span>
            </div>
          </div>
        </DropdownPill>

        {/* Rating */}
        <DropdownPill label={filters.minRating !== 'all' ? `${filters.minRating}+ ★` : t('filter.rating')} active={filters.minRating !== 'all'}>
          <div className="p-3 space-y-1">
            {[['all', t('filter.anyRating')], ['4', `4+ ${t('filter.starsPlus')}`], ['4.5', `4.5+ ${t('filter.starsPlus')}`]].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => onChange({ ...filters, minRating: val })}
                className="w-full text-left px-3 py-2 text-sm font-body rounded transition-colors hover:bg-[#FAF9F7]"
                style={{ color: filters.minRating === val ? '#0a5dc2' : '#111418', fontWeight: filters.minRating === val ? 500 : 400 }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </DropdownPill>

        {/* Clear */}
        {hasAnyFilter && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-[#8A8578] hover:text-[#111418] font-body flex-shrink-0 transition-colors"
          >
            <X className="w-3 h-3" /> {t('filter.clearAll')}
          </button>
        )}
      </div>
    </div>
  );
}