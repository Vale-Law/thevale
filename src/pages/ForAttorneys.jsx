import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/lib/i18n';
import { ArrowRight, Users, ShieldCheck, CalendarClock } from 'lucide-react';

export default function ForAttorneys() {
  const { t } = useLanguage();
  const ref1 = useScrollReveal();
  const ref3 = useScrollReveal();

  const values = [
    { icon: Users, title: t('forAttorneys.v1Title'), desc: t('forAttorneys.v1Desc') },
    { icon: CalendarClock, title: t('forAttorneys.v3Title'), desc: t('forAttorneys.v3Desc') },
    { icon: ShieldCheck, title: t('forAttorneys.v4Title'), desc: t('forAttorneys.v4Desc') },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />

      {/* Hero */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAF9F7]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">{t('forAttorneys.label')}</p>
          <h1 className="font-serif font-medium text-[44px] lg:text-[72px] text-[#111418] leading-[1.02] max-w-4xl mb-6">
            {t('forAttorneys.heading')}
          </h1>
          <p className="text-lg text-[#8A8578] font-body max-w-xl leading-relaxed">
            {t('forAttorneys.desc')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to="/signup/attorney"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 font-body"
            >
              {t('forAttorneys.apply')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-[#8A8578] font-body">{t('forAttorneys.sub')}</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 lg:py-28 px-6 lg:px-8 bg-white" ref={ref1}>
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body fade-up-child">{t('forAttorneys.whyTitle')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-10">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="fade-up-child flex gap-5" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="w-12 h-12 rounded-full bg-[#EAF2FB] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#0a5dc2]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#111418] mb-2">{v.title}</h3>
                    <p className="text-sm text-[#8A8578] font-body leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAF9F7]" ref={ref3}>
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="font-serif font-medium text-[32px] lg:text-[44px] text-[#111418] leading-[1.1] mb-4 fade-up-child">
            {t('forAttorneys.ctaHeading')}
          </h2>
          <p className="text-lg text-[#8A8578] font-body mb-10 fade-up-child">
            {t('forAttorneys.ctaDesc')}
          </p>
          <Link
            to="/signup/attorney"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a5dc2] text-white text-sm font-medium hover:bg-[#094fa0] transition-all duration-300 font-body"
          >
            {t('forAttorneys.ctaButton')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-[#8A8578] font-body mt-6">{t('forAttorneys.ctaSub')}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}