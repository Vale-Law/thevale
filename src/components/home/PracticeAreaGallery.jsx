import { useState } from 'react';
import { Heart, Plane, Scale, Building } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/lib/i18n';

// Placeholder icons pending real illustrations for these 4 areas — the
// original Base44-hosted illustrations have no local equivalent yet.
// Swap `icon` for an `image` field (see CircleCard) once real artwork
// is supplied.
const areas = [
  {
    nameKey: 'area.familyLaw',
    name: 'Family Law',
    description: { en: 'Divorce, custody, adoption, and domestic matters.', es: 'Divorcio, custodia, adopción y asuntos familiares.' },
    icon: Heart,
    query: 'Family Law',
    bgColor: 'var(--accent-soft)',
  },
  {
    nameKey: 'area.immigration',
    name: 'Immigration',
    description: { en: 'Visas, green cards, citizenship, and deportation defense.', es: 'Visas, green cards, ciudadanía y defensa contra deportación.' },
    icon: Plane,
    query: 'Immigration',
    bgColor: 'var(--ground)',
  },
  {
    nameKey: 'area.personalInjury',
    name: 'Personal Injury',
    description: { en: 'Accidents, negligence claims — no fee unless you win.', es: 'Accidentes, negligencia — no pagas a menos que ganes.' },
    icon: Scale,
    query: 'Personal Injury',
    bgColor: 'var(--accent-soft)',
  },
  {
    nameKey: 'area.businessFormation',
    name: 'Business Formation',
    description: { en: 'LLCs, contracts, trademarks, and startup legal strategy.', es: 'LLCs, contratos, marcas y estrategia legal para startups.' },
    icon: Building,
    query: 'Business Formation',
    bgColor: 'var(--ground)',
  },
];

function CircleCard({ area, index, onClick, t, language }) {
  const [hovered, setHovered] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  const animate = !prefersReducedMotion && !isTouchDevice;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fade-up-child flex flex-col items-center gap-4 group"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Circle — placeholder icon pending real illustration for this area (see areas[] above) */}
      <div
        style={{
          width: 'clamp(140px, 20vw, 220px)',
          height: 'clamp(140px, 20vw, 220px)',
          borderRadius: '50%',
          backgroundColor: area.bgColor,
          border: '1px solid var(--line-2)',
          boxShadow: hovered && animate
            ? '0 8px 32px rgba(10,61,98,0.16)'
            : '0 4px 16px rgba(10,61,98,0.10)',
          transform: hovered && animate ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 300ms ease, box-shadow 300ms ease',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <area.icon
          aria-hidden="true"
          strokeWidth={1.25}
          style={{
            width: '34%',
            height: '34%',
            color: 'var(--text)',
            opacity: 0.65,
            transform: hovered && animate ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 300ms ease',
          }}
        />
      </div>

      {/* Label */}
      <div className="text-center">
        <h3
          className="font-serif text-[18px] leading-tight transition-colors duration-200"
          style={{ color: hovered && animate ? 'var(--accent)' : 'var(--text)' }}
        >
          {t(area.nameKey)}
        </h3>
        <p className="text-[13px] text-[var(--text-3)] font-body mt-1 leading-snug max-w-[180px]">
          {area.description[language] || area.description.en}
        </p>
      </div>
    </button>
  );
}

export default function PracticeAreaGallery({ onSelect }) {
  const ref = useScrollReveal();
  const { t, language } = useLanguage();

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[var(--ground)]" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16 fade-up-child">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-3 font-body">Practice Areas</p>
          <h2 className="font-serif font-bold text-[40px] lg:text-[52px] text-[var(--text)] leading-[1.05]">
            Every Issue. Every Budget.
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-10 lg:gap-16">
          {areas.map((area, i) => (
            <CircleCard
              key={area.name}
              area={area}
              index={i}
              onClick={() => onSelect(area.query)}
              t={t}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}