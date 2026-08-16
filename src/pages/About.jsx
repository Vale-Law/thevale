import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <Header />

      <main className="flex-1 py-16 lg:py-24 px-6 lg:px-8">
        <article className="max-w-[680px] mx-auto">
          <h1 className="font-heading text-[34px] sm:text-[44px] lg:text-[48px] text-[var(--text)] leading-[1.08] tracking-[-0.01em] mb-10">
            The front door of a well-run practice.
          </h1>

          <div className="space-y-6 text-[15px] lg:text-base text-[var(--text-2)] font-body leading-[1.75]">
            <p>
              Brief is the booking desk for a modern law practice. One link holds your availability, your intake, and the consultation. Clients pick a time that is actually open. You show up informed.
            </p>
            <p>
              Most practices do not lose work in the hearing. They lose it in the hour after someone tries to reach them. A missed call. A form that sits. A calendar that does not match the site. Brief is built for that hour.
            </p>
            <p>
              You get a booking page with your name on it. You set hours, buffers, and notice once. If you connect Google Calendar, Brief reads free/busy only — never event titles, never details — and busy time blocks itself. Every booking arrives with the client’s own description of the matter.
            </p>
            <p>
              Brief lists attorneys for a flat monthly fee. There is no per-booking cut, no pay-per-lead auction, and no referral fee dressed up as software. Education on the consumer side stays free. We do not recommend or endorse any attorney. We do not give legal advice. Brief is an advertising platform, not a law firm and not a lawyer referral service.
            </p>
            <p>
              We are starting in Houston. Family law, immigration, and business formation first. The product is the desk, not a marketplace costume.
            </p>
            <p>
              If you want to see the desk:{' '}
              <Link to="/for-attorneys" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
                See how it works
              </Link>
              . If you want one:{' '}
              <Link to="/signup/attorney" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
                Claim your booking page
              </Link>
              .
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
