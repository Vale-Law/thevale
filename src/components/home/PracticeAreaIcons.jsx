import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Heart, Scale, Plane, Shield, Building, FileText } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const cards = [
{ key: 'familyLaw', query: 'Family Law', image: '/images/practice-icons/family-law.png', icon: Heart },
{ key: 'personalInjury', query: 'Personal Injury', image: '/images/practice-icons/personal-injury.png', icon: Scale },
{ key: 'immigration', query: 'Immigration', image: '/images/practice-icons/immigration.png', icon: Plane },
{ key: 'criminalDefense', query: 'Criminal Defense', image: '/images/practice-icons/criminal-defense.png', icon: Shield },
{ key: 'businessTax', query: 'Business & Tax', image: '/images/practice-icons/business-tax.png', icon: Building },
{ key: 'estateWills', query: 'Estate & Wills', image: '/images/practice-icons/estate-wills.png', icon: FileText }];


export default function PracticeAreaIcons({ onSelect }) {
  const { t } = useLanguage();
  const ref = useScrollReveal();
  const [hovered, setHovered] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsTouchDevice(window.matchMedia('(hover: none)').matches);
  }, []);

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-8 bg-[var(--surface)]" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-[28px] lg:text-[38px] text-[var(--text)] leading-[1.1]">{t('practiceIcons.heading')}</h2>
          <p className="text-[var(--text-3)] font-body mt-2">{t('practiceIcons.subheading')}</p>
        </div>

        {/* Quick-pick pills */}
        










        

        {/* Icon gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 justify-items-center">
          {cards.map((card, i) => {
            const isHovered = hovered === i && !isTouchDevice;
            return (
              <button
                key={card.key}
                onClick={() => onSelect(card.query)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="fade-up-child flex flex-col items-center gap-3 group"
                style={{ transitionDelay: `${i * 60}ms` }}>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    width: 'clamp(100px, 14vw, 150px)',
                    height: 'clamp(100px, 14vw, 150px)',
                    borderRadius: '23%',
                    backgroundColor: 'var(--ground)',
                    boxShadow: isHovered ? '0 12px 40px rgba(10,61,98,0.15)' : '0 4px 16px rgba(10,61,98,0.08)',
                    transform: isHovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)'
                  }}>

                  <img
                    src={card.image}
                    alt={t(`practiceIcons.${card.key}`)}
                    loading="lazy"
                    className="block"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      animation: prefersReducedMotion ? 'none' : 'float 3.5s ease-in-out infinite',
                      animationDelay: `${i * 0.4}s`
                    }} />
                  
                </div>
                <span
                  className="font-serif font-medium text-[14px] lg:text-[15px] text-center transition-colors duration-200"
                  style={{ color: isHovered ? 'var(--accent)' : 'var(--text)' }}>

                  {t(`practiceIcons.${card.key}`)}
                </span>
              </button>);

          })}
        </div>
      </div>
    </section>);

}