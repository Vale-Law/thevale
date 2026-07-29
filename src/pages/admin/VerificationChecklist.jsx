import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, Link2 } from 'lucide-react';
import { Button, Card, Field } from '@/components/primitives';

/**
 * F-05 admin verification checklist (Sprint v1.2 Track B, W2.1).
 *
 * Backed by attorney_verification_records / attorney_verification_evidence
 * (Shared Contract 2.2, admin-only writes via RLS). This is the ONE action
 * path allowed to update attorneys.verification_status (Shared Contract
 * 2.3) — the record decision drives the fast-path column so the two never
 * drift. isAttorneyVerified() and every RLS policy keep reading the
 * fast-path column untouched.
 *
 * The record is created lazily on the first checklist action, not on view,
 * so merely opening an application never writes.
 *
 * Known contract gap, logged in the Track B log: the 2.2 schema has no
 * rejection/remediation-reason column, so no reason field is offered here —
 * adding one is a schema escalation, not a local fix.
 */

const CHECK_ITEMS = [
  { field: 'bar_status_verified_at', label: 'Bar status', hint: 'Active bar status checked against the official state bar directory.' },
  { field: 'identity_verified_at', label: 'Identity', hint: 'Government ID matches the applicant and the bar record.' },
  { field: 'profile_attested_at', label: 'Profile attestation', hint: 'Attorney attested their profile (fee, formats, practice areas) is accurate.' },
];

const EVIDENCE_TYPES = [
  { value: 'bar_directory', label: 'Bar directory listing' },
  { value: 'state_id', label: 'State ID' },
  { value: 'bar_card', label: 'Bar card' },
  { value: 'other', label: 'Other' },
];

function plusOneYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export default function VerificationChecklist({ attorney, onApproved, onRejected }) {
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [renewal, setRenewal] = useState('');
  const [eviType, setEviType] = useState('bar_directory');
  const [eviUri, setEviUri] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('attorney_verification_records')
        .select('*')
        .eq('attorney_id', attorney.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (err) throw err;
      setRecord(data || null);
      setRenewal(data?.renewal_date || '');
      if (data) {
        const { data: evi, error: eviErr } = await supabase
          .from('attorney_verification_evidence')
          .select('*')
          .eq('verification_record_id', data.id)
          .order('uploaded_at', { ascending: true });
        if (eviErr) throw eviErr;
        setEvidence(evi || []);
      } else {
        setEvidence([]);
      }
      setError('');
    } catch (e) {
      setError(e.message || 'Could not load the verification record.');
    } finally {
      setLoading(false);
    }
  }, [attorney.id]);

  useEffect(() => { load(); }, [load]);

  // Lazily create the record on the first write, never on view.
  const ensureRecord = async () => {
    if (record) return record;
    const { data, error: err } = await supabase
      .from('attorney_verification_records')
      .insert({ attorney_id: attorney.id, reviewer_id: user?.id || null })
      .select()
      .single();
    if (err) throw err;
    setRecord(data);
    return data;
  };

  const patchRecord = async (patch, busyKey) => {
    setBusy(busyKey);
    setError('');
    try {
      const rec = await ensureRecord();
      const { data, error: err } = await supabase
        .from('attorney_verification_records')
        .update({ ...patch, reviewer_id: user?.id || rec.reviewer_id, updated_at: new Date().toISOString() })
        .eq('id', rec.id)
        .select()
        .single();
      if (err) throw err;
      setRecord(data);
      return data;
    } catch (e) {
      setError(e.message || 'Update failed.');
      throw e;
    } finally {
      setBusy('');
    }
  };

  const toggleItem = async (field) => {
    const next = record?.[field] ? null : new Date().toISOString();
    try { await patchRecord({ [field]: next }, field); } catch { /* surfaced via error state */ }
  };

  const saveRenewal = async () => {
    try { await patchRecord({ renewal_date: renewal || null }, 'renewal'); } catch { /* surfaced */ }
  };

  const addEvidence = async () => {
    if (!eviUri.trim()) return;
    setBusy('evidence');
    setError('');
    try {
      const rec = await ensureRecord();
      const { error: err } = await supabase
        .from('attorney_verification_evidence')
        .insert({ verification_record_id: rec.id, evidence_type: eviType, evidence_uri: eviUri.trim() });
      if (err) throw err;
      setEviUri('');
      await load();
    } catch (e) {
      setError(e.message || 'Could not link evidence.');
    } finally {
      setBusy('');
    }
  };

  // Auto-link the uploaded application documents as evidence on approval so
  // the audit trail always carries what the decision was based on.
  const linkDocumentEvidence = async (rec) => {
    const docs = [
      attorney.id_document ? { evidence_type: 'state_id', evidence_uri: attorney.id_document } : null,
      attorney.bar_card_document ? { evidence_type: 'bar_card', evidence_uri: attorney.bar_card_document } : null,
    ].filter(Boolean);
    const missing = docs.filter(d => !evidence.some(e => e.evidence_uri === d.evidence_uri));
    if (missing.length === 0) return;
    await supabase
      .from('attorney_verification_evidence')
      .insert(missing.map(d => ({ ...d, verification_record_id: rec.id })));
  };

  const allChecked = CHECK_ITEMS.every(i => record?.[i.field]);

  const approve = async () => {
    setBusy('approve');
    setError('');
    try {
      const rec = await patchRecord(
        { status: 'verified', renewal_date: renewal || plusOneYear() },
        'approve'
      );
      await linkDocumentEvidence(rec);
      // The one allowed fast-path update (Shared Contract 2.3).
      const today = new Date().toISOString().split('T')[0];
      const { error: err } = await supabase
        .from('attorneys')
        .update({ verification_status: 'verified', verified: true, verified_date: today })
        .eq('id', attorney.id);
      if (err) throw err;
      await onApproved?.();
    } catch (e) {
      setError(e.message || 'Approval failed.');
      setBusy('');
    }
  };

  const reject = async () => {
    setBusy('reject');
    setError('');
    try {
      await patchRecord({ status: 'rejected' }, 'reject');
      const { error: err } = await supabase
        .from('attorneys')
        .update({ verification_status: 'rejected', verified: false })
        .eq('id', attorney.id);
      if (err) throw err;
      await onRejected?.();
    } catch (e) {
      setError(e.message || 'Rejection failed.');
      setBusy('');
    }
  };

  const pending = (attorney.verification_status || (attorney.verified ? 'verified' : 'pending')) === 'pending';

  if (loading) {
    return (
      <Card tone="raised" className="mb-5">
        <p className="ds-type-label text-[var(--text-3)] mb-3">Verification checklist</p>
        <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" /></div>
      </Card>
    );
  }

  return (
    <Card tone="raised" className="mb-5">
      <p className="ds-type-label text-[var(--text-3)] mb-3">Verification checklist</p>

      {error && (
        <p
          className="mb-3 px-3 py-2 rounded-[var(--radius-s)] border text-xs ds-type-body-m"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--noshow) 10%, transparent)',
            borderColor: 'var(--noshow)',
            color: 'var(--noshow)',
          }}
        >
          {error}
        </p>
      )}

      <div className="divide-y divide-[var(--line)]">
        {CHECK_ITEMS.map(item => {
          const at = record?.[item.field];
          return (
            <div key={item.field} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm text-[var(--text)] ds-type-body-m flex items-center gap-1.5">
                  {at
                    ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--confirmed)]" />
                    : <span className="w-4 h-4 shrink-0 rounded-[var(--radius-full)] border border-[var(--line-2)] inline-block" aria-hidden="true" />}
                  {item.label}
                  {at && <span className="text-xs text-[var(--text-3)]">· verified {format(new Date(at), 'MMM yyyy')}</span>}
                </p>
                <p className="text-xs text-[var(--text-3)] ds-type-body-m mt-0.5">{item.hint}</p>
              </div>
              <Button
                variant="secondary"
                size="compact"
                onClick={() => toggleItem(item.field)}
                disabled={!!busy || !pending}
                className="text-xs"
              >
                {busy === item.field ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (at ? 'Clear' : 'Mark verified')}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--line)] grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Field
            label="Renewal date"
            type="date"
            value={renewal}
            onChange={e => setRenewal(e.target.value)}
            hint="Re-verification due date. Defaults to one year out on approval."
            disabled={!!busy}
          />
          <div className="mt-2">
            <Button variant="ghost" size="compact" onClick={saveRenewal} disabled={!!busy || (record?.renewal_date || '') === (renewal || '')} className="text-xs">
              {busy === 'renewal' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save renewal date'}
            </Button>
          </div>
        </div>
        <div>
          <p className="ds-type-label text-[var(--text-2)] mb-1.5">Evidence</p>
          {evidence.length === 0 ? (
            <p className="text-xs text-[var(--text-3)] ds-type-body-m mb-2">Nothing linked yet. Application documents are linked automatically on approval.</p>
          ) : (
            <ul className="mb-2 space-y-1">
              {evidence.map(e => (
                <li key={e.id} className="text-xs ds-type-body-m flex items-center gap-1.5 min-w-0">
                  <Link2 className="w-3 h-3 shrink-0 text-[var(--text-3)]" />
                  <span className="text-[var(--text-3)] shrink-0">{EVIDENCE_TYPES.find(t => t.value === e.evidence_type)?.label || e.evidence_type}</span>
                  <span className="text-[var(--text)] truncate">{e.evidence_uri}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end gap-2">
            <div className="w-36 shrink-0">
              <label className="ds-type-label text-[var(--text-2)] block mb-1.5" htmlFor="evi-type">Type</label>
              <select
                id="evi-type"
                value={eviType}
                onChange={e => setEviType(e.target.value)}
                className="ds-type-body-m ds-field-input h-11 w-full px-3"
                disabled={!!busy}
              >
                {EVIDENCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <Field
                label="Link"
                value={eviUri}
                onChange={e => setEviUri(e.target.value)}
                placeholder="https://…"
                disabled={!!busy}
              />
            </div>
            <Button variant="secondary" size="compact" onClick={addEvidence} disabled={!!busy || !eviUri.trim()} className="mb-0.5">
              {busy === 'evidence' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
            </Button>
          </div>
        </div>
      </div>

      {pending && (
        <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={approve} disabled={!!busy || !allChecked}>
            {busy === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify &amp; approve
          </Button>
          <Button variant="destructive" confirmLabel="Reject this application?" onClick={reject} disabled={!!busy}>
            {busy === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </Button>
          {!allChecked && (
            <span className="text-xs text-[var(--text-3)] ds-type-body-m">All three checks must be recorded before approval.</span>
          )}
        </div>
      )}
    </Card>
  );
}
