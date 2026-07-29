import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { seriesForRange } from '@/lib/metrics';

const RANGES = [
  { value: 'weeks', label: '8w' },
  { value: '7d', label: '7d' },
  { value: '2w', label: '2w' },
  { value: '1m', label: '1m' },
];

// "Weekly booking volume" — same real `bookings` data as before, reshaped
// client-side per the selected range (src/lib/metrics.js's seriesForRange,
// a pure function, no new query). One chart, real data only: bars stay
// DS §10 compliant (--accent fill, no gradient, no shadow, no draw-in)
// even though the range-toggle chrome matches the Base44 export.
export default function WeeklyBookingsChart({ bookings, loading, className = '' }) {
  const [range, setRange] = useState('weeks');
  const data = useMemo(() => (loading ? [] : seriesForRange(bookings, range)), [bookings, range, loading]);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (loading) {
    return <div className={`rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)] p-5 h-[260px] ${className}`} />;
  }

  return (
    <div className={`rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)] p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <p className="text-base text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Weekly booking volume</p>
          <p className="text-[11px] text-[var(--text-3)] mt-0.5">{total} consults in range</p>
        </div>
        <div className="flex items-center gap-1 rounded-[var(--radius-m)] bg-[var(--surface-sunk)] border border-[var(--line)] p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className="px-2.5 py-1 text-xs rounded-[var(--radius-s)] transition-colors ds-type-body-m"
              style={{
                backgroundColor: range === r.value ? 'var(--accent)' : 'transparent',
                color: range === r.value ? 'var(--accent-on)' : 'var(--text-3)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-sm text-[var(--text-3)] ds-type-body-m italic">No consults in this range yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval={0} minTickGap={20} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={24} />
            <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
