import { HeartCrack, Users, CreditCard, Shield, Car, AlertTriangle, KeyRound, FileCheck, Building2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const SITUATIONS = [
  { key: 'divorce', icon: HeartCrack, area: 'Family Law' },
  { key: 'childCustody', icon: Users, area: 'Family Law' },
  { key: 'greenCard', icon: CreditCard, area: 'Immigration' },
  { key: 'asylum', icon: Shield, area: 'Immigration' },
  { key: 'carAccident', icon: Car, area: 'Personal Injury' },
  { key: 'slipFall', icon: AlertTriangle, area: 'Personal Injury' },
  { key: 'dui', icon: KeyRound, area: 'Personal Injury' },
  { key: 'expungement', icon: FileCheck, area: 'Personal Injury' },
  { key: 'llcFormation', icon: Building2, area: 'Business Formation' },
];

export default function CommonSituations({ onSelect }) {
  const { t } = useLanguage();

  return (
    <section className="bg-[var(--surface)] py-20 lg:py-24 px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[26px] lg:text-[34px] text-[var(--text)] leading-[1.1]">{t('commonSituations.heading')}</h2>
          <p className="text-[var(--text-3)] font-body mt-2">{t('commonSituations.subheading')}</p>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1" style={{ scrollSnapType: 'x proximity' }}>
          {SITUATIONS.map((s) => {
            const Icon = s.icon;
            const label = t(`situation.${s.key}`);
            return (
              <button
                key={s.key}
                onClick={() => onSelect(s.area)}
                className="flex flex-col items-center gap-3 shrink-0 group"
                style={{ scrollSnapAlign: 'start', width: 'clamp(96px, 18vw, 120px)' }}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent)]" strokeWidth={1.6} />
                </div>
                <span className="font-heading text-[13px] text-[var(--text)] text-center leading-tight transition-colors duration-200 group-hover:text-[var(--accent)]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
