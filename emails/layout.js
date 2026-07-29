// Brief Design System v2, Section 13 (Transactional Email): 600px max
// width, --ground body / --surface content card at --radius-m, Georgia
// serif wordmark line (web fonts are unreliable in email clients), system
// sans for everything else, no halftone/grain/texture effects, single
// --accent button per email, dark-mode overrides via a media query.
//
// Email clients don't reliably support CSS custom properties or alpha
// compositing, so colors are inlined from emails/tokens.js's solid
// approximations rather than referencing src/styles/tokens.css directly.
// Dark-mode overrides use classed `!important` rules, which do take
// precedence over an element's own inline style — the standard technique
// for email dark-mode support (Apple Mail, Gmail app, etc.).
import { light, dark, fontHuman, fontSystem } from './tokens.js';

const DISCLAIMER =
  'Brief is not a law firm. Booking a consultation does not create an attorney-client relationship. ' +
  'Any attorney-client relationship is formed only between you and the attorney, on terms you agree with them directly.';

export function renderLayout({ title, preheader, contentHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)}</title>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}
  body{margin:0;padding:0;width:100%!important;}
  @media (prefers-color-scheme: dark) {
    .ds-body{background-color:${dark.ground}!important;}
    .ds-card{background-color:${dark.surface}!important;border-color:${dark.line}!important;}
    .ds-sunk{background-color:${dark.surfaceSunk}!important;}
    .ds-text{color:${dark.text}!important;}
    .ds-text-2{color:${dark.text2}!important;}
    .ds-text-3{color:${dark.text3}!important;}
    .ds-button{background-color:${dark.accent}!important;color:${dark.accentOn}!important;}
    .ds-link{color:${dark.accent}!important;}
  }
</style>
</head>
<body class="ds-body" style="margin:0;padding:0;background-color:${light.ground};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${light.ground};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding-bottom:20px;text-align:center;">
<span class="ds-text" style="font-family:${fontHuman};font-size:20px;color:${light.text};">Brief</span>
</td></tr>
<tr><td class="ds-card" style="background-color:${light.surface};border:1px solid ${light.line};border-radius:14px;padding:32px;">
${contentHtml}
</td></tr>
<tr><td style="padding-top:20px;text-align:center;">
<p class="ds-text-3" style="font-family:${fontSystem};font-size:12px;line-height:1.5;color:${light.text3};margin:0;">${DISCLAIMER}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const TEXT_DISCLAIMER = DISCLAIMER;
