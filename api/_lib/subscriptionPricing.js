// Resolves the live platform-subscription Price from Stripe by lookup_key
// rather than hard-coding a price ID (let alone an amount) anywhere in this
// codebase. Set a Price's lookup_key to STRIPE_PLATFORM_PRICE_LOOKUP_KEY's
// value (default 'brief_platform_monthly') in the Stripe Dashboard --
// changing the price there takes effect immediately, no deploy needed.
import { stripeClient } from './stripeClient.js';

const DEFAULT_LOOKUP_KEY = 'brief_platform_monthly';

export function platformPriceLookupKey() {
  return process.env.STRIPE_PLATFORM_PRICE_LOOKUP_KEY || DEFAULT_LOOKUP_KEY;
}

export async function getPlatformPrice() {
  const stripe = stripeClient();
  const lookupKey = platformPriceLookupKey();
  const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, expand: ['data.product'], limit: 1 });
  const price = data[0];
  if (!price) throw new Error(`No active Stripe Price found with lookup_key "${lookupKey}". Create one in the Stripe Dashboard.`);
  return price;
}
