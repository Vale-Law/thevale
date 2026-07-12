import { useState, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import FloatingPanel from '@/components/ui/FloatingPanel';

export default function LanguageSwitcher({ compact = false }) {
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const options = [
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
  ];

  const current = options.find(o => o.code === language) || options[0];

  return (
    <div ref={triggerRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm text-[#111418] hover:text-[#0a5dc2] transition-colors font-body whitespace-nowrap"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="opacity-50">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <FloatingPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} align="right" minWidth={160}>
        <div className="py-1">
          {options.map(opt => (
            <button
              key={opt.code}
              onClick={() => { changeLanguage(opt.code); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#111418] hover:bg-[#FAF9F7] transition-colors font-body"
            >
              <span className="flex items-center gap-2">
                <span>{opt.flag}</span>
                {opt.label}
              </span>
              {language === opt.code && <Check className="w-3.5 h-3.5 text-[#0a5dc2]" />}
            </button>
          ))}
        </div>
      </FloatingPanel>
    </div>
  );
}