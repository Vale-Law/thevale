import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <Header />

      <main className="flex-1 py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-heading text-[34px] sm:text-[44px] lg:text-[48px] text-[var(--text)] leading-[1.08] tracking-[-0.01em] mb-5">
            Contact
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-2)] font-body leading-relaxed mb-8">
            For Brief, write to the studio.
          </p>
          <a
            href="mailto:studio@faajistudios.com"
            className="text-[var(--text)] font-body underline underline-offset-4 hover:text-[var(--accent)] transition-colors"
          >
            studio@faajistudios.com
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
