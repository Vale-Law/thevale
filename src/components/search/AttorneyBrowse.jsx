import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchFilterBar from './SearchFilterBar';
import CarouselRow from './CarouselRow';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const PRACTICE_AREAS = ['Family Law', 'Immigration', 'Personal Injury', 'Business Formation'];

function buildRows(attorneys, filters) {
  const nearYou = (filters.city || filters.state)
    ? attorneys.filter(a =>
        (filters.city ? a.city === filters.city : true) &&
        (filters.state ? a.state === filters.state : true)
      )
    : attorneys;

  const topRated = [...attorneys].sort((a, b) => (b.rating || 0) - (a.rating || 0)).filter(a => (a.rating || 0) >= 4.8);

  const rows = [
    { id: 'nearYou', title: 'Near you', attorneys: nearYou },
    { id: 'toprated', title: 'Top rated', attorneys: topRated },
  ];

  return rows.filter(r => r.attorneys.length > 0);
}

function applyFilters(attorneys, filters) {
  return attorneys.filter(a => {
    if ((filters.areas || []).length > 0 && !filters.areas.includes(a.practice_area)) return false;
    if (filters.maxFee < 500 && (a.consult_fee || 0) > filters.maxFee) return false;
    if ((filters.languages || []).length > 0) {
      const aLangs = (a.languages || []).map(l => l.toLowerCase());
      if (!filters.languages.some(fl => aLangs.includes(fl.toLowerCase()))) return false;
    }
    if (filters.minRating !== 'all' && (a.rating || 0) < parseFloat(filters.minRating)) return false;
    if (filters.state && a.state !== filters.state) return false;
    if (filters.city && a.city !== filters.city) return false;
    // Spanish-specific filter toggles
    if (filters.speaksSpanish && !a.spanish_speaker && !(a.languages || []).some(l => l.toLowerCase().includes('spanish'))) return false;
    if (filters.spanishStaff && !a.bilingual_staff) return false;
    if (filters.translationAvail && !a.interpreter_available) return false;
    return true;
  });
}

function rankAttorneys(attorneys, screening, requireSpanish) {
  let result = [...attorneys];

  // Spanish preference ranking
  if (requireSpanish) {
    result.sort((a, b) => {
      const aScore = (a.spanish_speaker ? 10 : 0) + (a.bilingual_staff ? 5 : 0) + (a.interpreter_available ? 3 : 0) + ((a.languages || []).some(l => l.toLowerCase().includes('spanish')) ? 8 : 0);
      const bScore = (b.spanish_speaker ? 10 : 0) + (b.bilingual_staff ? 5 : 0) + (b.interpreter_available ? 3 : 0) + ((b.languages || []).some(l => l.toLowerCase().includes('spanish')) ? 8 : 0);
      return bScore - aScore;
    });
  }

  // Screening-based ranking
  if (screening && !screening.skipped && screening.answers) {
    const answers = screening.answers;
    const firstAnswer = (answers.matter_type || '').toLowerCase();
    const urgencyAnswer = (answers.urgency || '').toLowerCase();
    const langAnswer = (answers.language || answers.preference || '').toLowerCase();

    const isUrgent = urgencyAnswer.includes('urgent') || urgencyAnswer.includes('immediately');
    const langPref = langAnswer && !['no preference', 'not sure', ''].includes(langAnswer) ? langAnswer : '';

    result.sort((a, b) => {
      let scoreA = 0, scoreB = 0;

      if (firstAnswer) {
        const matchA = (a.specialties || []).some(s => s.toLowerCase().includes(firstAnswer) || firstAnswer.includes(s.toLowerCase()));
        const matchB = (b.specialties || []).some(s => s.toLowerCase().includes(firstAnswer) || firstAnswer.includes(s.toLowerCase()));
        if (matchA) scoreA += 10;
        if (matchB) scoreB += 10;
      }

      if (langPref) {
        const aHas = (a.languages || []).some(l => l.toLowerCase().includes(langPref));
        const bHas = (b.languages || []).some(l => l.toLowerCase().includes(langPref));
        if (aHas) scoreA += 5;
        if (bHas) scoreB += 5;
      }

      if (isUrgent) {
        const aSlots = (a.available_slots || []).length;
        const bSlots = (b.available_slots || []).length;
        if (aSlots > bSlots) scoreA += 3;
        if (bSlots > aSlots) scoreB += 3;
      }

      return scoreB - scoreA;
    });
  }

  return result;
}

