import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import HeroSearchCard from './HeroSearchCard';

// ASCII-mosaic rendering of the Temple of Hephaestus — the visual anchor
// for the brand ("the law as an old, steady institution"). Also used as
// the search-card backdrop below.
const HERO_IMAGE = '/images/hero-temple.jpg';
const HERO_LOGO = '/brand/logo-dark.png';



export default function Hero({ onSearch }) {
  const navigate = useNavigate();
  const { t, language, languageManuallySet } = useLanguage();


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



  return (
    <section className="relative w-full overflow-hidden min-h-[440px] lg:min-h-[600px] flex items-center justify-center">
      {/* Full-width temple artwork background */}
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover', objectPosition: 'center 62%' }}
      />

      {/* Dark scrim overlay — keeps white text readable over the artwork */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(16,28,23,0.45), rgba(16,28,23,0.58))' }} />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[1100px] mx-auto px-6 lg:px-8 py-14 sm:py-16 lg:py-24 text-center">
        {/* Brand mark over the artwork, slightly darkened so it sits into the image */}
        <img
          src={HERO_LOGO}
          alt="Brief"
          className="h-12 sm:h-14 lg:h-16 w-auto object-contain mb-6"
          style={{ filter: 'brightness(0.88) drop-shadow(0 2px 12px rgba(16,28,23,0.45))' }}
        />
        {/* Headline — fixed height reserved via invisible longest-variant (ES) span */}
        <h1
          className="relative font-heading text-[34px] sm:text-[48px] lg:text-[58px] text-white text-center leading-[1.08] tracking-[-0.01em] min-h-[42px] sm:min-h-[56px] lg:min-h-[64px] flex items-center justify-center"
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
                <span className="inline-block w-[3px] h-[0.85em] bg-[var(--surface)] ml-1 align-middle animate-pulse" />
              )}
            </span>
          )}
        </h1>

        {/* Subline — fixed height reserved via invisible longest-variant (ES) span */}
        <p
          className="relative text-white/90 text-center text-base sm:text-lg font-body mt-5 max-w-2xl min-h-[28px] sm:min-h-[32px] flex items-center justify-center"
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

        {/* Search bar — reused on homepage and Areas of Help */}
        <div className="w-full flex justify-center mt-9"><HeroSearchCard onSearch={onSearch} /></div>

        {/* Fine print */}
        <p className="text-xs text-white/70 font-body mt-7 text-center max-w-2xl">{t('hero.fineprint')}</p>
        <p className="text-xs text-white/55 font-body mt-1.5 text-center max-w-2xl">{t('hero.financingSoon')}</p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
          <button
            onClick={() => navigate('/areas-of-help')}
            className="px-8 py-4 bg-[var(--surface)] text-[var(--text)] text-sm font-body font-medium hover:bg-[var(--accent)] hover:text-[var(--accent-on)] transition-all duration-300 hover:scale-[1.02] min-w-[200px]"
          >
            {t('hero.bookConsultation')}
          </button>
          <button
            onClick={() => navigate('/financing')}
            className="px-8 py-4 border border-white/60 text-white text-sm font-body font-medium hover:border-white transition-all duration-200 min-w-[200px]"
          >
            {t('hero.seeFinancing')}
          </button>
        </div>
      </div>
    </section>
  );
}