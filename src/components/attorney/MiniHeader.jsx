import { Star } from 'lucide-react';
import { getInitials } from './profileUtils';

export default function MiniHeader({ attorney, visible, onBook }) {
  return (
    <div
      className={`fixed left-0 right-0 z-40 top-[calc(env(safe-area-inset-top)+var(--mobile-header-h))] lg:top-[var(--header-height)] bg-white border-b border-[#E5E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#EAF2FB] flex items-center justify-center">
            {attorney.photo ? (
              <img src={attorney.photo} alt={attorney.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-[#0a5dc2] font-serif">{getInitials(attorney.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#111418] font-body truncate">{attorney.name}</p>
            <div className="flex items-center gap-1 text-xs text-[#8A8578] font-body">
              <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" /> {attorney.rating ? attorney.rating.toFixed(1) : '—'} ({attorney.review_count || 0})
            </div>
          </div>
        </div>
        <button onClick={onBook} className="px-4 py-2 rounded-lg bg-[#0a5dc2] hover:bg-[#084a9e] text-white text-sm font-medium font-body transition-colors shrink-0">
          View availability
        </button>
      </div>
    </div>
  );
}