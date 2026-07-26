import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

export default function ValueStrip() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <section className="bg-[#F4E4D0] py-20 lg:py-28 px-6 lg:px-8 text-center">
      <div className="max-w-[760px] mx-auto">
        <h2 className="font-serif font-medium text-[30px] lg:text-[44px] text-[#111418] leading-[1.1]">
          {t('valueStrip.heading')}
        </h2>
        <p className="text-[#5d5d5d] font-body mt-4 max-w-xl mx-auto leading-relaxed">
          {t('valueStrip.body')}
        </p>
        <button
          onClick={() => navigate('/areas-of-help')}
          className="mt-8 px-7 py-3 rounded-full bg-[#111418] text-white text-sm font-body font-medium hover:bg-[#0a5dc2] transition-colors"
        >
          {t('valueStrip.cta')}
        </button>
      </div>
    </section>
  );
}