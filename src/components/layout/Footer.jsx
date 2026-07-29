import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import BrandLogo from '@/components/brand/BrandLogo';

export default function Footer() {
  const { t } = useLanguage();

  const cols = [
    {
      heading: t('footer.browseCol'),
      links: [
        { label: t('area.familyLaw'), to: '/bookings?area=Family+Law' },
        { label: t('area.immigration'), to: '/bookings?area=Immigration' },
        { label: t('area.personalInjury'), to: '/bookings?area=Personal+Injury' },
        { label: t('area.businessFormation'), to: '/bookings?area=Business+Formation' },
        { label: t('footer.allAttorneys'), to: '/areas-of-help' },
        { label: t('footer.exploreAreas'), to: '/areas-of-help' },
      ],
    },
    {
      heading: t('footer.forAttorneysCol'),
      links: [
        { label: t('footer.listPractice'), to: '/for-attorneys' },
        { label: t('footer.applyJoin'), to: '/signup/attorney' },
      ],
    },
    {
      heading: t('footer.learnCol'),
      links: [
        { label: t('learn.immigrationLaw'), to: '/learn/immigration-law' },
        { label: t('learn.personalInjuryLaw'), to: '/learn/personal-injury-law' },
        { label: t('footer.allGuidesCol'), to: '/learn' },
      ],
    },
    {
      heading: t('footer.companyCol'),
      links: [
        { label: t('footer.privacyPolicy'), to: '/privacy' },
        { label: t('footer.termsOfService'), to: '/terms' },
        { label: t('footer.financingSoon'), to: '/financing' },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--surface)] text-[var(--text)] border-t border-[var(--line-2)] hidden lg:block">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-14">
          <div className="col-span-2 lg:col-span-2">
            <BrandLogo className="h-10 w-auto object-contain mb-4" />
            <p className="text-sm text-[var(--text-3)] leading-relaxed max-w-xs">
              {t('footer.tagline')}<br />
              {t('footer.nationwide')}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
              <Link to="/" className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors">{t('footer.home')}</Link>
              <span className="text-[var(--text-4)]">·</span>
              <Link to="/" className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors">{t('footer.about')}</Link>
              <span className="text-[var(--text-4)]">·</span>
              <Link to="/" className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors">{t('footer.contact')}</Link>
              <span className="text-[var(--text-4)]">·</span>
              <Link to="/" className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors">{t('footer.help')}</Link>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.heading}>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-4 font-body">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-[var(--text-2)] hover:text-[var(--text)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--line)] pt-6 flex flex-col gap-4">
          <p className="text-xs text-[var(--text-3)] leading-relaxed max-w-3xl">Brief is an advertising platform, not a law firm and not a lawyer referral service. Attorneys pay a flat fee to be listed. Brief does not recommend or endorse any attorney and does not give legal advice.</p>
          <p className="text-xs text-[var(--text-3)]">{t('footer.copyright')}</p>
          <p className="text-xs text-[var(--text-3)] leading-relaxed max-w-3xl">{t('footer.disclaimerLong')}</p>
        </div>
      </div>
    </footer>
  );
}