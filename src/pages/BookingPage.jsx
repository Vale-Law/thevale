import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { computeAvailableSlots } from '@/lib/availability';
import { Button, Field, Card, TimeSlot, Halftone } from '@/components/primitives';
import { Checkbox } from '@/components/ui/checkbox';
import MinimalFooter from '@/components/layout/MinimalFooter';
import VerificationLabels from '@/components/verify/VerificationLabels';
import { Loader2, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

const STEPS = ['slot', 'situation', 'contact', 'confirm'];

// The attorney's own public booking page — this is the v1.4 keystone
// feature. No login required to book. Calendar sync is limited to the
// attorney's own weekly working-hours rule (see src/lib/availability.js);
// external Google/Microsoft free-busy sync isn't built yet.
export default function BookingPage() {
  const { slug } = useParams();

  const [attorney, setAttorney] = useState(undefined); // undefined = loading, null = not found
  const [avail, setAvail] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState('slot');

  const [form, setForm] = useState({ name: '', email: '', phone: '', situation: '', consent: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Public profile card fields (including firm name) come from a narrow
  // security-definer RPC rather than a direct table select — `firms` has
  // no anon row policy, so a plain join would silently drop firm_name.
  // See supabase/migrations/20260731120000_public_attorney_profile_rpc.sql.
  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc('get_public_attorney_profile', { p_slug: slug })
      .then(({ data }) => {
        if (cancelled) return;
        setAttorney(data || null);
      });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (attorney === undefined || attorney === null) return;
    setLoadingSlots(true);

    // The serverless endpoint is the preferred source (it merges Google
    // Calendar free/busy). When it isn't available — e.g. the deployment
    // is missing SUPABASE_SERVICE_ROLE_KEY and it 503s — fall back to the
    // anon-safe RPC and compute slots in the browser with the same engine.
    const fallback = async () => {
      const { data } = await supabase.rpc('get_public_booking_page', { p_slug: slug });
      if (!data?.working_hours || !data?.timezone) return { slots: [], timezone: null };
      const slots = computeAvailableSlots({
        workingHours: data.working_hours,
        bufferMinutes: data.buffer_minutes ?? 15,
        minNoticeHours: data.min_notice_hours ?? 24,
        dailyCap: data.daily_cap,
        timezone: data.timezone,
        existingRanges: data.booked || [],
      });
      return { attorneyId: data.attorney_id, timezone: data.timezone, slots };
    };

    fetch(`/api/availability?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('availability api unavailable'))))
      .then((data) => setAvail(data))
      .catch(() => fallback().then(setAvail).catch(() => setAvail({ slots: [], timezone: null })))
      .finally(() => setLoadingSlots(false));
  }, [attorney, slug]);

  const days = useMemo(() => {
    if (!avail?.slots?.length) return [];
    const tz = avail.timezone;
    const byDay = new Map();
    for (const s of avail.slots) {
      const key = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(s.start));
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(s);
    }
    return Array.from(byDay.entries()).map(([key, slots]) => ({
      key,
      label: new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(slots[0].start)),
      slots,
    }));
  }, [avail]);

  const formatTime = (iso) => new Intl.DateTimeFormat('en-US', { timeZone: avail?.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  const formatDay = (iso) => new Intl.DateTimeFormat('en-US', { timeZone: avail?.timezone, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(iso));

  const chooseSlot = (slot) => {
    setSelected(slot);
    setStep('situation');
  };

  const changeTime = () => {
    setSelected(null);
    setStep('slot');
  };

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const contactValid = form.name.trim().length > 0 && emailLooksValid;

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bookings-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          slotStart: selected.start,
          slotEnd: selected.end,
          clientName: form.name,
          clientEmail: form.email,
          clientPhone: form.phone,
          situation: form.situation,
          consent: form.consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (attorney === undefined) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
        </div>
      </Shell>
    );
  }

  if (attorney === null) {
    return (
      <Shell>
        <div className="max-w-[560px] mx-auto px-6 py-24 text-center">
          <h1 className="font-serif text-2xl text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-human)' }}>This booking page isn't available.</h1>
          <p className="text-sm text-[var(--text-3)] ds-type-body-m">It may not be published yet, or the link may be incorrect.</p>
        </div>
      </Shell>
    );
  }

  if (result) {
    const when = `${formatDay(selected.start)} at ${formatTime(selected.start)}`;
    return (
      <Shell>
        <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
          <Halftone direction="radial" className="rounded-[var(--radius-l)] px-6 py-10 mb-2">
            <CheckCircle2 className="w-12 h-12 text-[var(--accent)] mx-auto mb-6" />
            <h1 className="text-3xl text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-human)' }}>You're booked.</h1>
            <p className="text-sm text-[var(--text-3)] ds-type-body-m mb-8">
              {when} with {attorney.name}. A confirmation
              {result.emailSent ? ' has been sent to ' : ' would be sent to '}
              <span className="text-[var(--text)]">{form.email}</span>
              {!result.emailSent && " (email sending isn't configured on this preview yet)"}.
            </p>
          </Halftone>
          <Card tone="raised" className="text-left space-y-2">
            <p className="ds-type-label text-[var(--text-3)] mb-3">Manage this appointment</p>
            <a href={`/manage/${result.manage.confirm.split('/').pop()}`} className="block text-sm text-[var(--accent)] hover:underline ds-type-body-m">Confirm my appointment</a>
            <a href={`/manage/${result.manage.reschedule.split('/').pop()}`} className="block text-sm text-[var(--accent)] hover:underline ds-type-body-m">Reschedule</a>
            <a href={`/manage/${result.manage.cancel.split('/').pop()}`} className="block text-sm text-[var(--accent)] hover:underline ds-type-body-m">Cancel</a>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-[680px] mx-auto px-6 py-12">
        <Halftone className="rounded-[var(--radius-l)] border border-[var(--line)] bg-[var(--surface)] px-6 py-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--surface-sunk)] border border-[var(--line)] flex items-center justify-center shrink-0">
              {attorney.photo ? <img src={attorney.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-xl text-[var(--text-3)]" style={{ fontFamily: 'var(--font-human)' }}>{attorney.name?.[0]}</span>}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{attorney.name}</h1>
              {attorney.firm_name && (
                <p className="text-sm text-[var(--text-2)] ds-type-body-m">{attorney.firm_name}</p>
              )}
              <p className="text-sm text-[var(--text-3)] ds-type-body-m mt-0.5">{(attorney.practice_areas?.length ? attorney.practice_areas : [attorney.practice_area]).filter(Boolean).join(' · ')}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {attorney.office_location && (
                  <p className="text-xs text-[var(--text-4)] ds-type-body-m">{attorney.office_location}</p>
                )}
                {attorney.consult_fee != null && (
                  <p className="text-xs text-[var(--text-4)] ds-type-body-m">${attorney.consult_fee} consultation fee</p>
                )}
              </div>
            </div>
          </div>
          {attorney.bio && (
            <p className="text-sm text-[var(--text-2)] ds-type-body-m leading-relaxed mt-4 pt-4 border-t border-[var(--line)] line-clamp-4">
              {attorney.bio}
            </p>
          )}
          <VerificationLabels attorneyId={attorney.id} />
        </Halftone>

        <StepIndicator step={step} />

        {step === 'slot' && (
          <div>
            <h2 className="text-lg text-[var(--text)] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-human)' }}><CalendarIcon className="w-4 h-4" /> Pick a time</h2>
            {loadingSlots ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" /></div>
            ) : days.length === 0 ? (
              <Card tone="recessed" className="text-center">
                <p className="text-sm text-[var(--text-3)] ds-type-body-m">No open times right now. Check back soon.</p>
              </Card>
            ) : (
              <div className="space-y-5">
                {days.map((day) => (
                  <div key={day.key}>
                    <p className="ds-type-label text-[var(--text-3)] mb-2">{day.label}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {day.slots.map((s) => (
                        <TimeSlot key={s.start} selected={selected?.start === s.start} onClick={() => chooseSlot(s)}>
                          {formatTime(s.start)}
                        </TimeSlot>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'situation' && selected && (
          <div>
            <SelectedSlotBanner label={`${formatDay(selected.start)} at ${formatTime(selected.start)}`} onChangeTime={changeTime} />

            <Field
              label="What's going on? (optional)"
              type="textarea"
              rows={4}
              value={form.situation}
              onChange={(e) => setForm((f) => ({ ...f, situation: e.target.value }))}
              placeholder="Tell us what's going on, in your own words."
            />
            <label className="flex items-start gap-2 mt-3 text-xs text-[var(--text-3)] ds-type-body-m">
              <Checkbox checked={form.consent} onCheckedChange={(v) => setForm((f) => ({ ...f, consent: !!v }))} className="mt-0.5" />
              Share what I wrote above with {attorney.name}. (Unchecked, only my contact info is sent.)
            </label>

            {/* Draft copy — pending legal review (Rule 1.18, prospective-client
                confidentiality). Covers both "no attorney-client relationship
                yet" and "this may not be privileged" so a client doesn't
                over-share before engagement. */}
            <p className="text-xs text-[var(--text-3)] ds-type-body-m mt-4 leading-relaxed">
              Submitting this form does not create an attorney-client relationship, and nothing
              here is legal advice. Because that relationship doesn't exist yet, information you
              share here may not be protected by attorney-client privilege or confidentiality —
              please avoid including highly sensitive details until an attorney has agreed to
              represent you.
            </p>

            <div className="flex justify-end mt-6">
              <Button variant="primary" onClick={() => setStep('contact')}>Continue</Button>
            </div>
          </div>
        )}

        {step === 'contact' && selected && (
          <div>
            <SelectedSlotBanner label={`${formatDay(selected.start)} at ${formatTime(selected.start)}`} onChangeTime={changeTime} />

            <div className="space-y-4">
              <Field label="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Field label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Field label="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep('situation')}>Back</Button>
              <Button variant="primary" disabled={!contactValid} onClick={() => setStep('confirm')}>Continue</Button>
            </div>
          </div>
        )}

        {step === 'confirm' && selected && (
          <div>
            <SelectedSlotBanner label={`${formatDay(selected.start)} at ${formatTime(selected.start)}`} onChangeTime={changeTime} />

            <Card tone="recessed" className="space-y-3 mb-6">
              <div>
                <p className="ds-type-label text-[var(--text-3)]">Contact</p>
                <p className="text-sm text-[var(--text)] ds-type-body-m">{form.name} · {form.email}{form.phone ? ` · ${form.phone}` : ''}</p>
              </div>
              <div>
                <p className="ds-type-label text-[var(--text-3)]">What you shared</p>
                <p className="text-sm text-[var(--text-2)] ds-type-body-m">
                  {form.consent && form.situation.trim() ? form.situation : 'Only your contact info will be shared.'}
                </p>
              </div>
            </Card>

            {error && <p className="text-sm text-[var(--noshow)] ds-type-body-m mb-4">{error}</p>}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('contact')} disabled={submitting}>Back</Button>
              <Button variant="primary" disabled={submitting} onClick={submit}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm booking
              </Button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function SelectedSlotBanner({ label, onChangeTime }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-[var(--surface-sunk)] border-l-2 border-[var(--accent)] rounded-[var(--radius-s)] px-4 py-3 mb-6">
      <p className="text-sm text-[var(--text)] ds-type-body-m">{label}</p>
      <button type="button" onClick={onChangeTime} className="text-xs text-[var(--accent)] ds-type-body-m hover:underline shrink-0">
        Change time
      </button>
    </div>
  );
}

function StepIndicator({ step }) {
  const idx = STEPS.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-8" aria-hidden="true">
      {STEPS.map((s, i) => (
        <span
          key={s}
          className="h-1 flex-1 rounded-[var(--radius-full)]"
          style={{ backgroundColor: i <= idx ? 'var(--accent)' : 'var(--line-2)' }}
        />
      ))}
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[var(--ground)] flex flex-col">
      <div className="flex-1">{children}</div>
      <MinimalFooter />
    </div>
  );
}
