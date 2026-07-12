const STEPS = ['Your details', 'About your case', 'Payment'];

export default function BookingProgressBar({ step }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const active = num === step;
          const done = num < step;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-medium transition-all font-body border ${
                  done ? 'bg-[#111418] text-white border-[#111418]' :
                  active ? 'bg-white text-[#111418] border-[#111418]' :
                  'bg-white text-[#8A8578] border-[#E5E2DC]'
                }`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-[10px] uppercase tracking-[0.08em] mt-1.5 whitespace-nowrap font-body ${
                  active ? 'text-[#111418]' : 'text-[#8A8578]'
                }`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-4 transition-all ${
                  done ? 'bg-[#111418]' : 'bg-[#E5E2DC]'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}