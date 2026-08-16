import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Heart, HeartPulse, Plane, Shield, Briefcase, FileText } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const cards = [
  { key: 'familyLaw', query: 'Family Law', icon: Heart },
  { key: 'personalInjury', query: 'Personal Injury', icon: HeartPulse },
  { key: 'immigration', query: 'Immigration', icon: Plane },
  { key: 'criminalDefense', query: 'Criminal Defense', icon: Shield },
  { key: 'businessTax', query: 'Business & Tax', icon: Briefcase },
  { key: 'estateWills', query: 'Estate & Wills', icon: FileText },
];

export default function PracticeAreaIcons({ onSelect }) {
  const { t } = useLanguage();
  const ref = useScrollReveal();

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-8 bg-[var(--surface)]" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-[28px] lg:text-[38px] text-[var(--text)] leading-[1.1]">{t('practiceIcons.heading')}</h2>
          <p className="text-[var(--text-3)] font-body mt-2">{t('practiceIcons.subheading')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 justify-items-center">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <button
                key={card.key}
                onClick={() => onSelect(card.query)}
                className="fade-up-child flex flex-col items-center gap-3 group"
                style={{ transitionDelay: `${i * 60}ms` }}>

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent)]" strokeWidth={1.6} />
                </div>
                <span className="font-heading text-[14px] lg:text-[15px] text-center text-[var(--text)] transition-colors duration-200 group-hover:text-[var(--accent)]">
                  {t(`practiceIcons.${card.key}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
