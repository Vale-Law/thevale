import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n';

export default function Financing() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <Header />

      <section className="flex-1 flex items-center justify-center px-6 py-24 lg:py-32">
        <div className="max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-4 font-body">{t('financing.label')}</p>
          <h1 className="font-serif text-[40px] lg:text-[56px] text-[var(--text)] leading-[1.05] mb-6">
            {t('financing.label')} — <span className="text-[var(--accent)]">{t('financing.comingSoon')}</span>
          </h1>
          <p className="text-lg text-[var(--text-3)] font-body leading-relaxed max-w-xl mx-auto mb-10">
            {t('financing.body')}
          </p>
          <button
            onClick={() => navigate('/bookings?browse=1')}
            className="inline-flex items-center px-7 py-3.5 bg-[var(--accent)] text-[var(--accent-on)] text-sm font-medium hover:bg-[var(--accent-press)] transition-colors font-body"
          >
            {t('financing.findLawyer')}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}