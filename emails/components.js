// Reusable HTML fragments for the DS v2 Section 13 email layout. One
// --accent button per email (44px tall); reschedule/cancel are always
// rendered as text links, never a second button.
import { light, fontSystem } from './tokens.js';
import { escapeHtml } from './layout.js';

export function paragraph(text, { color = light.text, cls = 'ds-text', size = 15 } = {}) {
  return `<p class="${cls}" style="font-family:${fontSystem};font-size:${size}px;line-height:1.6;color:${color};margin:0 0 16px;">${escapeHtml(text)}</p>`;
}

export function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr><td>
<a href="${escapeHtml(href)}" class="ds-button" style="display:inline-block;height:44px;line-height:44px;padding:0 28px;background-color:${light.accent};color:${light.accentOn};font-family:${fontSystem};font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

// Tabular-nums details block on --surface-sunk, per spec.
export function detailsBlock(rows) {
  const trs = rows.map(([label, value]) => `
<tr>
<td class="ds-text-3" style="font-family:${fontSystem};font-size:13px;color:${light.text3};padding:6px 0;">${escapeHtml(label)}</td>
<td align="right" class="ds-text" style="font-family:${fontSystem};font-size:14px;color:${light.text};font-variant-numeric:tabular-nums;padding:6px 0;">${escapeHtml(value)}</td>
</tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="ds-sunk" style="background-color:${light.surfaceSunk};border-radius:8px;padding:4px 20px;margin:4px 0 20px;">${trs}</table>`;
}

export function textLink(href, label) {
  return `<a href="${escapeHtml(href)}" class="ds-link" style="color:${light.accent};font-family:${fontSystem};font-size:13px;text-decoration:underline;">${escapeHtml(label)}</a>`;
}

export function textLinkRow(links) {
  const parts = links.map(([href, label]) => textLink(href, label));
  return `<p class="ds-text-3" style="font-family:${fontSystem};font-size:13px;color:${light.text3};margin:0;">${parts.join(' &nbsp;&middot;&nbsp; ')}</p>`;
}
