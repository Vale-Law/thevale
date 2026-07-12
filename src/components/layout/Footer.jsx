import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLanguage();

  const cols = [
    {
      heading: t('footer.browse'),
      links: [
        { label: t('area.familyLaw'), to: '/?area=Family+Law' },
        { label: t('area.immigration'), to: '/?area=Immigration' },
        { label: t('area.businessFormation'), to: '/?area=Business+Formation' },
        { label: t('area.personalInjury'), to: '/?area=Personal+Injury' },
        { label: t('footer.allAttorneys'), to: '/?browse=1' },
      ],
    },
    {
      heading: t('footer.financing'),
      links: [
        { label: t('footer.howItWorks'), to: '/financing' },
        { label: 'Klarna', to: '/financing' },
        { label: 'Affirm', to: '/financing' },
        { label: 'LawFi', to: '/financing' },
      ],
    },
    {
      heading: t('footer.learn'),
      links: [
        { label: t('learn.immigrationLaw'), to: '/learn/immigration-law' },
        { label: t('learn.personalInjuryLaw'), to: '/learn/personal-injury-law' },
        { label: t('learn.familyLawSoon'), to: '/learn' },
        { label: t('footer.allGuides'), to: '/learn' },
      ],
    },
    {
      heading: t('footer.company'),
      links: [
        { label: t('nav.forAttorneys'), to: '/for-attorneys' },
        { label: t('footer.attorneyDashboard'), to: '/attorney-dashboard' },
        { label: t('footer.privacyPolicy'), to: '/' },
        { label: t('footer.termsOfService'), to: '/' },
      ],
    },
  ];

  return (
    <footer className="bg-white text-[#111418]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 lg:col-span-1">
            <img
              src="https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/03090a7d8_A685878D-8D1E-4B4E-BD14-35608619A7D7.PNG"
              alt="Brief"
              className="h-20 w-auto object-contain mb-4"
            />
            <p className="text-sm text-[#8A8578] leading-relaxed">
              {t('footer.tagline')}<br />
              {t('footer.nationwide')}
            </p>
          </div>
          {cols.map(col => (
            <div key={col.heading}>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-[#111418]/70 hover:text-[#111418] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#111418]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8A8578]">{t('footer.copyright')}</p>
          <p className="text-xs text-[#8A8578]">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}