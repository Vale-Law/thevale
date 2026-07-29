import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

export default function ForAttorneysStrip() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const bullets = [t('forAttorneysStrip.b1'), t('forAttorneysStrip.b2'), t('forAttorneysStrip.b3')];

  return (
    <section className="bg-[var(--surface)] py-20 lg:py-28 px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[var(--accent-soft)] order-2 lg:order-1">
          <img src="/for-attorneys.png"

          alt="Attorney on Brief"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center top' }} />

        </div>
        <div className="order-1 lg:order-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] font-body mb-3">{t('forAttorneysStrip.label')}</p>
          <h2 className="font-serif font-medium text-[28px] lg:text-[38px] text-[var(--text)] leading-[1.1] mb-5">
            {t('forAttorneysStrip.heading')}
          </h2>
          <ul className="space-y-3 mb-8">
            {bullets.map((b) =>
            <li key={b} className="flex items-start gap-3 text-[var(--text)] font-body text-[15px] leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                {b}
              </li>
            )}
          </ul>
          <button
            onClick={() => navigate('/for-attorneys')}
            className="px-7 py-3 rounded-full bg-[var(--text)] text-[var(--ground)] text-sm font-body font-medium hover:bg-[var(--accent)] transition-colors">

            {t('forAttorneysStrip.cta')}
          </button>
        </div>
      </div>
    </section>
  );
}