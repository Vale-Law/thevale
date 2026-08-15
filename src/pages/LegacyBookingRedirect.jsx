import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Loader2 } from 'lucide-react';

/**
 * Wave 0 lock: the legacy /booking flow (client-side Booking insert, fee
 * shown, nothing charged) is gone. Old deep links — /booking?attorney=<id>
 * from bookmarks or stale emails — resolve the attorney's slug and land on
 * the real Stripe-backed booking page (/book/:slug). Links without an
 * attorney land on the directory. A slugless attorney falls through to
 * /book's honest "isn't available" state rather than a fake free booking.
 */
export default function LegacyBookingRedirect() {
  const attorneyId = new URLSearchParams(window.location.search).get('attorney');
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
      .catch(() => { if (!cancelled) setTarget('/bookings?browse=1'); });
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
