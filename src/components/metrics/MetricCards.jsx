import { CalendarCheck, ShieldCheck, UserX } from 'lucide-react';

// Every value here is traceable to a real Booking record via
// src/lib/metrics.js — nothing estimated, nothing profile-derived. When a
// rate genuinely can't be computed yet (no decided bookings), the card says
// so instead of showing a misleading 0%.
function Pct(v) {
  return v == null ? null : `${Math.round(v * 100)}%`;
}

export default function MetricCards({ metrics, loading, className = '' }) {
  const cards = [
    {
      icon: CalendarCheck,
      label: "This week's consults",
      value: loading ? null : metrics.thisWeekCount,
      empty: 'No consultations on the record yet.',
    },
    {
      icon: ShieldCheck,
      label: 'Confirmation rate',
      value: loading ? null : Pct(metrics.confirmationRate),
      empty: 'Not yet measured — no bookings have been decided yet.',
    },
    {
      icon: UserX,
      label: 'No-show rate',
      value: loading ? null : Pct(metrics.noShowRate),
      empty: 'Not yet measured — no appointments have been held yet.',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--line)] ${className}`}>
      {cards.map(({ icon: Icon, label, value, empty }) => (
        <div key={label} className="bg-[var(--surface)] p-5">
          <Icon className="w-4 h-4 text-[var(--text-3)] mb-3" />
          <p className="ds-type-label text-[var(--text-3)] mb-2">{label}</p>
          {value == null ? (
            <div>
              <div className="text-3xl text-[var(--text-4)] leading-none mb-1" style={{ fontFamily: 'var(--font-human)' }}>—</div>
              <p className="text-xs text-[var(--text-3)] ds-type-body-m">{empty}</p>
            </div>
          ) : (
            <div className="text-3xl text-[var(--text)] leading-none [font-variant-numeric:tabular-nums]" style={{ fontFamily: 'var(--font-human)' }}>{value}</div>
          )}
        </div>
      ))}
    </div>
  );
}
