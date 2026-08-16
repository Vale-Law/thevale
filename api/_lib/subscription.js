// Wave 1: one server-side answer to "may this firm use the paid paths
// right now?". Mirrors AttorneyShell.jsx's portal gate exactly:
// 'active'/'trialing' are obviously in; 'past_due' stays in because it is
// Stripe's own Smart-Retries grace window (Stripe itself moves the
// subscription to 'canceled'/'unpaid' when retries are exhausted) -- the
// server never invents a harsher dunning policy than the webhook-mirrored
// status. Everything else ('incomplete', 'canceled', 'unpaid', or no row
// at all) is not active.
//
// The DB-level backstop for the same rule is
// public.firm_has_active_subscription() plus the consultation_charges
// insert trigger (supabase/migrations/20260817000000_wave1_money_loop_enforcement.sql);
// this helper is the API-level gate in front of it.
export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due'];

// Fails CLOSED: a lookup error (including the table not existing yet on an
// un-migrated environment) reads as "not active". This is an enforcement
// gate on money collection -- unlike the payment-collection conveniences
// elsewhere, it must never fail open.
export async function firmHasActiveSubscription(admin, firmId) {
  if (!firmId) return false;
  const { data, error } = await admin
    .from('firm_subscriptions')
    .select('status')
    .eq('firm_id', firmId)
    .maybeSingle();
  if (error) {
    console.error(`[subscription] firm_subscriptions lookup failed for firm ${firmId}: ${error.message}`);
    return false;
  }
  return !!data && ACTIVE_SUBSCRIPTION_STATUSES.includes(data.status);
}
