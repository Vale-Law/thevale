import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, XCircle, FileText, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button, Card, StatusDot } from '@/components/primitives';

const APP_STATUS = {
  pending: { dot: 'pending', color: 'var(--pending)', label: 'Pending' },
  verified: { dot: 'confirmed', color: 'var(--confirmed)', label: 'Approved' },
  rejected: { dot: 'no_show', color: 'var(--noshow)', label: 'Rejected' },
};

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attorney, setAttorney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!id) return;
    base44.entities.Attorney.get(id)
      .then(setAttorney)
      .catch(() => setAttorney(null))
      .finally(() => setLoading(false));
  }, [id]);

  const viewDoc = async (uri) => {
    try {
      const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      window.open(res.signed_url, '_blank');
    } catch (e) {
      alert('Could not load document: ' + (e.message || 'unknown error'));
    }
  };

  const approve = async () => {
    setBusy('approve');
    try {
      const today = new Date().toISOString().split('T')[0];
      await base44.entities.Attorney.update(id, { verification_status: 'verified', verified: true, verified_date: today });
      try {
        await base44.integrations.Core.SendEmail({
          to: attorney.email,
          subject: "You're approved — welcome to Brief!",
          body: `Hi ${attorney.name},\n\nGreat news — your Brief application has been approved! You're now a verified attorney on Brief.\n\nLog in to your dashboard to complete your profile, set your availability, and start receiving clients.\n\nWelcome aboard!\n\nThe Brief Team`,
        });
      } catch (e) { console.error('Approval email failed:', e); }
      navigate('/admin/applications?flash=approved');
    } catch (e) {
      alert('Failed to verify: ' + (e.message || 'unknown error'));
      setBusy('');
    }
  };

  const reject = async () => {
    setBusy('reject');
    try {
      await base44.entities.Attorney.update(id, { verification_status: 'rejected', verified: false });
      navigate('/admin/applications?flash=rejected');
    } catch (e) {
      alert('Failed to reject: ' + (e.message || 'unknown error'));
      setBusy('');
    }
  };

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>;
  }
  if (!attorney) {
    return (
      <div>
        <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] ds-type-body-m hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m">Application not found.</p>
      </div>
    );
  }

  const status = attorney.verification_status || (attorney.verified ? 'verified' : 'pending');
  const s = APP_STATUS[status] || APP_STATUS.pending;

  return (
    <div>
      <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] ds-type-body-m hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to applications
      </Link>

      <div className="mb-6 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Admin</p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{attorney.name}</h1>
          <span className="inline-flex items-center gap-1.5">
            <StatusDot status={s.dot} className="h-1.5 w-1.5" />
            <span className="text-[11px] uppercase tracking-[0.14em] ds-type-body-m" style={{ color: s.color }}>{s.label}</span>
          </span>
        </div>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mt-1">{attorney.email}</p>
      </div>

      <Card tone="raised" className="mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm">
          <Field label="Bar number" value={attorney.bar_number} />
          <Field label="Bar state" value={attorney.bar_state} />
          <Field label="Phone" value={attorney.phone_number} />
          <Field label="Consultation fee" value={`$${attorney.consult_fee}`} />
          <Field label="Practice area(s)" value={(attorney.practice_areas || [attorney.practice_area]).filter(Boolean).join(', ')} />
          <Field label="Office location" value={attorney.office_location} />
        </div>
      </Card>

      <Card tone="raised" className="mb-5">
        <p className="ds-type-label text-[var(--text-3)] mb-3">Verification documents</p>
        <div className="flex flex-wrap gap-3">
          {attorney.id_document ? (
            <Button variant="secondary" size="compact" onClick={() => viewDoc(attorney.id_document)}>
              <FileText className="w-4 h-4" /> State ID <ExternalLink className="w-3 h-3" />
            </Button>
          ) : <span className="text-sm text-[var(--text-3)] ds-type-body-m">No ID uploaded</span>}
          {attorney.bar_card_document ? (
            <Button variant="secondary" size="compact" onClick={() => viewDoc(attorney.bar_card_document)}>
              <FileText className="w-4 h-4" /> Bar card <ExternalLink className="w-3 h-3" />
            </Button>
          ) : <span className="text-sm text-[var(--text-3)] ds-type-body-m">No bar card uploaded</span>}
        </div>
        <p className="text-xs text-[var(--text-3)] ds-type-body-m mt-3">Tip: cross-check the name and bar number against your state's bar directory before approving.</p>
      </Card>

      {status === 'pending' && (
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={approve} disabled={!!busy}>
            {busy === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify &amp; approve
          </Button>
          <Button variant="destructive" confirmLabel="Reject this application?" onClick={reject} disabled={!!busy}>
            {busy === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </Button>
        </div>
      )}
      {status === 'verified' && (
        <div className="inline-flex items-center gap-2 text-sm text-[var(--confirmed)] ds-type-body-m">
          <CheckCircle2 className="w-4 h-4" /> Approved{attorney.verified_date ? ` on ${attorney.verified_date}` : ''}
        </div>
      )}
      {status === 'rejected' && (
        <div className="inline-flex items-center gap-2 text-sm text-[var(--noshow)] ds-type-body-m">
          <XCircle className="w-4 h-4" /> Rejected
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="ds-type-label text-[var(--text-3)] mb-1">{label}</p>
      <p className="text-[var(--text)] ds-type-body-m">{value || '—'}</p>
    </div>
  );
}
