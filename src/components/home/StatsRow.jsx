const stats = [
  { value: '500+', label: 'Vetted attorneys' },
  { value: '12k+', label: 'Consultations booked' },
  { value: '4.8★', label: 'Average rating' },
  { value: '24h', label: 'Response time' },
];

export default function StatsRow() {
  return (
    <section className="py-12 px-4 bg-primary">
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-white/70">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}