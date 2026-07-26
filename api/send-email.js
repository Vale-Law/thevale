// Vercel serverless function — transactional email can't be sent
// client-side (that would mean shipping a provider API key to the
// browser), so the frontend's base44.integrations.Core.SendEmail() call
// hits this endpoint instead. See docs/MIGRATION.md.
//
// Requires a RESEND_API_KEY environment variable set in the Vercel
// project (server-only — do not prefix with VITE_). Until it's set, this
// returns 503 and the frontend already treats email failures as
// non-fatal (every call site wraps SendEmail in try/catch).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { to, subject, body } = req.body || {};
  if (typeof to !== 'string' || !EMAIL_RE.test(to)) {
    res.status(400).json({ error: 'Invalid "to" address' });
    return;
  }
  if (typeof subject !== 'string' || !subject.trim() || /[\r\n]/.test(subject)) {
    res.status(400).json({ error: 'Invalid "subject"' });
    return;
  }
  if (typeof body !== 'string' || !body.trim()) {
    res.status(400).json({ error: 'Invalid "body"' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    res.status(503).json({ error: 'Email is not configured (RESEND_API_KEY / RESEND_FROM_EMAIL unset)' });
    return;
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: body,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      res.status(502).json({ error: 'Email provider rejected the request', detail });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message || 'Failed to send email' });
  }
}
