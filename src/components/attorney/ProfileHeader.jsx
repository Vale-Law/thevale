import { useState } from 'react';
import { Share2, Bookmark } from 'lucide-react';
import { getInitials } from './profileUtils';

export default function ProfileHeader({ attorney }) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: attorney.name, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2000); } catch {}
    }
  };

  const addressLine = attorney.office_location || [attorney.city, attorney.state].filter(Boolean).join(', ');

  return (
    <div className="pb-8 border-b border-[#E5E2DC]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-5 min-w-0">
          <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 bg-[#EAF2FB] flex items-center justify-center">
            {attorney.photo ? (
              <img src={attorney.photo} alt={attorney.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-2xl text-[#0a5dc2]">{getInitials(attorney.name)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif font-medium text-[28px] lg:text-[32px] text-[#111418] leading-tight">{attorney.name}</h1>
            {attorney.practice_area && <p className="text-[#8A8578] font-body mt-1">{attorney.practice_area}</p>}
            {addressLine && <p className="text-[#8A8578] font-body">{addressLine}</p>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E2DC] text-xs text-[#111418] hover:border-[#111418] transition-colors font-body"
          >
            <Share2 className="w-3.5 h-3.5" /> {shared ? 'Link copied' : 'Share'}
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors font-body ${saved ? 'border-[#0a5dc2] text-[#0a5dc2]' : 'border-[#E5E2DC] text-[#111418] hover:border-[#111418]'}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#0a5dc2]' : ''}`} /> Save
          </button>
        </div>
      </div>
      <p className="text-xs text-[#8A8578] font-body mt-5 leading-relaxed">
        Attorneys pay a flat fee to be listed on Brief. Brief does not recommend or endorse any attorney.
      </p>
    </div>
  );
}