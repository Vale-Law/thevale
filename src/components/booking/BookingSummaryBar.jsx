import { ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingSummaryBar({ attorney, slot }) {
  if (!attorney) return null;
  const slotDate = slot ? new Date(slot) : null;

  return (
    <div className="border border-[#E5E2DC] bg-white p-4 mb-6 flex items-center gap-4">
      <img
        src={attorney.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(attorney.name)}&background=EAF2FB&color=0a5dc2&size=80`}
        alt={attorney.name}
        className="w-14 h-14 object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg text-[#111418]">{attorney.name}</span>
          {attorney.verified && <ShieldCheck className="w-4 h-4 text-[#0a5dc2]" />}
        </div>
        <p className="text-sm text-[#8A8578] font-body">{attorney.practice_area}</p>
      </div>
      <div className="text-right flex-shrink-0">
        {slotDate ? (
          <>
            <p className="text-sm font-medium text-[#111418] font-body">{format(slotDate, 'EEE, MMM d')}</p>
            <p className="text-sm text-[#8A8578] font-body">{format(slotDate, 'h:mm a')}</p>
          </>
        ) : (
          <p className="text-sm text-[#8A8578] font-body">No slot selected</p>
        )}
        <p className="text-xs text-[#0a5dc2] mt-0.5 font-body">${attorney.consult_fee}</p>
      </div>
    </div>
  );
}