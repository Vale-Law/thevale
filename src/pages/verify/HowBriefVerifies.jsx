import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck2, UserCheck, Receipt, CalendarClock } from 'lucide-react';

/**
 * Public "How Brief Verifies" page (F-05, Sprint v1.2 Track B W2.2).
 * Route: /verify -- registered OUTSIDE LegacyAccentScope so the page gets
 * DS v2 tokens straight from :root and is light/dark aware on its own,
 * same as /book and /dev/primitives.
 *
 * Comfortable density, plain factual register (DS 14.6, Shared Contract
 * 2.4 constraint 3). Every claim on this page states what is checked and
 * when -- never an endorsement, ranking, or recommendation. Copy changes
 * here are a compliance surface: keep the register factual.
 */

function usePrefersDark() {
  const [prefersDark, setPrefersDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setPrefersDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return prefersDark;
}

const STANDARDS = [
  {
    icon: ShieldCheck,
    title: 'Active bar status, checked against an official source',
    body: "We check the attorney's bar number and standing against the official state bar directory, and we record the date of that check. The profile label shows the month and year it was last done.",
  },
  {
    icon: UserCheck,
    title: 'Identity and bar-document review',
    body: 'The attorney submits a government-issued ID and their bar card. A member of the Brief admin team reviews both against the bar record before the profile is approved.',
  },
  {
    icon: FileCheck2,
    title: 'Attorney-authored profile attestation',
    body: 'The attorney attests that what their profile states — consultation fee, consultation formats, practice areas — is accurate. The attestation is recorded with a date.',
  },
  {
    icon: Receipt,
    title: 'Disclosed fee and format',
    body: 'The consultation fee and format are stated on the profile before you book. What you see on the profile is what the attorney attested to.',
  },
  {
    icon: CalendarClock,
    title: 'Periodic re-verification',
    body: 'Every verification carries a renewal date. When it comes due, the same checks are run again; the profile labels always show the most recent dates.',
  },
];

export default function HowBriefVerifies() {
  const prefersDark = usePrefersDark();
  const logo = prefersDark ? '/brand/logo-dark.png' : '/brand/logo-light.png';

  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <header className="border-b border-[var(--line)]">
        <div className="max-w-[760px] mx-auto px-6 h-20 flex items-center">
          <Link to="/" aria-label="Brief home">
            <img src={logo} alt="Brief" className="h-12 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-6 py-12 lg:py-16">
        <p className="ds-type-label text-[var(--text-3)] mb-3">Verification</p>
        <h1 className="text-3xl lg:text-4xl text-[var(--text)] leading-tight mb-4" style={{ fontFamily: 'var(--font-human)' }}>
          How Brief verifies attorneys
        </h1>
        <p className="text-[var(--text-2)] ds-type-body-m leading-relaxed mb-10 max-w-[560px]">
          Every attorney listed on Brief goes through the same review before their profile is published.
          This page describes exactly what is checked and what the labels on a profile mean.
        </p>

        <div className="space-y-6 mb-12">
          {STANDARDS.map(({ icon: Icon, title, body }) => (
            <section key={title} className="rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)] p-6">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 shrink-0 rounded-[var(--radius-full)] bg-[var(--surface-sunk)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg text-[var(--text)] mb-1.5" style={{ fontFamily: 'var(--font-human)' }}>{title}</h2>
                  <p className="text-sm text-[var(--text-2)] ds-type-body-m leading-relaxed">{body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section className="mb-12">
          <h2 className="text-xl text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-human)' }}>What the labels mean</h2>
          <p className="text-sm text-[var(--text-2)] ds-type-body-m leading-relaxed mb-3 max-w-[560px]">
            A verified profile shows dated, factual labels — for example, “Bar status verified March 2026”
            or “Profile attested March 2026.” Each one states what was checked and when. A label is never
            a rating and never a comparison between attorneys.
          </p>
        </section>

        <section className="rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface-sunk)] p-6 mb-12">
          <h2 className="text-lg text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-human)' }}>What verification is not</h2>
          <p className="text-sm text-[var(--text-2)] ds-type-body-m leading-relaxed">
            Verification is not an endorsement, a ranking, or a recommendation. Brief is an advertising
            platform, not a law firm and not a lawyer referral service. Brief does not recommend or endorse
            any attorney and does not give legal advice. Verification tells you the checks above were
            completed, and when — the choice of attorney is yours.
          </p>
        </section>

        <Link to="/" className="text-sm text-[var(--accent)] ds-type-body-m hover:underline">
          ← Back to Brief
        </Link>
      </main>
    </div>
  );
}
