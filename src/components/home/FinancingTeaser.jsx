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
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#F5F0E8]" ref={ref}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="fade-up-child">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">Flexible Payments</p>
          <h2 className="font-serif font-bold text-[36px] lg:text-[48px] text-[#111418] leading-[1.05] mb-6">
            Justice Shouldn't Wait for Payday.
          </h2>
          <p className="text-[#8A8578] leading-relaxed mb-8 max-w-md">
            Split your consultation fee into 4 interest-free payments with Klarna, or finance your full retainer over 12–24 months with Affirm or LawFi. No hard credit check with LawFi.
          </p>
          <button
            onClick={() => navigate('/financing')}
            className="text-[#0a5dc2] text-sm font-medium border-b border-[#0a5dc2]/40 hover:border-[#0a5dc2] pb-0.5 transition-colors"
          >
            Explore Financing →
          </button>
        </div>

        {/* Right: animated payment card */}
        <div className="fade-up-child flex justify-center lg:justify-end">
          <div className="bg-white border border-[#E5E2DC] shadow-[0_4px_32px_rgba(0,0,0,0.07)] p-8 w-full max-w-[340px]">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-6 font-body">Sample retainer plan</p>
            <div className="text-center mb-8">
              <p className="text-sm text-[#8A8578] mb-1 font-body">$2,500 retainer</p>
              <div className="font-serif text-[56px] text-[#111418] leading-none transition-all duration-500">
                ${plans[activePlan].monthly}
              </div>
              <p className="text-[#8A8578] text-sm font-body">/mo · {plans[activePlan].label}</p>
            </div>
            <div className="flex gap-2 justify-center">
              {plans.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePlan(i)}
                  className={`px-3 py-1.5 text-xs border transition-all font-body ${
                    activePlan === i
                      ? 'bg-[#111418] text-white border-[#111418]'
                      : 'text-[#8A8578] border-[#E5E2DC] hover:border-[#111418]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#8A8578]/60 text-center mt-4 font-body">
              Estimates only. Terms set by financing partner.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}