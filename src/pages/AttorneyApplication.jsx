import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone, MapPin, Upload, Loader2, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { US_STATES } from "@/lib/usLocations";
import { useLanguage } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";

// Single editable list of states Brief is currently accepting attorneys from.
const ACCEPTED_STATES = ["Texas"];

// Canonical launch scope is Family Law, Immigration, and Business Formation
// (Personal Injury is not part of the launch scope -- Brief Aspirational
// Feature Blueprint, "Current structural gaps").
const PRACTICE_AREAS = [
  { value: "Family Law", labelKey: "area.familyLaw" },
  { value: "Immigration", labelKey: "area.immigration" },
  { value: "Business Formation", labelKey: "area.businessFormation" },
];

export default function AttorneyApplication() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    licenseState: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    barNumber: "",
    barState: "",
    officeLocation: "",
    phone: "",
    consultFee: "",
    boardCertBody: "",
    boardCertSpecialty: "",
  });
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [idFile, setIdFile] = useState(null);
  const [barCardFile, setBarCardFile] = useState(null);
  const [boardCertFile, setBoardCertFile] = useState(null);
  const [profileAck, setProfileAck] = useState(false);
  const [feeAck, setFeeAck] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleArea = (area) => {
    setPracticeAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const licenseAccepted = ACCEPTED_STATES.includes(form.licenseState);
  const licenseSelected = !!form.licenseState;

  const submitWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistLoading(true);
    try {
      await base44.entities.Waitlist.create({ email: waitlistEmail.trim(), state: form.licenseState });
      setWaitlistDone(true);
    } catch (err) {
      setError(err.message || "Could not save your email. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  const validate = () => {
    if (!form.name || !form.email || !form.password) return t('apply.validationRequired');
    if (form.password !== form.confirmPassword) return t('apply.validationMatch');
    if (form.password.length < 6) return t('apply.validationLength');
    if (!form.barNumber) return t('apply.validationBar');
    if (!form.barState) return t('apply.validationBarState');
    if (!form.officeLocation) return t('apply.validationOffice');
    if (!form.phone) return t('apply.validationPhone');
    if (practiceAreas.length === 0) return t('apply.validationArea');
    if (!form.consultFee || parseFloat(form.consultFee) <= 0) return t('apply.validationFee');
    if (!idFile && !barCardFile) return t('apply.validationDoc');
    if (!feeAck) return t('pricing.confirmError');
    if (!profileAck) return "Please confirm you wrote your profile and it is accurate.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email: form.email, password: form.password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: form.email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }

      setLoading(true);
      let idDocumentUri = "";
      let barCardUri = "";
      let boardCertUri = "";

      if (idFile) {
        try {
          const res = await base44.integrations.Core.UploadPrivateFile({ file: idFile });
          idDocumentUri = res.file_uri || "";
        } catch (e) { console.error("ID upload failed:", e); }
      }
      if (barCardFile) {
        try {
          const res = await base44.integrations.Core.UploadPrivateFile({ file: barCardFile });
          barCardUri = res.file_uri || "";
        } catch (e) { console.error("Bar card upload failed:", e); }
      }
      if (boardCertFile) {
        try {
          const res = await base44.integrations.Core.UploadPrivateFile({ file: boardCertFile });
          boardCertUri = res.file_uri || "";
        } catch (e) { console.error("Board cert upload failed:", e); }
      }

      try {
        await base44.auth.updateMe({ account_type: "attorney", role: "attorney" });
      } catch (e) { console.error("Failed to set account type:", e); }

      const me = await base44.auth.me();

      await base44.entities.Attorney.create({
        name: form.name,
        email: form.email,
        practice_areas: practiceAreas,
        bar_number: form.barNumber,
        bar_state: form.barState,
        state: form.licenseState,
        office_location: form.officeLocation,
        phone_number: form.phone,
        consult_fee: parseFloat(form.consultFee),
        id_document: idDocumentUri,
        bar_card_document: barCardUri,
        board_cert_body: form.boardCertBody || "",
        board_cert_specialty: form.boardCertSpecialty || "",
        board_cert_document: boardCertUri,
        board_cert_approved: false,
        profile_attestation: true,
        profile_attestation_date: new Date().toISOString(),
        verification_status: "pending",
        verified: false,
        user_id: me.id,
      });

      try {
        await base44.integrations.Core.SendEmail({
          to: form.email,
          subject: "Your Brief application is being processed",
          body: `Hi ${form.name},\n\nThanks for applying to join Brief! Your application has been received and is now under review.\n\nAt Brief, we check every attorney's bar license and identity before activating their account. Our team will review your submission and reach out once you're approved.\n\nWhat happens next:\n- We review your bar credentials and submitted documents\n- Once approved, you'll get an email welcoming you to Brief\n- You'll then be able to complete your profile and start receiving clients\n\nIf you have any questions in the meantime, just reply to this email.\n\nThanks for your patience — we're excited to have you on Brief.\n\nThe Brief Team`,
        });
      } catch (e) { console.error("Email send failed:", e); }

      window.location.href = "/attorney-pending";
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await base44.auth.resendOtp(form.email);
      toast({ title: t('apply.codeSent'), description: t('apply.codeSentDesc') });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  /* ---------- OTP Step ---------- */
  if (showOtp) {
    return (
      <AuthLayout
        title={t('apply.verifyTitle')}
        subtitle={`${t('apply.verifySubtitle')} ${form.email}`}
        logoPosition="left"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('apply.verifying')}</>) : t('apply.verifySubmit')}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t('apply.resend')}{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">{t('apply.resendBtn')}</button>
        </p>
      </AuthLayout>
    );
  }

  /* ---------- Application Form ---------- */
  return (
    <AuthLayout
      title={t('apply.title')}
      subtitle={t('apply.subtitle')}
      maxWidth="max-w-2xl"
      logoPosition="left"
      footer={
        <>
          {t('apply.alreadyHaveAccount')}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">{t('apply.login')}</Link>
        </>
      }
    >
      <p className="mb-5 text-sm text-muted-foreground font-body leading-relaxed">{t('apply.intro')}</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* State of licensure — first field, gates the rest of the form */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-body mb-3">State of licensure</p>
          <div className="space-y-2">
            <select
              value={form.licenseState}
              onChange={(e) => update("licenseState", e.target.value)}
              className="w-full h-12 border border-input bg-card px-3 text-sm rounded-md outline-none focus:border-primary font-body appearance-none"
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {licenseSelected && !licenseAccepted && (
          <div className="p-5 rounded-lg bg-[#EAF2FB] border border-[#0a5dc2]/15">
            <p className="font-serif text-lg text-[#111418] mb-2">
              Brief is currently accepting attorneys licensed in {ACCEPTED_STATES.join(", ")}.
            </p>
            <p className="text-sm text-[#8A8578] font-body mb-4">
              We're expanding state by state — leave your email and we'll notify you when Brief opens in {form.licenseState}.
            </p>
            {waitlistDone ? (
              <p className="text-sm text-green-600 font-body">Thanks — we'll let you know when Brief opens in {form.licenseState}.</p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="you@firm.com"
                  className="flex-1 h-11 px-3 border border-input bg-card text-sm rounded-md outline-none focus:border-primary font-body"
                />
                <Button type="button" onClick={submitWaitlist} disabled={waitlistLoading || !waitlistEmail.trim()}>
                  {waitlistLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Notify me"}
                </Button>
              </div>
            )}
          </div>
        )}

        {licenseAccepted && (
          <>
            {/* Account credentials */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-body mb-3">{t('apply.account')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('apply.fullName')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Doe" className="pl-10 h-12" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('apply.phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 123-4567" className="pl-10 h-12" required />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('apply.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@firm.com" className="pl-10 h-12" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultFee">{t('apply.consultFee')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input id="consultFee" type="number" min="1" step="1" value={form.consultFee} onChange={(e) => update("consultFee", e.target.value)} placeholder="100" className="pl-7 h-12" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('apply.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className="pl-10 h-12" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t('apply.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirm" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="••••••••" className="pl-10 h-12" required />
                </div>
              </div>
            </div>

            {/* Bar credentials */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-body mb-3">{t('apply.barCredentials')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barNumber">{t('apply.barNumber')}</Label>
                  <Input id="barNumber" value={form.barNumber} onChange={(e) => update("barNumber", e.target.value)} placeholder="e.g. 1234567" className="h-12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barState">{t('apply.barState')}</Label>
                  <select id="barState" value={form.barState} onChange={(e) => update("barState", e.target.value)} className="w-full h-12 border border-input bg-card px-3 text-sm rounded-md outline-none focus:border-primary font-body appearance-none" required>
                    <option value="">{t('apply.selectState')}</option>
                    {US_STATES.map((s) => (<option key={s.code} value={s.name}>{s.name}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="office">{t('apply.office')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="office" value={form.officeLocation} onChange={(e) => update("officeLocation", e.target.value)} placeholder="123 Main St, Houston, TX" className="pl-10 h-12" required />
              </div>
            </div>

            {/* Practice areas */}
            <div>
              <Label className="mb-3 block">{t('apply.practiceAreas')}</Label>
              <div className="grid grid-cols-2 gap-3">
                {PRACTICE_AREAS.map((area) => (
                  <label key={area.value} className="flex items-center gap-2.5 cursor-pointer border border-border rounded-lg px-4 py-3 hover:border-primary transition-colors">
                    <input type="checkbox" checked={practiceAreas.includes(area.value)} onChange={() => toggleArea(area.value)} className="accent-[#0a5dc2] w-4 h-4" />
                    <span className="text-sm font-body text-foreground">{t(area.labelKey)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Board certification (optional) */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-body mb-3">Board certification (optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="boardCertBody">Certifying body</Label>
                  <Input id="boardCertBody" value={form.boardCertBody} onChange={(e) => update("boardCertBody", e.target.value)} placeholder="e.g. Texas Board of Legal Specialization" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boardCertSpecialty">Specialty</Label>
                  <Input id="boardCertSpecialty" value={form.boardCertSpecialty} onChange={(e) => update("boardCertSpecialty", e.target.value)} placeholder="e.g. Family Law" className="h-12" />
                </div>
              </div>
              <div className="mt-3">
                <FileUpload label="Certification document (optional)" file={boardCertFile} onChange={setBoardCertFile} chooseFileLabel={t('apply.chooseFile')} />
              </div>
            </div>

            {/* Document uploads */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-body mb-3">{t('apply.verificationDocs')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUpload label={t('apply.idDoc')} file={idFile} onChange={setIdFile} chooseFileLabel={t('apply.chooseFile')} />
                <FileUpload label={t('apply.barCard')} file={barCardFile} onChange={setBarCardFile} chooseFileLabel={t('apply.chooseFile')} />
              </div>
              <p className="text-xs text-muted-foreground font-body mt-2">{t('apply.docNote')}</p>
            </div>

            {/* Profile attestation */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={profileAck} onChange={(e) => setProfileAck(e.target.checked)} className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground font-body leading-relaxed">
                I wrote this profile, the information in it is accurate and current, and I am responsible for its compliance with my state's lawyer advertising rules.
              </span>
            </label>

            {/* Pricing acknowledgment */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={feeAck} onChange={(e) => setFeeAck(e.target.checked)} className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground font-body leading-relaxed">{t('pricing.confirmLabel')}</span>
            </label>

            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('apply.sending')}</>) : t('apply.submit')}
            </Button>
          </>
        )}

        {!licenseSelected && (
          <p className="text-xs text-muted-foreground font-body">
            Brief is currently accepting attorneys licensed in {ACCEPTED_STATES.join(", ")}. Select your state of licensure to continue.
          </p>
        )}
      </form>
    </AuthLayout>
  );
}

function FileUpload({ label, file, onChange, chooseFileLabel }) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <label className="flex items-center gap-3 border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:border-primary transition-colors">
        <div className="w-9 h-9 rounded-full bg-[#EAF2FB] flex items-center justify-center shrink-0">
          <Upload className="w-4 h-4 text-[#0a5dc2]" />
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-foreground truncate font-body">{file.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground font-body">{chooseFileLabel}</span>
          )}
        </div>
        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onChange(e.target.files[0])} />
      </label>
    </div>
  );
}