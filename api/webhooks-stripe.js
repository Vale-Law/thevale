// POST /api/webhooks-stripe -- Stripe webhook endpoint for the platform
// subscription lifecycle (checkout completion, created/updated/deleted,
// payment failures). Signature-verified against the raw request body, so
// body parsing is disabled for this function and the bytes are read
// manually before any JSON parsing happens.
//
// Requires STRIPE_WEBHOOK_SECRET (the signing secret for the webhook
// endpoint configured in the Stripe Dashboard) as a server-only Vercel env
// var, in addition to STRIPE_SECRET_KEY.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { isStripeConfigured, stripeClient } from './_lib/stripeClient.js';

export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Past-due is a deliberate grace period, not a cutoff: a subscription stays
// 'past_due' through Stripe's own retry schedule (Smart Retries) before
// Stripe itself moves it to 'canceled' or 'unpaid' -- portal-access gating
// (src/lib/AuthContext.jsx) treats 'past_due' as still-active-with-a-banner,
// never an immediate lockout. This function only ever mirrors whatever
// status Stripe reports; it doesn't invent its own dunning logic.
async function syncSubscriptionRow(admin, subscription) {
  const update = {
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items?.data?.[0]?.price?.id || null,
    status: subscription.status,
    current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: !!subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };
  await admin.from('firm_subscriptions').update(update).eq('stripe_customer_id', subscription.customer);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(503).json({ error: 'Webhook is not configured yet.' });
    return;
  }

  const stripe = await stripeClient();
  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Not configured (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    res.status(400).json({ error: `Webhook signature verification failed: ${e.message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await syncSubscriptionRow(admin, subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscriptionRow(admin, event.data.object);
        break;
      case 'invoice.payment_failed':
      case 'invoice.paid': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          await syncSubscriptionRow(admin, subscription);
        }
        break;
      }
      default:
        break;
    }
    res.status(200).json({ received: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Webhook handling failed' });
  }
}
