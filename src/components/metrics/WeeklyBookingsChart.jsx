import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

// One chart, real data only. If there's no booking history at all, this
// shows empty axes and an honest line instead of a demo dataset or a
// placeholder sparkline.
export default function WeeklyBookingsChart({ metrics, loading, className = '' }) {
  if (loading) {
    return <div className={`bg-white border border-[#E5E2DC] p-6 h-[180px] ${className}`} />;
  }

  return (
    <div className={`bg-white border border-[#E5E2DC] p-6 ${className}`}>
      <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-4">Bookings per week</p>
      {!metrics.hasAnyHistory ? (
        <div className="h-[140px] flex items-center justify-center">
          <p className="text-sm text-[#8A8578] font-body italic">Available after the first completed week.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={metrics.weeks} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E5E2DC" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A8578' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8A8578' }} axisLine={false} tickLine={false} width={24} />
            <Bar dataKey="count" fill="#0a5dc2" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
