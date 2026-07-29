import { Link } from 'react-router-dom';
import { Clock, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AttorneyPendingPage() {
  const { attorney } = useAuth();
  const rejected = attorney?.verification_status === 'rejected';

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-5 border-b border-[var(--line-2)]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-1 font-body">Attorney Portal</p>
          <h1 className="font-serif text-2xl sm:text-3xl text-[var(--text)]">
            {rejected ? 'Application not approved' : 'Application under review'}
          </h1>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line-2)] p-6 sm:p-8">
        {rejected ? (
          <>
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
              <XCircle className="w-7 h-7 text-destructive" />
            </div>
            <p className="text-sm text-[var(--text-3)] font-body leading-relaxed mb-6">
              We weren't able to verify your credentials at this time. If you believe this is an error, please contact
              our team and we'll help you get it sorted out.
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-5">
              <Clock className="w-7 h-7 text-[var(--accent)]" />
            </div>
            <h2 className="font-serif text-xl text-[var(--text)] mb-2">Thanks for applying to Brief!</h2>
            <p className="text-sm text-[var(--text-3)] font-body leading-relaxed mb-2">
              Your application is being reviewed. We verify every attorney's bar license and credentials before activation —
              this usually takes 1–2 business days.
            </p>
            <p className="text-sm text-[var(--text-3)] font-body leading-relaxed mb-6">
              You'll receive an email once you're approved. Once verified, your dashboard, bookings, and availability
              tools will unlock automatically.
            </p>
          </>
        )}

        {attorney && (
          <div className="bg-[var(--ground)] border border-[var(--line-2)] p-5 mb-6">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body mb-2">Your application</p>
            <p className="text-sm font-body text-[var(--text)]">
              <span className="font-medium">{attorney.name}</span> · {(attorney.practice_areas || []).join(', ')}
            </p>
            <p className="text-sm text-[var(--text-3)] font-body">
              Bar #{attorney.bar_number} · {attorney.bar_state}
            </p>
            <p className="text-sm text-[var(--text-3)] font-body">Consultation fee: ${attorney.consult_fee}</p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-body">
              <span className={`w-2 h-2 rounded-full ${rejected ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <span className={`${rejected ? 'text-red-700' : 'text-yellow-700'} capitalize`}>
                {attorney.verification_status || 'pending'}
              </span>
            </div>
          </div>
        )}

        {!rejected && (
          <div className="flex items-start gap-2.5 bg-[var(--accent-soft)] border-l-2 border-[var(--accent)] px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text)] font-body">
              Bookings and Availability unlock automatically once you're verified. You can edit your profile now.
            </p>
          </div>
        )}

        <Link
          to="/attorney/profile"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--text)] text-[var(--ground)] text-sm font-body hover:bg-[var(--accent)] transition-colors"
        >
          Review & edit my profile <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}