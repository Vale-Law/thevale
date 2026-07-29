// Every value here is traceable to a real Booking record via
// src/lib/metrics.js — nothing estimated, nothing profile-derived.
//
// Four separate cards (not a hairline-joined strip), per the attorney-
// portal visual-fidelity retrofit. `zeroText` shows whenever the number
// is a genuine, measured zero (e.g. "0 consults this week" is a real
// fact) or when a rate can't be computed yet (no denominator) — DS §11's
// distinction: never fabricate, but a real zero is not "not yet measured."
function Pct(v) {
  return v == null ? null : `${Math.round(v * 100)}%`;
}

export default function MetricCards({ metrics, loading, className = '' }) {
  const cards = [
    {
      label: "This week's consults",
      value: loading ? null : metrics.thisWeekCount,
      zeroText: 'No consults this week yet.',
    },
    {
      label: 'Confirmation rate',
      value: loading ? null : Pct(metrics.confirmationRate),
      zeroText: 'Not yet measured — no bookings have been decided yet.',
    },
    {
      label: 'No-show rate',
      value: loading ? null : Pct(metrics.noShowRate),
      zeroText: 'Not yet measured — no appointments have been held yet.',
    },
    {
      label: 'Upcoming this week',
      value: loading ? null : metrics.upcomingThisWeek,
      zeroText: 'Nothing upcoming.',
    },
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {cards.map(({ label, value, zeroText }) => {
        const unmeasured = value == null;
        const isZero = value === 0;
        return (
          <div key={label} className="rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="ds-type-label text-[var(--text-3)] mb-2">{label}</p>
            <div
              className="text-3xl leading-none [font-variant-numeric:tabular-nums]"
              style={{ fontFamily: 'var(--font-human)', color: unmeasured ? 'var(--text-4)' : 'var(--text)' }}
            >
              {unmeasured ? '—' : value}
            </div>
            {(unmeasured || isZero) && (
              <p className="text-xs text-[var(--text-3)] ds-type-body-m mt-1.5">{zeroText}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
