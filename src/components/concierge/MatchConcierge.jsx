import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import HeroSearchCard from '@/components/home/HeroSearchCard';
import ConciergePanel from './ConciergePanel';
import { useLanguage } from '@/lib/i18n';

const PLACEHOLDERS = [
  'My landlord won\u2019t return my deposit\u2026',
  'I was hit by a driver who ran a red light\u2026',
  'My spouse and I are separating and we have kids\u2026',
  'I need help applying for a green card\u2026',
];

function ConciergeEntry({ onStart, t }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [idx, setIdx] = useState(0);

  const submit = () => {
    if (value.trim()) onStart(value.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] w-full p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={PLACEHOLDERS[idx]}
          aria-label={t('concierge.cta')}
          className="flex-1 w-full bg-transparent outline-none text-base lg:text-lg text-[#111418] font-body placeholder:text-[#8A8578] px-2"
        />
        <button
          onClick={submit}
          className="shrink-0 inline-flex items-center gap-1.5 px-5 sm:px-6 h-11 rounded-full bg-[#0a5dc2] hover:bg-[#084a9e] transition-colors text-white text-sm font-medium font-body"
        >
          {t('concierge.cta')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function MatchConcierge({ onSearchFallback, initialDescription: handedOffDescription = '', initialState = '', initialCity = '' }) {
  const { t } = useLanguage();
  // A description handed off from the hero chatbox starts the chat immediately.
  const [phase, setPhase] = useState(handedOffDescription ? 'active' : 'idle'); // idle | active | fallback
  const [initialDescription, setInitialDescription] = useState(handedOffDescription);

  const start = (text) => {
    setInitialDescription(text);
    setPhase('active');
  };

  const reset = () => {
    setInitialDescription('');
    setPhase('idle');
  };

  const browseAreas = () => {
    reset();
  };

  const fallback = () => {
    setInitialDescription('');
    setPhase('fallback');
    setTimeout(() => {
      document.getElementById('areas-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (phase === 'active') {
    return (
      <ConciergePanel
        initialDescription={initialDescription}
        initialState={initialState}
        initialCity={initialCity}
        onReset={reset}
        onBrowseAreas={browseAreas}
      />
    );
  }

  if (phase === 'fallback') {
    return (
      <div className="max-w-2xl">
        <h2 className="font-serif text-[24px] lg:text-[30px] text-[#111418] leading-[1.1] mb-2">
          {t('concierge.fallbackTitle')}
        </h2>
        <p className="text-sm text-[#8A8578] font-body mb-6">{t('concierge.fallbackSub')}</p>
        <HeroSearchCard onSearch={onSearchFallback} />
        <button
          onClick={reset}
          className="mt-4 text-sm text-[#0a5dc2] hover:text-[#111418] font-body"
        >
          {t('concierge.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-[28px] lg:text-[36px] text-[#111418] leading-[1.1] mb-2">
        {t('concierge.heading')}
      </h2>
      <p className="text-base lg:text-lg text-[#8A8578] font-body mb-6">
        {t('concierge.subhead')}
      </p>
      <ConciergeEntry onStart={start} t={t} />
    </div>
  );
}