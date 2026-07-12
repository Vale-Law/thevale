import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function SuccessStep({ pendingUrl }) {
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = pendingUrl || '/';
    }, 1500);
    return () => clearTimeout(timer);
  }, [pendingUrl]);

  return (
    <div key="success" className="px-6 py-16 text-center animate-fade-up">
      <div className="flex justify-center mb-6">
        <div
          className="w-16 h-16 bg-[#EAF2FB] flex items-center justify-center"
          style={{ borderRadius: '50%' }}
        >
          <CheckCircle2 className="w-8 h-8 text-[#0a5dc2]" />
        </div>
      </div>
      <h2 className="font-serif text-[28px] text-[#111418] mb-2">{t('onboarding.accountVerified')}</h2>
      <p className="text-sm text-[#8A8578] font-body">{t('onboarding.allSet')}</p>
      <p className="text-sm text-[#8A8578] font-body mt-1">{t('onboarding.takingBack')}</p>
    </div>
  );
}