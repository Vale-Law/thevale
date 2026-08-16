import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CircleHelp } from 'lucide-react';

const QUESTIONS = [
  {
    q: 'What does Brief cost?',
    a: (
      <>
        A flat monthly fee for the practice. The listed price is $199 a month. You are not charged a percentage of the consultation and you are not charged per booking.
      </>
    ),
  },
  {
    q: 'Is there a per-booking cut?',
    a: (
      <>
        No. Attorneys pay to be listed. Brief does not take a cut of the consultation fee and does not run pay-per-lead auctions.
      </>
    ),
  },
  {
    q: 'How does verification work?',
    a: (
      <>
        We check bar number and standing against the official state directory, and we review identity and bar documents before a profile is published. The profile shows when that check was last done.{' '}
        <Link to="/verify" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
          How Brief verifies
        </Link>
        .
      </>
    ),
  },
  {
    q: 'What does calendar connect see?',
    a: (
      <>
        If you connect Google Calendar, Brief reads free/busy times only. It does not read event titles, descriptions, attendees, or locations. You can disconnect at any time and fall back to the hours you set yourself.
      </>
    ),
  },
  {
    q: 'How do clients find me?',
    a: (
      <>
        You share your booking link — site, bar profile, email signature. You also appear in the public directory when your profile is published.
      </>
    ),
  },
  {
    q: 'Who appears in the public directory?',
    a: (
      <>
        Attorneys who are verified and listed. Brief does not recommend one attorney over another.
      </>
    ),
  },
  {
    q: 'What happens if a client needs to change a consultation?',
    a: (
      <>
        The client gets a manage link with the confirmation. They use that link on their confirmation email to reschedule or cancel.
      </>
    ),
  },
  {
    q: 'How do I get started?',
    a: (
      <>
        <Link to="/signup/attorney" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
          Claim your booking page
        </Link>
        . Already listed?{' '}
        <Link to="/login" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
          Log in
        </Link>
        .
      </>
    ),
  },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <Header />

      <main className="flex-1 py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-11 h-11 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
              <CircleHelp className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.6} />
            </div>
            <h1 className="font-heading text-[34px] sm:text-[44px] lg:text-[48px] text-[var(--text)] leading-[1.08] tracking-[-0.01em]">
              Help
            </h1>
          </div>

          <div className="space-y-10">
            {QUESTIONS.map(({ q, a }) => (
              <section key={q}>
                <h2 className="font-heading text-xl lg:text-2xl text-[var(--text)] leading-tight mb-3">
                  {q}
                </h2>
                <p className="text-[15px] lg:text-base text-[var(--text-2)] font-body leading-[1.75]">
                  {a}
                </p>
              </section>
            ))}
          </div>

          <p className="mt-16 text-sm text-[var(--text-3)] font-body">
            Still need us?{' '}
            <Link to="/contact" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
              Contact
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
