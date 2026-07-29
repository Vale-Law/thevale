import { useState } from 'react';

export default function AboutSection({ attorney }) {
  const [expanded, setExpanded] = useState(false);
  if (!attorney.bio) return null;
  const long = attorney.bio.length > 180;
  return (
    <div>
      <h2 className="font-serif text-xl text-[var(--text)] mb-3">About {attorney.name}</h2>
      <p className={`text-[15px] text-[var(--text-2)] font-body leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>{attorney.bio}</p>
      {long && (
        <button onClick={() => setExpanded((e) => !e)} className="text-sm text-[var(--accent)] font-medium font-body mt-2 hover:underline">
          {expanded ? 'show less' : 'show more'}
        </button>
      )}
      <p className="text-xs text-[var(--text-3)] font-body mt-3">This profile was written by the attorney.</p>
    </div>
  );
}