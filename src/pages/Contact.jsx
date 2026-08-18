import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const BLOCKS = [
  { label: 'Why write.', body: 'Listing, billing, or a problem with a booking.' },
  { label: 'Who reads it.', body: 'The studio. Not a ticket bot.' },
  { label: 'What to include.', body: 'Your name, the practice, what you need.' },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <Header />

      <main className="flex-1 py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-serif text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.02em] text-[var(--text)] mb-14">
            Write the studio.
          </h1>

          <div className="space-y-10 mb-14">
            {BLOCKS.map(({ label, body }) => (
              <div key={label}>
                <h2 className="font-serif text-xl sm:text-2xl leading-[1.2] tracking-[-0.01em] text-[var(--text)] mb-2">
                  {label}
                </h2>
                <p className="text-base sm:text-lg text-[var(--text-2)] font-body leading-[1.7]">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <a
            href="mailto:studio@faajistudios.com"
            className="font-body text-[24px] sm:text-[28px] text-[var(--text)] underline underline-offset-4 hover:text-[var(--accent)] transition-colors"
          >
            studio@faajistudios.com
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
