import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { X, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { useIsMobile } from '@/components/mobile/useIsMobile';
import { useLanguage } from '@/lib/i18n';
import { detectPracticeArea } from '@/lib/conciergeUtils';
import { US_STATES } from '@/lib/usLocations';

const AREA_FALLBACK = ['Family Law', 'Immigration', 'Business Formation', 'Personal Injury'];
const LANG_FALLBACK = ['English', 'Spanish'];
const PRICE_OPTIONS = [
  { label: 'No preference', value: null },
  { label: 'Under $100', value: 100 },
  { label: '$100 – $200', value: 200 },
  { label: 'Over $200', value: 999 },
];
const URGENCY_OPTIONS = ['No preference', 'Urgent', 'Soon', 'Just exploring'];

function Bubble({ role, text }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] min-w-0 bg-[#0a5dc2] text-white text-sm font-body px-4 py-2.5 rounded-2xl rounded-br-md whitespace-pre-wrap break-words">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] min-w-0 bg-white border border-[#E5E2DC] text-[#111418] text-sm font-body px-4 py-3 rounded-2xl rounded-bl-md break-words">
        {text}
      </div>
    </div>
  );
}

function OptionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 border border-[#E5E2DC] bg-white text-sm text-[#111418] font-body hover:border-[#0a5dc2] hover:text-[#0a5dc2] transition-colors rounded-xl break-words"
    >
      {label}
    </button>
  );
}

