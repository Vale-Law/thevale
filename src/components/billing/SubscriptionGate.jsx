import { useState, useEffect } from 'react';
import { Loader2, CreditCard, LogOut } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button, Card } from '@/components/primitives';

const STATUS_COPY = {
  none: "Your firm hasn't subscribed to Brief yet.",
  incomplete: 'Your subscription setup was never finished.',
  canceled: 'Your firm\'s subscription has been canceled.',
  unpaid: "Your firm's subscription is unpaid.",
};

// Blocks attorney-portal access when the firm's subscription status isn't
// one of 'active'/'trialing'/'past_due' (AttorneyShell.jsx decides which
// statuses reach this component at all -- past_due deliberately does not,
// per the owner's instruction to treat it as a grace period, not a
// cutoff). Only a firm owner can actually start Checkout (matches
// api/subscription-checkout.js's own owner-only check); staff/non-owner
// attorneys see the same message with no button, since only the owner's
// session can create a session for the firm's Stripe customer.
export default function SubscriptionGate({ status }) {
  const { logout, firmId, user } = useAuth();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('firm_members').select('role').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setIsOwner(data?.role === 'owner'));
  }, [user?.id]);

  const startCheckout = async () => {
    setStarting(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/subscription-checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.');
      window.location.href = data.url;
    } catch (e) {
      setError(e.message || 'Could not start checkout.');
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ground)] px-6">
      <Card tone="raised" className="max-w-md w-full text-center py-10 px-8">
        <CreditCard className="w-8 h-8 text-[var(--text-3)] mx-auto mb-4" />
        <h1 className="text-xl text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-human)' }}>Subscription needed</h1>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mb-6">
          {STATUS_COPY[status] || 'Your firm needs an active subscription to use the attorney portal.'}
          {' '}Brief is a flat monthly subscription for platform access — no cut of your consultation fees.
        </p>
        {error && <p className="text-sm text-[var(--noshow)] ds-type-body-m mb-4">{error}</p>}
        {firmId && isOwner ? (
          <Button variant="primary" disabled={starting} onClick={startCheckout} className="w-full mb-3">
            {starting && <Loader2 className="w-4 h-4 animate-spin" />} Subscribe
          </Button>
        ) : (
          <p className="text-xs text-[var(--text-4)] ds-type-body-m mb-3">Ask your firm's owner to subscribe.</p>
        )}
        <button onClick={() => logout('/')} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text)] ds-type-body-m">
          <LogOut className="w-3.5 h-3.5" /> Log out
        </button>
      </Card>
    </div>
  );
}
