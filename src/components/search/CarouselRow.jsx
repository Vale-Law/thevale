import { useRef, useState, useEffect, useCallback } from 'react';
import CinematicCard from './CinematicCard';

export default function CarouselRow({ title, attorneys, visible }) {
  const trackRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(false);
  const rowRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Intersection observer for stagger entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCardsVisible(true); },
      { threshold: 0.1 }
    );
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  const updateFades = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateFades, { passive: true });
    updateFades();
    return () => el.removeEventListener('scroll', updateFades);
  }, [attorneys, updateFades]);

  // Click-drag for desktop
  const onMouseDown = (e) => {
    isDragging.current = false;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftStart.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (e) => {
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    if (Math.abs(walk) > 5) isDragging.current = true;
    trackRef.current.scrollLeft = scrollLeftStart.current - walk;
  };
  const onMouseUp = () => {
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  if (!attorneys || attorneys.length === 0) return null;

  return (
    <div
      ref={rowRef}
      className="relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }}
    >
      {/* Row header */}
      <div className="flex items-baseline justify-between mb-5 px-6 lg:px-8">
        <h2 className="font-serif font-medium text-[22px] lg:text-[26px] text-[#111418] leading-tight">{title}</h2>
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body">
          {attorneys.length} attorneys
        </span>
      </div>

      {/* Track wrapper with edge fades */}
      <div className="relative">
        {/* Left edge fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to right, #FFFFFF 0%, transparent 100%)',
            opacity: showLeft ? 1 : 0,
          }}
        />
        {/* Right edge fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to left, #FFFFFF 0%, transparent 100%)',
            opacity: showRight ? 1 : 0,
          }}
        />

        {/* Scroll track — no arrows, native swipe/drag */}
        <div
          ref={trackRef}
          className="no-scrollbar flex gap-5 overflow-x-auto px-6 lg:px-8 pb-4"
          style={{
            scrollSnapType: 'x mandatory',
            cursor: 'grab',
          }}
          onMouseDown={onMouseDown}
        >
          {attorneys.map((attorney, i) => (
            <div
              key={attorney.id}
              data-card
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                width: 'clamp(240px, 72vw, 300px)',
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 400ms ease-out ${i * 60}ms, transform 400ms ease-out ${i * 60}ms`,
              }}
            >
              <CinematicCard attorney={attorney} />
            </div>
          ))}
          {/* Trailing spacer so last card isn't cut by right fade */}
          <div style={{ flexShrink: 0, width: 8 }} />
        </div>
      </div>
    </div>
  );
}