import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useOnboarding } from '@/lib/onboardingContext';
import RegistrationStep from './RegistrationStep';
import OtpStep from './OtpStep';
import PhoneStep from './PhoneStep';
import SuccessStep from './SuccessStep';

export default function OnboardingModal() {
  const { open, pendingUrl, closeOnboarding } = useOnboarding();
  const [step, setStep] = useState('registration');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (open) {
      setStep('registration');
      setEmail('');
      setFirstName('');
      setLastName('');
      base44.analytics.track({ eventName: 'Registration Started' });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, step]);

  if (!open) return null;

  const handleClose = () => {
    if (step !== 'success') {
      base44.analytics.track({ eventName: 'Registration Abandoned' });
    }
    closeOnboarding();
  };

  const handleOtpVerified = async () => {
    if (firstName || lastName) {
      try {
        await base44.auth.updateMe({ full_name: `${firstName} ${lastName}`.trim() });
      } catch (e) { /* proceed anyway */ }
    }
    setStep('phone');
  };

  const handlePhoneComplete = () => {
    base44.analytics.track({ eventName: 'Registration Completed' });
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-[3000]">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal / Mobile sheet */}
      <div className="absolute inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[92vw] sm:max-w-[480px] bg-[#FAF9F7] overflow-y-auto max-h-screen sm:max-h-[90vh] sm:rounded-2xl sm:shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#8A8578] hover:text-[#111418] z-10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'registration' && (
          <RegistrationStep
            email={email}
            setEmail={setEmail}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            onRegistered={() => setStep('otp')}
            pendingUrl={pendingUrl}
          />
        )}
        {step === 'otp' && (
          <OtpStep
            email={email}
            onVerified={handleOtpVerified}
            onBack={() => setStep('registration')}
          />
        )}
        {step === 'phone' && (
          <PhoneStep onComplete={handlePhoneComplete} />
        )}
        {step === 'success' && (
          <SuccessStep pendingUrl={pendingUrl} />
        )}
      </div>
    </div>
  );
}