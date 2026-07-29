import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, CheckCircle2 } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';

/**
 * Public token-authenticated feedback page (F-03, Sprint v1.2 Track B W3).
 * Route: /feedback/:token -- no login, outside LegacyAccentScope, DS v2
 * tokens straight from :root so it is light/dark aware on its own, same
 * shape as /manage/:token and /verify.
 *
 * The token is the authorization. This page never renders a previously
 * submitted response -- the API has no read path for one.
 */

function usePrefersDark() {
  const [prefersDark, setPrefersDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setPrefersDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return prefersDark;
}

export default function ConsultationFeedback() {
  const { token } = useParams();
  const prefersDark = usePrefersDark();
  const logo = prefersDark ? '/brand/logo-dark.png' : '/brand/logo-light.png';

  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/feedback?token=${encodeURIComponent(token)}`)
      .then(async r => {
        const body = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) setLoadError(body.error || 'This feedback link is no longer valid.');
        else setContext(body);
      })
      .catch(() => { if (!cancelled) setLoadError('Could not load this feedback link.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const submit = async (answers) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...answers }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(body.error || 'Could not send your feedback.');
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setSubmitError('Could not send your feedback.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <header className="border-b border-[var(--line)]">
        <div className="max-w-[640px] mx-auto px-6 h-20 flex items-center">
          <Link to="/" aria-label="Brief home">
            <img src={logo} alt="Brief" className="h-12 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto px-6 py-12">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
        ) : loadError ? (
          <>
            <h1 className="text-2xl text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-human)' }}>
              This link is no longer valid
            </h1>
            <p className="text-sm text-[var(--text-2)] ds-type-body-m leading-relaxed">{loadError}</p>
          </>
        ) : done ? (
          <>
            <p className="inline-flex items-center gap-2 text-[var(--confirmed)] ds-type-body-m mb-3">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> Sent
            </p>
            <h1 className="text-2xl text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-human)' }}>
              Thank you
            </h1>
            <p className="text-sm text-[var(--text-2)] ds-type-body-m leading-relaxed max-w-[480px]">
              Your feedback goes to Brief's team and helps us keep the standards on this platform honest.
              It is not published anywhere.
            </p>
          </>
        ) : (
          <>
            <p className="ds-type-label text-[var(--text-3)] mb-3">Consultation feedback</p>
            <h1 className="text-2xl lg:text-3xl text-[var(--text)] leading-tight mb-2" style={{ fontFamily: 'var(--font-human)' }}>
              How did your consultation go?
            </h1>
            {(context?.attorneyName || context?.slotStart) && (
              <p className="text-sm text-[var(--text-3)] ds-type-body-m mb-8">
                {context.attorneyName}
                {context.attorneyName && context.slotStart ? ' · ' : ''}
                {context.slotStart ? format(new Date(context.slotStart), 'EEE, MMM d, yyyy') : ''}
              </p>
            )}
            <FeedbackForm
              attorneyName={context?.attorneyName}
              onSubmit={submit}
              submitting={submitting}
              error={submitError}
            />
          </>
        )}
      </main>
    </div>
  );
}
