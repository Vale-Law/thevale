import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  CalendarClock, Link2, PhoneMissed, CalendarX2, Inbox,
  ShieldCheck, Users, ArrowRight, Check,
} from 'lucide-react';

const HERO_IMAGE = '/images/hero-temple.jpg';
const HERO_LOGO = '/brand/logo-dark.png';

// The root landing page. Brief leads as a booking platform for law
// practices: availability, intake triage, and bookings in one place. The
// client-facing marketplace (the old homepage) lives at /bookings.
export default function LawyerHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <Header />

      {/* Hero */}
      <section className="relative w-full overflow-hidden flex items-center justify-center">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'center 62%' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(16,28,23,0.48), rgba(16,28,23,0.62))' }} />

        <div className="relative z-10 flex flex-col items-center w-full max-w-[1100px] mx-auto px-6 lg:px-8 py-14 sm:py-16 lg:py-24 text-center">
          <img
            src={HERO_LOGO}
            alt="Brief"
            className="h-12 sm:h-14 lg:h-16 w-auto object-contain mb-6"
            style={{ filter: 'brightness(0.88) drop-shadow(0 2px 12px rgba(16,28,23,0.45))' }}
          />
          <h1
            className="font-heading text-white text-[34px] sm:text-[48px] lg:text-[58px] leading-[1.08] tracking-[-0.01em] max-w-3xl"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
          >
            The booking desk for modern law practices.
          </h1>
          <p
            className="text-white/90 text-base sm:text-lg font-body mt-5 max-w-2xl"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
          >
            Most practices lose clients in triage — missed calls, slow intake, calendars that
            don&rsquo;t talk to each other. Brief puts your availability, intake, and bookings
            in one place, behind one link.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9 w-full sm:w-auto">
            <button
              onClick={() => navigate('/signup/attorney')}
              className="w-full sm:w-auto px-8 py-4 bg-[var(--accent)] text-[var(--accent-on)] text-sm font-medium font-body hover:bg-[var(--accent-press)] transition-all duration-200 min-w-[200px]"
            >
              Claim your booking page
            </button>
            <button
              onClick={() => navigate('/for-attorneys')}
              className="w-full sm:w-auto px-8 py-4 border border-white/60 text-white text-sm font-medium font-body hover:border-white transition-all duration-200 min-w-[200px]"
            >
              See how it works
            </button>
          </div>

          <Link
            to="/bookings"
            className="mt-7 text-sm text-white/80 hover:text-white font-body inline-flex items-center gap-1.5 transition-colors"
          >
            Looking for a lawyer? Browse vetted attorneys <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Pain */}
      <section className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)] font-body text-center mb-3">Why Brief exists</p>
          <h2 className="font-heading text-3xl sm:text-4xl text-[var(--text)] text-center mb-12">
            Triage is where practices bleed time.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: PhoneMissed,
                title: 'Calls you can’t take',
                body: 'Every missed call is a consultation booked with someone else. Intake shouldn’t depend on whoever answers the phone.',
              },
              {
                icon: Inbox,
                title: 'Unqualified inquiries',
                body: 'Hours spent sorting matters you don’t handle. Brief screens for practice area, location, and urgency before anyone books.',
              },
              {
                icon: CalendarX2,
                title: 'Scattered scheduling',
                body: 'Phone tag, double-bookings, no-shows. Your availability should come from your real calendar — not a sticky note.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-m)] p-6" style={{ boxShadow: 'var(--shadow-raised)' }}>
                <div className="w-11 h-11 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.6} />
                </div>
                <h3 className="font-heading text-lg text-[var(--text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-2)] font-body leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product */}
      <section className="py-16 lg:py-24 px-6 lg:px-8 bg-[var(--surface)] border-y border-[var(--line)]">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl text-[var(--text)] text-center mb-3">
            Everything in one place.
          </h2>
          <p className="text-[var(--text-2)] font-body text-center max-w-xl mx-auto mb-12">
            One link does the work of a front desk: it knows your hours, screens the matter,
            and books the consultation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: Link2,
                title: 'Your own booking link',
                body: 'brief.com/book/your-name — share it on your site, your bar profile, your email signature. Clients pick from times that are actually open.',
              },
              {
                icon: CalendarClock,
                title: 'Calendar-true availability',
                body: 'Set weekly hours, buffers, notice windows, and daily caps once. Connect Google Calendar and busy time blocks itself — free/busy only, never event details.',
              },
              {
                icon: Users,
                title: 'Clients arrive pre-screened',
                body: 'Every booking comes with the client’s own description of their situation, so the first consultation starts informed instead of cold.',
              },
              {
                icon: ShieldCheck,
                title: 'A vetted directory, not a lead mill',
                body: 'Flat fee to be listed. No per-booking cut, no pay-per-lead auctions — clean of fee-sharing and referral-fee concerns.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 p-5 rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--ground)]">
                <div className="w-11 h-11 shrink-0 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.6} />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-[var(--text)] mb-1.5">{title}</h3>
                  <p className="text-sm text-[var(--text-2)] font-body leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl text-[var(--text)] text-center mb-12">
            Live in three steps.
          </h2>
          <ol className="space-y-6">
            {[
              ['Apply and get verified', 'Bar number, identity, and profile review — verification clients can actually see.'],
              ['Set your hours or connect your calendar', 'Weekly windows, buffers, and minimum notice. Google Calendar sync keeps it honest.'],
              ['Share your link', 'Bookings, confirmations, and reminders are handled. You just show up to the consultation.'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-5 items-start bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-m)] p-6" style={{ boxShadow: 'var(--shadow-raised)' }}>
                <span className="w-9 h-9 shrink-0 rounded-full bg-[var(--accent)] text-[var(--accent-on)] flex items-center justify-center font-body text-sm font-medium">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-lg text-[var(--text)] mb-1">{title}</h3>
                  <p className="text-sm text-[var(--text-2)] font-body leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-[var(--accent)]">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl text-[var(--accent-on)] mb-4">
            Flat fee. No per-booking cut.
          </h2>
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 mb-8">
            {['Your booking page', 'Calendar sync', 'Pre-screened clients'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm font-body text-[var(--accent-on)] opacity-90">
                <Check className="w-4 h-4" /> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/signup/attorney')}
            className="px-8 py-4 bg-[var(--text)] text-[var(--ground)] text-sm font-medium font-body hover:opacity-90 transition-opacity min-w-[200px]"
          >
            Apply to join Brief
          </button>
          <p className="text-xs font-body text-[var(--accent-on)] opacity-75 mt-4">
            Already listed? <Link to="/attorney-dashboard" className="underline">Go to your portal</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
