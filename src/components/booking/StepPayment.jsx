import { Loader2 } from 'lucide-react';

export default function StepPayment({ attorney, data, onChange, onConfirm, onBack, loading }) {
  const fee = attorney?.consult_fee || 0;
  const retainer = attorney?.typical_retainer || 0;
  const klarnaInstallment = Math.round(fee / 4);
  const affirmMonthly = retainer ? Math.round(retainer / 12) : null;

  const options = [
    {
      id: 'full',
      label: 'Pay in full',
      provider: null,
      summary: `$${fee} today`,
      detail: 'One-time payment. No installments.',
    },
    {
      id: 'klarna',
      label: 'Klarna',
      badge: 'Interest-free',
      summary: `4 × $${klarnaInstallment}`,
      detail: `Pay $${klarnaInstallment} today, then 3 more every 2 weeks. 0% interest.`,
    },
    {
      id: 'affirm',
      label: 'Affirm',
      badge: null,
      summary: affirmMonthly ? `From $${affirmMonthly}/mo` : 'Retainer financing',
      detail: `Finance your retainer over 12 months. 0–18% APR based on credit.`,
    },
    {
      id: 'lawfi',
      label: 'LawFi',
      badge: 'No credit check',
      summary: `Up to $${retainer.toLocaleString()}`,
      detail: `Repay over 6–24 months based on income, not just credit score.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-serif text-2xl text-[#111418] mb-1">Choose payment</p>
        <p className="text-sm text-[#8A8578] font-body">You won't be charged until your attorney confirms.</p>
      </div>

      <div className="space-y-2">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange({ ...data, payment: opt.id })}
            className={`w-full text-left p-4 border transition-all duration-200 ${
              data.payment === opt.id
                ? 'border-[#111418] bg-white'
                : 'border-[#E5E2DC] bg-white hover:border-[#111418]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 border-2 flex-shrink-0 transition-all ${
                  data.payment === opt.id ? 'border-[#111418] bg-[#111418]' : 'border-[#E5E2DC]'
                }`} />
                <div>
                  <span className="text-sm font-medium text-[#111418] font-body">{opt.label}</span>
                  {opt.badge && (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.08em] border border-[#0a5dc2]/30 text-[#0a5dc2] px-1.5 py-0.5 font-body">
                      {opt.badge}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-[#111418] font-medium font-body">{opt.summary}</span>
            </div>
            {data.payment === opt.id && (
              <p className="text-xs text-[#8A8578] mt-2 ml-7 font-body">{opt.detail}</p>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#EAF2FB] px-4 py-3 text-xs text-[#8A8578] font-body">
        You won't be charged until your consultation is confirmed by the attorney.
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 border border-[#E5E2DC] text-[#111418] text-sm font-medium hover:border-[#111418] transition-colors font-body"
        >
          ← Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!data.payment || loading}
          className="flex-1 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm booking'}
        </button>
      </div>
    </div>
  );
}
