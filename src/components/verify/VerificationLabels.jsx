import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

/**
 * Factual verification labels for a public attorney profile (F-05, Sprint
 * v1.2 Track B W2.2). Reads the narrow /api/verification-labels route --
 * never the verification tables directly -- and renders nothing at all
 * unless the attorney is verified, so an unverified profile (or an API
 * failure) shows exactly what it showed before this component existed.
 *
 * Copy register (DS 14.6, Shared Contract 2.4 constraint 3): factual
 * statements with dates only. No "top", no "recommended", no rating.
 *
 * data-theme="light" pins the DS tokens inside this block to their light
 * values: the surrounding marketing page is hardcoded light-only, and
 * without the pin the tokens would flip dark with the OS while the page
 * behind them stayed light. Remove the pin when the marketing pages get
 * their DS v2 retrofit (planned as its own mini-sprint in v1.3).
 */

const LABEL_COPY = {
  bar_status_verified: 'Bar status verified',
  identity_verified: 'Identity verified',
  profile_attested: 'Profile attested',
  renewal_due: 'Re-verification due',
};

export default function VerificationLabels({ attorneyId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!attorneyId) return;
    let cancelled = false;
    fetch(`/api/verification-labels?attorney_id=${encodeURIComponent(attorneyId)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, [attorneyId]);

  if (!data?.verified) return null;

  const entries = Object.entries(data.labels || {}).filter(([, v]) => v);

  return (
    <div
      data-theme="light"
      className="mt-4 rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--confirmed)]">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Verified by Brief
        </span>
        {entries.map(([key, when]) => (
          <span key={key} className="text-xs text-[var(--text-2)]">
            {LABEL_COPY[key] || key} {when}
          </span>
        ))}
        <Link to="/verify" className="text-xs text-[var(--text-3)] underline underline-offset-2 hover:text-[var(--text)]">
          How Brief verifies
        </Link>
      </div>
    </div>
  );
}
