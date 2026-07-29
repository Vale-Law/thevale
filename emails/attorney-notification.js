// New-consultation-request notification sent to the attorney at booking
// creation time (api/bookings-public.js). Administrative content only —
// no client-facing marketing copy, per DS v2 Section 13.
import { renderLayout } from './layout.js';
import { paragraph, button, detailsBlock } from './components.js';

export function attorneyNotificationText({ clientName, when, dashboardUrl }) {
  return `${clientName} requested a consultation for ${when}.\n\nReview it in your dashboard: ${dashboardUrl}`;
}

export function attorneyNotificationHtml({ clientName, when, dashboardUrl }) {
  const line = `${clientName} requested a consultation for ${when}.`;
  const contentHtml = [
    paragraph(line),
    detailsBlock([['Client', clientName], ['Requested for', when]]),
    button(dashboardUrl, 'Review in dashboard'),
  ].join('\n');

  return renderLayout({
    title: 'New consultation request',
    preheader: line,
    contentHtml,
  });
}
