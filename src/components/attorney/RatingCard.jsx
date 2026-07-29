import { format } from 'date-fns';
import StarRow from './StarRow';
import { maskName } from './profileUtils';

export default function RatingCard({ attorney, reviews, onSeeAll }) {
  const latest = reviews[0];
  const count = attorney.review_count || 0;

  return (
    <div className="bg-[var(--surface-sunk)] rounded-xl p-5 mt-8">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="sm:w-44 shrink-0">
          <span className="font-serif text-4xl text-[var(--text)]">{attorney.rating ? attorney.rating.toFixed(1) : '—'}</span>
          <StarRow rating={attorney.rating} className="w-5 h-5 mt-1" />
          <p className="text-xs text-[var(--text-3)] font-body mt-2">Based on {count} review{count === 1 ? '' : 's'}</p>
          {count > 0 && (
            <button onClick={onSeeAll} className="text-xs text-[var(--accent)] font-medium font-body mt-3 hover:underline">
              See all {count} reviews
            </button>
          )}
        </div>
        <div className="flex-1 min-w-0 sm:border-l sm:border-[var(--line-2)] sm:pl-5">
          {latest ? (
            <>
              <StarRow rating={latest.rating} />
              <p className="text-[15px] text-[var(--text)] font-body mt-2 line-clamp-3 leading-relaxed">"{latest.review_text}"</p>
              <p className="text-xs text-[var(--text-3)] font-body mt-2">
                — {maskName(latest.reviewer_name)}{latest.date ? ` · ${format(new Date(latest.date), 'MMM d, yyyy')}` : ''}
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-3)] font-body">
              No reviews yet. Reviews come only from clients who completed a consultation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}