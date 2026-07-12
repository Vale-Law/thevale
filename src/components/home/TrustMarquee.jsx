const items = [
  'Bar Verified',
  '4.8★ Average Rating',
  '12,000+ Consultations',
  'Klarna',
  'Affirm',
  'LawFi',
  'Vetted Attorneys',
  'Transparent Pricing',
  'Secure Video Calls',
  'Nationwide',
];

export default function TrustMarquee() {
  const doubled = [...items, ...items];

  return (
    <div className="border-t border-b border-[#E5E2DC] py-4 overflow-hidden bg-white">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] text-center mb-3 font-body">
        Trusted nationwide
      </p>
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs text-[#111418]/40 uppercase tracking-[0.08em] font-body">
              <span className="w-1 h-1 rounded-full bg-[#111418]/20 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}