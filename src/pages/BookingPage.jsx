import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

// The attorney's own public booking page — this is the v1.4 keystone
// feature. No login required to book. Calendar sync is limited to the
// attorney's own weekly working-hours rule (see src/lib/availability.js);
// external Google/Microsoft free-busy sync isn't built yet.
export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [attorney, setAttorney] = useState(undefined); // undefined = loading, null = not found
  const [avail, setAvail] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '', situation: '', consent: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('attorneys')
      .select('id, name, photo, bio, practice_area, practice_areas, office_location, verification_status, booking_page_published')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const ok = data && data.verification_status === 'verified' && data.booking_page_published;
        setAttorney(ok ? data : null);
      });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (attorney === undefined || attorney === null) return;
    setLoadingSlots(true);
    fetch(`/api/availability?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => setAvail(data))
      .catch(() => setAvail({ slots: [], timezone: null }))
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

  const submit = async (e) => {
    e.preventDefault();
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
          <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
        </div>
      </Shell>
    );
  }

  if (attorney === null) {
    return (
      <Shell>
        <div className="max-w-[560px] mx-auto px-6 py-24 text-center">
          <h1 className="font-serif text-2xl text-[#111418] mb-3">This booking page isn't available.</h1>
          <p className="text-sm text-[#8A8578] font-body">It may not be published yet, or the link may be incorrect.</p>
        </div>
      </Shell>
    );
  }

  if (result) {
    const when = `${new Intl.DateTimeFormat('en-US', { timeZone: avail.timezone, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(selected.start))} at ${formatTime(selected.start)}`;
    return (
      <Shell>
        <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#0a5dc2] mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-[#111418] mb-2">You're booked.</h1>
          <p className="text-sm text-[#8A8578] font-body mb-8">
            {when} with {attorney.name}. A confirmation
            {result.emailSent ? ' has been sent to ' : ' would be sent to '}
            <span className="text-[#111418]">{form.email}</span>
            {!result.emailSent && ' (email sending isn\'t configured on this preview yet)'}.
          </p>
          <div className="bg-white border border-[#E5E2DC] p-6 text-left space-y-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-3">Manage this appointment</p>
            <a href={`/manage/${result.manage.confirm.split('/').pop()}`} className="block text-sm text-[#0a5dc2] hover:underline font-body">Confirm my appointment</a>
            <a href={`/manage/${result.manage.reschedule.split('/').pop()}`} className="block text-sm text-[#0a5dc2] hover:underline font-body">Reschedule</a>
            <a href={`/manage/${result.manage.cancel.split('/').pop()}`} className="block text-sm text-[#0a5dc2] hover:underline font-body">Cancel</a>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-[680px] mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#E5E2DC]">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F4F2EE] border border-[#E5E2DC] flex items-center justify-center shrink-0">
            {attorney.photo ? <img src={attorney.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-xl font-serif text-[#8A8578]">{attorney.name?.[0]}</span>}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#111418]">{attorney.name}</h1>
            <p className="text-sm text-[#8A8578] font-body">{(attorney.practice_areas?.length ? attorney.practice_areas : [attorney.practice_area]).filter(Boolean).join(' · ')}</p>
          </div>
        </div>

        {!selected ? (
          <div>
            <h2 className="font-serif text-lg text-[#111418] mb-4 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Pick a time</h2>
            {loadingSlots ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-[#0a5dc2] animate-spin" /></div>
            ) : days.length === 0 ? (
              <div className="bg-white border border-[#E5E2DC] p-8 text-center">
                <p className="text-sm text-[#8A8578] font-body">No open times right now. Check back soon.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {days.map((day) => (
                  <div key={day.key}>
                    <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">{day.label}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {day.slots.map((s) => (
                        <button
                          key={s.start}
                          onClick={() => setSelected(s)}
                          className="border border-[#E5E2DC] py-2.5 text-sm font-body text-[#111418] hover:border-[#0a5dc2] hover:text-[#0a5dc2] transition-colors"
                        >
                          {formatTime(s.start)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={submit}>
            <button type="button" onClick={() => setSelected(null)} className="text-xs text-[#0a5dc2] font-body hover:underline mb-4">
              ← Choose a different time
            </button>
            <div className="bg-[#EAF2FB] border-l-2 border-[#0a5dc2] px-4 py-3 mb-6">
              <p className="text-sm text-[#111418] font-body">
                {new Intl.DateTimeFormat('en-US', { timeZone: avail.timezone, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(selected.start))} at {formatTime(selected.start)}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <Field label="Your name">
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-[#E5E2DC] px-3 py-2.5 text-sm font-body outline-none focus:border-[#111418]" />
              </Field>
              <Field label="Email">
                <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-[#E5E2DC] px-3 py-2.5 text-sm font-body outline-none focus:border-[#111418]" />
              </Field>
              <Field label="Phone (optional)">
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border border-[#E5E2DC] px-3 py-2.5 text-sm font-body outline-none focus:border-[#111418]" />
              </Field>
            </div>

            <p className="text-xs text-[#8A8578] font-body mb-2 leading-relaxed">
              Sharing details below does not create an attorney-client relationship. Brief is not a law firm, and submitting this form is not legal advice.
            </p>
            <Field label="What's going on? (optional)">
              <Textarea value={form.situation} onChange={(e) => setForm((f) => ({ ...f, situation: e.target.value }))} rows={4} placeholder="Tell us what's going on, in your own words." />
            </Field>
            <label className="flex items-start gap-2 mt-3 mb-6 text-xs text-[#8A8578] font-body">
              <Checkbox checked={form.consent} onCheckedChange={(v) => setForm((f) => ({ ...f, consent: !!v }))} className="mt-0.5" />
              Share what I wrote above with {attorney.name}. (Unchecked, only my contact info is sent.)
            </label>

            {error && <p className="text-sm text-red-600 font-body mb-4">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#111418] text-white text-sm font-body hover:bg-[#0a5dc2] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm booking
            </button>
          </form>
        )}
      </div>
    </Shell>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.08em] text-[#8A8578] font-body mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
