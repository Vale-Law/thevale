import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const providers = [
  {
    name: 'Klarna',
    tagline: 'Split your consultation into 4 interest-free payments',
    color: '#FFB3C7',
    bestFor: 'Consultation fees and smaller upfront costs',
    example: '$150 consult → 4 × $37.50',
    steps: [
      'Select Klarna at checkout',
      'Pay 25% today, rest over 6 weeks',
      '0% interest, no hard credit check',
    ],
    faqs: [],
  },
  {
    name: 'Affirm',
    tagline: 'Finance retainers from $1,000–$10,000 over 3–24 months',
    color: '#D4F0C0',
    bestFor: 'Medium-to-large retainer financing',
    example: '$3,000 retainer → from $125/mo',
    steps: [
      'Select Affirm at checkout',
      'Quick soft-credit check (no impact)',
      'Choose your term: 3, 6, 12, or 24 months (0–18% APR)',
    ],
  },
  {
    name: 'LawFi',
    tagline: 'Income-based legal fee loans — no hard credit check',
    color: '#C2D4F0',
    bestFor: 'Clients with limited credit history',
    example: '$2,500 retainer → repay over 18 months',
    steps: [
      'Apply in minutes with basic income info',
      'No hard credit check required',
      'Repay over 6–24 months based on ability to pay',
    ],
  },
];

const faqs = [
  { q: 'Does checking rates affect my credit score?', a: 'No. Both Affirm and LawFi use soft credit checks for rate estimates, which do not affect your credit score. Only a final approval results in a hard inquiry.' },
  { q: 'What legal fees can I finance?', a: 'You can finance both consultation fees (with Klarna) and attorney retainers (with Affirm or LawFi). Financing is available for Family Law, Immigration, Business Formation, and more.' },
  { q: 'What if my case settles early?', a: 'You can pay off your financing early at any time. Klarna and Affirm charge no prepayment penalties. Check LawFi\'s terms for specifics.' },
  { q: 'How fast is approval?', a: 'Klarna is instant. Affirm typically takes 1–2 minutes. LawFi income-based review is usually completed within a few hours.' },
  { q: 'What if I\'m not approved?', a: 'If you\'re declined by one provider, you may still qualify with another. LawFi in particular serves clients who may not qualify for traditional financing.' },
  { q: 'Is the financing directly with my attorney?', a: "No — Brief's financing partners pay the attorney on your behalf. You repay the financing provider according to your plan terms." },
];

export default function Financing() {
  const navigate = useNavigate();
  const [fee, setFee] = useState(2500);
  const [term, setTerm] = useState(12);
  const [openFaq, setOpenFaq] = useState(null);
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();
  const ref4 = useScrollReveal();

  const monthly = Math.round(fee / term);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />

      {/* Hero */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAF9F7]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">Pay your way</p>
          <h1 className="font-serif text-[48px] lg:text-[72px] text-[#111418] leading-[1.02] max-w-3xl mb-6">
            Legal fees, on your terms.
          </h1>
          <p className="text-lg text-[#8A8578] font-body max-w-xl leading-relaxed">
            Split your consultation fee into 4 payments with Klarna, or finance your full retainer over months with Affirm or LawFi.
          </p>
        </div>
      </section>

      {/* Providers */}
      <section className="px-6 lg:px-8 pb-24 lg:pb-32" ref={ref1}>
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-8 font-body fade-up-child">Financing options</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[#E5E2DC]">
            {providers.map((p, i) => (
              <div key={p.name} className="bg-white p-8 fade-up-child" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-8 h-8 rounded-full mb-5" style={{ background: p.color }} />
                <h3 className="font-serif text-2xl text-[#111418] mb-2">{p.name}</h3>
                <p className="text-sm text-[#8A8578] font-body mb-6 leading-relaxed">{p.tagline}</p>
                <div className="space-y-3 mb-6">
                  {p.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className="font-serif text-[#0a5dc2] text-lg leading-none mt-0.5 w-4 flex-shrink-0">{j + 1}</span>
                      <span className="text-sm text-[#111418] font-body">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E5E2DC] pt-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#8A8578] font-body">Best for</p>
                  <p className="text-sm text-[#111418] font-body">{p.bestFor}</p>
                </div>
                <div className="mt-3 bg-[#EAF2FB] px-3 py-2 text-xs text-[#0a5dc2] font-body">
                  Example: {p.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-24 lg:py-28 px-6 lg:px-8 bg-white" ref={ref2}>
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[600px]">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body fade-up-child">Payment calculator</p>
            <h2 className="font-rounded font-bold text-[36px] text-[#0a5dc2] mb-10 fade-up-child">estimate your monthly payment.</h2>

            <div className="fade-up-child space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body">Legal fee amount</label>
                  <span className="font-serif text-xl text-[#111418]">${fee.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={100}
                  value={fee}
                  onChange={e => setFee(Number(e.target.value))}
                  className="w-full accent-[#111418]"
                />
                <div className="flex justify-between text-xs text-[#8A8578] font-body mt-1">
                  <span>$500</span><span>$10,000</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-3">Payment term</label>
                <div className="flex flex-wrap gap-2">
                  {[4, 12, 18, 24].map(t => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`px-4 py-2 text-sm border transition-all font-body ${
                        term === t
                          ? 'bg-[#111418] text-white border-[#111418]'
                          : 'border-[#E5E2DC] text-[#8A8578] hover:border-[#111418] hover:text-[#111418]'
                      }`}
                    >
                      {t === 4 ? '4 payments' : `${t} months`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-[#E5E2DC] p-6">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">Estimated payment</p>
                <div className="font-serif text-[64px] text-[#111418] leading-none">
                  ${monthly.toLocaleString()}
                </div>
                <p className="text-[#8A8578] font-body text-sm mt-2">
                  {term === 4 ? 'per installment' : 'per month'}
                </p>
              </div>

              <p className="text-xs text-[#8A8578] font-body leading-relaxed">
                Estimates only. Final terms set by financing partner upon approval. APR varies based on creditworthiness and provider.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-28 px-6 lg:px-8 bg-[#FAF9F7]" ref={ref3}>
        <div className="max-w-[800px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body fade-up-child">Common questions</p>
          <h2 className="font-rounded font-bold text-[36px] text-[#0a5dc2] mb-10 fade-up-child">faq</h2>
          <div className="divide-y divide-[#E5E2DC] fade-up-child">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left flex items-center justify-between gap-4"
                >
                  <span className="font-serif text-lg text-[#111418]">{faq.q}</span>
                  <span className="text-[#8A8578] text-xl flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-48 mt-3' : 'max-h-0'}`}>
                  <p className="text-[#8A8578] font-body text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111418] py-24 lg:py-28 px-6 lg:px-8 text-center" ref={ref4}>
        <div className="max-w-[1200px] mx-auto fade-up-child">
          <h2 className="font-rounded font-bold text-[36px] lg:text-[48px] text-[#0a5dc2] mb-6">
            ready to talk to a lawyer about your case?
          </h2>
          <button
            onClick={() => navigate('/?browse=1')}
            className="inline-flex items-center px-8 py-4 bg-white text-[#111418] text-sm font-medium hover:bg-[#EAF2FB] transition-all duration-200 font-body"
          >
            Find your lawyer →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}