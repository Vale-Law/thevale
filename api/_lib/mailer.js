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
export async function sendEmail(to, subject, text) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !to) return false;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text }),
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

export function bookingEmailBody({ clientName, attorneyName, when, links, reminder }) {
  const heading = reminder
    ? `This is a reminder: your consultation with ${attorneyName} is coming up on ${when}.`
    : `Your consultation with ${attorneyName} is booked for ${when}.`;
  return (
    `Hi ${clientName},\n\n${heading}\n\n` +
    `Confirm your appointment: ${links.confirm}\n` +
    `Need to change it? Reschedule: ${links.reschedule}\n` +
    `Cancel: ${links.cancel}\n\n` +
    `Brief is not a law firm. Booking a consultation does not create an attorney-client relationship. ` +
    `Any attorney-client relationship is formed only between you and the attorney, on terms you agree with them directly.\n\n` +
    `The Brief Team`
  );
}
