import { useLanguage } from '@/lib/i18n';

export default function AnnouncementBar() {
  const { t } = useLanguage();
  return (
    <div className="bg-[var(--accent)] text-[var(--accent-on)] text-center py-2 px-4">
      <p className="text-[11px] tracking-[0.08em] font-body">
        {t('announcement.financing')}
      </p>
    </div>
  );
}