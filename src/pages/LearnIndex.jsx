import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useLanguage } from '@/lib/i18n';

export default function LearnIndex() {
  const { t } = useLanguage();
  const ref = useScrollReveal();

  const articles = [
    {
      slug: '/learn/immigration-law',
      label: t('learnIndex.immigrationLabel'),
      title: t('learnIndex.immigrationTitle'),
      desc: t('learnIndex.immigrationDesc'),
      readTime: t('learnIndex.immigrationRead'),
      available: true,
    },
    {
      slug: '/learn/personal-injury-law',
      label: t('learnIndex.injuryLabel'),
      title: t('learnIndex.injuryTitle'),
      desc: t('learnIndex.injuryDesc'),
      readTime: t('learnIndex.injuryRead'),
      available: true,
    },
    {
      slug: '/learn',
      label: t('learnIndex.familyLabel'),
      title: t('learnIndex.familyTitle'),
      desc: t('learnIndex.familyDesc'),
      readTime: t('learnIndex.comingSoon'),
      available: false,
    },
    {
      slug: '/learn',
      label: t('learnIndex.businessLabel'),
      title: t('learnIndex.businessTitle'),
      desc: t('learnIndex.businessDesc'),
      readTime: t('learnIndex.comingSoon'),
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <Header />

      <section className="py-24 lg:py-32 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-4 font-body">{t('learnIndex.label')}</p>
          <h1 className="font-serif text-[48px] lg:text-[64px] text-[var(--text)] leading-[1.02] mb-4 max-w-2xl">
            {t('learnIndex.heading')}
          </h1>
          <p className="text-lg text-[var(--text-3)] font-body max-w-lg leading-relaxed mb-16">
            {t('learnIndex.desc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" ref={ref}>
            {articles.map((a, i) => (
              <div key={i} className="fade-up-child" style={{ transitionDelay: `${i * 80}ms` }}>
                {a.available ? (
                  <Link
                    to={a.slug}
                    className="block bg-[var(--surface)] border border-[var(--line-2)] p-8 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--accent)] font-body mb-3">{a.label}</p>
                    <h2 className="font-serif text-2xl text-[var(--text)] leading-[1.15] mb-3 group-hover:text-[var(--accent)] transition-colors">
                      {a.title}
                    </h2>
                    <p className="text-sm text-[var(--text-3)] font-body leading-relaxed mb-4">{a.desc}</p>
                    <p className="text-xs text-[var(--text-3)] font-body">{a.readTime}</p>
                  </Link>
                ) : (
                  <div className="bg-[var(--surface)] border border-[var(--line-2)] p-8 opacity-60">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)] font-body mb-3">{a.label}</p>
                    <h2 className="font-serif text-2xl text-[var(--text)] leading-[1.15] mb-3">{a.title}</h2>
                    <p className="text-sm text-[var(--text-3)] font-body leading-relaxed mb-4">{a.desc}</p>
                    <span className="inline-block text-[10px] uppercase tracking-[0.1em] border border-[var(--line-2)] text-[var(--text-3)] px-2 py-1 font-body">
                      {t('learnIndex.comingSoon')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}