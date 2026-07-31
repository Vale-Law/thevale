import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Upload, Check } from 'lucide-react';
import { Card, Field, Button } from '@/components/primitives';
import BillingCard from '@/components/billing/BillingCard';
import ConnectCard from '@/components/billing/ConnectCard';

const ALL_LANGUAGES = ['English', 'Spanish', 'Portuguese', 'French', 'Mandarin', 'Arabic', 'Other'];
const LANG_LABEL = { English: 'English', Spanish: 'Spanish', Portuguese: 'Portuguese', French: 'French', Mandarin: 'Mandarin', Arabic: 'Arabic', Other: 'Other' };
// Canonical launch scope is Family Law, Immigration, and Business Formation
// (Personal Injury is not part of the launch scope -- Brief Aspirational
// Feature Blueprint, "Current structural gaps").
const PRACTICE_AREAS = ['Family Law', 'Immigration', 'Business Formation'];
const AREAS = { 'Family Law': 'area.familyLaw', Immigration: 'area.immigration', 'Business Formation': 'area.businessFormation' };

const ADD_STAFF_MESSAGES = {
  added: { text: 'Added to your team.', ok: true },
  no_account_found: { text: 'No Brief account found for that email. They need to sign up first.', ok: false },
  already_member: { text: 'Already on your team.', ok: false },
  ineligible_role: { text: "That email belongs to an attorney or admin account and can't be added as staff.", ok: false },
  not_firm_owner: { text: "Only the firm's owner can add staff.", ok: false },
};

