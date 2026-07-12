import { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import { getQuestionnaire, generateCaseSummary } from '@/lib/questionnaireData';
import { useLanguage } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';

export default function QuestionnaireModal({ open, areaLabel, location, onClose, onComplete }) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLangPref, setShowLangPref] = useState(false);
  const [langPrefAnswer, setLangPrefAnswer] = useState(null);

  const questionnaire = getQuestionnaire(areaLabel);

  // Show the Spanish preference question only when the user has selected Spanish
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

    // Save to user profile if logged in
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

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[2200]" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2300] bg-[#FAF9F7] w-[92vw] max-w-[560px] flex flex-col"
        style={{ borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#0a5dc2] font-body mb-0.5">
              {areaLabel}
            </p>
            {location?.city && (
              <p className="text-[11px] text-[#8A8578] font-body">
                {location.city}, {location.state}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSkip}
              className="text-sm text-[#0a5dc2] hover:text-[#111418] transition-colors font-body whitespace-nowrap"
            >
              {t('questionnaire.skipToResults')}
            </button>
            <button onClick={onClose} className="text-[#8A8578] hover:text-[#111418] transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
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

        {/* Body */}
        <div className="px-6 pb-8 pt-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#0a5dc2] animate-spin mb-4" />
              <p className="font-serif text-xl text-[#111418]">{t('questionnaire.findingMatches')}</p>
              <p className="text-sm text-[#8A8578] font-body mt-1">{t('questionnaire.sorting')}</p>
            </div>
          ) : isLangPrefStep ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#0a5dc2] font-body mb-2">{t('langPref.title')}</p>
              <h2 className="font-serif text-[24px] lg:text-[28px] text-[#111418] leading-[1.15] mb-4">
                {t('langPref.question')}
              </h2>
              <div className="flex flex-col gap-2 mb-4">
                {[t('langPref.yes'), t('langPref.no')].map((option) => {
                  const selected = langPrefAnswer === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleLangPrefAnswer(option)}
                      className="w-full text-left px-4 py-3.5 border transition-all duration-200 font-body text-sm group flex items-center justify-between"
                      style={{
                        borderRadius: 8,
                        borderColor: selected ? '#0a5dc2' : '#E5E2DC',
                        background: selected ? '#EAF2FB' : '#fff',
                        color: selected ? '#0a5dc2' : '#111418',
                      }}
                    >
                      <span>{option}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: selected ? '#0a5dc2' : '#8A8578' }} />
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-[#8A8578] font-body leading-relaxed">{t('langPref.explanation')}</p>
            </>
          ) : (
            <>
              {step === 0 && (
                <p className="text-sm text-[#8A8578] font-body mb-4 leading-relaxed">{t('questionnaire.intro')}</p>
              )}
              <h2 className="font-serif text-[24px] lg:text-[28px] text-[#111418] leading-[1.15] mb-6">
                {currentQuestion.question}
              </h2>
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((option) => {
                  const selected = answers[currentQuestion.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="w-full text-left px-4 py-3.5 border transition-all duration-200 font-body text-sm group flex items-center justify-between"
                      style={{
                        borderRadius: 8,
                        borderColor: selected ? '#0a5dc2' : '#E5E2DC',
                        background: selected ? '#EAF2FB' : '#fff',
                        color: selected ? '#0a5dc2' : '#111418',
                      }}
                    >
                      <span>{option}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: selected ? '#0a5dc2' : '#8A8578' }} />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-6 py-4 border-t border-[#E5E2DC]">
            <p className="text-[11px] text-[#8A8578] font-body text-center leading-relaxed">{t('questionnaire.footer')}</p>
          </div>
        )}
      </div>
    </>
  );
}
