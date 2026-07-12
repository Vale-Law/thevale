import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Heart, Scale, Plane, Shield, Building, FileText } from 'lucide-react';

const cards = [
{ label: 'Family Law', query: 'Family Law', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/978433de0_image.png', icon: Heart },
{ label: 'Personal Injury', query: 'Personal Injury', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/fb1ab0966_image.png', icon: Scale },
{ label: 'Immigration', query: 'Immigration', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/3cf9e299a_image.png', icon: Plane },
{ label: 'Criminal Defense', query: 'Criminal Defense', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/0a4fd0c5f_image.png', icon: Shield },
{ label: 'Business & Tax', query: 'Business & Tax', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/a3657b6ba_image.png', icon: Building },
{ label: 'Estate & Wills', query: 'Estate & Wills', image: 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/e5bf3e70f_image.png', icon: FileText }];


export default function PracticeAreaIcons({ onSelect }) {
  const ref = useScrollReveal();
  const [hovered, setHovered] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsTouchDevice(window.matchMedia('(hover: none)').matches);
  }, []);

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-8 bg-white" ref={ref}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 text-center">
          <h2 className="font-serif font-medium text-[28px] lg:text-[38px] text-[#111418] leading-[1.1]">Every area of law</h2>
          <p className="text-[#8A8578] font-body mt-2">Tap a practice area to find attorneys who handle it.</p>
        </div>

        {/* Quick-pick pills */}
        









        

        {/* Icon gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 justify-items-center">
          {cards.map((card, i) => {
            const isHovered = hovered === i && !isTouchDevice;
            return (
              <button
                key={card.label}
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
                    backgroundColor: '#F5F0E8',
                    boxShadow: isHovered ? '0 12px 40px rgba(10,61,98,0.15)' : '0 4px 16px rgba(10,61,98,0.08)',
                    transform: isHovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)'
                  }}>
                  
                  <img
                    src={card.image}
                    alt={card.label}
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
                  style={{ color: isHovered ? '#0a5dc2' : '#111418' }}>
                  
                  {card.label}
                </span>
              </button>);

          })}
        </div>
      </div>
    </section>);

}