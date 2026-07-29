// GET /api/verification-labels?attorney_id=<uuid>
//
// Narrow public read for F-05's factual profile labels (Sprint v1.2 Track
// B, W2.2). attorney_verification_records is admin/owner-only under RLS by
// design -- the public reads through this route instead, which exposes
// ONLY factual month/year labels for verified attorneys: never the raw
// row, never reviewer_id, never a rejection reason, never exact
// timestamps (month/year granularity per Shared Contract 2.2's public-
// label rule).
//
// Double-gated: the attorney's fast-path verification_status AND the
// record's own status must both be 'verified', otherwise the response is
// { verified: false } with nothing else.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function monthYear(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    res.status(503).json({ error: 'Not configured (SUPABASE_SERVICE_ROLE_KEY unset).' });
    return;
  }

  const attorneyId = String(req.query?.attorney_id || '');
  if (!UUID_RE.test(attorneyId)) {
    res.status(400).json({ error: 'attorney_id must be a UUID' });
    return;
  }

  const { data: attorney, error: aErr } = await admin
    .from('attorneys')
    .select('id, verification_status')
    .eq('id', attorneyId)
    .maybeSingle();
  if (aErr) {
    res.status(500).json({ error: aErr.message });
    return;
  }
  if (!attorney || attorney.verification_status !== 'verified') {
    res.status(200).json({ verified: false });
    return;
  }

  const { data: record, error: rErr } = await admin
    .from('attorney_verification_records')
    .select('status, bar_status_verified_at, identity_verified_at, profile_attested_at, renewal_date')
    .eq('attorney_id', attorneyId)
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (rErr) {
    res.status(500).json({ error: rErr.message });
    return;
  }
  if (!record) {
    // Verified on the fast-path column but no verification record yet
    // (attorneys approved before F-05 landed). Factual and safe: report
    // verified with no dated labels rather than inventing dates.
    res.status(200).json({ verified: true, labels: {} });
    return;
  }

  res.status(200).json({
    verified: true,
    labels: {
      bar_status_verified: monthYear(record.bar_status_verified_at),
      identity_verified: monthYear(record.identity_verified_at),
      profile_attested: monthYear(record.profile_attested_at),
      renewal_due: monthYear(record.renewal_date),
    },
  });
}
