import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

/**
 * Wave 0 lock 2 (money-loop audit 2026-08-15): /booking used to render the
 * legacy Base44 flow — a client-side bookings insert that displayed the
 * consultation fee but never charged anything. The real, Stripe-connected
 * path is the attorney's public booking page at /book/:slug
 * (api/bookings-public.js). This route now only translates old links:
 * ?attorney=<id> is resolved to that attorney's slug (anon-readable for
 * verified attorneys) and forwarded to /book/:slug; anything else lands on
 * the directory.
 */
export default function LegacyBookingRedirect() {
  const [params] = useSearchParams();
  const attorneyId = params.get('attorney');
  const [target, setTarget] = useState(attorneyId ? null : '/bookings?browse=1');

  useEffect(() => {
    if (!attorneyId) return;
    let cancelled = false;
    supabase
      .from('attorneys')
      .select('slug')
      .eq('id', attorneyId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setTarget(data?.slug ? `/book/${data.slug}` : '/bookings?browse=1');
      })
      .catch(() => {
        if (!cancelled) setTarget('/bookings?browse=1');
      });
    return () => { cancelled = true; };
  }, [attorneyId]);

  if (!target) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ground)]">
        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  return <Navigate to={target} replace />;
}
