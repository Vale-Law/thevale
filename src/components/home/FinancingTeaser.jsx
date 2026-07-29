import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const plans = [
  { months: 12, label: '12 months', monthly: 208 },
  { months: 18, label: '18 months', monthly: 139 },
  { months: 24, label: '24 months', monthly: 104 },
];

export default function FinancingTeaser() {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState(0);
  const ref = useScrollReveal();

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlan(p => (p + 1) % plans.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[var(--ground)]" ref={ref}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="fade-up-child">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-4 font-body">Flexible Payments</p>
          <h2 className="font-serif font-bold text-[36px] lg:text-[48px] text-[var(--text)] leading-[1.05] mb-6">
            Justice Shouldn't Wait for Payday.
          </h2>
          <p className="text-[var(--text-3)] leading-relaxed mb-8 max-w-md">
            Soon, Brief will offer flexible financing options — so you can get the legal help you need now and pay over time. Stay tuned.
          </p>
          <button
            onClick={() => navigate('/financing')}
            className="text-[var(--accent)] text-sm font-medium border-b border-[var(--accent)] hover:border-[var(--accent)] pb-0.5 transition-colors"
          >
            Explore Financing →
          </button>
        </div>

        {/* Right: animated payment card */}
        <div className="fade-up-child flex justify-center lg:justify-end">
          <div className="bg-[var(--surface)] border border-[var(--line-2)] shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-8 w-full max-w-[340px]">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-6 font-body">Sample retainer plan</p>
            <div className="text-center mb-8">
              <p className="text-sm text-[var(--text-3)] mb-1 font-body">$2,500 retainer</p>
              <div className="font-serif text-[56px] text-[var(--text)] leading-none transition-all duration-500">
                ${plans[activePlan].monthly}
              </div>
              <p className="text-[var(--text-3)] text-sm font-body">/mo · {plans[activePlan].label}</p>
            </div>
            <div className="flex gap-2 justify-center">
              {plans.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePlan(i)}
                  className={`px-3 py-1.5 text-xs border transition-all font-body ${
                    activePlan === i
                      ? 'bg-[var(--text)] text-[var(--ground)] border-[var(--text)]'
                      : 'text-[var(--text-3)] border-[var(--line-2)] hover:border-[var(--text)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-4)] text-center mt-4 font-body">
              Estimates only. Terms set by financing partner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}