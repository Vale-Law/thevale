import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ArticleLayout({ label, title, readTime, sections, ctaArea }) {
  const [activeSection, setActiveSection] = useState(0);
  const navigate = useNavigate();
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observers = sections.map((_, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(i); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      if (sectionRefs.current[i]) observer.observe(sectionRefs.current[i]);
      return observer;
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />

      {/* Article hero */}
      <div className="border-b border-[#E5E2DC] bg-white py-16 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">
            Learn · {label}
          </p>
          <h1 className="font-serif text-[40px] lg:text-[56px] text-[#111418] leading-[1.05] max-w-3xl mb-4">
            {title}
          </h1>
          <p className="text-sm text-[#8A8578] font-body">{readTime}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sticky TOC */}
        <aside className="lg:w-56 flex-shrink-0 order-2 lg:order-1">
          <nav className="sticky top-32">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">Contents</p>
            <ul className="space-y-2">
              {sections.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`text-sm text-left transition-colors font-body leading-snug ${
                      activeSection === i ? 'text-[#0a5dc2]' : 'text-[#8A8578] hover:text-[#111418]'
                    }`}
                  >
                    {s.heading}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 order-1 lg:order-2 max-w-[700px]">
          {sections.map((section, i) => (
            <div
              key={i}
              ref={el => sectionRefs.current[i] = el}
              className="mb-14 scroll-mt-28"
            >
              <h2 className="font-serif text-2xl lg:text-3xl text-[#111418] mb-5 leading-[1.1]">
                {section.heading}
              </h2>
              {section.pullQuote && (
                <blockquote className="border-l-2 border-[#0a5dc2] pl-6 my-6">
                  <p className="font-serif text-xl lg:text-2xl italic text-[#111418] leading-[1.3]">
                    "{section.pullQuote}"
                  </p>
                </blockquote>
              )}
              <div className="prose prose-sm max-w-none">
                {section.content.map((block, j) => {
                  if (block.type === 'p') return <p key={j} className="text-[#111418] font-body leading-relaxed mb-4 text-[17px]">{block.text}</p>;
                  if (block.type === 'ul') return (
                    <ul key={j} className="mb-4 space-y-2">
                      {block.items.map((item, k) => (
                        <li key={k} className="flex items-start gap-3 font-body text-[#111418] text-[16px] leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0a5dc2] mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                  if (block.type === 'stat') return (
                    <div key={j} className="bg-[#EAF2FB] p-6 my-6 text-center">
                      <div className="font-serif text-[48px] text-[#111418] leading-none mb-2">{block.value}</div>
                      <p className="text-sm text-[#8A8578] font-body">{block.label}</p>
                    </div>
                  );
                  return null;
                })}
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="border border-[#E5E2DC] bg-white p-8 mt-12">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-3 font-body">Ready to talk to an attorney?</p>
            <h3 className="font-serif text-2xl text-[#111418] mb-3">
              Talk to a vetted {ctaArea} attorney near you.
            </h3>
            <p className="text-sm text-[#8A8578] font-body mb-5">
              Consultations from $130. Financing available through Klarna, Affirm, and LawFi.
            </p>
            <button
              onClick={() => navigate(`/?area=${encodeURIComponent(ctaArea)}`)}
              className="px-6 py-3 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 font-body"
            >
              Find a {ctaArea} attorney →
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}