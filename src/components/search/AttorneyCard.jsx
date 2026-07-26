import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { format, startOfDay, addDays } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';

function getInitials(name) {
  return name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
}

function nextAvailable(attorney) {
  const slots = attorney.available_slots || [];
  if (!slots.length) return null;
  const d = new Date(slots[0]);
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const day = startOfDay(d);
  if (day.getTime() === today.getTime()) return 'today';
  if (day.getTime() === tomorrow.getTime()) return 'tomorrow';
  return format(d, 'EEE, MMM d');
}

export default function AttorneyCard({ attorney }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const next = nextAvailable(attorney);
  const location = attorney.city && attorney.state ? `${attorney.city}, ${attorney.state}` : attorney.location || 'Nationwide';
  const tagline = attorney.board_certified ? 'Board certified · New client consultations' : 'New client consultations';
  const areas = (attorney.practice_areas && attorney.practice_areas.length) ? attorney.practice_areas : (attorney.practice_area ? [attorney.practice_area] : []);
  const pills = areas.length > 3 ? [...areas.slice(0, 3), `+${areas.length - 3} more`] : areas;

  const book = () => {
    base44.analytics.track({ eventName: 'Lawyer Selected', properties: { attorney_id: attorney.id } });
    navigate(`/attorney/${attorney.id}`);
  };

  return (
    <div
      className="bg-white border border-[#E5E2DC] rounded-xl flex flex-col p-5 w-full h-full min-h-[300px] cursor-pointer"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
      onClick={book}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && book()}
      aria-label={`View ${attorney.name}'s profile`}
    >
      {/* Header row: circular photo + name/practice area */}
      <div className="flex items-start gap-3">
        <div className="w-[72px] h-[72px] rounded-full overflow-hidden shrink-0 bg-[#EAF2FB] flex items-center justify-center">
          {attorney.photo ? (
            <img src={attorney.photo} alt={attorney.name} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <span className="font-serif text-[#0a5dc2] text-lg">{getInitials(attorney.name)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif font-medium text-[20px] text-[#111418] leading-tight truncate">{attorney.name}</h3>
          <p className="text-[13px] text-[#5A5A5A] font-body truncate">{attorney.practice_area}</p>
          <div className="flex items-center gap-1 mt-1 text-[12px]">
            <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
            <span className="font-medium text-[#111418]">{attorney.rating || '—'}</span>
            <span className="text-[#5A5A5A]">· {attorney.review_count || 0} reviews</span>
          </div>
        </div>
      </div>

      {/* Location line */}
      <div className="flex items-center gap-1 mt-3 text-[12px] text-[#5A5A5A] font-body">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">{location}</span>
      </div>

      {/* Tag line */}
      <p className="text-[12px] text-[#5A5A5A] font-body mt-2 line-clamp-2 leading-snug">{tagline}</p>

      {/* Availability line */}
      <p className="text-[13px] font-medium text-[#111418] mt-3">
        {next ? `Next available ${next}` : 'Contact for availability'}
      </p>

      {/* Practice areas pills */}
      {pills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 mb-4">
          {pills.map((p, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full border border-[#E5E2DC] bg-[#F1EEE8] text-[13px] text-[#111418] font-body">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Primary button pinned to bottom */}
      <button
        onClick={(e) => { e.stopPropagation(); book(); }}
        className="mt-auto w-full h-12 rounded-lg bg-[#0a5dc2] hover:bg-[#084a9e] text-white text-[13px] font-medium font-body transition-colors"
      >
        Book online
      </button>
    </div>
  );
}