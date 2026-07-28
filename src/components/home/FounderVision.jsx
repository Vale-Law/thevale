import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/lib/i18n';

export default function FounderVision() {
  const { t } = useLanguage();
  const ref = useScrollReveal();

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#F5F0E8]" ref={ref}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Founders */}
        <div className="fade-up-child order-2 lg:order-1">
          <div className="grid grid-cols-2 gap-8 max-w-[440px]">
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-4 flex-shrink-0"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid #E5E2DC',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src="/images/founders/ola-kuforiji.jpeg"
                  alt="Ola Kuforiji"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
              <h3 className="font-serif text-[18px] text-[#111418] mb-0.5">Ola Kuforiji</h3>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body">{t('founder.coFounder')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-4 flex-shrink-0"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid #E5E2DC',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src="/images/founders/timothy-ogunlowo.png"
                  alt="Timothy Ogunlowo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
              <h3 className="font-serif text-[18px] text-[#111418] mb-0.5">Timothy Ogunlowo</h3>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body">{t('founder.coFounder')}</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="fade-up-child order-1 lg:order-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-5 font-body">{t('founder.vision')}</p>
          <h2 className="font-serif font-medium text-[28px] lg:text-[38px] text-[#111418] leading-[1.1] mb-6">
            {t('founder.heading')}
          </h2>
          <p className="text-[#8A8578] leading-relaxed mb-4">{t('founder.p1')}</p>
          <p className="text-[#8A8578] leading-relaxed mb-4">{t('founder.p2')}</p>
          <p className="text-[#8A8578] leading-relaxed mb-4">{t('founder.p3')}</p>
          <p className="text-[#8A8578] leading-relaxed">{t('founder.p4')}</p>
        </div>
      </div>
    </section>
  );
}