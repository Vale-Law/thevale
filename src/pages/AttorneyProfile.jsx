import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import ProfileHeader from '@/components/attorney/ProfileHeader';
import RatingCard from '@/components/attorney/RatingCard';
import ProfileTabs from '@/components/attorney/ProfileTabs';
import Highlights from '@/components/attorney/Highlights';
import AboutSection from '@/components/attorney/AboutSection';
import PracticeAreasSection from '@/components/attorney/PracticeAreasSection';
import OfficeLocation from '@/components/attorney/OfficeLocation';
import ClientReviews from '@/components/attorney/ClientReviews';
import FaqSection from '@/components/attorney/FaqSection';
import MiniHeader from '@/components/attorney/MiniHeader';
import BookingPanel from '@/components/attorney/BookingPanel';
import { nextAvailableLabel } from '@/components/attorney/profileUtils';

const SECTION_IDS = ['highlights', 'about', 'practice-areas', 'location', 'reviews', 'faqs'];

export default function AttorneyProfile() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [attorney, setAttorney] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('highlights');
  const [miniVisible, setMiniVisible] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Attorney.filter({ id }),
      base44.entities.Review.filter({ attorney_id: id }),
    ]).then(([attorneys, revs]) => {
      setAttorney(attorneys[0] || null);
      setReviews(revs);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const onScroll = () => setMiniVisible(window.scrollY > 360);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock the page behind the mobile booking sheet, same as Header does for
  // its mobile menu — otherwise wheel/touch scrolling chains through the
  // sheet to the page underneath.
  useEffect(() => {
    document.body.style.overflow = mobileSheet ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileSheet]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    SECTION_IDS.forEach((sid) => {
      const el = document.getElementById(sid);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [attorney]);

  // Scroll clearance: the desktop sticky stack is the announcement bar +
  // header (--header-height, 146px) plus the pinned section tabs (~48px).
  // The old -120 offset was smaller than the header alone, so scroll
  // targets tucked underneath it.
  const scrollTo = useCallback((sid) => {
    const el = document.getElementById(sid);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setActive(sid);
  }, []);

  const handleBook = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      const el = document.getElementById('booking');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 170;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      setMobileSheet(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!attorney) {
    return (
      <div className="min-h-screen bg-[#FAF9F7]">
        <Header />
        <div className="text-center py-32 text-[#8A8578] font-body">{t('profile.notFound')}</div>
        <Footer />
      </div>
    );
  }

  const nextLabel = nextAvailableLabel(attorney);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <MiniHeader attorney={attorney} visible={miniVisible} onBook={handleBook} />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 lg:py-10 pb-40 lg:pb-10">
        <Link to="/?browse=1" className="inline-flex items-center gap-1.5 text-sm text-[#8A8578] hover:text-[#0a5dc2] mb-8 transition-colors font-body">
          <ArrowLeft className="w-4 h-4" />
          {t('profile.backToResults')}
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            <ProfileHeader attorney={attorney} />
            <RatingCard attorney={attorney} reviews={reviews} onSeeAll={() => scrollTo('reviews')} />

            {/* No wrapper div: ProfileTabs is position:sticky, and a sticky
                element can only travel within its parent. A wrapper exactly
                as tall as the tabs pinned them to a 48px corridor -- i.e.
                never. Direct child of the tall article column, they pin for
                its whole height. */}
            <ProfileTabs active={active} onSelect={scrollTo} />

            <div className="space-y-10 mt-8">
              <section id="highlights" className="scroll-mt-40">
                <h2 className="font-serif text-xl text-[#111418] mb-4">Highlights</h2>
                <Highlights attorney={attorney} />
              </section>

              <section id="about" className="scroll-mt-40">
                <AboutSection attorney={attorney} />
              </section>

              <section id="practice-areas" className="scroll-mt-40">
                <PracticeAreasSection attorney={attorney} />
              </section>

              <section id="location" className="scroll-mt-40">
                <OfficeLocation attorney={attorney} />
              </section>

              <section id="reviews" className="scroll-mt-40">
                <ClientReviews attorney={attorney} reviews={reviews} />
              </section>

              <section id="faqs" className="scroll-mt-40">
                <FaqSection attorney={attorney} />
              </section>
            </div>

            <p className="text-xs text-[#8A8578] font-body mt-10 leading-relaxed">
              Attorneys pay a flat fee to be listed on Brief. Brief does not recommend or endorse any attorney and does not give legal advice.
            </p>
          </div>

          {/* Right column — sticky booking panel (desktop). top must clear the
              146px sticky header stack (--header-height) or the panel tucks
              underneath it while pinned. */}
          <div id="booking" className="hidden lg:block lg:w-[380px] shrink-0">
            <div className="sticky top-[168px] max-h-[calc(100vh-12rem)] overflow-y-auto no-scrollbar">
              <BookingPanel attorney={attorney} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom bar. Sits ABOVE the app-wide MobileTabBar
          (fixed bottom-0, z-[1100], ~64px tall) — at bottom-0 this bar was
          almost entirely buried underneath it and the Book online button
          could not be tapped at all. 64px matches .mobile-shell-pad's
          clearance for the same tab bar. */}
      <div className="lg:hidden fixed bottom-[calc(64px+env(safe-area-inset-bottom))] inset-x-0 z-40 bg-white border-t border-[#E5E2DC]">
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[#8A8578] font-body">Consultation</p>
            <p className="text-sm font-medium text-[#111418] font-body">${attorney.consult_fee}{nextLabel ? ` · Next available ${nextLabel}` : ''}</p>
          </div>
          <button onClick={() => setMobileSheet(true)} className="px-5 py-3 rounded-lg bg-[#0a5dc2] hover:bg-[#084a9e] text-white text-sm font-medium font-body transition-colors shrink-0">
            Book online
          </button>
        </div>
      </div>

      {/* Mobile booking sheet. z must beat the MobileTabBar's z-[1100] or
          the tab bar floats over the bottom of the open sheet and steals
          its taps; overscroll-contain stops sheet scrolling from chaining
          to the page. */}
      {mobileSheet && (
        <div className="lg:hidden fixed inset-0 z-[1200] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSheet(false)} />
          <div className="relative w-full max-h-[92vh] bg-[#FAF9F7] rounded-t-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E2DC]">
              <p className="font-serif text-lg text-[#111418]">Book a consultation</p>
              <button onClick={() => setMobileSheet(false)} aria-label="Close booking sheet" className="w-9 h-9 flex items-center justify-center text-[#111418]"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto overscroll-contain p-5 safe-pb">
              <BookingPanel attorney={attorney} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}