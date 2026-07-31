// Shared Stripe SDK instance for every server-side Stripe call in this
// codebase (subscriptions and Connect direct charges alike).
//
// Requires STRIPE_SECRET_KEY as a server-only Vercel env var (never
// VITE_-prefixed). Until it's set, isStripeConfigured() is false and every
// caller returns a soft 503 -- same convention as api/send-email.js's
// RESEND_API_KEY gate and the calendar layer's OAuth-credential gates.
import Stripe from 'stripe';

let cached;

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function stripeClient() {
  if (cached) return cached;
  if (!process.env.STRIPE_SECRET_KEY) return null;
  cached = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  return cached;
}
