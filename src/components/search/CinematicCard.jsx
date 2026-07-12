import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { format, startOfDay, addDays } from 'date-fns';

function getInitials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
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
  return format(d, 'EEE');
}

export default function CinematicCard({ attorney, style }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const next = nextAvailable(attorney);
  const location = attorney.city && attorney.state ? `${attorney.city}, ${attorney.state}` : attorney.location || 'Nationwide';

  return (
    <div
      className="bg-white border border-[#E5E2DC] rounded-2xl flex flex-col cursor-pointer transition-all duration-300 group"
      style={{
        boxShadow: hovered ? '0 10px 30px rgba(10,61,98,0.12)' : '0 2px 12px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/attorney/${attorney.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/attorney/${attorney.id}`)}
      aria-label={`View ${attorney.name}'s profile`}
    >
      <div className="p-5 flex flex-col flex-1">
        {/* Circular photo + name/specialty */}
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-[#EAF2FB] flex items-center justify-center">
            {attorney.photo ? (
              <img src={attorney.photo} alt={attorney.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-[#0a5dc2] text-lg">{getInitials(attorney.name)}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif font-medium text-[16px] text-[#111418] leading-tight group-hover:text-[#0a5dc2] transition-colors truncate">
              {attorney.name}
            </h3>
            <p className="text-[13px] text-[#8A8578] font-body truncate">{attorney.practice_area}</p>
            <div className="flex items-center gap-1 mt-1 text-[12px]">
              <Star className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
              <span className="font-medium text-[#111418]">{attorney.rating || '—'}</span>
              <span className="text-[#8A8578]">· {attorney.review_count || 0} reviews</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mt-3 text-[12px] text-[#8A8578] font-body">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {/* Tagline */}
        <p className="text-[12px] text-[#8A8578] font-body mt-2">New client appointments · Highly rated</p>

        {/* Next available */}
        <p className="text-[13px] font-medium text-[#111418] mt-3">
          {next ? `Next available ${next}` : 'Contact for availability'}
        </p>

        {/* Book button */}
        <button
          onClick={e => { e.stopPropagation(); navigate(`/attorney/${attorney.id}`); }}
          className="mt-4 w-full py-2.5 rounded-full bg-[#F1EEE8] hover:bg-[#111418] hover:text-white text-[#111418] text-[13px] font-body font-medium transition-colors"
        >
          Book online
        </button>
      </div>
    </div>
  );
}