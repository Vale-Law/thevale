import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingProgressBar from '@/components/booking/BookingProgressBar';
import BookingSummaryBar from '@/components/booking/BookingSummaryBar';
import StepInfo from '@/components/booking/StepInfo';
import StepDetails from '@/components/booking/StepDetails';
import StepPayment from '@/components/booking/StepPayment';
import { Loader2 } from 'lucide-react';
import { getScreeningData, extractUrgency, extractSubArea, extractLanguagePreference } from '@/lib/questionnaireData';

export default function Booking() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const attorneyId = params.get('attorney');
  const slot = params.get('slot');

  const [attorney, setAttorney] = useState(null);
  const [loadingAtty, setLoadingAtty] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [info, setInfo] = useState({ name: '', email: '', phone: '' });
  const [details, setDetails] = useState({ urgency: 'Soon', issue: '' });
  const [payment, setPayment] = useState({ payment: 'full' });

  useEffect(() => {
    if (!attorneyId) return;
    base44.entities.Attorney.filter({ id: attorneyId }).then(res => {
      setAttorney(res[0] || null);
      setLoadingAtty(false);
    });
  }, [attorneyId]);

  const handleConfirm = async () => {
    setLoading(true);
    const screening = getScreeningData();
    const booking = await base44.entities.Booking.create({
      client_name: info.name,
      client_email: info.email,
      client_phone: info.phone,
      attorney_id: attorneyId,
      attorney_name: attorney?.name,
      slot,
      urgency: extractUrgency(screening?.answers) || details.urgency,
      issue_description: details.issue,
      payment_method: payment.payment,
      status: 'pending',
      case_summary: screening?.caseSummary || 'Client skipped screening — limited details.',
      sub_area: extractSubArea(screening?.answers),
      language_preference: extractLanguagePreference(screening?.answers),
    });
    setLoading(false);
    navigate(`/confirmation?bookingId=${booking.id}&email=${encodeURIComponent(info.email)}`);
  };

  if (loadingAtty) return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="max-w-[640px] mx-auto px-6 py-12">
        <BookingProgressBar step={step} />
        <BookingSummaryBar attorney={attorney} slot={slot} />
        <div className="bg-white border border-[#E5E2DC] p-8">
          {step === 1 && (
            <StepInfo data={info} onChange={setInfo} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <StepDetails data={details} onChange={setDetails} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <StepPayment
              attorney={attorney}
              data={payment}
              onChange={setPayment}
              onConfirm={handleConfirm}
              onBack={() => setStep(2)}
              loading={loading}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}