export default function AttorneyProfilePage() {
  const { attorney, reloadAttorney } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [addingStaff, setAddingStaff] = useState(false);
  const [addStaffResult, setAddStaffResult] = useState(null);

  useEffect(() => {
    if (attorney) setForm({ ...attorney });
  }, [attorney?.id]);

  if (!form) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>;
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleArea = (area) => {
    const areas = form.practice_areas || [];
    set('practice_areas', areas.includes(area) ? areas.filter(a => a !== area) : [...areas, area]);
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // practice_areas (array) is canonical; practice_area (singular) is no
      // longer written from this attorney-facing surface. The column is
      // still nullable-but-present (its drop is deferred to Track B
      // confirming B1's admin display is off it -- Shared Contract 2.2), so
      // omitting it here is safe.
      const { practice_area: _unused, ...rest } = form;
      await base44.entities.Attorney.update(attorney.id, rest);
      await reloadAttorney();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleLang = (lang) => {
    const langs = form.languages_spoken || [];
    const next = langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang];
    set('languages_spoken', next);
    if (lang === 'Spanish') set('spanish_speaker', !langs.includes('Spanish'));
  };

  const toggleComm = (field) => set(field, !form[field]);

  // Minimal admin-side "add to firm" action (Sprint v1.2 D4): the firm
  // owner adds an already-registered user by email -- no self-service
  // invite/token flow this sprint. See add_firm_staff_by_email() in
  // supabase/migrations/20260728070000_track_a_w0b_add_firm_staff.sql.
  const addStaff = async (e) => {
    e.preventDefault();
    if (!staffEmail.trim()) return;
    setAddingStaff(true);
    setAddStaffResult(null);
    try {
      const { data, error } = await supabase.rpc('add_firm_staff_by_email', { p_email: staffEmail.trim() });
      if (error) throw error;
      const { ok, reason } = data?.[0] || {};
      setAddStaffResult(ADD_STAFF_MESSAGES[reason] || { text: 'Something went wrong.', ok: false });
      if (ok) setStaffEmail('');
    } catch (err) {
      setAddStaffResult({ text: err.message || 'Something went wrong.', ok: false });
    } finally {
      setAddingStaff(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      set('photo', res.file_url);
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'unknown'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Attorney Portal</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>My Profile</h1>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mt-2">This is your public-facing profile that clients see.</p>
      </div>

      {/* Photo */}
      <Card tone="raised" className="mb-4">
        <p className="ds-type-label text-[var(--text-3)] mb-3">Profile photo</p>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-[var(--radius-full)] overflow-hidden border border-[var(--line)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--surface-sunk)' }}>
            {form.photo ? (
              <img src={form.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-[var(--text-3)]" style={{ fontFamily: 'var(--font-human)' }}>{(form.name || '?')[0]}</span>
            )}
          </div>
          <label className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-s)] border border-[var(--line-2)] text-sm ds-type-body-m text-[var(--text-2)] hover:bg-[var(--surface-sunk)] transition-colors cursor-pointer">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </label>
        </div>
      </Card>

      {/* Basic fields */}
      <Card tone="raised" className="mb-4">
        <p className="ds-type-label text-[var(--text-3)] mb-4">Profile details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: 'Full name', key: 'name', type: 'text' },
            { label: 'Consultation fee ($)', key: 'consult_fee', type: 'number' },
            { label: 'Typical retainer ($)', key: 'typical_retainer', type: 'number' },
            { label: 'Years of experience', key: 'years_experience', type: 'number' },
            { label: 'State (e.g. TX)', key: 'state', type: 'text' },
            { label: 'City', key: 'city', type: 'text' },
            { label: 'Office location', key: 'office_location', type: 'text' },
            { label: 'Education', key: 'education', type: 'text' },
            { label: 'Bar admission', key: 'bar_admission', type: 'text' },
          ].map(({ label, key, type }) => (
            <Field
              key={key}
              label={label}
              type={type}
              value={form[key] ?? ''}
              onChange={e => set(key, type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
            />
          ))}
          <div className="sm:col-span-2">
            <label className="ds-type-label text-[var(--text-3)] block mb-2">Practice areas</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRACTICE_AREAS.map(a => (
                <label key={a} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={(form.practice_areas || []).includes(a)} onChange={() => toggleArea(a)} className="w-4 h-4 accent-[var(--accent)]" />
                  <span className="text-sm ds-type-body-m text-[var(--text)]">{AREAS[a]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Field label="Bio" type="textarea" rows={5} value={form.bio || ''} onChange={e => set('bio', e.target.value)} />
        </div>
      </Card>

      {/* Languages & communication */}
      <Card tone="raised" className="mb-4">
        <p className="ds-type-label text-[var(--text-3)] mb-4">Languages &amp; communication support</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {ALL_LANGUAGES.map(lang => (
            <label key={lang} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={(form.languages_spoken || []).includes(lang)} onChange={() => toggleLang(lang)} className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-sm ds-type-body-m text-[var(--text)]">{LANG_LABEL[lang]}</span>
            </label>
          ))}
        </div>
        <div className="border-t border-[var(--line)] pt-4 space-y-3">
          {[
            { field: 'bilingual_staff', label: 'Bilingual support staff' },
            { field: 'interpreter_available', label: 'Professional interpreters available' },
            { field: 'translated_documents', label: 'Translated legal documents' },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form[field]} onChange={() => toggleComm(field)} className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-sm ds-type-body-m text-[var(--text)]">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      <BillingCard />
      <ConnectCard />

      {/* Team */}
      <Card tone="raised" className="mb-4">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Team</p>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mb-4">Add office staff who already have a Brief account. They'll see your firm's booking pipeline the next time they log in.</p>
        <form onSubmit={addStaff} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <Field
              label="Staff email"
              type="email"
              value={staffEmail}
              onChange={e => setStaffEmail(e.target.value)}
              placeholder="staff@yourfirm.com"
            />
          </div>
          <Button variant="secondary" type="submit" disabled={addingStaff || !staffEmail.trim()}>
            {addingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to team'}
          </Button>
        </form>
        {addStaffResult && (
          <p className="text-sm ds-type-body-m mt-3" style={{ color: addStaffResult.ok ? 'var(--confirmed)' : 'var(--text-3)' }}>{addStaffResult.text}</p>
        )}
      </Card>

      <div className="flex items-center gap-4">
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm ds-type-body-m" style={{ color: 'var(--confirmed)' }}>
            <Check className="w-4 h-4" /> Profile saved
          </span>
        )}
      </div>
    </div>
  );
}
