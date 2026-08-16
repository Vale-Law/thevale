import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AttorneyBeat from '@/components/for-attorneys/AttorneyBeat';

export default function ForAttorneys() {
  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <Header />

      {/* Beat 1 */}
      <section className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-body font-semibold text-[12px] leading-[16px] tracking-[0.08em] uppercase text-[var(--text-3)] mb-3">
            For the practice
          </p>
          <h1 className="font-display font-bold text-[32px] leading-[36px] tracking-[-0.025em] sm:text-[44px] sm:leading-[46px] text-[var(--text)] max-w-3xl">
            The front door.
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-2)] font-body mt-5 max-w-2xl leading-[1.7]">
            One page does the consult: a time on the firm&rsquo;s calendar, payment into the firm&rsquo;s account, the week in one pipeline.
          </p>
        </div>
      </section>

      {/* Beat 2 */}
      <AttorneyBeat heading="This is what you share.">
        <p>
          /book/your-name. Put it on the site, the bar profile, the signature. The firm&rsquo;s own traffic starts converting without the office as the switchboard.
        </p>
      </AttorneyBeat>

      {/* Beat 3 */}
      <AttorneyBeat heading="Your calendar, not a sticky note.">
        <p>
          Set hours, buffers, and notice once. If you connect Google Calendar, Brief reads free/busy only. Never event titles. Never details. Busy time blocks itself.
        </p>
      </AttorneyBeat>

      {/* Beat 4 */}
      <AttorneyBeat heading="They arrive with the matter.">
        <p>
          Every booking comes with the client&rsquo;s own description of the situation. Rule 1.18 sits on the page. They were received at first contact.
        </p>
      </AttorneyBeat>

      {/* Beat 5 */}
      <AttorneyBeat heading="The fee goes to the firm.">
        <p>
          The door is <span className="font-display font-semibold text-[36px] leading-[40px] tracking-[-0.02em] tabular-nums text-[var(--text)] align-middle">$199</span> a month. The consult fee goes to the firm. There is no per-booking cut and no pay-per-lead auction. First month free for the first five Houston firms.
        </p>
      </AttorneyBeat>

      {/* Beat 6 */}
      <AttorneyBeat heading="Tuesday is already in order.">
        <p>
          Name, their words, the time, in one pipeline. Pending is visible. Staff and attorney see the same week.
        </p>
      </AttorneyBeat>

      {/* Beat 7 — sage claim band */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-[var(--accent)]">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="font-display font-semibold text-[32px] leading-[36px] tracking-[-0.02em] text-[var(--accent-on)] mb-5">
            Claim your booking page.
          </h2>
          <p className="font-display font-semibold text-[36px] leading-[40px] tracking-[-0.02em] tabular-nums text-[var(--accent-on)] mb-3">$199</p>
          <p className="text-sm font-body text-[var(--accent-on)] opacity-90 mb-8">
            First month free for the first five.
          </p>
          <Link
            to="/signup/attorney"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--text)] text-[var(--ground)] text-sm font-medium font-body hover:opacity-90 transition-opacity min-w-[200px]"
          >
            Claim your booking page
          </Link>
          <div className="mt-4">
            <Link
              to="/login"
              className="text-xs font-body text-[var(--accent-on)] opacity-75 hover:opacity-100 underline"
            >
              Already listed?
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
