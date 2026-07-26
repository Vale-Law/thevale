import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LegalLayout({ title, lastUpdated, sections }) {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <div className="max-w-[720px] mx-auto px-6 py-16 lg:py-24">
          <h1 className="font-serif text-[32px] lg:text-[44px] text-[#111418] leading-[1.1] mb-3">
            {title}
          </h1>
          <p className="text-sm text-[#8A8578] font-body mb-12 lg:mb-16">
            Last updated {lastUpdated}
          </p>

          <div className="space-y-10 lg:space-y-12">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-serif text-xl lg:text-2xl text-[#111418] leading-tight mb-4">
                  {section.heading}
                </h2>
                <div className="space-y-4">
                  {section.paragraphs.map((para, i) => (
                    <p key={i} className="text-[15px] lg:text-base text-[#3c3a36] font-body leading-[1.75]">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}