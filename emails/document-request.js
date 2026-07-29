// Shared Contract 2.2 adds 'document_request' to email_schedule.kind and
// 'upload' to booking_action_tokens.purpose, for a future Track A/B
// /upload/:token flow (document_requests, client_documents). Not wired to
// any send path yet — document_requests doesn't exist until Track A's v1.3
// schema PR lands. Built now as W1 template prep, per the Shared Contract's
// email-kind list.
import { renderLayout } from './layout.js';
import { paragraph, button, detailsBlock } from './components.js';

export function documentRequestText({ clientName, attorneyName, label, uploadUrl }) {
  return (
    `Hi ${clientName},\n\n` +
    `${attorneyName} has requested a document for your consultation: ${label}.\n\n` +
    `Upload it here: ${uploadUrl}\n\n` +
    `The Brief Team`
  );
}

export function documentRequestHtml({ clientName, attorneyName, label, uploadUrl }) {
  const line = `${attorneyName} has requested a document for your consultation.`;
  const contentHtml = [
    paragraph(`Hi ${clientName},`),
    paragraph(line),
    detailsBlock([['Requested by', attorneyName], ['Document', label]]),
    button(uploadUrl, 'Upload document'),
  ].join('\n');

  return renderLayout({
    title: 'Document requested',
    preheader: line,
    contentHtml,
  });
}
