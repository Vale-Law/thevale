import { useState } from 'react';

export default function StepInfo({ data, onChange, onNext }) {
  const [form, setForm] = useState(data);
  const valid = form.name.trim() && form.email.trim();

  const update = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-serif text-2xl text-[#111418] mb-1">Your details</p>
        <p className="text-sm text-[#8A8578] font-body">We'll use these to confirm your booking.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">Full name *</label>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="Your full name"
            className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] transition-colors font-body bg-white"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">Email address *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] transition-colors font-body bg-white"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">Phone (optional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] transition-colors font-body bg-white"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed font-body"
      >
        Continue →
      </button>
    </div>
  );
}