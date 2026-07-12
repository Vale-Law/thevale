import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const articles = [
  {
    slug: '/learn/immigration-law',
    label: 'Immigration Law',
    title: 'Immigration law, explained in plain English.',
    desc: 'Visas, green cards, citizenship, and deportation defense — everything you need to know before your consultation.',
    readTime: '12 min read',
    available: true,
  },
  {
    slug: '/learn/personal-injury-law',
    label: 'Personal Injury Law',
    title: 'How personal injury cases work — and what your case may be worth.',
    desc: 'Contingency fees, case timelines, insurance adjusters, and red flags to watch for.',
    readTime: '10 min read',
    available: true,
  },
  {
    slug: '/learn',
    label: 'Family Law',
    title: 'Divorce, custody, and family legal matters explained.',
    desc: 'A plain-English guide to navigating family law in Texas.',
    readTime: 'Coming soon',
    available: false,
  },
  {
    slug: '/learn',
    label: 'Business Formation',
    title: 'LLCs, contracts, and startup legal basics.',
    desc: 'Everything a Texas entrepreneur needs to know before starting a business.',
    readTime: 'Coming soon',
    available: false,
  },
];

export default function LearnIndex() {
  const ref = useScrollReveal();

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />

      <section className="py-24 lg:py-32 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">Learn</p>
          <h1 className="font-serif text-[48px] lg:text-[64px] text-[#111418] leading-[1.02] mb-4 max-w-2xl">
            Legal guides, in plain English.
          </h1>
          <p className="text-lg text-[#8A8578] font-body max-w-lg leading-relaxed mb-16">
            Before you book a consultation, understand your situation. Our guides are written by attorneys and edited for clarity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" ref={ref}>
            {articles.map((a, i) => (
              <div key={i} className="fade-up-child" style={{ transitionDelay: `${i * 80}ms` }}>
                {a.available ? (
                  <Link
                    to={a.slug}
                    className="block bg-white border border-[#E5E2DC] p-8 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#0a5dc2] font-body mb-3">{a.label}</p>
                    <h2 className="font-serif text-2xl text-[#111418] leading-[1.15] mb-3 group-hover:text-[#0a5dc2] transition-colors">
                      {a.title}
                    </h2>
                    <p className="text-sm text-[#8A8578] font-body leading-relaxed mb-4">{a.desc}</p>
                    <p className="text-xs text-[#8A8578] font-body">{a.readTime}</p>
                  </Link>
                ) : (
                  <div className="bg-white border border-[#E5E2DC] p-8 opacity-60">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-3">{a.label}</p>
                    <h2 className="font-serif text-2xl text-[#111418] leading-[1.15] mb-3">{a.title}</h2>
                    <p className="text-sm text-[#8A8578] font-body leading-relaxed mb-4">{a.desc}</p>
                    <span className="inline-block text-[10px] uppercase tracking-[0.1em] border border-[#E5E2DC] text-[#8A8578] px-2 py-1 font-body">
                      Coming soon
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