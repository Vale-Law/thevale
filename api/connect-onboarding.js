// POST /api/connect-onboarding
// Authenticated, firm owner only. Creates (or reuses) a Stripe Express
// connected account for the firm and returns a fresh Account Link URL --
// works for both first-time onboarding and resuming an incomplete one,
// since Account Links always regenerate the return/refresh destination.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { isStripeConfigured } from './_lib/stripeClient.js';
import { createExpressAccount, createAccountLink } from './_lib/stripeConnect.js';

function redirectBase(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isStripeConfigured()) {
    res.status(503).json({ error: 'Payments are not configured yet (STRIPE_SECRET_KEY unset).' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Not configured (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }

  const { data: membership } = await admin
    .from('firm_members')
    .select('firm_id, role')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (!membership || membership.role !== 'owner') {
    res.status(403).json({ error: 'Only the firm owner can set up payments.' });
    return;
  }

  const { data: existing } = await admin
    .from('firm_payment_accounts')
    .select('*')
    .eq('firm_id', membership.firm_id)
    .maybeSingle();

  let accountId = existing?.stripe_account_id;
  if (!accountId) {
    const account = await createExpressAccount(userData.user.email);
    accountId = account.id;
    const { error: insertErr } = await admin.from('firm_payment_accounts').insert({
      firm_id: membership.firm_id,
      stripe_account_id: accountId,
      status: 'onboarding',
    });
    if (insertErr) {
      res.status(500).json({ error: insertErr.message });
      return;
    }
  }

  const base = redirectBase(req);
  const link = await createAccountLink(accountId, {
    refreshUrl: `${base}/attorney/profile?connect=refresh`,
    returnUrl: `${base}/attorney/profile?connect=return`,
  });

  res.status(200).json({ url: link.url });
}
