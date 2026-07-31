import { useState, useEffect, useCallback } from 'react';
import { Loader2, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, Button } from '@/components/primitives';

const STATUS_LABEL = {
  active: 'Active', trialing: 'Trial', past_due: 'Payment failed — grace period',
  canceled: 'Canceled', unpaid: 'Unpaid', incomplete: 'Incomplete', none: 'Not subscribed',
};
const STATUS_COLOR = {
  active: 'var(--confirmed)', trialing: 'var(--confirmed)', past_due: 'var(--pending)',
  canceled: 'var(--noshow)', unpaid: 'var(--noshow)', incomplete: 'var(--text-3)', none: 'var(--text-3)',
};

// Firm-level billing (Item 4a) -- Brief takes a flat monthly subscription
// for platform access, no cut of consultation fees. Only the firm owner
// can actually act (matches api/subscription-checkout.js and
// api/subscription-portal.js's own owner-only checks); a non-owner sees
// status only.
export default function BillingCard() {
  const { user, subscriptionStatus, reloadAttorney } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('firm_members').select('role').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setIsOwner(data?.role === 'owner'));
  }, [user?.id]);

  const call = useCallback(async (endpoint) => {
    setBusy(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      window.location.href = data.url;
    } catch (e) {
      setError(e.message || 'Something went wrong.');
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('billing') === 'success') reloadAttorney();
  }, [reloadAttorney]);

  const status = subscriptionStatus || 'none';
  const subscribed = !['none', 'incomplete', 'canceled', 'unpaid'].includes(status);

  return (
    <Card tone="raised" className="mb-4">
      <p className="ds-type-label text-[var(--text-3)] mb-1">Billing</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
        <span className="text-sm ds-type-body-m text-[var(--text)]">{STATUS_LABEL[status] || status}</span>
      </div>
      {status === 'past_due' && (
        <p className="flex items-start gap-1.5 text-xs text-[var(--pending)] ds-type-body-m mb-3">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Your last payment failed. Your portal access continues during this grace period — update your payment method to avoid losing access.
        </p>
      )}
      <p className="text-sm text-[var(--text-3)] ds-type-body-m mb-4 max-w-md">
        Brief is a flat monthly subscription for platform access — no cut of your consultation fees, ever.
      </p>
      {error && <p className="text-sm text-[var(--noshow)] ds-type-body-m mb-3">{error}</p>}
      {isOwner ? (
        subscribed ? (
          <Button variant="secondary" size="compact" disabled={busy} onClick={() => call('/api/subscription-portal')}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />} Manage billing
          </Button>
        ) : (
          <Button variant="primary" size="compact" disabled={busy} onClick={() => call('/api/subscription-checkout')}>
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />} Subscribe
          </Button>
        )
      ) : (
        <p className="text-xs text-[var(--text-4)] ds-type-body-m">Only your firm's owner can manage billing.</p>
      )}
    </Card>
  );
}
