import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function OtpStep({ email, onVerified, onBack }) {
  const { t } = useLanguage();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.analytics.track({ eventName: 'OTP Verified' });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      onVerified();
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await base44.auth.resendOtp(email);
      setCountdown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  };

  return (
    <div key="otp" className="px-6 py-8 animate-fade-up">
      <button onClick={onBack} className="text-sm text-[#8A8578] hover:text-[#111418] mb-4 flex items-center gap-1 font-body">
        <ArrowLeft className="w-4 h-4" /> {t('onboarding.back')}
      </button>
      <h2 className="font-serif text-[28px] text-[#111418] leading-tight mb-2">{t('onboarding.verifyEmail')}</h2>
      <p className="text-sm text-[#8A8578] font-body mb-6">
        {t('onboarding.sentCodeTo')} <span className="text-[#111418] font-medium">{email}</span>
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-body" style={{ borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
        className="w-full py-3.5 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
        style={{ borderRadius: 8 }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('onboarding.verify')}
      </button>

      <p className="text-center text-sm text-[#8A8578] font-body mt-4">
        {countdown > 0 ? (
          <>{t('onboarding.didntReceive')} {t('onboarding.resendIn')} {countdown}s</>
        ) : (
          <>{t('onboarding.didntReceive')}{' '}
            <button onClick={handleResend} className="text-[#0a5dc2] font-medium hover:underline">{t('onboarding.resendCode')}</button>
          </>
        )}
      </p>
    </div>
  );
}