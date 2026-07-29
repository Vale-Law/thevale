import { useState } from 'react';
import { format } from 'date-fns';
import StarRow from './StarRow';
import { maskName } from './profileUtils';

const PER_PAGE = 3;

export default function ClientReviews({ attorney, reviews }) {
  const [page, setPage] = useState(0);
  const total = reviews.length;
  const pages = Math.ceil(total / PER_PAGE);
  const slice = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div>
      <h2 className="font-serif text-xl text-[var(--text)] mb-4">Client reviews</h2>
      {total === 0 ? (
        <p className="text-sm text-[var(--text-3)] font-body">
          No reviews yet. Reviews come only from clients who completed a consultation through Brief.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--line-2)]">
            <span className="font-serif text-3xl text-[var(--text)]">{attorney.rating ? attorney.rating.toFixed(1) : '—'}</span>
            <div>
              <StarRow rating={attorney.rating} />
              <p className="text-xs text-[var(--text-3)] font-body mt-1">Based on {total} review{total === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="space-y-6">
            {slice.map((r) => (
              <div key={r.id} className="border-b border-[var(--line-2)] last:border-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--text)] font-body">{maskName(r.reviewer_name)}</span>
                  <span className="text-xs text-[var(--text-3)] font-body">{r.date ? format(new Date(r.date), 'MMM d, yyyy') : ''}</span>
                </div>
                <StarRow rating={r.rating} className="w-3.5 h-3.5" />
                <p className="text-[15px] text-[var(--text)] font-body mt-2 leading-relaxed">"{r.review_text}"</p>
              </div>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="text-sm text-[var(--accent)] font-body disabled:text-[var(--text-4)]">Previous</button>
              <span className="text-sm text-[var(--text-3)] font-body">Page {page + 1} of {pages}</span>
              <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="text-sm text-[var(--accent)] font-body disabled:text-[var(--text-4)]">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}