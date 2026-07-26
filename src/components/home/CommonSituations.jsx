import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

const SITUATIONS = [
  { key: 'divorce', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/9790bf345_image.png', area: 'Family Law' },
  { key: 'childCustody', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/51806928b_image.png', area: 'Family Law' },
  { key: 'greenCard', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/676cf5b67_image.png', area: 'Immigration' },
  { key: 'asylum', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/bc3d90fab_image.png', area: 'Immigration' },
  { key: 'carAccident', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/b7f8a3a70_image.png', area: 'Personal Injury' },
  { key: 'slipFall', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/fff2611a8_image.png', area: 'Personal Injury' },
  { key: 'dui', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/3fa4ceb1c_image.png', area: 'Personal Injury' },
  { key: 'expungement', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/c0f44d99a_image.png', area: 'Personal Injury' },
  { key: 'llcFormation', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/daf0ecc0c_image.png', area: 'Business Formation' },
];

export default function CommonSituations({ onSelect }) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsTouchDevice(window.matchMedia('(hover: none)').matches);
  }, []);

  return (
    <section className="bg-white py-20 lg:py-24 px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif font-medium text-[26px] lg:text-[34px] text-[#111418] leading-[1.1]">{t('commonSituations.heading')}</h2>
          <p className="text-[#8A8578] font-body mt-2">{t('commonSituations.subheading')}</p>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1" style={{ scrollSnapType: 'x proximity' }}>
          {SITUATIONS.map((s, i) => {
            const isHovered = hovered === i && !isTouchDevice;
            const label = t(`situation.${s.key}`);
            return (
              <button
                key={s.key}
                onClick={() => onSelect(s.area)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="flex flex-col items-center gap-3 shrink-0 group"
                style={{ scrollSnapAlign: 'start', width: 'clamp(96px, 18vw, 120px)' }}
              >
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    width: 'clamp(96px, 18vw, 120px)',
                    height: 'clamp(96px, 18vw, 120px)',
                    borderRadius: '23%',
                    backgroundColor: '#F1EEE8',
                    boxShadow: isHovered ? '0 12px 40px rgba(10,61,98,0.15)' : '0 4px 16px rgba(10,61,98,0.08)',
                    transform: isHovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
                  }}
                >
                  <img
                    src={s.image}
                    alt={label}
                    loading="lazy"
                    className="block"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      animation: prefersReducedMotion ? 'none' : 'float 3.5s ease-in-out infinite',
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                </div>
                <span
                  className="font-body text-[13px] text-[#111418] text-center leading-tight transition-colors duration-200"
                  style={{ color: isHovered ? '#0a5dc2' : '#111418' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}