import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useIsMobile } from './useIsMobile';

export default function BottomSheet({ open, onClose, children, desktopMaxWidth = 520 }) {
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Desktop: unchanged centered modal
  if (!isMobile) {
    if (!open) return null;
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-[2000]" onClick={onClose} aria-hidden="true" />
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2100] bg-[#FAF9F7] flex flex-col"
          style={{ width: '92vw', maxWidth: desktopMaxWidth, borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxHeight: '85vh' }}
        >
          {children}
        </div>
      </>
    );
  }

  // Mobile: native bottom sheet
  const transition = reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 38 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[2000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[2100] bg-[#FAF9F7] flex flex-col"
            style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', maxHeight: '88vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transition}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 500) onClose(); }}
          >
            <div className="flex justify-center pt-3 pb-1.5 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-[#D9D4CA]" />
            </div>
            <div className="overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}