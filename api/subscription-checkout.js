// POST /api/subscription-checkout
// Authenticated, firm owner only (matches the firms_update_owner RLS
// pattern -- billing is an owner action, not something office staff do).
// Creates or reuses a Stripe Customer for the firm and returns a Checkout
// Session URL in subscription mode. The price is read live from Stripe
// (see _lib/subscriptionPricing.js) -- never hard-coded here.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { isStripeConfigured, stripeClient } from './_lib/stripeClient.js';
import { getPlatformPrice } from './_lib/subscriptionPricing.js';

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

  const stripe = stripeClient();
  const { data: existing } = await admin
    .from('firm_subscriptions')
    .select('*')
    .eq('firm_id', membership.firm_id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData.user.email,
      metadata: { firm_id: membership.firm_id },
    });
    customerId = customer.id;
    const { error: insertErr } = await admin.from('firm_subscriptions').insert({
      firm_id: membership.firm_id,
      stripe_customer_id: customerId,
      status: 'incomplete',
    });
    if (insertErr) {
      res.status(500).json({ error: insertErr.message });
      return;
    }
  }

  let price;
  try {
    price = await getPlatformPrice();
  } catch (e) {
    res.status(503).json({ error: e.message });
    return;
  }

  const base = redirectBase(req);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${base}/attorney/profile?billing=success`,
    cancel_url: `${base}/attorney/profile?billing=canceled`,
    allow_promotion_codes: true,
  });

  res.status(200).json({ url: session.url });
}
