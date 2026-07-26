import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const fn = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', fn);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return isMobile;
}