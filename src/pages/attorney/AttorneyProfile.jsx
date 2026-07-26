import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Upload, Check } from 'lucide-react';

const ALL_LANGUAGES = ['English', 'Spanish', 'Portuguese', 'French', 'Mandarin', 'Arabic', 'Other'];
const LANG_LABEL = { English: 'English', Spanish: 'Spanish', Portuguese: 'Portuguese', French: 'French', Mandarin: 'Mandarin', Arabic: 'Arabic', Other: 'Other' };
const PRACTICE_AREAS = ['Family Law', 'Immigration', 'Business Formation', 'Personal Injury'];
const AREAS = { 'Family Law': 'area.familyLaw', Immigration: 'area.immigration', 'Business Formation': 'area.businessFormation', 'Personal Injury': 'area.personalInjury' };

export default function AttorneyProfilePage() {
  const { attorney, reloadAttorney } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (attorney) setForm({ ...attorney });
  }, [attorney?.id]);

  if (!form) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>;
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await base44.entities.Attorney.update(attorney.id, form);
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
      <div className="mb-6 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Attorney Portal</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">My Profile</h1>
        <p className="text-sm text-[#8A8578] font-body mt-2">This is your public-facing profile that clients see.</p>
      </div>

      {/* Photo */}
      <div className="bg-white border border-[#E5E2DC] p-6 mb-5">
        <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-3">Profile photo</p>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F4F2EE] border border-[#E5E2DC] flex items-center justify-center shrink-0">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-serif text-[#8A8578]">{(form.name || '?')[0]}</span>
            )}
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E2DC] text-sm font-body text-[#111418] hover:border-[#0a5dc2] hover:text-[#0a5dc2] transition-colors cursor-pointer">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </label>
        </div>
      </div>

      {/* Basic fields */}
      <div className="bg-white border border-[#E5E2DC] p-6 mb-5">
        <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-4">Profile details</p>
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
            <div key={key}>
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key] ?? ''}
                onChange={e => set(key, type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
                className="w-full border border-[#E5E2DC] px-4 py-2.5 text-sm text-[#111418] outline-none focus:border-[#111418] transition-colors font-body"
              />
            </div>
          ))}
          <div>
            <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">Primary practice area</label>
            <select
              value={form.practice_area || ''}
              onChange={e => set('practice_area', e.target.value)}
              className="w-full border border-[#E5E2DC] px-4 py-2.5 text-sm text-[#111418] outline-none focus:border-[#111418] font-body appearance-none bg-white"
            >
              {PRACTICE_AREAS.map(a => <option key={a} value={a}>{AREAS[a]}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">Bio</label>
          <textarea
            rows={5}
            value={form.bio || ''}
            onChange={e => set('bio', e.target.value)}
            className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] resize-none font-body"
          />
        </div>
      </div>

      {/* Languages & communication */}
      <div className="bg-white border border-[#E5E2DC] p-6 mb-6">
        <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-4">Languages & communication support</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {ALL_LANGUAGES.map(lang => (
            <label key={lang} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={(form.languages_spoken || []).includes(lang)} onChange={() => toggleLang(lang)} className="accent-[#0a5dc2] w-4 h-4" />
              <span className="text-sm font-body text-[#111418]">{LANG_LABEL[lang]}</span>
            </label>
          ))}
        </div>
        <div className="border-t border-[#E5E2DC] pt-4 space-y-3">
          {[
            { field: 'bilingual_staff', label: 'Bilingual support staff' },
            { field: 'interpreter_available', label: 'Professional interpreters available' },
            { field: 'translated_documents', label: 'Translated legal documents' },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={!!form[field]} onChange={() => toggleComm(field)} className="accent-[#0a5dc2] w-4 h-4" />
              <span className="text-sm font-body text-[#111418]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-colors disabled:opacity-40 font-body"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-body">
            <Check className="w-4 h-4" /> Profile saved
          </span>
        )}
      </div>
    </div>
  );
}