import { useState, useEffect, useCallback } from 'react';
import { Loader2, Landmark } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Card, Button } from '@/components/primitives';

const STATUS_LABEL = { onboarding: 'Setup incomplete', active: 'Active', disabled: 'Disabled' };
const STATUS_COLOR = { onboarding: 'var(--pending)', active: 'var(--confirmed)', disabled: 'var(--noshow)' };

// Item 4b: Connect onboarding for direct-charge consultation payments.
// Firm-scoped and owner-only, same pattern as BillingCard (item 4a) --
// separate account/flow from the platform subscription, since this one is
// about clients paying the attorney directly (zero application fee),
// not the firm paying Brief.
export default function ConnectCard() {
  const { user, firmId } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [account, setAccount] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id || !firmId) return;
    const [{ data: membership }, { data: acct }] = await Promise.all([
      supabase.from('firm_members').select('role').eq('user_id', user.id).maybeSingle(),
      supabase.from('firm_payment_accounts').select('*').eq('firm_id', firmId).maybeSingle(),
    ]);
    setIsOwner(membership?.role === 'owner');
    setAccount(acct || null);
  }, [user?.id, firmId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('connect') === 'return') load();
  }, [load]);

  const startOnboarding = async () => {
    setBusy(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/connect-onboarding', { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start setup.');
      window.location.href = data.url;
    } catch (e) {
      setError(e.message || 'Could not start setup.');
      setBusy(false);
    }
  };

  return (
    <Card tone="raised" className="mb-4">
      <p className="ds-type-label text-[var(--text-3)] mb-1">Consultation payments</p>
      <p className="text-sm text-[var(--text-3)] ds-type-body-m mb-3 max-w-md">
        Connect a bank account so clients can pay your consultation fee at booking. Funds settle straight to you — Brief takes no cut.
      </p>
      {account && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[account.status] }} />
          <span className="text-sm ds-type-body-m text-[var(--text)]">{STATUS_LABEL[account.status] || account.status}</span>
        </div>
      )}
      {error && <p className="text-sm text-[var(--noshow)] ds-type-body-m mb-3">{error}</p>}
      {isOwner ? (
        <Button variant="secondary" size="compact" disabled={busy} onClick={startOnboarding}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Landmark className="w-3.5 h-3.5" />}
          {account?.status === 'active' ? 'Update payment details' : account ? 'Finish setup' : 'Set up payments'}
        </Button>
      ) : (
        <p className="text-xs text-[var(--text-4)] ds-type-body-m">Only your firm's owner can set this up.</p>
      )}
    </Card>
  );
}
