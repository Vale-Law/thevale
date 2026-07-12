import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import BrowseModal from '@/components/search/BrowseModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/lib/i18n';

export default function Header() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileLearnOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileLearnOpen(false);
  };

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 z-[1000]" onClick={closeMenu} aria-hidden="true" />
      )}

      <div className="sticky top-0 z-[1100]">
        <AnnouncementBar />
        <header
          className={`bg-[#FAF9F7]/90 backdrop-blur-md transition-all duration-300 ${
            scrolled ? 'border-b border-[#E5E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : ''
          }`}
        >
          <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-28 flex items-center justify-between">
            <Link to="/" onClick={closeMenu} className="flex items-center relative z-[1200]">
              <img
                src="https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/03090a7d8_A685878D-8D1E-4B4E-BD14-35608619A7D7.PNG"
                alt="Brief"
                className="h-20 w-auto object-contain"
                style={{
                  animation: prefersReducedMotion ? 'none' : 'float 3.5s ease-in-out infinite',
                }}
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setBrowseOpen(true)}
                className="text-sm text-[#111418] hover:text-[#0a5dc2] transition-colors flex items-center gap-1"
              >
                {t('nav.browse')}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <Link to="/financing" className="text-sm text-[#111418] hover:text-[#0a5dc2] transition-colors">
                {t('nav.financing')}
              </Link>
              <div className="relative" onMouseEnter={() => setLearnOpen(true)} onMouseLeave={() => setLearnOpen(false)}>
                <button className="text-sm text-[#111418] hover:text-[#0a5dc2] transition-colors flex items-center gap-1">
                  {t('nav.learn')}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {learnOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#E5E2DC] shadow-[0_4px_20px_rgba(0,0,0,0.08)] py-2 z-[1200]">
                    <Link to="/learn/immigration-law" className="block px-4 py-2.5 text-sm text-[#111418] hover:bg-[#FAF9F7] hover:text-[#0a5dc2] transition-colors">
                      {t('learn.immigrationLaw')}
                    </Link>
                    <Link to="/learn/personal-injury-law" className="block px-4 py-2.5 text-sm text-[#111418] hover:bg-[#FAF9F7] hover:text-[#0a5dc2] transition-colors">
                      {t('learn.personalInjuryLaw')}
                    </Link>
                    <Link to="/learn" className="block px-4 py-2.5 text-sm text-[#111418] hover:bg-[#FAF9F7] hover:text-[#0a5dc2] transition-colors">
                      {t('nav.allGuides')} →
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/for-attorneys" className="text-sm text-[#111418] hover:text-[#0a5dc2] transition-colors">
                {t('nav.forAttorneys')}
              </Link>
              <LanguageSwitcher />
            </nav>

            {/* Desktop CTA */}
            <Link
              to="/?browse=1"
              className="hidden md:inline-flex items-center px-5 py-2.5 border border-[#111418] text-[#111418] text-sm font-medium hover:bg-[#111418] hover:text-white transition-all duration-200 hover:scale-[1.02]"
            >
              {t('nav.bookConsultation')}
            </Link>

            {/* Mobile hamburger / close button */}
            <div className="md:hidden flex items-center gap-3 relative z-[1200]">
              <LanguageSwitcher compact />
              <button
                className="flex items-center justify-center w-11 h-11 text-[#111418]"
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile menu panel */}
        <div
          className="md:hidden bg-[#FAF9F7] border-b border-[#E5E2DC] overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: menuOpen ? '600px' : '0px',
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'auto' : 'none',
          }}
        >
          <nav className="px-6 py-4 flex flex-col gap-1">
            <button
              onClick={() => { closeMenu(); setBrowseOpen(true); }}
              className="w-full text-left py-3 text-base text-[#111418] hover:text-[#0a5dc2] transition-colors border-b border-[#E5E2DC] flex items-center justify-between"
            >
              {t('nav.browse')}
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="opacity-50">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <Link to="/financing" onClick={closeMenu} className="py-3 text-base text-[#111418] hover:text-[#0a5dc2] transition-colors border-b border-[#E5E2DC]">
              {t('nav.financing')}
            </Link>

            <div className="border-b border-[#E5E2DC]">
              <button
                onClick={() => setMobileLearnOpen(o => !o)}
                className="w-full py-3 text-base text-[#111418] flex items-center justify-between"
              >
                {t('nav.learn')}
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="opacity-50 transition-transform duration-200" style={{ transform: mobileLearnOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: mobileLearnOpen ? '200px' : '0px' }}>
                <div className="pl-4 pb-2 flex flex-col gap-1">
                  <Link to="/learn/immigration-law" onClick={closeMenu} className="py-2 text-sm text-[#8A8578] hover:text-[#0a5dc2] transition-colors">
                    {t('learn.immigrationLaw')}
                  </Link>
                  <Link to="/learn/personal-injury-law" onClick={closeMenu} className="py-2 text-sm text-[#8A8578] hover:text-[#0a5dc2] transition-colors">
                    {t('learn.personalInjuryLaw')}
                  </Link>
                  <Link to="/learn" onClick={closeMenu} className="py-2 text-sm text-[#8A8578] hover:text-[#0a5dc2] transition-colors">
                    {t('nav.allGuides')} →
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/for-attorneys" onClick={closeMenu} className="py-3 text-base text-[#111418] hover:text-[#0a5dc2] transition-colors border-b border-[#E5E2DC]">
              {t('nav.forAttorneys')}
            </Link>

            <Link to="/?browse=1" onClick={closeMenu} className="mt-4 py-3 px-5 border border-[#111418] text-[#111418] text-sm font-medium text-center hover:bg-[#111418] hover:text-white transition-all duration-200">
              {t('nav.bookConsultation')}
            </Link>
          </nav>
        </div>
      </div>

      <BrowseModal open={browseOpen} onClose={() => setBrowseOpen(false)} />
    </>
  );
}