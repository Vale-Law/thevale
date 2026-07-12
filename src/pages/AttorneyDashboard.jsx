import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, CalendarClock, Star, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n';

const urgencyColors = { Urgent: 'text-red-600', Soon: 'text-yellow-600', 'Just exploring': 'text-green-600' };
const statusColors = { pending: 'text-yellow-600', confirmed: 'text-green-600', completed: 'text-blue-600', declined: 'text-red-600' };

const ALL_LANGUAGES = ['English', 'Spanish', 'Portuguese', 'French', 'Mandarin', 'Arabic', 'Other'];

export default function AttorneyDashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [attorneys, setAttorneys] = useState([]);
  const [selectedAttyId, setSelectedAttyId] = useState('');
  const [attorney, setAttorney] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [newSlot, setNewSlot] = useState('');
  const [tab, setTab] = useState('bookings');

  useEffect(() => {
    base44.entities.Attorney.list().then(list => {
      setAttorneys(list);
      if (list.length > 0) setSelectedAttyId(list[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedAttyId) return;
    const atty = attorneys.find(a => a.id === selectedAttyId);
    if (atty) {
      setAttorney(atty);
      setForm({ ...atty });
      base44.entities.Booking.filter({ attorney_id: selectedAttyId }).then(setBookings);
    }
  }, [selectedAttyId, attorneys]);

  const handleSave = async () => {
    setSaving(true);
    const updated = await base44.entities.Attorney.update(selectedAttyId, form);
    setAttorneys(prev => prev.map(a => a.id === selectedAttyId ? updated : a));
    setSaving(false);
    toast({ title: 'Profile saved', description: 'Changes have been saved.' });
  };

  const handleBookingAction = async (bookingId, status) => {
    await base44.entities.Booking.update(bookingId, { status });
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const addSlot = () => {
    if (!newSlot) return;
    const slots = [...(form.available_slots || []), new Date(newSlot).toISOString()];
    setForm({ ...form, available_slots: slots });
    setNewSlot('');
  };

  const removeSlot = (idx) => {
    setForm({ ...form, available_slots: (form.available_slots || []).filter((_, i) => i !== idx) });
  };

  const toggleLanguage = (lang) => {
    const langs = form.languages_spoken || [];
    setForm({
      ...form,
      languages_spoken: langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang],
      spanish_speaker: lang === 'Spanish' ? !langs.includes('Spanish') : form.spanish_speaker,
    });
  };

  const toggleComm = (field) => {
    setForm({ ...form, [field]: !form[field] });
  };

  const metrics = [
    { icon: Users, label: t('dashboard.totalBookings'), value: bookings.length },
    { icon: CalendarClock, label: t('dashboard.upcoming'), value: bookings.filter(b => b.status === 'confirmed').length },
    { icon: Star, label: t('dashboard.avgRating'), value: `${attorney?.rating || 0}★` },
    { icon: TrendingUp, label: t('dashboard.reviews'), value: attorney?.review_count || 0 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
      </div>
    </div>
  );

  const commOptions = [
    { field: 'spanish_speaker', label: t('dashboard.iSpeakSpanish') },
    { field: 'bilingual_staff', label: t('dashboard.firmSpeaksSpanish') },
    { field: 'interpreter_available', label: t('dashboard.provideInterpreters') },
    { field: 'translated_documents', label: t('dashboard.translatedDocs') },
    { field: 'bilingual_staff', label: t('dashboard.bilingualStaff') },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10 pb-6 border-b border-[#E5E2DC]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-2 font-body">{t('dashboard.attorneyPortal')}</p>
            <h1 className="font-serif text-[36px] text-[#111418]">{t('dashboard.title')}</h1>
          </div>
          <select
            value={selectedAttyId}
            onChange={e => setSelectedAttyId(e.target.value)}
            className="border border-[#E5E2DC] bg-white px-4 py-2.5 text-sm text-[#111418] outline-none focus:border-[#111418] font-body"
          >
            {attorneys.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E5E2DC] mb-10">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white p-6">
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-3">{label}</p>
              <div className="font-serif text-[36px] text-[#111418] leading-none">{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E5E2DC] mb-8">
          {['bookings', 'profile', 'languages'].map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-6 py-3 text-sm font-body capitalize transition-colors ${
                tab === tabKey
                  ? 'border-b-2 border-[#111418] text-[#111418]'
                  : 'text-[#8A8578] hover:text-[#111418]'
              }`}
            >
              {tabKey === 'bookings' ? `${t('dashboard.bookings')} (${bookings.length})` : tabKey === 'profile' ? t('dashboard.editProfile') : t('dashboard.languagesSection')}
            </button>
          ))}
        </div>

        {tab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-20 text-[#8A8578] font-body bg-white border border-[#E5E2DC]">
                {t('dashboard.noBookings')}
              </div>
            ) : bookings.map(b => (
              <div key={b.id} className="bg-white border border-[#E5E2DC] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    {b.case_summary && (
                      <div className="mb-2 bg-[#EAF2FB] border-l-2 border-[#0a5dc2] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-[#0a5dc2] font-body mb-0.5">{t('dashboard.caseSummary')}</p>
                        <p className="text-sm text-[#111418] font-body">{b.case_summary}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-serif text-lg text-[#111418]">{b.client_name}</span>
                      <span className={`text-xs uppercase tracking-[0.08em] font-body ${statusColors[b.status] || ''}`}>{b.status}</span>
                      {b.urgency && <span className={`text-xs font-body ${urgencyColors[b.urgency] || ''}`}>{b.urgency}</span>}
                    </div>
                    <p className="text-sm text-[#8A8578] font-body">{b.client_email}</p>
                    {b.slot && (
                      <p className="text-sm text-[#111418] font-body">
                        {format(new Date(b.slot), 'EEEE, MMMM d')} at {format(new Date(b.slot), 'h:mm a')}
                      </p>
                    )}
                    <p className="text-xs text-[#8A8578] font-body capitalize">{t('dashboard.payment')}: {b.payment_method}</p>
                    {b.issue_description && (
                      <p className="text-sm text-[#8A8578] mt-2 font-body italic">"{b.issue_description}"</p>
                    )}
                  </div>
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookingAction(b.id, 'confirmed')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#111418] text-white text-xs font-body hover:bg-[#0a5dc2] transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('dashboard.confirm')}
                      </button>
                      <button
                        onClick={() => handleBookingAction(b.id, 'declined')}
                        className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E2DC] text-[#8A8578] text-xs font-body hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> {t('dashboard.decline')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div className="bg-white border border-[#E5E2DC] p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: t('dashboard.fullName'), key: 'name', type: 'text' },
                { label: t('dashboard.consultFee'), key: 'consult_fee', type: 'number' },
                { label: t('dashboard.typicalRetainer'), key: 'typical_retainer', type: 'number' },
                { label: t('dashboard.location'), key: 'location', type: 'text' },
                { label: t('dashboard.state'), key: 'state', type: 'text' },
                { label: t('dashboard.city'), key: 'city', type: 'text' },
                { label: t('dashboard.yearsExp'), key: 'years_experience', type: 'number' },
                { label: t('dashboard.education'), key: 'education', type: 'text' },
                { label: t('dashboard.barAdmission'), key: 'bar_admission', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key] || ''}
                    onChange={e => setForm({ ...form, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                    className="w-full border border-[#E5E2DC] px-4 py-2.5 text-sm text-[#111418] outline-none focus:border-[#111418] transition-colors font-body"
                  />
                </div>
              ))}
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">{t('dashboard.practiceArea')}</label>
                <select
                  value={form.practice_area || ''}
                  onChange={e => setForm({ ...form, practice_area: e.target.value })}
                  className="w-full border border-[#E5E2DC] px-4 py-2.5 text-sm text-[#111418] outline-none focus:border-[#111418] font-body appearance-none bg-white"
                >
                  <option value="Family Law">Family Law</option>
                  <option value="Immigration">Immigration</option>
                  <option value="Business Formation">Business Formation</option>
                  <option value="Personal Injury">Personal Injury</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-1.5">{t('dashboard.bio')}</label>
              <textarea
                rows={5}
                value={form.bio || ''}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-[#E5E2DC] px-4 py-3 text-sm text-[#111418] outline-none focus:border-[#111418] resize-none font-body"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-3">{t('dashboard.availabilitySlots')}</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="datetime-local"
                  value={newSlot}
                  onChange={e => setNewSlot(e.target.value)}
                  className="flex-1 border border-[#E5E2DC] px-4 py-2.5 text-sm outline-none focus:border-[#111418] font-body"
                />
                <button onClick={addSlot} className="px-4 py-2.5 border border-[#E5E2DC] text-sm text-[#111418] hover:border-[#111418] transition-colors font-body">
                  {t('dashboard.add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.available_slots || []).map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-2 text-xs border border-[#E5E2DC] px-3 py-1.5 font-body text-[#111418]">
                    {format(new Date(s), 'MMM d, h:mm a')}
                    <button onClick={() => removeSlot(i)} className="text-[#8A8578] hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 disabled:opacity-40 font-body flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.saveChanges')}
            </button>
          </div>
        )}

        {tab === 'languages' && (
          <div className="bg-white border border-[#E5E2DC] p-8 space-y-8">
            {/* Languages Spoken */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-4">{t('dashboard.languagesSpoken')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_LANGUAGES.map(lang => (
                  <label key={lang} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(form.languages_spoken || []).includes(lang)}
                      onChange={() => toggleLanguage(lang)}
                      className="accent-[#0a5dc2] w-4 h-4"
                    />
                    <span className="text-sm font-body text-[#111418]">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E5E2DC] pt-6" />

            {/* Communication Support */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body block mb-4">{t('dashboard.commSupport')}</label>
              <div className="space-y-3">
                {[
                  { field: 'spanish_speaker', label: t('dashboard.iSpeakSpanish') },
                  { field: 'bilingual_staff', label: t('dashboard.firmSpeaksSpanish') },
                  { field: 'interpreter_available', label: t('dashboard.provideInterpreters') },
                  { field: 'translated_documents', label: t('dashboard.translatedDocs') },
                  { field: 'bilingual_staff', label: t('dashboard.bilingualStaff') },
                ].map(({ field, label }) => (
                  <label key={field + label} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form[field]}
                      onChange={() => toggleComm(field)}
                      className="accent-[#0a5dc2] w-4 h-4"
                    />
                    <span className="text-sm font-body text-[#111418]">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E5E2DC] pt-4">
              <p className="text-xs text-[#8A8578] font-body leading-relaxed">
                Changes update your public profile and search visibility immediately.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300 disabled:opacity-40 font-body flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.saveChanges')}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
