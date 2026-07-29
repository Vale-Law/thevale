// Confirmation / reminder (and reschedule, which reuses the same body —
// the call site supplies its own subject line) client-facing email.
// bookingEmailText's copy is byte-identical to the plain-text body this
// replaces (previously api/_lib/mailer.js's bookingEmailBody), so the
// plain-text alternative required by DS v2 Section 13 doesn't drift from
// what was already being sent.
import { renderLayout, TEXT_DISCLAIMER } from './layout.js';
import { paragraph, button, detailsBlock, textLinkRow } from './components.js';

function heading({ attorneyName, when, reminder }) {
  return reminder
    ? `This is a reminder: your consultation with ${attorneyName} is coming up on ${when}.`
    : `Your consultation with ${attorneyName} is booked for ${when}.`;
}

export function bookingEmailText({ clientName, attorneyName, when, links, reminder }) {
  return (
    `Hi ${clientName},\n\n${heading({ attorneyName, when, reminder })}\n\n` +
    `Confirm your appointment: ${links.confirm}\n` +
    `Need to change it? Reschedule: ${links.reschedule}\n` +
    `Cancel: ${links.cancel}\n\n` +
    `${TEXT_DISCLAIMER}\n\n` +
    `The Brief Team`
  );
}

export function bookingEmailHtml({ clientName, attorneyName, when, links, reminder }) {
  const line = heading({ attorneyName, when, reminder });
  const contentHtml = [
    paragraph(`Hi ${clientName},`),
    paragraph(line),
    detailsBlock([['With', attorneyName], ['When', when]]),
    button(links.confirm, 'Confirm appointment'),
    textLinkRow([[links.reschedule, 'Reschedule'], [links.cancel, 'Cancel']]),
  ].join('\n');

  return renderLayout({
    title: reminder ? 'Consultation reminder' : 'Consultation booked',
    preheader: line,
    contentHtml,
  });
}
