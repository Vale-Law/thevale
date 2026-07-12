import { useNavigate } from 'react-router-dom';
import { format, addDays, startOfDay } from 'date-fns';
import { ShieldCheck, MapPin, Star, Languages } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useOnboarding } from '@/lib/onboardingContext';
import { useLanguage } from '@/lib/i18n';

function getDisplaySlots(slots) {
  if (!slots || slots.length === 0) return [];
  return slots.slice(0, 6).map(s => {
    const d = new Date(s);
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const slotDay = startOfDay(d);
    let prefix = format(d, 'EEE');
    if (slotDay.getTime() === today.getTime()) prefix = 'Today';
    else if (slotDay.getTime() === tomorrow.getTime()) prefix = 'Tmrw';
    return { label: `${prefix} ${format(d, 'h:mm a')}`, value: s };
  });
}

function LanguageBadges({ attorney, t }) {
  const badges = [];
  const speaksSpanish = attorney.spanish_speaker || (attorney.languages || []).some(l => l.toLowerCase().includes('spanish'));
  if (speaksSpanish) {
    badges.push({ icon: '🗯️', label: t('badge.speaksSpanish') });
  }
  if (attorney.bilingual_staff) {
    badges.push({ icon: '🗯️', label: t('badge.bilingualStaff') });
  }
  if (attorney.interpreter_available) {
    badges.push({ icon: '🗯️', label: t('badge.translationAvail') });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {badges.map((b, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-[10px] border border-[#0a5dc2]/20 text-[#0a5dc2] px-2 py-0.5 font-body bg-[#EAF2FB]/50">
          {b.icon} {b.label}
        </span>
      ))}
    </div>
  );
}

export default function AttorneyCard({ attorney }) {
  const navigate = useNavigate();
  const { openOnboarding } = useOnboarding();
  const { t } = useLanguage();
  const slots = getDisplaySlots(attorney.available_slots);
  const monthlyAffirm = attorney.typical_retainer ? Math.round(attorney.typical_retainer / 12) : null;

  const handleSlot = async (slot) => {
    const bookingUrl = `/booking?attorney=${attorney.id}&slot=${encodeURIComponent(slot)}`;
    base44.analytics.track({ eventName: 'Lawyer Selected', properties: { attorney_id: attorney.id } });
    const authed = await base44.auth.isAuthenticated();
    if (authed) {
      navigate(bookingUrl);
    } else {
      openOnboarding(bookingUrl);
    }
  };

  return (
    <div className="bg-white border border-[#E5E2DC] p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-5">
        <img
          src={attorney.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(attorney.name)}&background=EAF2FB&color=0a5dc2&size=100`}
          alt={attorney.name}
          className="w-20 h-20 object-cover flex-shrink-0 cursor-pointer"
          onClick={() => navigate(`/attorney/${attorney.id}`)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-1">
            <button
              onClick={() => navigate(`/attorney/${attorney.id}`)}
              className="font-serif text-xl text-[#111418] hover:text-[#0a5dc2] transition-colors leading-tight"
            >
              {attorney.name}
            </button>
            {attorney.verified && <ShieldCheck className="w-4 h-4 text-[#0a5dc2] flex-shrink-0 mt-1" />}
            {attorney.board_certified && (
              <span className="text-[10px] uppercase tracking-[0.08em] border border-[#0a5dc2]/30 text-[#0a5dc2] px-2 py-0.5 font-body">
                {t('card.boardCertified')}
              </span>
            )}
          </div>
          <p className="text-sm text-[#8A8578] font-body mb-2">
            {attorney.practice_area} · {attorney.years_experience} {t('card.yrsExp')}
          </p>

          {/* Language badges */}
          <LanguageBadges attorney={attorney} t={t} />

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#8A8578] font-body mb-3">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#111418] text-[#111418]" />
              <span className="text-[#111418] font-medium">{attorney.rating}</span>
              <span className="text-[#8A8578]">({attorney.review_count})</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {attorney.location}
            </span>
            {attorney.languages && attorney.languages.length > 1 && (
              <span className="flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" />
                {attorney.languages.join(', ')}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-2 mb-4">
            <span className="font-serif text-2xl text-[#111418]">${attorney.consult_fee}</span>
            <span className="text-sm text-[#8A8578] font-body">{t('card.consultation')}</span>
            {monthlyAffirm && (
              <span className="text-xs text-[#0a5dc2] font-body">
                · {t('card.financeRetainer')} ${monthlyAffirm}{t('card.mo')}
              </span>
            )}
          </div>

          {slots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {slots.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleSlot(value)}
                  className="text-xs px-3 py-1.5 border border-[#E5E2DC] text-[#111418] hover:bg-[#111418] hover:text-white hover:border-[#111418] transition-all duration-200 font-body"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8A8578] font-body">{t('card.noSlots')}</p>
          )}
        </div>
      </div>
    </div>
  );
}