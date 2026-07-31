// Stripe Connect helpers for Item 4b: client consultation payments via
// DIRECT CHARGES (the charge itself belongs to the attorney's connected
// account -- created by calling the Stripe API with the `stripeAccount`
// request option -- so funds settle straight there and never touch
// Brief's own balance). application_fee_amount is always 0: Brief takes
// no percentage of any consultation fee, only the flat platform
// subscription (item 4a).
import { stripeClient } from './stripeClient.js';

export function createExpressAccount(email) {
  const stripe = stripeClient();
  return stripe.accounts.create({
    type: 'express',
    email,
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
  });
}

export function createAccountLink(accountId, { refreshUrl, returnUrl }) {
  const stripe = stripeClient();
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
}

// A direct-charge Checkout Session: created ON the connected account via
// { stripeAccount }, mode 'payment' (one-time, not subscription),
// application_fee_amount 0. metadata.booking_id lets the Connect webhook
// (api/webhooks-stripe-connect.js) find the matching consultation_charges
// row without a second round trip.
export function createConsultationCheckout({ connectedAccountId, amountCents, clientEmail, attorneyName, bookingId, successUrl, cancelUrl }) {
  const stripe = stripeClient();
  return stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: { name: `Consultation with ${attorneyName}` },
        },
        quantity: 1,
      }],
      payment_intent_data: { application_fee_amount: 0 },
      metadata: { booking_id: bookingId },
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
    { stripeAccount: connectedAccountId }
  );
}

// Refunds must be issued against the connected account too, same as the
// charge itself -- this is what makes it a refund of a direct charge
// rather than an (invalid) attempt to refund from the platform's balance.
export function refundConsultationPayment({ connectedAccountId, paymentIntentId }) {
  const stripe = stripeClient();
  return stripe.refunds.create({ payment_intent: paymentIntentId }, { stripeAccount: connectedAccountId });
}
