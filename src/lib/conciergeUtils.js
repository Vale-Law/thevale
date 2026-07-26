// Utilities for the legal matching concierge: structured-output parsing,
// booking handoff (stores case summary the same way the questionnaire does),
// and "see more matches" routing into the standard search results.
import { storeScreeningData } from './questionnaireData';

export function extractStructured(content) {
  if (!content || typeof content !== 'string') return null;
  const fence = content.match(/```json\s*([\s\S]*?)```/i);
  if (!fence) return null;
  try {
    const parsed = JSON.parse(fence[1].trim());
    if (parsed && (parsed.type === 'matches' || parsed.type === 'no_matches')) return parsed;
    return null;
  } catch (e) {
    return null;
  }
}

export function stripJsonBlock(content) {
  if (!content || typeof content !== 'string') return { text: '', json: null };
  const json = extractStructured(content);
  const text = content.replace(/```json\s*[\s\S]*?```/i, '').trim();
  return { text, json };
}

function formatCaseSummary(cs) {
  if (!cs) return '';
  const parts = [];
  if (cs.practice_area_primary) parts.push(cs.practice_area_primary);
  if (cs.practice_area_secondary) parts.push(`(also: ${cs.practice_area_secondary})`);
  const loc = [cs.city, cs.state].filter(Boolean).join(', ');
  if (loc) parts.push(loc);
  if (cs.urgency) parts.push(cs.urgency);
  if (cs.budget_range) parts.push(`Budget: ${cs.budget_range}`);
  if (cs.preferred_language) parts.push(`Prefers ${cs.preferred_language}`);
  const head = parts.filter(Boolean).join(' · ');
  const body = cs.description || '';
  const facts = cs.key_facts && cs.key_facts.length ? `Key facts: ${cs.key_facts.join('; ')}` : '';
  return [head, body, facts].filter(Boolean).join('\n\n');
}

// Stores the agent's case summary through the same screening-data mechanism
// the existing questionnaire uses, so the Booking flow picks it up unchanged.
export function storeConciergeScreening(parsed) {
  if (!parsed || parsed.type !== 'matches' || !parsed.case_summary) return;
  const cs = parsed.case_summary;
  const search = parsed.search || {};
  const answers = {};
  if (cs.urgency) answers.urgency = cs.urgency;
  if (cs.practice_area_primary) answers.matter_type = cs.practice_area_primary;
  if (cs.preferred_language) answers.language = cs.preferred_language;
  storeScreeningData({
    answers,
    caseSummary: formatCaseSummary(cs),
    areaLabel: cs.practice_area_primary || search.area || '',
    location: { state: cs.state || search.state || '', city: cs.city || search.city || '' },
    skipped: false,
  });
}

export function stripContextPrefix(content) {
  if (!content || typeof content !== 'string') return '';
  return content.replace(/^\s*\[Context for matching[\s\S]*?\]\s*/, '').trim();
}

// Keyword-based practice-area detection for free-text input, shared by the
// hero chatbox and the concierge chat so both flows understand the same
// language. Returns a canonical practice area ('' when nothing matches).
const AREA_KEYWORDS = [
  { area: 'Immigration', keywords: ['immigra', 'inmigra', 'migra', 'visa', 'green card', 'citizenship', 'naturaliz', 'asylum', 'asilo', 'deport', 'daca', 'residency', 'residencia'] },
  { area: 'Family Law', keywords: ['family law', 'divorce', 'divorcio', 'custody', 'custodia', 'child support', 'adopt', 'alimony', 'prenup', 'separat', 'domestic violence', 'guardianship', 'spouse', 'marriage', 'matrimonio'] },
  { area: 'Personal Injury', keywords: ['personal injury', 'injur', 'accident', 'accidente', 'crash', 'hit by', 'slip', 'fell ', 'malpractice', 'negligen', 'dog bite', 'wrongful death', 'hurt', 'lesion', 'lesión'] },
  { area: 'Business Formation', keywords: ['business', 'llc', 'contract', 'contrato', 'trademark', 'copyright', 'startup', 'incorporat', 'partnership', 'company', 'negocio', 'tax', 'impuesto'] },
];

export function detectPracticeArea(text) {
  if (!text) return '';
  const t = String(text).toLowerCase();
  for (const { area, keywords } of AREA_KEYWORDS) {
    if (keywords.some((k) => t.includes(k))) return area;
  }
  return '';
}

export function buildSearchUrl(search) {
  if (!search) return '/?browse=1';
  const params = new URLSearchParams();
  if (search.area) params.set('area', search.area);
  if (search.state) params.set('state', search.state);
  if (search.city) params.set('city', search.city);
  const qs = params.toString();
  return qs ? `/?${qs}` : '/?browse=1';
}