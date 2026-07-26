import { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { getQuestionnaire, generateCaseSummary } from '@/lib/questionnaireData';
import { useLanguage } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useIsMobile } from '@/components/mobile/useIsMobile';

export default function QuestionnaireModal({ open, areaLabel, location, onClose, onComplete }) {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLangPref, setShowLangPref] = useState(false);
  const [langPrefAnswer, setLangPrefAnswer] = useState(null);

  const questionnaire = getQuestionnaire(areaLabel);
  const showSpanishPref = language === 'es';
  const totalSteps = (questionnaire?.questions?.length || 0) + (showSpanishPref ? 1 : 0);

  useEffect(() => {
    if (open) {
      setStep(0);
      setAnswers({});
      setLoading(false);
      setShowLangPref(false);
      setLangPrefAnswer(null);
    }
  }, [open, areaLabel]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open || !questionnaire) return null;

  const currentQuestion = questionnaire.questions[step];
  const isLastQuestionnaireStep = step === questionnaire.questions.length - 1;
  const isLangPrefStep = showSpanishPref && step === questionnaire.questions.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (isLastQuestionnaireStep && showSpanishPref) {
      setShowLangPref(true);
      setTimeout(() => setStep(questionnaire.questions.length), 250);
    } else if (isLastQuestionnaireStep) {
      finishQuestionnaire(newAnswers);
    } else {
      setTimeout(() => setStep(step + 1), 250);
    }
  };

  const handleLangPrefAnswer = (answer) => {
    setLangPrefAnswer(answer);
    const requiresSpanish = answer === t('langPref.no');

    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        base44.auth.updateMe({
          preferredLanguage: 'es',
          requiresSpanishAttorney: requiresSpanish,
        }).catch(() => {});
      }
    });

    finishQuestionnaire(answers, { requiresSpanish, preferredLanguage: 'es' });
  };

  const finishQuestionnaire = (ans, extra = {}) => {
    setLoading(true);
    setTimeout(() => {
      const caseSummary = generateCaseSummary(areaLabel, ans, location);
      onComplete({
        answers: ans,
        caseSummary,
        areaLabel,
        location,
        skipped: false,
        requiresSpanish: extra.requiresSpanish || false,
        preferredLanguage: extra.preferredLanguage || language,
      });
    }, 1200);
  };

  const handleSkip = () => {
    onComplete({
      answers: {},
      caseSummary: t('questionnaire.skipped'),
      areaLabel,
      location,
      skipped: true,
    });
  };

  const goBack = () => {
    if (step === 0) onClose();
    else setStep(step - 1);
  };

  const LoadingView = (
    <div className="flex flex-col items-center justify-center py-16 md:py-20">
      <Loader2 className="w-8 h-8 text-[#0a5dc2] animate-spin mb-4" />
      <p className="font-serif text-xl text-[#111418]">{t('questionnaire.findingMatches')}</p>
      <p className="text-sm text-[#8A8578] font-body mt-1">{t('questionnaire.sorting')}</p>
    </div>
  );

  const LangPrefView = (
    <>
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#0a5dc2] font-body mb-2">{t('langPref.title')}</p>
      <h2 className="font-serif text-[24px] lg:text-[28px] text-[#111418] leading-[1.15] mb-4">
        {t('langPref.question')}
      </h2>
      <div className="flex flex-col gap-2.5 mb-4">
        {[t('langPref.yes'), t('langPref.no')].map((option) => {
          const selected = langPrefAnswer === option;
          return (
            <button
              key={option}
              onClick={() => handleLangPrefAnswer(option)}
              className="w-full text-left px-5 py-4 border transition-all duration-200 font-body text-[15px] md:text-sm flex items-center justify-between"
              style={{
                borderRadius: 12,
                borderColor: selected ? '#0a5dc2' : '#E5E2DC',
                background: selected ? '#EAF2FB' : '#fff',
                color: selected ? '#0a5dc2' : '#111418',
              }}
            >
              <span>{option}</span>
              <ArrowRight className="w-4 h-4" style={{ color: selected ? '#0a5dc2' : '#8A8578' }} />
            </button>
          );
        })}
      </div>
      <p className="text-sm text-[#8A8578] font-body leading-relaxed">{t('langPref.explanation')}</p>
    </>
  );

  const QuestionView = (
    <>
      {step === 0 && (
        <p className="text-sm text-[#8A8578] font-body mb-4 leading-relaxed">{t('questionnaire.intro')}</p>
      )}
      <h2 className="font-serif text-[26px] lg:text-[28px] text-[#111418] leading-[1.15] mb-6">
        {currentQuestion.question[language]}
      </h2>
      <div className="flex flex-col gap-2.5">
        {currentQuestion.options.map((option) => {
          const selected = answers[currentQuestion.id] === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full text-left px-5 py-4 border transition-all duration-200 font-body text-[15px] md:text-sm flex items-center justify-between"
              style={{
                borderRadius: 12,
                borderColor: selected ? '#0a5dc2' : '#E5E2DC',
                background: selected ? '#EAF2FB' : '#fff',
                color: selected ? '#0a5dc2' : '#111418',
              }}
            >
              <span>{option[language]}</span>
              <ArrowRight className="w-4 h-4" style={{ color: selected ? '#0a5dc2' : '#8A8578' }} />
            </button>
          );
        })}
      </div>
    </>
  );

  const Body = loading ? LoadingView : isLangPrefStep ? LangPrefView : QuestionView;

  // Desktop: centered modal (unchanged layout)
  if (!isMobile) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-[2200]" onClick={onClose} aria-hidden="true" />

        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2300] bg-[#FAF9F7] w-[92vw] max-w-[560px] flex flex-col"
          style={{ borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#0a5dc2] font-body mb-0.5">{areaLabel}</p>
              {location?.city && (
                <p className="text-[11px] text-[#8A8578] font-body">{location.city}, {location.state}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleSkip} className="text-sm text-[#0a5dc2] hover:text-[#111418] transition-colors font-body whitespace-nowrap">
                {t('questionnaire.skipToResults')}
              </button>
              <button onClick={onClose} className="text-[#8A8578] hover:text-[#111418] transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!loading && (
            <div className="px-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-[#E5E2DC] overflow-hidden">
                  <div className="h-full bg-[#0a5dc2] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[11px] text-[#8A8578] font-body whitespace-nowrap">
                  {t('questionnaire.step')} {step + 1} {t('questionnaire.of')} {totalSteps}
                </span>
              </div>
            </div>
          )}

          <div className="px-6 pb-8 pt-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {Body}
          </div>

          {!loading && (
            <div className="px-6 py-4 border-t border-[#E5E2DC]">
              <p className="text-[11px] text-[#8A8578] font-body text-center leading-relaxed">{t('questionnaire.footer')}</p>
            </div>
          )}
        </div>
      </>
    );
  }

  // Mobile: full-screen, one-question-per-screen
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[2200]" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed inset-0 z-[2300] bg-[#FAF9F7] flex flex-col"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-between px-3 h-12 shrink-0">
          <button onClick={goBack} aria-label="Back" className="w-10 h-10 flex items-center justify-center -ml-1">
            <ArrowLeft className="w-5 h-5 text-[#111418]" />
          </button>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#0a5dc2] font-body">{areaLabel}</p>
          <button onClick={handleSkip} className="text-sm text-[#0a5dc2] font-body px-2 whitespace-nowrap">
            {t('questionnaire.skipToResults')}
          </button>
        </div>

        {!loading && (
          <div className="px-5 pb-3 shrink-0">
            <div className="h-1 bg-[#E5E2DC] rounded-full overflow-hidden">
              <div className="h-full bg-[#0a5dc2] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          {Body}
        </div>
      </div>
    </>
  );
}