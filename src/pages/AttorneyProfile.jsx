import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingWidget from '@/components/attorney/BookingWidget';
import { ShieldCheck, MapPin, ArrowLeft, Loader2, Star, Languages } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n';

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'fill-[#111418] text-[#111418]' : 'text-[#E5E2DC] fill-[#E5E2DC]'}`} />
      ))}
    </div>
  );
}

export default function AttorneyProfile() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [attorney, setAttorney] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
      </div>
    </div>
  );

  if (!attorney) return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="text-center py-32 text-[#8A8578] font-body">{t('profile.notFound')}</div>
    </div>
  );

  const speaksSpanish = attorney.spanish_speaker || (attorney.languages || []).some(l => l.toLowerCase().includes('spanish'));

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10">
        <Link to="/?browse=1" className="inline-flex items-center gap-1.5 text-sm text-[#8A8578] hover:text-[#0a5dc2] mb-8 transition-colors font-body">
          <ArrowLeft className="w-4 h-4" />
          {t('profile.backToResults')}
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left column */}
          <div className="flex-1 space-y-8 min-w-0">

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-[#E5E2DC]">
              <img
                src={attorney.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(attorney.name)}&background=EAF2FB&color=0a5dc2&size=120`}
                alt={attorney.name}
                className="w-28 h-28 object-cover flex-shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-serif text-[32px] lg:text-[40px] text-[#111418] leading-[1.05]">
                    {attorney.name}
                  </h1>
                  {attorney.verified && <ShieldCheck className="w-5 h-5 text-[#0a5dc2]" />}
                  {attorney.board_certified && (
                    <span className="text-[10px] uppercase tracking-[0.08em] border border-[#0a5dc2]/30 text-[#0a5dc2] px-2 py-0.5 font-body">
                      {t('card.boardCertified')}
                    </span>
                  )}
                </div>
                <p className="text-[#8A8578] font-body mb-3">
                  {attorney.practice_area} · {attorney.years_experience} {t('profile.yearsExperience')}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <StarRow rating={attorney.rating} />
                  <span className="text-sm font-medium text-[#111418] font-body">{attorney.rating}</span>
                  <span className="text-sm text-[#8A8578] font-body">({attorney.review_count} {t('profile.reviews')})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#8A8578] font-body">
                  <MapPin className="w-4 h-4" />
                  {attorney.location}
                  {attorney.distance && <span className="ml-1">· {attorney.distance}</span>}
                </div>

                {/* Language badges */}
                {(speaksSpanish || attorney.bilingual_staff || attorney.interpreter_available) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {speaksSpanish && (
                      <span className="inline-flex items-center gap-1 text-xs border border-[#0a5dc2]/30 text-[#0a5dc2] px-3 py-1 font-body bg-[#EAF2FB]/50">
                        🗣️ {t('badge.speaksSpanish')}
                      </span>
                    )}
                    {attorney.bilingual_staff && (
                      <span className="inline-flex items-center gap-1 text-xs border border-[#0a5dc2]/30 text-[#0a5dc2] px-3 py-1 font-body bg-[#EAF2FB]/50">
                        🗣️ {t('badge.bilingualStaff')}
                      </span>
                    )}
                    {attorney.interpreter_available && (
                      <span className="inline-flex items-center gap-1 text-xs border border-[#0a5dc2]/30 text-[#0a5dc2] px-3 py-1 font-body bg-[#EAF2FB]/50">
                        🗣️ {t('badge.translationAvail')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">{t('profile.about')}</p>
              <p className="text-[#111418] leading-relaxed text-[17px] font-body mb-6">{attorney.bio}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#E5E2DC] pt-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] mb-1 font-body">{t('profile.education')}</p>
                  <p className="text-sm text-[#111418] font-body">{attorney.education}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] mb-1 font-body">{t('profile.barAdmission')}</p>
                  <p className="text-sm text-[#111418] font-body">{attorney.bar_admission}</p>
                </div>
                {attorney.languages && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] mb-1 font-body">{t('profile.languages')}</p>
                    <p className="text-sm text-[#111418] font-body">{attorney.languages.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            {attorney.specialties && attorney.specialties.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">{t('profile.specialties')}</p>
                <div className="flex flex-wrap gap-2">
                  {attorney.specialties.map(s => (
                    <span key={s} className="px-3 py-1.5 border border-[#E5E2DC] text-sm text-[#111418] font-body hover:border-[#111418] transition-colors">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-6 font-body">
                {t('profile.reviews')} ({reviews.length})
              </p>
              {reviews.length === 0 ? (
                <p className="text-sm text-[#8A8578] font-body">{t('profile.noReviews')}</p>
              ) : (
                <div className="space-y-8">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-[#E5E2DC] last:border-0 pb-8 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-serif text-lg text-[#111418]">{r.reviewer_name}</span>
                        <span className="text-xs text-[#8A8578] font-body">
                          {r.date ? format(new Date(r.date), 'MMM d, yyyy') : ''}
                        </span>
                      </div>
                      <StarRow rating={r.rating} />
                      <blockquote className="font-serif italic text-[17px] text-[#111418] mt-3 leading-relaxed">
                        "{r.review_text}"
                      </blockquote>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:w-80 flex-shrink-0">
            <BookingWidget attorney={attorney} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}