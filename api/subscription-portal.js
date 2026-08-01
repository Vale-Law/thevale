// POST /api/subscription-portal
// Authenticated, firm owner only. Returns a Stripe Billing Portal session
// URL where the owner can update their payment method or cancel --
// no custom cancellation/payment-method UI built here, by design.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { isStripeConfigured, stripeClient } from './_lib/stripeClient.js';

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
    res.status(503).json({ error: 'Billing is not configured yet (STRIPE_SECRET_KEY unset).' });
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
    res.status(403).json({ error: 'Only the firm owner can manage billing.' });
    return;
  }

  const { data: sub } = await admin
    .from('firm_subscriptions')
    .select('stripe_customer_id')
    .eq('firm_id', membership.firm_id)
    .maybeSingle();
  if (!sub?.stripe_customer_id) {
    res.status(404).json({ error: 'No billing account yet — subscribe first.' });
    return;
  }

  const stripe = await stripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${redirectBase(req)}/attorney/profile`,
  });

  res.status(200).json({ url: session.url });
}
