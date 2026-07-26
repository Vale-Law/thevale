import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n';

export default function Financing() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      <Header />

      <section className="flex-1 flex items-center justify-center px-6 py-24 lg:py-32">
        <div className="max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">{t('financing.label')}</p>
          <h1 className="font-serif text-[40px] lg:text-[56px] text-[#111418] leading-[1.05] mb-6">
            {t('financing.label')} — <span className="text-[#0a5dc2]">{t('financing.comingSoon')}</span>
          </h1>
          <p className="text-lg text-[#8A8578] font-body leading-relaxed max-w-xl mx-auto mb-10">
            {t('financing.body')}
          </p>
          <button
            onClick={() => navigate('/?browse=1')}
            className="inline-flex items-center px-7 py-3.5 bg-[#0a5dc2] text-white text-sm font-medium hover:bg-[#0a4d9e] transition-colors font-body"
          >
            {t('financing.findLawyer')}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}