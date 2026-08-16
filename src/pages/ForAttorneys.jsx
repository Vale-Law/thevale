import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FADE = {
  animation: 'forAttorneysFade 0.35s cubic-bezier(0.23, 1, 0.32, 1) both',
};

const FRAMES = [
  {
    src: '/how-it-works/booking-link.png',
    alt: 'A Brief booking page with the attorney’s name and open consultation times',
    caption: 'This is what you share.',
    line: 'Put it on your site, your bar profile, your email signature.',
  },
  {
    src: '/how-it-works/client-intake.png',
    alt: 'The intake step on a Brief booking page, where a client describes the matter',
    caption: 'This is what they see.',
    line: 'They describe the matter and pick a time that is actually open.',
  },
  {
    src: null,
    alt: 'A booked client on the attorney’s Brief desk',
    caption: 'This is what you get.',
    line: 'A pre-screened client, on your calendar.',
  },
];

function WalkthroughFrame({ src, alt, caption, line }) {
  return (
    <section className="py-16 lg:py-24 px-6 lg:px-8" style={FADE}>
      <div className="max-w-[1000px] mx-auto">
        <FrameShot src={src} alt={alt} />
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)] font-body mt-6 mb-2">
          {caption}
        </p>
        <p className="text-base sm:text-lg text-[var(--text-2)] font-body leading-relaxed max-w-2xl">
          {line}
        </p>
      </div>
    </section>
  );
}

function FrameShot({ src, alt }) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className="w-full aspect-[4/3] rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)]"
        style={{ boxShadow: 'var(--shadow-raised)' }}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full rounded-[var(--radius-m)] border border-[var(--line)]"
      style={{ boxShadow: 'var(--shadow-raised)' }}
      onError={() => setFailed(true)}
    />
  );
}

export default function ForAttorneys() {
  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <style>{`@keyframes forAttorneysFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Header />

      <section className="py-16 lg:py-24 px-6 lg:px-8">
        <div className="max-w-[1000px] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-3)] font-body mb-3">
            For attorneys
          </p>
          <h1 className="font-heading text-[34px] sm:text-[48px] lg:text-[58px] text-[var(--text)] leading-[1.08] tracking-[-0.01em] max-w-3xl">
            Your front desk, as a link.
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-2)] font-body mt-5 max-w-2xl leading-relaxed">
            Availability, intake, and the consultation, behind one URL.
          </p>
        </div>
      </section>

      {FRAMES.map((frame) => (
        <WalkthroughFrame key={frame.caption} {...frame} />
      ))}

      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-[var(--accent)]">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl text-[var(--accent-on)] mb-8">
            Start collecting clients.
          </h2>
          <Link
            to="/signup/attorney"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--text)] text-[var(--ground)] text-sm font-medium font-body hover:opacity-90 transition-opacity min-w-[200px]"
          >
            Claim your booking page
          </Link>
          <p className="text-xs font-body text-[var(--accent-on)] opacity-75 mt-4">
            Already listed?{' '}
            <Link to="/login" className="underline">
              Go to your portal
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
