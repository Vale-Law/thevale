import { useState } from 'react';
import { Check } from 'lucide-react';

export default function PracticeAreasSection({ attorney }) {
  const [showAll, setShowAll] = useState(false);
  const areas = (attorney.practice_areas && attorney.practice_areas.length)
    ? attorney.practice_areas
    : (attorney.practice_area ? [attorney.practice_area] : []);
  const situations = attorney.specialties || [];
  const visible = showAll ? situations : situations.slice(0, 6);

  if (areas.length === 0 && situations.length === 0 && attorney.consult_fee == null) return null;

  return (
    <div>
      <h2 className="font-serif text-xl text-[var(--text)] mb-4">Practice areas</h2>

      {areas.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {areas.map((a, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full border border-[var(--line-2)] bg-[var(--surface-sunk)] text-[13px] text-[var(--text)] font-body">{a}</span>
          ))}
        </div>
      )}

      {situations.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-[var(--text)] font-body mb-3">Common situations handled</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visible.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <span className="text-sm text-[var(--text-2)] font-body">{s}</span>
              </div>
            ))}
          </div>
          {situations.length > 6 && (
            <button onClick={() => setShowAll((s) => !s)} className="text-sm text-[var(--accent)] font-medium font-body mt-3 hover:underline">
              {showAll ? 'See less' : `See ${situations.length - 6} more`}
            </button>
          )}
        </div>
      )}

      {attorney.consult_fee != null && (
        <div>
          <p className="text-sm font-medium text-[var(--text)] font-body mb-1">Consultation</p>
          <p className="text-sm text-[var(--text-2)] font-body">
            ${attorney.consult_fee} consultation fee{attorney.typical_retainer ? ` · Typical retainer $${attorney.typical_retainer.toLocaleString()}` : ''}.
          </p>
        </div>
      )}
    </div>
  );
}