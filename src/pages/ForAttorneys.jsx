import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const steps = [
  { num: '01', title: 'Apply online', desc: 'Submit your bar number, practice area, and a few details about your practice. We verify your credentials within 48 hours.' },
  { num: '02', title: 'Set your availability', desc: 'Connect your calendar or manually add available slots. Clients only see real-time openings — no phantom appointments.' },
  { num: '03', title: 'Accept bookings & get paid', desc: 'Clients book and pay instantly. You receive funds within 2 business days of each completed consultation.' },
];

const stats = [
  { value: '4,200+', label: 'Clients actively searching' },
  { value: '$285', label: 'Average booking value' },
  { value: '2 days', label: 'Avg time to first booking' },
];

export default function ForAttorneys() {
  const [form, setForm] = useState({ name: '', bar: '', area: '', email: '' });
  const [submitted, setSubmitted] = useState(false);
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />

      {/* Hero */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAF9F7]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">For attorneys</p>
          <h1 className="font-serif text-[48px] lg:text-[80px] text-[#111418] leading-[1.02] max-w-4xl mb-6">
            Your next client is already looking for you.
          </h1>
          <p className="text-lg text-[#8A8578] font-body max-w-xl leading-relaxed">
            Brief connects vetted attorneys with clients who are ready to book — and pay. No cold outreach, no referral fees, no guesswork.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#EAF2FB] py-16 px-6 lg:px-8" ref={ref1}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {stats.map((s, i) => (
            <div key={i} className="fade-up-child text-center sm:text-left" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="font-serif text-[48px] text-[#111418] leading-none mb-2">{s.value}</div>
              <p className="text-sm text-[#8A8578] uppercase tracking-[0.08em] font-body">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-white" ref={ref2}>
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body fade-up-child">How it works for attorneys</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-10">
            {steps.map((s, i) => (
              <div key={s.num} className="fade-up-child" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="font-serif text-[72px] text-[#EAF2FB] leading-none block mb-4">{s.num}</span>
                <h3 className="font-serif text-xl text-[#111418] mb-3">{s.title}</h3>
                <p className="text-sm text-[#8A8578] font-body leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAF9F7]" ref={ref3}>
        <div className="max-w-[600px] mx-auto text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body fade-up-child">Pricing</p>
          <div className="border border-[#E5E2DC] bg-white p-10 fade-up-child">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] mb-4 font-body">Founding attorney rate</p>
            <div className="mb-2">
              <span className="font-serif text-[72px] text-[#111418] leading-none">$99</span>
              <span className="text-[#8A8578] font-body text-lg">/mo</span>
            </div>
            <p className="text-[#8A8578] font-body text-sm mb-1">
              <span className="line-through">$149/mo</span> — 33% off, locked in for life
            </p>
            <p className="text-xs text-[#8A8578] font-body mb-8">Available to the first 200 attorneys only</p>
            <ul className="text-sm text-[#111418] font-body space-y-3 text-left mb-8">
              {[
                'Verified profile with Brief badge',
                'Unlimited bookings & consultations',
                'Integrated availability calendar',
                'Client financing (Klarna, Affirm, LawFi)',
                'No commission on consultations',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0a5dc2] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {submitted ? (
              <div className="bg-[#EAF2FB] p-4 text-center">
                <p className="font-serif text-lg text-[#111418]">Application received.</p>
                <p className="text-sm text-[#8A8578] font-body mt-1">We'll be in touch within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  required
                  className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] font-body"
                />
                <input
                  value={form.bar}
                  onChange={e => setForm({ ...form, bar: e.target.value })}
                  placeholder="Bar number"
                  required
                  className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] font-body"
                />
                <select
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  required
                  className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] font-body appearance-none bg-white"
                >
                  <option value="">Practice area</option>
                  <option>Family Law</option>
                  <option>Immigration</option>
                  <option>Business Formation</option>
                  <option>Personal Injury</option>
                  <option>Other</option>
                </select>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                  required
                  className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] font-body"
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 font-body"
                >
                  Apply for founding rate →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}