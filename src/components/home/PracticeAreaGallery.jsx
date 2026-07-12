import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/lib/i18n';

const areas = [
  {
    nameKey: 'area.familyLaw',
    name: 'Family Law',
    description: { en: 'Divorce, custody, adoption, and domestic matters.', es: 'Divorcio, custodia, adopción y asuntos familiares.' },
    image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/567d6cc7a_51593BAB-8AD5-4A83-8FCE-244CBE22C93B.png',
    imgAlt: 'Illustration of two people holding the ends of a giant tangled knot of string while a friendly attorney calmly untangles it, with a cat sitting on top of the knot.',
    query: 'Family Law',
    bgColor: '#EAF2FB',
  },
  {
    nameKey: 'area.immigration',
    name: 'Immigration',
    description: { en: 'Visas, green cards, citizenship, and deportation defense.', es: 'Visas, green cards, ciudadanía y defensa contra deportación.' },
    image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/2afc075ea_C1E156ED-B20F-4CD4-9CB7-C4FDE851C436.png',
    imgAlt: 'Illustration of a determined immigrant on a journey toward a hopeful destination, with labeled milestones along the way.',
    query: 'Immigration',
    bgColor: '#F5F0E8',
  },
  {
    nameKey: 'area.personalInjury',
    name: 'Personal Injury',
    description: { en: 'Accidents, negligence claims — no fee unless you win.', es: 'Accidentes, negligencia — no pagas a menos que ganes.' },
    image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/681cdfe82_IMG_0322.png',
    imgAlt: "Illustration of a balance scale where a lawyer's glowing case folder tips the scales back in favor of an injured person.",
    query: 'Personal Injury',
    bgColor: '#EAF2FB',
  },
  {
    nameKey: 'area.businessFormation',
    name: 'Business Formation',
    description: { en: 'LLCs, contracts, trademarks, and startup legal strategy.', es: 'LLCs, contratos, marcas y estrategia legal para startups.' },
    image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/7336e8da5_IMG_0321.png',
    imgAlt: 'Illustration of an entrepreneur building their own storefront out of labeled business and tax blocks, with an OPEN sign at the top.',
    query: 'Business Formation',
    bgColor: '#F5F0E8',
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
      {/* Circle */}
      <div
        style={{
          width: 'clamp(140px, 20vw, 220px)',
          height: 'clamp(140px, 20vw, 220px)',
          borderRadius: '50%',
          backgroundColor: area.bgColor,
          border: '1px solid #E5E2DC',
          boxShadow: hovered && animate
            ? '0 8px 32px rgba(10,61,98,0.16)'
            : '0 4px 16px rgba(10,61,98,0.10)',
          transform: hovered && animate ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 300ms ease, box-shadow 300ms ease',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <img
          src={area.image}
          alt={area.imgAlt}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            transform: hovered && animate ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 2.5s ease-in-out',
            display: 'block',
          }}
        />
      </div>

      {/* Label */}
      <div className="text-center">
        <h3
          className="font-serif text-[18px] leading-tight transition-colors duration-200"
          style={{ color: hovered && animate ? '#0a5dc2' : '#111418' }}
        >
          {t(area.nameKey)}
        </h3>
        <p className="text-[13px] text-[#8A8578] font-body mt-1 leading-snug max-w-[180px]">
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
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#F5F0E8]" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-16 fade-up-child">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-3 font-body">Practice Areas</p>
          <h2 className="font-serif font-bold text-[40px] lg:text-[52px] text-[#111418] leading-[1.05]">
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