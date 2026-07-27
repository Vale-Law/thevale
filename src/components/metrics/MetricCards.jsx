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
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#E5E2DC] ${className}`}>
      {cards.map(({ icon: Icon, label, value, empty }) => (
        <div key={label} className="bg-white p-5">
          <Icon className="w-4 h-4 text-[#8A8578] mb-3" />
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">{label}</p>
          {value == null ? (
            <div>
              <div className="font-serif text-3xl text-[#D8D4CC] leading-none mb-1">—</div>
              <p className="text-xs text-[#8A8578] font-body">{empty}</p>
            </div>
          ) : (
            <div className="font-serif text-3xl text-[#111418] leading-none">{value}</div>
          )}
        </div>
      ))}
    </div>
  );
}
