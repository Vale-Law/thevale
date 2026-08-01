// Shared Stripe SDK instance for every server-side Stripe call in this
// codebase (subscriptions and Connect direct charges alike).
//
// Requires STRIPE_SECRET_KEY as a server-only Vercel env var (never
// VITE_-prefixed). Until it's set, isStripeConfigured() is false and every
// caller returns a soft 503 -- same convention as api/send-email.js's
// RESEND_API_KEY gate and the calendar layer's OAuth-credential gates.
//
// The 'stripe' package itself is loaded lazily, via a dynamic import
// inside stripeClient() -- deliberately NOT a static top-level import.
// api/bookings-public.js and api/manage.js are on the critical path for
// every public booking action and import this module transitively
// (through stripeConnect.js) regardless of whether a given booking
// involves payment at all; a static import would mean any failure to
// load the Stripe SDK (a bad build, a bundling issue, anything) crashes
// those endpoints entirely, breaking booking/cancellation for everyone
// -- exactly the "fails closed" bug this file exists to prevent. With a
// lazy import, isStripeConfigured() (a plain env-var check) never
// touches the package at all, and stripeClient() only attempts to load
// it once the caller has already confirmed Stripe is meant to be used.
let cached;

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

export async function stripeClient() {
  if (cached) return cached;
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const { default: Stripe } = await import('stripe');
  cached = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  return cached;
}
