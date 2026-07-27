// Service-role Supabase client for the handful of server-side operations
// that must bypass RLS by design: creating a guest booking with no
// authenticated client_id, and reading/consuming hashed action tokens from
// booking_action_tokens (which deliberately carries no anon/authenticated
// policies at all — see supabase/migrations/20260727040000_track_a_w0_foundation.sql).
//
// Requires SUPABASE_SERVICE_ROLE_KEY as a server-only Vercel env var (never
// VITE_-prefixed, never sent to the browser). Until it's set, every handler
// that calls this returns a soft 503 — same convention as api/send-email.js
// and its RESEND_API_KEY gate.
import { createClient } from '@supabase/supabase-js';

let cached;

export function supabaseAdmin() {
  if (cached) return cached;
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
