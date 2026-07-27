import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

// One chart, real data only. If there's no booking history at all, this
// shows empty axes and an honest line instead of a demo dataset or a
// placeholder sparkline.
export default function WeeklyBookingsChart({ metrics, loading, className = '' }) {
  if (loading) {
    return <div className={`bg-[var(--surface)] border border-[var(--line)] p-6 h-[180px] ${className}`} />;
  }

  return (
    <div className={`bg-[var(--surface)] border border-[var(--line)] p-6 ${className}`}>
      <p className="ds-type-label text-[var(--text-3)] mb-4">Bookings per week</p>
      {!metrics.hasAnyHistory ? (
        <div className="h-[140px] flex items-center justify-center">
          <p className="text-sm text-[var(--text-3)] ds-type-body-m italic">Available after the first completed week.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={metrics.weeks} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={24} />
            {/* DS §10 "one chart maximum": --accent bars, radius-xs top
                corners only, no gradient fill, no draw-in beyond an
                opacity fade. */}
            <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
