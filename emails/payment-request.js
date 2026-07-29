// Shared Contract 2.2 adds 'payment_request' to email_schedule.kind and
// 'pay' to booking_action_tokens.purpose, for a future Track A /pay/:token
// flow (firm_payment_accounts, consultation_charges.stripe_payment_intent_id
// / paid_at). Not wired to any send path yet — no caller exists until that
// schema lands and a payment flow calls it. Built now as W1 template prep,
// per the Shared Contract's email-kind list.
import { renderLayout } from './layout.js';
import { paragraph, button, detailsBlock } from './components.js';

export function paymentRequestText({ clientName, attorneyName, amount, when, payUrl }) {
  return (
    `Hi ${clientName},\n\n` +
    `Your consultation with ${attorneyName} on ${when} requires payment of ${amount} before it's confirmed.\n\n` +
    `Pay now: ${payUrl}\n\n` +
    `The Brief Team`
  );
}

export function paymentRequestHtml({ clientName, attorneyName, amount, when, payUrl }) {
  const line = `Your consultation with ${attorneyName} on ${when} requires payment before it's confirmed.`;
  const contentHtml = [
    paragraph(`Hi ${clientName},`),
    paragraph(line),
    detailsBlock([['With', attorneyName], ['When', when], ['Amount due', amount]]),
    button(payUrl, 'Pay now'),
  ].join('\n');

  return renderLayout({
    title: 'Payment requested',
    preheader: line,
    contentHtml,
  });
}
