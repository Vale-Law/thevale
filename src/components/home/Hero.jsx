import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { US_STATES, getCitiesForState } from '@/lib/usLocations';
import { Search, MapPin, ChevronDown, ArrowRight, Briefcase } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const HERO_GIF = 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/0401aa1f5_63a02f7d041f5f83b2b14e23_NY.gif';

const PRACTICE_AREAS = ['Family Law', 'Personal Injury', 'Immigration', 'Criminal Defense', 'Business & Tax', 'Estate & Wills'];

export default function Hero({ onSearch }) {
  const navigate = useNavigate();
  const { t, language, languageManuallySet } = useLanguage();
  const [area, setArea] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [city, setCity] = useState('');
  const [searchText, setSearchText] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);

  // Animated rotating headline — alternates EN/ES every 1s until language manually selected
  const [headlineLang, setHeadlineLang] = useState('en');
  const [fade, setFade] = useState(true);

  // One-time typewriter intro for the headline + subline on page load
  const [prefersReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [typingPhase, setTypingPhase] = useState('headline'); // 'headline' | 'subline' | 'done'
  const [typedHeadline, setTypedHeadline] = useState('');
  const [typedSubline, setTypedSubline] = useState('');

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypingPhase('done');
      return;
    }
    const headlineFull = t('hero.animated.en');
    const sublineFull = t('hero.sublineNew.en');
    let i = 0;
    const headlineInterval = setInterval(() => {
      i++;
      setTypedHeadline(headlineFull.slice(0, i));
      if (i >= headlineFull.length) {
        clearInterval(headlineInterval);
        setTypingPhase('subline');
        setTimeout(() => {
          let j = 0;
          const sublineInterval = setInterval(() => {
            j++;
            setTypedSubline(sublineFull.slice(0, j));
            if (j >= sublineFull.length) {
              clearInterval(sublineInterval);
              setTypingPhase('done');
            }
          }, 22);
        }, 200);
      }
    }, 45);
    return () => clearInterval(headlineInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (languageManuallySet) {
      setHeadlineLang(language);
      setFade(true);
      return;
    }
    if (typingPhase !== 'done') return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setHeadlineLang(prev => prev === 'en' ? 'es' : 'en');
        setFade(true);
      }, 280);
    }, 1000);
    return () => clearInterval(interval);
  }, [languageManuallySet, language, typingPhase]);

  const cities = getCitiesForState(stateCode);

  const handleSearch = () => {
    onSearch(area, stateCode, city);
  };

  return (
    <section className="relative w-full overflow-hidden min-h-[440px] lg:min-h-[600px] flex items-center justify-center">
      {/* Full-width GIF background */}
      <img
        src={HERO_GIF}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />

      {/* Dark scrim overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.45))' }} />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[1200px] mx-auto px-6 lg:px-8 py-20 lg:py-28">
        {/* Headline — fixed height reserved via invisible longest-variant (ES) span */}
        <h1
          className="relative font-rounded font-bold text-[40px] sm:text-[52px] lg:text-[60px] text-white text-center leading-[1.05] tracking-[-0.02em] mb-4 min-h-[88px] sm:min-h-[114px] lg:min-h-[130px] flex items-center justify-center"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
        >
          <span className="invisible" aria-hidden="true">
            {t('hero.animated.es')}
          </span>
          {typingPhase === 'done' ? (
            <>
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: fade && headlineLang === 'en' ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
              >
                {t('hero.animated.en')}
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: fade && headlineLang === 'es' ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
              >
                {t('hero.animated.es')}
              </span>
            </>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              {typedHeadline}
              {typingPhase === 'headline' && (
                <span className="inline-block w-[3px] h-[0.85em] bg-white ml-1 align-middle animate-pulse" />
              )}
            </span>
          )}
        </h1>

        {/* Subline — fixed height reserved via invisible longest-variant (ES) span */}
        <p
          className="relative text-white/90 text-center text-base sm:text-lg font-body mb-8 max-w-xl min-h-[56px] sm:min-h-[58px] flex items-center justify-center"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          <span className="invisible" aria-hidden="true">
            {t('hero.sublineNew.es')}
          </span>
          {typingPhase === 'done' ? (
            <>
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: fade && headlineLang === 'en' ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
              >
                {t('hero.sublineNew.en')}
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: fade && headlineLang === 'es' ? 1 : 0, transition: 'opacity 400ms ease-in-out' }}
              >
                {t('hero.sublineNew.es')}
              </span>
            </>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              {typedSubline}
              {typingPhase === 'subline' && (
                <span className="inline-block w-[2px] h-[1em] bg-white/90 ml-1 align-middle animate-pulse" />
              )}
            </span>
          )}
        </p>

        {/* Search bar — clean white rounded card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full max-w-2xl p-3 sm:p-4">
          {/* Main search field */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 px-2">
              <Search className="w-4 h-4 text-[#8A8578] shrink-0" />
              <input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('hero.searchPlaceholder')}
                className="w-full bg-transparent outline-none text-sm text-[#111418] font-body placeholder:text-[#8A8578]"
              />
            </div>
            <button
              onClick={handleSearch}
              aria-label={t('hero.search')}
              className="w-10 h-10 rounded-full bg-[#0a5dc2] hover:bg-[#084a9e] transition-colors flex items-center justify-center text-white shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pill selectors */}
          <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
            {/* Location pill */}
            <div className="relative">
              <button
                onClick={() => setLocationOpen(o => !o)}
                className="flex items-center gap-1.5 pl-3 pr-2 py-2 text-sm font-body text-[#111418] border border-[#E5E2DC] rounded-full hover:border-[#111418] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8A8578]" />
                {city ? `${city}, ${stateCode}` : t('hero.selectLocation')}
                <ChevronDown className="w-3 h-3 text-[#8A8578]" />
              </button>
              {locationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLocationOpen(false)} />
                  <div className="absolute z-50 mt-2 bg-white border border-[#E5E2DC] rounded-xl shadow-xl p-3 w-60 left-0">
                    <select
                      value={stateCode}
                      onChange={e => { setStateCode(e.target.value); setCity(''); }}
                      className="w-full border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#111418] outline-none font-body appearance-none cursor-pointer mb-2"
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
                      className="w-full border border-[#E5E2DC] bg-white px-3 py-2 text-sm text-[#111418] outline-none font-body appearance-none cursor-pointer disabled:opacity-40"
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
                className="flex items-center gap-1.5 pl-3 pr-2 py-2 text-sm font-body text-[#111418] border border-[#E5E2DC] rounded-full hover:border-[#111418] transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#8A8578]" />
                {area || t('hero.addDetails')}
                <ChevronDown className="w-3 h-3 text-[#8A8578]" />
              </button>
              {areaOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAreaOpen(false)} />
                  <div className="absolute z-50 mt-2 bg-white border border-[#E5E2DC] rounded-xl shadow-xl p-2 w-56 max-h-64 overflow-auto left-0">
                    {PRACTICE_AREAS.map(a => (
                      <button
                        key={a}
                        onClick={() => { setArea(a); setAreaOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm font-body text-[#111418] rounded-lg hover:bg-[#F5F0E8] transition-colors"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fine print */}
        <p className="text-xs text-white/70 font-body mt-4 text-center max-w-2xl">{t('hero.fineprint')}</p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => navigate('/booking')}
            className="px-8 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 hover:scale-[1.02] min-w-[180px]"
          >
            {t('hero.bookConsultation')}
          </button>
          <button
            onClick={() => navigate('/financing')}
            className="px-8 py-4 border border-white/60 text-white text-sm font-medium hover:border-white transition-all duration-200 min-w-[180px]"
          >
            {t('hero.seeFinancing')}
          </button>
        </div>
      </div>
    </section>
  );
}