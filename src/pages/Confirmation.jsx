import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n';

export default function Confirmation() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('bookingId');
  const email = params.get('email');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    base44.entities.Booking.filter({ id: bookingId }).then(res => {
      setBooking(res[0] || null);
      setLoading(false);
    });
  }, [bookingId]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--ground)]">
      <Header />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
      </div>
    </div>
  );

  const slotDate = booking?.slot ? new Date(booking.slot) : null;
  const paymentLabels = {
    full: t('confirmation.payFull'),
    klarna: t('confirmation.payFull'),
    affirm: t('confirmation.payFull'),
    lawfi: t('confirmation.payFull'),
  };
  const nextSteps = [t('confirmation.step1'), t('confirmation.step2'), t('confirmation.step3'), t('confirmation.step4')];

  return (
    <div className="min-h-screen bg-[var(--ground)]">
      <Header />
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        {/* Check animation */}
        <div className="flex justify-center mb-8">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-[var(--text)]">
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M20 32l9 9 15-16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="100"
              strokeDashoffset="0"
              style={{ animation: 'checkDraw 0.6s ease-out 0.3s both' }}
            />
          </svg>
        </div>

        <h1 className="font-serif text-[48px] lg:text-[60px] text-[var(--text)] leading-[1.05] mb-3">
          {t('confirmation.title')}
        </h1>
        <p className="text-[var(--text-3)] font-body mb-10">
          {t('confirmation.sentTo')} <span className="text-[var(--text)]">{email || booking?.client_email}</span>
        </p>

        {/* Summary */}
        <div className="bg-[var(--surface)] border border-[var(--line-2)] p-6 text-left mb-6 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-4 font-body">{t('confirmation.summary')}</p>
          <div className="flex justify-between text-sm pb-3 border-b border-[var(--line-2)]">
            <span className="text-[var(--text-3)] font-body">{t('confirmation.attorney')}</span>
            <span className="font-serif text-[var(--text)]">{booking?.attorney_name}</span>
          </div>
          <div className="flex justify-between text-sm pb-3 border-b border-[var(--line-2)]">
            <span className="text-[var(--text-3)] font-body">{t('confirmation.when')}</span>
            <span className="text-sm text-[var(--text)] font-body">
              {slotDate ? `${format(slotDate, 'EEEE, MMMM d')} at ${format(slotDate, 'h:mm a')}` : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm pb-3 border-b border-[var(--line-2)]">
            <span className="text-[var(--text-3)] font-body">{t('confirmation.format')}</span>
            <span className="text-sm text-[var(--text)] font-body">{t('confirmation.videoCall')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-3)] font-body">{t('confirmation.payment')}</span>
            <span className="text-sm text-[var(--text)] font-body">{paymentLabels[booking?.payment_method] || t('confirmation.payFull')}</span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-3)] font-body mb-6 leading-relaxed">Brief is not a law firm. Booking a consultation through Brief does not create an attorney-client relationship. Any attorney-client relationship is formed only between you and the attorney, on terms you agree with them directly.</p>

        {/* Next steps */}
        <div className="bg-[var(--accent-soft)] border border-[var(--accent-soft)] p-6 text-left mb-10">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-3)] mb-4 font-body">{t('confirmation.whatNext')}</p>
          <ol className="space-y-3">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-serif text-lg text-[var(--accent)] leading-none mt-0.5 w-5 flex-shrink-0">{i + 1}</span>
                <span className="text-sm text-[var(--text)] font-body">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 border border-[var(--text)] text-[var(--text)] text-sm font-medium hover:bg-[var(--text)] hover:text-[var(--ground)] transition-all duration-200 font-body"
        >
          {t('confirmation.backHome')}
        </button>
      </div>
      <Footer />
    </div>
  );
}