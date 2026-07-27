import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { WEEKDAYS } from '@/lib/availability';
import { Button, Card, Field } from '@/components/primitives';
import { Loader2, Copy, Check, ExternalLink } from 'lucide-react';

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'America/Phoenix',
];

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyRules = () => ({ working_hours: {}, buffer_minutes: 15, min_notice_hours: 24, daily_cap: null, timezone: 'America/New_York' });

export default function AttorneyAvailabilityPage() {
  const { attorney, reloadAttorney } = useAuth();
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);
  const [slugSaving, setSlugSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!attorney?.id) return;
    setLoading(true);
    const { data } = await supabase.from('attorney_availability_rules').select('*').eq('attorney_id', attorney.id).maybeSingle();
    setRules(data || emptyRules());
    setSlug(attorney.slug || '');
    setPublished(!!attorney.booking_page_published);
    setLoading(false);
  }, [attorney?.id, attorney?.slug, attorney?.booking_page_published]);

  useEffect(() => { load(); }, [load]);

  const saveRules = async (next) => {
    setRules(next);
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.from('attorney_availability_rules').upsert({ attorney_id: attorney.id, ...next });
      if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayKey) => {
    const next = { ...rules, working_hours: { ...rules.working_hours } };
    if (next.working_hours[dayKey]) delete next.working_hours[dayKey];
    else next.working_hours[dayKey] = [['09:00', '17:00']];
    saveRules(next);
  };

  const setWindow = (dayKey, idx, which, value) => {
    const windows = rules.working_hours[dayKey].map((w, i) => (i === idx ? (which === 'start' ? [value, w[1]] : [w[0], value]) : w));
    saveRules({ ...rules, working_hours: { ...rules.working_hours, [dayKey]: windows } });
  };

  const claimSlug = async () => {
    setSlugSaving(true);
    try {
      const proposed = slug.trim() || slugify(attorney.name);
      await base44.entities.Attorney.update(attorney.id, { slug: proposed });
      setSlug(proposed);
      await reloadAttorney();
    } catch (e) {
      alert('That link is already taken — try another.');
    } finally {
      setSlugSaving(false);
    }
  };

  const togglePublish = async () => {
    const next = !published;
    setPublished(next);
    await base44.entities.Attorney.update(attorney.id, { booking_page_published: next });
    await reloadAttorney();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !rules) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Attorney Portal</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Availability</h1>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mt-2 max-w-lg">
          Set your weekly hours once. Clients pick from what's actually open — the site works out the rest.
        </p>
      </div>

      {/* Booking link */}
      <Card tone="raised" className="mb-5">
        <p className="ds-type-label text-[var(--text-3)] mb-3">Your booking page</p>
        {!attorney.slug ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Field
                label="Booking link"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder={slugify(attorney.name) || 'your-name'}
              />
            </div>
            <Button variant="primary" disabled={slugSaving} onClick={claimSlug} className="sm:self-end">
              {slugSaving && <Loader2 className="w-4 h-4 animate-spin" />} Claim link
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <code className="flex-1 rounded-[var(--radius-s)] border border-[var(--line)] bg-[var(--surface-sunk)] px-4 py-2.5 text-sm ds-type-body-m text-[var(--text)] truncate">
                {window.location.origin}/book/{attorney.slug}
              </code>
              <button onClick={copyLink} className="p-2.5 rounded-[var(--radius-s)] border border-[var(--line)] hover:border-[var(--accent)] transition-colors">
                {copied ? <Check className="w-4 h-4 text-[var(--accent)]" /> : <Copy className="w-4 h-4 text-[var(--text-3)]" />}
              </button>
              <a href={`/book/${attorney.slug}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-[var(--radius-s)] border border-[var(--line)] hover:border-[var(--accent)] transition-colors">
                <ExternalLink className="w-4 h-4 text-[var(--text-3)]" />
              </a>
            </div>
            <label className="flex items-center gap-2 text-sm ds-type-body-m text-[var(--text)]">
              <input type="checkbox" checked={published} onChange={togglePublish} className="w-4 h-4" style={{ accentColor: 'var(--accent)' }} />
              Published — clients can book this link
            </label>
          </div>
        )}
      </Card>

      {/* Weekly hours */}
      <Card tone="raised" className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="ds-type-label text-[var(--text-3)]">Weekly hours ({rules.timezone})</p>
          {saving && <Loader2 className="w-3.5 h-3.5 text-[var(--text-3)] animate-spin" />}
          {saved && <span className="text-xs text-[var(--accent)] ds-type-body-m">Saved</span>}
        </div>
        <div className="space-y-2">
          {WEEKDAYS.map(({ key, label }) => {
            const windows = rules.working_hours[key];
            return (
              <div key={key} className="flex items-center gap-3 py-2 border-b border-[var(--line)] last:border-0">
                <label className="flex items-center gap-2 w-32 shrink-0">
                  <input type="checkbox" checked={!!windows} onChange={() => toggleDay(key)} className="w-4 h-4" style={{ accentColor: 'var(--accent)' }} />
                  <span className="text-sm ds-type-body-m text-[var(--text)]">{label}</span>
                </label>
                {windows ? (
                  <div className="flex items-center gap-2">
                    <input type="time" value={windows[0][0]} onChange={(e) => setWindow(key, 0, 'start', e.target.value)} className="ds-field-input px-2 py-1.5 text-sm ds-type-body-m text-[var(--text)]" />
                    <span className="text-[var(--text-3)] text-sm">to</span>
                    <input type="time" value={windows[0][1]} onChange={(e) => setWindow(key, 0, 'end', e.target.value)} className="ds-field-input px-2 py-1.5 text-sm ds-type-body-m text-[var(--text)]" />
                  </div>
                ) : (
                  <span className="text-sm text-[var(--text-3)] ds-type-body-m">Not available</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Rules */}
      <Card tone="raised">
        <p className="ds-type-label text-[var(--text-3)] mb-4">Booking rules</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label="Buffer between consults (min)"
            type="number"
            min={0}
            value={rules.buffer_minutes}
            onChange={(e) => saveRules({ ...rules, buffer_minutes: +e.target.value })}
          />
          <Field
            label="Minimum notice (hours)"
            type="number"
            min={0}
            value={rules.min_notice_hours}
            onChange={(e) => saveRules({ ...rules, min_notice_hours: +e.target.value })}
          />
          <Field
            label="Daily cap (optional)"
            type="number"
            min={1}
            value={rules.daily_cap || ''}
            onChange={(e) => saveRules({ ...rules, daily_cap: e.target.value ? +e.target.value : null })}
            placeholder="No limit"
          />
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="ds-type-label text-[var(--text-2)]">Timezone</label>
          <select
            value={rules.timezone}
            onChange={(e) => saveRules({ ...rules, timezone: e.target.value })}
            className="ds-field-input ds-type-body-m h-11 w-full px-3 text-[var(--text)]"
          >
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </Card>
    </div>
  );
}
