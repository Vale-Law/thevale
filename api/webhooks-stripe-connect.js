// POST /api/webhooks-stripe-connect -- a SEPARATE webhook endpoint from
// api/webhooks-stripe.js, on purpose: direct charges and the connected
// accounts themselves emit their events in the Connect context, which
// Stripe only delivers to a webhook endpoint explicitly configured in the
// Dashboard to "Listen to events on Connected accounts" -- they do not
// arrive on the platform's own (non-Connect) webhook endpoint. Stripe
// issues that endpoint its own separate signing secret
// (STRIPE_CONNECT_WEBHOOK_SECRET), distinct from STRIPE_WEBHOOK_SECRET.
//
// Handles:
//  - account.updated: syncs firm_payment_accounts.status from the
//    connected account's own charges_enabled/details_submitted flags.
//  - checkout.session.completed (mode 'payment'): marks the matching
//    consultation_charges row 'charged' once a client's direct-charge
//    payment at booking succeeds.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isStripeConfigured() || !process.env.STRIPE_CONNECT_WEBHOOK_SECRET) {
    res.status(503).json({ error: 'Connect webhook is not configured yet.' });
    return;
  }

  const stripe = stripeClient();
  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Not configured (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_CONNECT_WEBHOOK_SECRET);
  } catch (e) {
    res.status(400).json({ error: `Webhook signature verification failed: ${e.message}` });
    return;
  }

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object;
        const status = account.charges_enabled && account.details_submitted ? 'active' : 'onboarding';
        await admin
          .from('firm_payment_accounts')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('stripe_account_id', account.id);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;
        if (session.mode === 'payment' && bookingId) {
          await admin
            .from('consultation_charges')
            .update({
              status: 'charged',
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent,
            })
            .eq('booking_id', bookingId);
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
