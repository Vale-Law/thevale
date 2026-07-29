// Shared send path for server-originated transactional email (booking
// confirmation, attorney notification, reminders). Same Resend call as
// api/send-email.js, duplicated rather than imported because that file is
// wired specifically to the browser-facing SendEmail() call shape — this
// one is called directly from other server functions with no HTTP hop.
//
// Requires RESEND_API_KEY / RESEND_FROM_EMAIL as server-only Vercel env
// vars. Until they're set, this no-ops and returns false; every caller
// treats that as non-fatal, matching how the rest of the app already
// handles email being unconfigured.
//
// `html` is optional so existing plain-text-only call sites keep working
// unchanged; Resend sends a proper multipart message when both text and
// html are present, satisfying DS v2 Section 13's plain-text-alternative
// requirement.
export async function sendEmail(to, subject, text, html) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !to) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(html ? { from, to, subject, text, html } : { from, to, subject, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function manageLinks(origin, tokens) {
  const base = `${origin || ''}/manage`;
  return {
    confirm: `${base}/${tokens.confirm}`,
    reschedule: `${base}/${tokens.reschedule}`,
    cancel: `${base}/${tokens.cancel}`,
  };
}
