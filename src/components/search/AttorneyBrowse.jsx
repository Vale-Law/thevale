import { useMemo, useState } from 'react';
import SearchFilterBar from './SearchFilterBar';
import AttorneyCarousel from './AttorneyCarousel';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const PRACTICE_AREAS = ['Family Law', 'Immigration', 'Personal Injury', 'Business Formation'];
const AREA_LABEL_KEYS = {
  'Family Law': 'area.familyLaw',
  'Immigration': 'area.immigration',
  'Business Formation': 'area.businessFormation',
  'Personal Injury': 'area.personalInjury',
};

const SORT_OPTIONS = [
  { value: 'soonest', label: 'Soonest availability' },
  { value: 'price_asc', label: 'Consultation price: low to high' },
  { value: 'price_desc', label: 'Consultation price: high to low' },
  { value: 'distance', label: 'Distance' },
  { value: 'name', label: 'Name A–Z' },
];

const SORT_CLAUSES = {
  soonest: 'Sorted by soonest availability.',
  price_asc: 'Sorted by consultation price, low to high.',
  price_desc: 'Sorted by consultation price, high to low.',
  distance: 'Sorted by distance.',
  name: 'Sorted by name, A–Z.',
};

function parseSlotDate(slots) {
  if (!slots || !slots.length) return Infinity;
  const d = new Date(slots[0]);
  return isNaN(d) ? Infinity : d.getTime();
}

function parseDistance(dist) {
  if (!dist) return Infinity;
  const m = String(dist).match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : Infinity;
}

function applyFilters(attorneys, filters) {
  return attorneys.filter((a) => {
    if ((filters.areas || []).length > 0 && !filters.areas.includes(a.practice_area)) return false;
    if (filters.maxFee < 500 && (a.consult_fee || 0) > filters.maxFee) return false;
    if ((filters.languages || []).length > 0) {
      const aLangs = (a.languages || []).map((l) => l.toLowerCase());
      if (!filters.languages.some((fl) => aLangs.includes(fl.toLowerCase()))) return false;
    }
    if (filters.minRating !== 'all' && (a.rating || 0) < parseFloat(filters.minRating)) return false;
    if (filters.state && a.state !== filters.state) return false;
    if (filters.city && a.city !== filters.city) return false;
    if (filters.speaksSpanish && !a.spanish_speaker && !(a.languages || []).some((l) => l.toLowerCase().includes('spanish'))) return false;
    if (filters.spanishStaff && !a.bilingual_staff) return false;
    if (filters.translationAvail && !a.interpreter_available) return false;
    return true;
  });
}

function sortAttorneys(list, sort) {
  const arr = [...list];
  if (sort === 'price_asc') arr.sort((a, b) => (a.consult_fee || 0) - (b.consult_fee || 0));
  else if (sort === 'price_desc') arr.sort((a, b) => (b.consult_fee || 0) - (a.consult_fee || 0));
  else if (sort === 'name') arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  else if (sort === 'distance') arr.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
  else arr.sort((a, b) => parseSlotDate(a.available_slots) - parseSlotDate(b.available_slots));
  return arr;
}

export default function AttorneyBrowse({ attorneys, loading, filters, onChange }) {
  const { t } = useLanguage();
  const [sort, setSort] = useState('soonest');

  const filtered = useMemo(() => applyFilters(attorneys, filters), [attorneys, filters]);
  const sorted = useMemo(() => sortAttorneys(filtered, sort), [filtered, sort]);

  const selectedArea = (filters.areas || [])[0];
  const hasLocation = filters.city && filters.state;

  let heading = `${filtered.length} attorneys match your filters`;
  if (selectedArea && hasLocation) {
    heading = `${filtered.length} ${selectedArea} attorneys in ${filters.city}, ${filters.state}`;
  } else if (selectedArea) {
    heading = `${filtered.length} ${selectedArea} attorneys`;
  } else if (hasLocation) {
    heading = `${filtered.length} attorneys in ${filters.city}, ${filters.state}`;
  }

  return (
    <section id="browse" className="bg-[var(--ground)]">
      <div className="px-6 lg:px-8 pt-14 pb-6 max-w-[1200px] mx-auto">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] font-body mb-3">{t('browse.label')}</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="font-serif font-medium text-[26px] lg:text-[34px] text-[var(--text)] leading-[1.1] mb-2">{heading}</h2>
            <p className="text-sm text-[var(--text-3)] font-body">
              {SORT_CLAUSES[sort]} Attorneys pay a flat fee to be listed on Brief. Brief does not recommend or endorse any attorney.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-3)] font-body">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 border border-[var(--line-2)] bg-[var(--surface)] px-3 text-sm font-body text-[var(--text)] rounded-md outline-none focus:border-[var(--accent)]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <SearchFilterBar filters={filters} onChange={onChange} attorneys={attorneys} />

      <div className="py-10">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center py-32">
            {hasLocation ? (
              <>
                <h2 className="font-serif font-medium text-[28px] lg:text-[34px] text-[var(--text)] mb-4">
                  {t('browse.addingSoon.title')} {filters.city} {t('browse.addingSoon.soon')}
                </h2>
                <p className="text-[var(--text-3)] font-body mb-8">{t('browse.addingSoon.desc')}</p>
              </>
            ) : (
              <>
                <h2 className="font-serif font-medium text-[28px] lg:text-[34px] text-[var(--text)] mb-4">{t('browse.noMatch.title')}</h2>
                <p className="text-[var(--text-3)] font-body mb-8">{t('browse.noMatch.desc')}</p>
              </>
            )}
            <button
              onClick={() => onChange({ location: '', state: '', city: '', areas: [], languages: [], maxFee: 500, minRating: 'all', speaksSpanish: false, spanishStaff: false, translationAvail: false })}
              className="px-6 py-3 border border-[var(--text)] text-[var(--text)] text-sm font-body hover:bg-[var(--text)] hover:text-[var(--ground)] transition-all duration-200 mr-3"
            >
              {t('browse.clearFilters')}
            </button>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {PRACTICE_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => onChange({ ...filters, areas: [area] })}
                  className="px-4 py-2 text-sm font-body border border-[var(--line-2)] text-[var(--text-3)] hover:border-[var(--text)] hover:text-[var(--text)] transition-all"
                  style={{ borderRadius: 999 }}
                >
                  {t(AREA_LABEL_KEYS[area] || area)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
            <AttorneyCarousel attorneys={sorted} />
          </div>
        )}
      </div>
    </section>
  );
}