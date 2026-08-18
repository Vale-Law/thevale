import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <Header />

      <main className="flex-1 py-16 lg:py-24 px-6 lg:px-8">
        <article className="max-w-[720px] mx-auto">
          <h1 className="font-serif text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.02em] text-[var(--text)] mb-14">
            The front door of a well-run practice.
          </h1>

          <section className="mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl leading-[1.15] tracking-[-0.01em] text-[var(--text)] mb-5">
              The reception problem
            </h2>
            <div className="space-y-4 text-base lg:text-lg text-[var(--text-2)] font-body leading-[1.7]">
              <p>
                Most practices do not lose work in the hearing. They lose it in the hour after someone tries to reach them. A missed call. A form that sits. A calendar that does not match the site.
              </p>
              <p>
                The firm does not have a lead problem. It has a reception problem. Clio 2024: 48 percent of firms unreachable by phone. 64 percent of prospective clients get no follow-up.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl leading-[1.15] tracking-[-0.01em] text-[var(--text)] mb-5">
              What Brief is, and is not
            </h2>
            <div className="space-y-4 text-base lg:text-lg text-[var(--text-2)] font-body leading-[1.7]">
              <p>
                Brief is the booking desk: a public page on the firm&rsquo;s calendar, consult payment to the firm&rsquo;s account, the week in one pipeline. Flat monthly fee. No per-booking cut.
              </p>
              <p>
                Brief is an advertising platform, not a law firm and not a lawyer referral service. We do not recommend or endorse any attorney. We do not give legal advice. We do not send them clients. We do not draft. We do not answer the phone.
              </p>
            </div>
          </section>

          <section className="mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl leading-[1.15] tracking-[-0.01em] text-[var(--text)] mb-5">
              Houston
            </h2>
            <p className="text-base lg:text-lg text-[var(--text-2)] font-body leading-[1.7]">
              We are starting in Houston. Family law, immigration, and business formation first. $199 a month. One missed consult pays for it.
            </p>
          </section>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              to="/for-attorneys"
              className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors font-body"
            >
              See how it works
            </Link>
            <Link
              to="/signup/attorney"
              className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors font-body"
            >
              Claim your booking page
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