export default function ConciergePanel({ initialDescription, initialState = '', initialCity = '', onReset, onBrowseAreas }) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [attorneys, setAttorneys] = useState([]);
  // Anything already known (area detected from the description, location handed
  // off from the hero search) is pre-answered so we never re-ask it.
  const detectedArea = initialDescription ? detectPracticeArea(initialDescription) : '';
  const [answers, setAnswers] = useState({
    description: initialDescription || '', area: detectedArea, state: initialState, city: initialCity, language: '', maxFee: null, urgency: '',
  });
  const [step, setStep] = useState(
    !initialDescription ? 0
      : !detectedArea ? 1
        : !initialState ? 2
          : !initialCity ? 3
            : 4
  );
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.entities.Attorney.list().then(setAttorneys).catch(() => {});
  }, []);

  // Lock background scroll while the mobile overlay is open.
  useEffect(() => {
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isMobile]);

  const areas = useMemo(() => {
    const s = new Set();
    attorneys.forEach((a) => a.practice_area && s.add(a.practice_area));
    return s.size ? [...s] : AREA_FALLBACK;
  }, [attorneys]);
  // Once a practice area is chosen, every downstream question (state, city,
  // language) offers only options that actually have attorneys in that area —
  // otherwise "No preference" and honest answers alike can walk the user into
  // a state/city combo with zero matches, even though other locations work.
  const inArea = useMemo(() => (
    answers.area && answers.area !== '__all'
      ? attorneys.filter((a) => a.practice_area === answers.area)
      : attorneys
  ), [attorneys, answers.area]);
  const states = useMemo(() => {
    const s = new Set();
    inArea.forEach((a) => a.state && s.add(a.state));
    return [...s];
  }, [inArea]);
  const cities = useMemo(() => {
    const c = new Set();
    inArea.filter((a) => a.state === answers.state).forEach((a) => a.city && c.add(a.city));
    return [...c];
  }, [inArea, answers.state]);
  const langs = useMemo(() => {
    const s = new Set();
    inArea.forEach((a) => (a.languages || []).forEach((l) => s.add(l)));
    return s.size ? [...s] : LANG_FALLBACK;
  }, [inArea]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);
  useEffect(() => { scrollToBottom(); }, [step, answers, draft, scrollToBottom]);

  const advance = (nextAnswers) => {
    setAnswers(nextAnswers);
    let next = step + 1;
    // Skip questions that already have an answer (e.g. handed off from the
    // hero search) and the city question when no state was given.
    while (
      (next === 1 && nextAnswers.area) ||
      (next === 2 && nextAnswers.state) ||
      (next === 3 && (nextAnswers.city || !nextAnswers.state)) ||
      (next === 4 && nextAnswers.language)
    ) next += 1;
    setStep(next);
  };

  const matchOption = (text, opts) => {
    const q = text.trim().toLowerCase();
    if (!q) return '';
    return opts.find((o) => {
      const l = String(o).toLowerCase();
      return l === q || l.includes(q) || q.includes(l);
    }) || '';
  };

  const matchState = (text) => {
    const q = text.trim().toLowerCase();
    const direct = matchOption(text, states);
    if (direct) return direct;
    const named = US_STATES.find((s) => s.code.toLowerCase() === q || s.name.toLowerCase() === q || q.includes(s.name.toLowerCase()));
    return named ? named.code : '';
  };

  // Typed text answers whatever is currently being asked — it must never
  // restart the conversation from the beginning.
  const submitDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    if (step === 0) {
      const area = detectPracticeArea(text);
      const nextAnswers = { ...answers, description: text, area: area || answers.area };
      setAnswers(nextAnswers);
      setStep(nextAnswers.area ? 2 : 1);
    } else if (step === 1) {
      advance({ ...answers, area: matchOption(text, areas) || detectPracticeArea(text) || '__all' });
    } else if (step === 2) {
      const state = matchState(text);
      advance({ ...answers, state, city: '' });
    } else if (step === 3) {
      advance({ ...answers, city: matchOption(text, cities) });
    } else if (step === 4) {
      advance({ ...answers, language: matchOption(text, langs) });
    } else if (step === 5) {
      const m = text.match(/\d+/);
      const n = m ? Number(m[0]) : null;
      advance({ ...answers, maxFee: n == null ? null : n <= 100 ? 100 : n <= 200 ? 200 : 999 });
    } else if (step === 6) {
      const u = URGENCY_OPTIONS.find((o) => text.toLowerCase().includes(o.toLowerCase()));
      advance({ ...answers, urgency: u && u !== 'No preference' ? u : '' });
    }
  };

  const restart = () => {
    setAnswers({ description: '', area: '', state: '', city: '', language: '', maxFee: null, urgency: '' });
    setDraft('');
    setStep(0);
  };

  const seeAttorneys = () => {
    // Pass everything the chat learned to the results page so the two booking
    // flows stay in sync and nothing gets asked twice.
    const p = new URLSearchParams();
    p.set('concierge', '1');
    if (answers.area && answers.area !== '__all') p.set('area', answers.area);
    if (answers.state) p.set('state', answers.state);
    if (answers.city) p.set('city', answers.city);
    if (answers.language) p.set('lang', answers.language);
    if (answers.maxFee && answers.maxFee !== 999) p.set('maxFee', String(answers.maxFee));
    navigate(`/?${p.toString()}`);
  };

  const QUESTIONS = [
    "Which of these best describes what you're dealing with?",
    'Which state do you need an attorney in?',
    'And which city?',
    'What language do you prefer?',
    'What consultation price range works for you?',
    'How soon do you want to be seen?',
  ];

  // Build conversation bubbles from completed steps.
  const convo = [];
  convo.push({ role: 'assistant', text: "Tell me what's going on in your own words, and I'll help you set up a search." });
  if (step > 0) convo.push({ role: 'user', text: answers.description });
  const pushQA = (q, a) => { convo.push({ role: 'assistant', text: q }); convo.push({ role: 'user', text: a }); };
  if (step >= 2) pushQA(QUESTIONS[0], answers.area === '__all' ? 'Not sure — show me everything' : (answers.area || 'No preference'));
  if (step >= 3) pushQA(QUESTIONS[1], answers.state || 'No preference');
  if (step >= 4 && answers.state) pushQA(QUESTIONS[2], answers.city || 'No preference');
  if (step >= 5) pushQA(QUESTIONS[3], answers.language || 'No preference');
  if (step >= 6) {
    const pl = PRICE_OPTIONS.find((p) => p.value === answers.maxFee);
    pushQA(QUESTIONS[4], pl ? pl.label : 'No preference');
  }
  if (step >= 7) pushQA(QUESTIONS[5], answers.urgency || 'No preference');

  let currentQuestion = null;
  let options = null;
  let isFinal = false;
  if (step === 0) { /* free text */ }
  else if (step === 1) { currentQuestion = QUESTIONS[0]; options = [...areas.map((a) => ({ label: a, value: a })), { label: 'Not sure — show me everything', value: '__all' }]; }
  else if (step === 2) { currentQuestion = QUESTIONS[1]; options = [...states.map((s) => ({ label: s, value: s })), { label: 'No preference', value: '' }]; }
  else if (step === 3) { currentQuestion = QUESTIONS[2]; options = [...cities.map((c) => ({ label: c, value: c })), { label: 'No preference', value: '' }]; }
  else if (step === 4) { currentQuestion = QUESTIONS[3]; options = [...langs.map((l) => ({ label: l, value: l })), { label: 'No preference', value: '' }]; }
  else if (step === 5) { currentQuestion = QUESTIONS[4]; options = PRICE_OPTIONS.map((p) => ({ label: p.label, value: p.value })); }
  else if (step === 6) { currentQuestion = QUESTIONS[5]; options = URGENCY_OPTIONS.map((u) => ({ label: u, value: u === 'No preference' ? '' : u })); }
  else if (step === 7) isFinal = true;

  if (currentQuestion) convo.push({ role: 'assistant', text: currentQuestion });

  const banner = (
    <div className="px-4 py-2.5 bg-[#EAF2FB] border border-[#0a5dc2]/15 rounded-xl">
      <p className="text-[11px] text-[#0a5dc2] font-body leading-relaxed text-center">
        {t('concierge.banner')}
      </p>
    </div>
  );

  const InputBar = (
    <div className="shrink-0 border-t border-[#E5E2DC] bg-[#FAF9F7]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 bg-white border border-[#E5E2DC] rounded-full px-3 h-11">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={scrollToBottom}
            onKeyDown={(e) => e.key === 'Enter' && submitDraft()}
            placeholder={step === 0 ? "Describe what's going on…" : 'Or type your own answer…'}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#111418] font-body placeholder:text-[#8A8578]"
          />
          <button
            onClick={submitDraft}
            disabled={!draft.trim()}
            className="w-8 h-8 rounded-full bg-[#0a5dc2] disabled:opacity-40 flex items-center justify-center text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-4 py-2 flex items-center justify-between">
        <button onClick={restart} className="text-xs text-[#8A8578] hover:text-[#111418] font-body">Start over</button>
        <button onClick={onBrowseAreas} className="text-xs text-[#0a5dc2] hover:text-[#111418] font-body">{t('concierge.browse')}</button>
      </div>
      <div className="px-4 pb-2">
        <p className="text-[11px] text-[#8A8578] font-body leading-relaxed">{t('concierge.disclaimer')}</p>
      </div>
    </div>
  );

  if (isMobile) {
    return createPortal(
      <div
        className="fixed top-0 left-0 right-0 z-[2300] h-[100dvh] flex flex-col bg-[#FAF9F7] animate-fade-up"
        style={{ isolation: 'isolate' }}
      >
        {/* A. Fixed top bar */}
        <div
          className="shrink-0 flex items-center justify-between h-14 px-3 border-b border-[#E5E2DC] bg-[#FAF9F7]"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <button onClick={onReset} aria-label="Back" className="w-10 h-10 flex items-center justify-center -ml-1">
            <ArrowLeft className="w-5 h-5 text-[#111418]" />
          </button>
          <p className="text-sm font-medium text-[#111418] font-body">{t('concierge.panelLabel')}</p>
          <div className="w-10" />
        </div>

        {/* B. Scrollable middle */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
          {banner}
          {convo.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.text} />
          ))}
          {options && (
            <div className="grid grid-cols-1 gap-2 pt-1">
              {options.map((o) => (
                <OptionButton
                  key={String(o.label)}
                  label={o.label}
                  onClick={() => {
                    if (step === 1) advance({ ...answers, area: o.value });
                    else if (step === 2) advance({ ...answers, state: o.value, city: '' });
                    else if (step === 3) advance({ ...answers, city: o.value });
                    else if (step === 4) advance({ ...answers, language: o.value });
                    else if (step === 5) advance({ ...answers, maxFee: o.value });
                    else if (step === 6) advance({ ...answers, urgency: o.value });
                  }}
                />
              ))}
            </div>
          )}
          {isFinal && (
            <button
              onClick={seeAttorneys}
              className="w-full inline-flex items-center justify-center gap-2 px-5 h-12 bg-[#0a5dc2] text-white text-sm font-medium font-body hover:bg-[#084a9e] transition-colors rounded-xl"
            >
              See attorneys matching these filters
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <div className="h-2" />
        </div>

        {/* C. Fixed input bar */}
        {InputBar}
      </div>,
      document.body
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-[#FAF9F7] border border-[#E5E2DC] rounded-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E2DC]">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#0a5dc2] font-body">{t('concierge.panelLabel')}</p>
          <button onClick={onReset} aria-label="Close" className="text-[#8A8578] hover:text-[#111418]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-2.5 bg-[#EAF2FB] border-b border-[#0a5dc2]/15">
          <p className="text-[11px] text-[#0a5dc2] font-body leading-relaxed text-center">{t('concierge.banner')}</p>
        </div>
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {convo.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.text} />
          ))}
          {options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {options.map((o) => (
                <OptionButton
                  key={String(o.label)}
                  label={o.label}
                  onClick={() => {
                    if (step === 1) advance({ ...answers, area: o.value });
                    else if (step === 2) advance({ ...answers, state: o.value, city: '' });
                    else if (step === 3) advance({ ...answers, city: o.value });
                    else if (step === 4) advance({ ...answers, language: o.value });
                    else if (step === 5) advance({ ...answers, maxFee: o.value });
                    else if (step === 6) advance({ ...answers, urgency: o.value });
                  }}
                />
              ))}
            </div>
          )}
          {isFinal && (
            <button
              onClick={seeAttorneys}
              className="w-full inline-flex items-center justify-center gap-2 px-5 h-12 bg-[#0a5dc2] text-white text-sm font-medium font-body hover:bg-[#084a9e] transition-colors rounded-xl"
            >
              See attorneys matching these filters
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="shrink-0 border-t border-[#E5E2DC]">
          <div className="px-4 pt-3 pb-2 space-y-2">
            <div className="flex items-center gap-2 bg-white border border-[#E5E2DC] rounded-full px-3 h-11">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitDraft()}
                placeholder={step === 0 ? "Describe what's going on…" : 'Or type your own answer…'}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[#111418] font-body placeholder:text-[#8A8578]"
              />
              <button
                onClick={submitDraft}
                disabled={!draft.trim()}
                className="w-8 h-8 rounded-full bg-[#0a5dc2] disabled:opacity-40 flex items-center justify-center text-white shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button onClick={restart} className="text-xs text-[#8A8578] hover:text-[#111418] font-body">Start over</button>
              <button onClick={onBrowseAreas} className="text-xs text-[#0a5dc2] hover:text-[#111418] font-body">{t('concierge.browse')}</button>
            </div>
            <p className="text-[11px] text-[#8A8578] font-body leading-relaxed">{t('concierge.disclaimer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}