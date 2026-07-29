import { Link } from 'react-router-dom';
import { Clock, XCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Card, Button } from '@/components/primitives';

export default function AttorneyPendingPage() {
  const { attorney } = useAuth();
  const rejected = attorney?.verification_status === 'rejected';

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-5 border-b border-[var(--line)]">
        <div>
          <p className="ds-type-label text-[var(--text-3)] mb-1">Attorney Portal</p>
          <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>
            {rejected ? 'Application not approved' : 'Application under review'}
          </h1>
        </div>
      </div>

      <Card tone="raised" className="p-6 sm:p-8">
        {rejected ? (
          <>
            <div className="w-14 h-14 rounded-[var(--radius-full)] flex items-center justify-center mb-5" style={{ backgroundColor: 'color-mix(in srgb, var(--noshow) 12%, transparent)' }}>
              <XCircle className="w-7 h-7" style={{ color: 'var(--noshow)' }} />
            </div>
            <p className="text-sm text-[var(--text-3)] ds-type-body-m leading-relaxed mb-6">
              We weren't able to verify your credentials at this time. If you believe this is an error, please contact
              our team and we'll help you get it sorted out.
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-[var(--radius-full)] flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--surface-sunk)' }}>
              <Clock className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-xl text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-human)' }}>Thanks for applying to Brief!</h2>
            <p className="text-sm text-[var(--text-3)] ds-type-body-m leading-relaxed mb-2">
              Your application is being reviewed. We verify every attorney's bar license and credentials before activation —
              this usually takes 1–2 business days.
            </p>
            <p className="text-sm text-[var(--text-3)] ds-type-body-m leading-relaxed mb-6">
              You'll receive an email once you're approved. Once verified, your dashboard, bookings, and availability
              tools will unlock automatically.
            </p>
          </>
        )}

        {attorney && (
          <div className="rounded-[var(--radius-m)] border border-[var(--line)] p-5 mb-6" style={{ backgroundColor: 'var(--surface-sunk)' }}>
            <p className="ds-type-label text-[var(--text-3)] mb-2">Your application</p>
            <p className="text-sm ds-type-body-m text-[var(--text)]">
              <span className="font-medium">{attorney.name}</span> · {(attorney.practice_areas || []).join(', ')}
            </p>
            <p className="text-sm text-[var(--text-3)] ds-type-body-m">
              Bar #{attorney.bar_number} · {attorney.bar_state}
            </p>
            <p className="text-sm text-[var(--text-3)] ds-type-body-m">Consultation fee: ${attorney.consult_fee}</p>
            <div className="mt-3 inline-flex items-center gap-2 text-xs ds-type-body-m">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rejected ? 'var(--noshow)' : 'var(--pending)' }} />
              <span className="capitalize" style={{ color: rejected ? 'var(--noshow)' : 'var(--pending)' }}>
                {attorney.verification_status || 'pending'}
              </span>
            </div>
          </div>
        )}

        {!rejected && (
          <div
            className="flex items-start gap-2.5 rounded-[var(--radius-s)] px-4 py-3 mb-6"
            style={{ backgroundColor: 'var(--surface-sunk)', borderLeft: '2px solid var(--accent)' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
            <p className="text-sm text-[var(--text)] ds-type-body-m">
              Bookings and Availability unlock automatically once you're verified. You can edit your profile now.
            </p>
          </div>
        )}

        <Link to="/attorney/profile">
          <Button variant="primary">
            Review &amp; edit my profile <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
