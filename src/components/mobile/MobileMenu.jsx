import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, BookOpen, CreditCard, Scale, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function MobileMenu() {
  const { t, language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const items = [
    { label: t('nav.browse'), to: '/areas-of-help', icon: Compass },
    { label: t('nav.learn'), to: '/learn', icon: BookOpen },
    { label: t('nav.financing'), to: '/financing', icon: CreditCard },
    { label: t('nav.forAttorneys'), to: '/for-attorneys', icon: Scale },
  ];

  const langs = [
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
  ];

  const close = () => setOpen(false);
  const go = (to) => { close(); navigate(to); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="w-12 h-12 flex items-center justify-center -mr-1 text-[#111418]"
      >
        <Menu className="w-8 h-8" strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[1300] bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
            />
            <motion.aside
              className="fixed top-0 right-0 bottom-0 z-[1400] w-[82vw] max-w-[340px] bg-[#FAF9F7] flex flex-col safe-pt"
              style={{ touchAction: 'pan-y' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_e, info) => {
                if (info.offset.x > 90 || info.velocity.x > 500) close();
              }}
            >
              <div className="flex items-center justify-between px-5 border-b border-[#E5E2DC]" style={{ height: 'var(--mobile-header-h)' }}>
                <span className="font-serif text-[#111418] text-lg leading-none">Menu</span>
                <button onClick={close} aria-label="Close menu" className="w-10 h-10 flex items-center justify-center -mr-2 text-[#111418]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => go(item.to)}
                      className="w-full flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-white active:bg-white transition-colors text-left"
                    >
                      <span className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-[#E5E2DC] shrink-0">
                        <Icon className="w-4 h-4 text-[#0a5dc2]" />
                      </span>
                      <span className="font-body text-[17px] text-[#111418]">{item.label}</span>
                    </button>
                  );
                })}

                <div className="mt-5 px-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-2">Language</p>
                  <div className="flex gap-2">
                    {langs.map((opt) => {
                      const active = language === opt.code;
                      return (
                        <button
                          key={opt.code}
                          onClick={() => changeLanguage(opt.code)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-body transition-colors"
                          style={{
                            borderColor: active ? '#0a5dc2' : '#E5E2DC',
                            background: active ? '#EAF2FB' : '#fff',
                            color: active ? '#0a5dc2' : '#111418',
                          }}
                        >
                          <span>{opt.flag}</span>
                          <span>{opt.label}</span>
                          {active && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}