export default function AttorneyBrowse({ attorneys, loading, filters, onChange, screening, requireSpanish }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const filtered = useMemo(() => applyFilters(attorneys, filters), [attorneys, filters]);
  const ranked = useMemo(() => rankAttorneys(filtered, screening, requireSpanish), [filtered, screening, requireSpanish]);
  const rows = useMemo(() => buildRows(ranked, filters), [ranked, filters]);

  const selectedArea = (filters.areas || [])[0];
  const hasLocation = filters.city && filters.state;

  let heading = t('browse.heading');
  if (selectedArea && hasLocation) {
    heading = `${selectedArea} ${t('browse.attorneysIn')} ${filters.city}, ${filters.state}`;
  } else if (selectedArea) {
    heading = `${selectedArea}`;
  } else if (hasLocation) {
    heading = `${t('browse.attorneysIn')} ${filters.city}, ${filters.state}`;
  }

  const showMatchLine = screening && !screening.skipped;

  return (
    <section id="browse" className="bg-[#F5F0E8]">
      <div className="px-6 lg:px-8 pt-14 pb-6 max-w-[1200px] mx-auto">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-3">{t('browse.label')}</p>
        <h2 className="font-serif font-medium text-[26px] lg:text-[34px] text-[#111418] leading-[1.1] mb-2">{heading}</h2>
        <p className="text-[15px] text-[#8A8578] font-body">{t('browse.subheading')}</p>
        {showMatchLine && (
          <p className="text-sm text-[#0a5dc2] font-body mt-2">{t('browse.matchLine')}</p>
        )}
      </div>

      <SearchFilterBar filters={filters} onChange={onChange} attorneys={attorneys} />

      <div className="py-10 space-y-[88px]">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center py-32">
            {hasLocation ? (
              <>
                <h2 className="font-serif font-medium text-[28px] lg:text-[34px] text-[#111418] mb-4">
                  {t('browse.addingSoon.title')} {filters.city} {t('browse.addingSoon.soon')}
                </h2>
                <p className="text-[#8A8578] font-body mb-8">{t('browse.addingSoon.desc')}</p>
              </>
            ) : (
              <>
                <h2 className="font-serif font-medium text-[28px] lg:text-[34px] text-[#111418] mb-4">{t('browse.noMatch.title')}</h2>
                <p className="text-[#8A8578] font-body mb-8">{t('browse.noMatch.desc')}</p>
              </>
            )}
            <button
              onClick={() => onChange({ location: '', state: '', city: '', areas: [], languages: [], maxFee: 500, minRating: 'all', speaksSpanish: false, spanishStaff: false, translationAvail: false })}
              className="px-6 py-3 border border-[#111418] text-[#111418] text-sm font-body hover:bg-[#111418] hover:text-white transition-all duration-200 mr-3"
            >
              {t('browse.clearFilters')}
            </button>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {PRACTICE_AREAS.map(area => (
                <button
                  key={area}
                  onClick={() => onChange(f => ({ ...f, areas: [area] }))}
                  className="px-4 py-2 text-sm font-body border border-[#E5E2DC] text-[#8A8578] hover:border-[#111418] hover:text-[#111418] transition-all"
                  style={{ borderRadius: 999 }}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        ) : (
          rows.map(row => (
            <CarouselRow key={row.id} title={row.title} attorneys={row.attorneys} visible={true} />
          ))
        )}

      </div>
    </section>
  );
}