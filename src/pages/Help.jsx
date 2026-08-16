import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CircleHelp } from 'lucide-react';

const GROUPS = [
  {
    label: 'Cost',
    q: 'What does Brief cost?',
    a: (
      <>
        $199 a month for the practice. No percentage of the consultation. No per-booking cut. First month free for the first five Houston firms.
      </>
    ),
  },
  {
    label: 'Calendar',
    q: 'What does calendar connect see?',
    a: (
      <>
        Free/busy only. No titles, descriptions, attendees, locations. Disconnect anytime and fall back to the hours you set.
      </>
    ),
  },
  {
    label: 'Verification',
    q: 'How does verification work?',
    a: (
      <>
        Bar number and standing against the official state directory. Identity and bar documents reviewed before publish. The profile shows when it was last done.{' '}
        <Link to="/verify" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
          How Brief verifies
        </Link>
        .
      </>
    ),
  },
  {
    label: 'How they find you',
    q: 'How do clients find me?',
    a: (
      <>
        You share the booking link. You also appear in the public directory when the profile is published. Brief does not recommend one attorney over another.
      </>
    ),
  },
  {
    label: 'Cancellations',
    q: 'What if a client needs to change a consultation?',
    a: (
      <>
        They use the manage link on the confirmation email.
      </>
    ),
  },
  {
    label: 'Start',
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
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <CircleHelp className="w-7 h-7 text-[var(--accent)]" strokeWidth={1.6} />
            <h1 className="font-heading text-[34px] sm:text-[48px] lg:text-[58px] text-[var(--text)] leading-[1.08] tracking-[-0.01em]">
              Help.
            </h1>
          </div>
          <p className="text-base sm:text-lg text-[var(--text-2)] font-body mb-14">
            For the person who opens the desk.
          </p>

          <div className="space-y-12">
            {GROUPS.map(({ label, q, a }) => (
              <section key={label}>
                <h2 className="font-heading text-3xl sm:text-4xl text-[var(--text)] leading-[1.15] mb-4">
                  {label}
                </h2>
                <h3 className="font-heading text-xl sm:text-2xl text-[var(--text)] leading-tight mb-2">
                  {q}
                </h3>
                <p className="text-[15px] text-[var(--text-2)] font-body leading-[1.6]">
                  {a}
                </p>
              </section>
            ))}
          </div>

          <p className="mt-16 text-sm text-[var(--text-3)] font-body">
            Need something else?{' '}
            <Link to="/contact" className="text-[var(--text)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
              Write the studio
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
