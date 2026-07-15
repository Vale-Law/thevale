import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-side admin client. Uses the SERVICE ROLE key, which can read/write any
// row and bypasses Row Level Security. This must NEVER be imported into browser
// code — it lives only inside API route handlers that run on the server.
//
// The real client is created lazily on first use (not at import time), so
// `next build` can load these modules without the env vars being present.
let _client: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
  }
  return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = client();
    const value = (c as any)[prop];
    return typeof value === 'function' ? value.bind(c) : value;
  },
});
