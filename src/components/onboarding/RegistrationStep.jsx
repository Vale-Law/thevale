import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import GoogleIcon from '@/components/GoogleIcon';
import AppleIcon from './AppleIcon';
import FloatingInput from './FloatingInput';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function getPasswordChecks(pw) {
  return {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
}

export default function RegistrationStep({ email, setEmail, firstName, setFirstName, lastName, setLastName, onRegistered, pendingUrl }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState('register');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pwChecks = getPasswordChecks(password);
  const isPasswordValid = pwChecks.length && pwChecks.uppercase && pwChecks.number;
  const isEmailValid = validateEmail(email);
  const passwordsMatch = password === confirmPassword;

  const canSubmit = mode === 'login'
    ? isEmailValid && password.length > 0
    : isEmailValid && isPasswordValid && passwordsMatch && firstName.trim().length > 0 && lastName.trim().length > 0 && agreeTerms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register') {
      base44.analytics.track({ eventName: 'Email Registration Submitted' });
    }

    try {
      if (mode === 'register') {
        await base44.auth.register({ email, password });
        base44.analytics.track({ eventName: 'OTP Sent' });
        onRegistered();
      } else {
        await base44.auth.loginViaEmailPassword(email, password);
        base44.analytics.track({ eventName: 'Registration Completed' });
        window.location.href = pendingUrl || '/';
      }
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('exist') || msg.includes('already') || msg.includes('registered')) {
        setMode('login');
        setError('');
      } else {
        setError(err.message || (mode === 'register' ? 'Registration failed' : 'Invalid email or password'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.analytics.track({ eventName: 'Google Sign-In Clicked' });
    base44.auth.loginWithProvider('google', pendingUrl || '/');
  };

  const handleApple = () => {
    base44.analytics.track({ eventName: 'Apple Sign-In Clicked' });
    base44.auth.loginWithProvider('apple', pendingUrl || '/');
  };

  return (
    <div key={mode} className="px-6 py-8 animate-fade-up">
      {mode === 'register' ? (
        <>
          <h2 className="font-serif text-[28px] text-[#111418] leading-tight mb-2">{t('onboarding.tellUs')}</h2>
          <p className="text-sm text-[#8A8578] font-body mb-6">{t('onboarding.createAccount')}</p>
        </>
      ) : (
        <>
          <h2 className="font-serif text-[28px] text-[#111418] leading-tight mb-2">{t('onboarding.welcomeBack')}</h2>
          <p className="text-sm text-[#8A8578] font-body mb-6">{t('onboarding.signInContinue')}</p>
        </>
      )}

      {/* Social buttons */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#E5E2DC] text-sm font-medium text-[#111418] hover:bg-[#FAF9F7] transition-colors font-body mb-3"
        style={{ borderRadius: 12 }}
      >
        <GoogleIcon className="w-5 h-5" />
        {t('onboarding.continueGoogle')}
      </button>
      <button
        onClick={handleApple}
        className="w-full flex items-center justify-center gap-2 py-3 bg-black text-sm font-medium text-white hover:bg-[#111418] transition-colors font-body mb-4"
        style={{ borderRadius: 12 }}
      >
        <AppleIcon className="w-5 h-5" />
        {t('onboarding.continueApple')}
      </button>

      {/* OR divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E5E2DC]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#FAF9F7] px-3 text-xs uppercase text-[#8A8578] font-body">{t('onboarding.or')}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-body" style={{ borderRadius: 8 }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-3">
            <FloatingInput id="firstName" label={t('onboarding.firstName')} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
            <FloatingInput id="lastName" label={t('onboarding.lastName')} type="text" value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
          </div>
        )}
        <FloatingInput id="email" label={t('onboarding.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" error={!isEmailValid && email ? 'Enter a valid email' : ''} />
        <FloatingInput id="password" label={t('onboarding.password')} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />

        {mode === 'register' && (
          <>
            {password.length > 0 && !isPasswordValid && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-body pt-1">
                <span className={pwChecks.length ? 'text-green-600' : 'text-[#8A8578]'}>{pwChecks.length ? '✓' : '○'} {t('onboarding.pwLength')}</span>
                <span className={pwChecks.uppercase ? 'text-green-600' : 'text-[#8A8578]'}>{pwChecks.uppercase ? '✓' : '○'} {t('onboarding.pwUppercase')}</span>
                <span className={pwChecks.number ? 'text-green-600' : 'text-[#8A8578]'}>{pwChecks.number ? '✓' : '○'} {t('onboarding.pwNumber')}</span>
              </div>
            )}
            <FloatingInput id="confirmPassword" label={t('onboarding.confirmPassword')} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" error={!passwordsMatch && confirmPassword ? 'Passwords do not match' : ''} />

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0a5dc2] cursor-pointer"
              />
              <span className="text-xs text-[#8A8578] font-body leading-relaxed">
                {t('onboarding.terms')}{' '}
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#0a5dc2] hover:underline">{t('onboarding.termsOfService')}</a>
                {' '}{t('onboarding.and')}{' '}
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#0a5dc2] hover:underline">{t('onboarding.privacyPolicy')}</a>
              </span>
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full py-3.5 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
          style={{ borderRadius: 8 }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'register' ? t('onboarding.continue') : t('onboarding.signIn'))}
        </button>
      </form>

      {/* Toggle mode */}
      <p className="text-center text-sm text-[#8A8578] font-body mt-4">
        {mode === 'register' ? (
          <>{t('onboarding.alreadyHaveAccount')}{' '}
            <button onClick={() => { setMode('login'); setError(''); }} className="text-[#0a5dc2] font-medium hover:underline">{t('onboarding.signIn')}</button>
          </>
        ) : (
          <>{t('onboarding.newHere')}{' '}
            <button onClick={() => { setMode('register'); setError(''); }} className="text-[#0a5dc2] font-medium hover:underline">{t('onboarding.createOne')}</button>
          </>
        )}
      </p>
    </div>
  );
}