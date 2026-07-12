import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const paymentLabels = {
  full: 'Pay in full',
  klarna: 'Klarna (4 installments)',
  affirm: 'Affirm financing',
  lawfi: 'LawFi financing',
};

const nextSteps = [
  'You\'ll receive a confirmation email with your secure video link.',
  'Your attorney will confirm within 24 hours.',
  'Join the call at your scheduled time.',
  'Discuss next steps and retainer if you\'d like to proceed.',
];

export default function Confirmation() {
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
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
      </div>
    </div>
  );

  const slotDate = booking?.slot ? new Date(booking.slot) : null;

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        {/* Check animation */}
        <div className="flex justify-center mb-8">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-[#111418]">
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

        <h1 className="font-serif text-[48px] lg:text-[60px] text-[#111418] leading-[1.05] mb-3">
          You're booked.
        </h1>
        <p className="text-[#8A8578] font-body mb-10">
          Confirmation sent to <span className="text-[#111418]">{email || booking?.client_email}</span>
        </p>

        {/* Summary */}
        <div className="bg-white border border-[#E5E2DC] p-6 text-left mb-6 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">Booking summary</p>
          <div className="flex justify-between text-sm pb-3 border-b border-[#E5E2DC]">
            <span className="text-[#8A8578] font-body">Attorney</span>
            <span className="font-serif text-[#111418]">{booking?.attorney_name}</span>
          </div>
          <div className="flex justify-between text-sm pb-3 border-b border-[#E5E2DC]">
            <span className="text-[#8A8578] font-body">When</span>
            <span className="text-sm text-[#111418] font-body">
              {slotDate ? `${format(slotDate, 'EEEE, MMMM d')} at ${format(slotDate, 'h:mm a')}` : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm pb-3 border-b border-[#E5E2DC]">
            <span className="text-[#8A8578] font-body">Format</span>
            <span className="text-sm text-[#111418] font-body">Secure video call</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8A8578] font-body">Payment</span>
            <span className="text-sm text-[#111418] font-body">{paymentLabels[booking?.payment_method] || '—'}</span>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-[#EAF2FB] border border-[#0a5dc2]/10 p-6 text-left mb-10">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">What happens next</p>
          <ol className="space-y-3">
            {nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-serif text-lg text-[#0a5dc2] leading-none mt-0.5 w-5 flex-shrink-0">{i + 1}</span>
                <span className="text-sm text-[#111418] font-body">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 border border-[#111418] text-[#111418] text-sm font-medium hover:bg-[#111418] hover:text-white transition-all duration-200 font-body"
        >
          Back to home →
        </button>
      </div>
      <Footer />
    </div>
  );
}