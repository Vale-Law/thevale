import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, XCircle, FileText, ExternalLink, ArrowLeft } from 'lucide-react';

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
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>;
  }
  if (!attorney) {
    return (
      <div>
        <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-[#0a5dc2] font-body hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>
        <p className="text-sm text-[#8A8578] font-body">Application not found.</p>
      </div>
    );
  }

  const status = attorney.verification_status || (attorney.verified ? 'verified' : 'pending');
  const statusColor = { pending: 'text-yellow-600', verified: 'text-green-600', rejected: 'text-red-600' }[status];

  return (
    <div>
      <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-[#0a5dc2] font-body hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to applications
      </Link>

      <div className="mb-6 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Admin</p>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">{attorney.name}</h1>
          <span className={`text-xs uppercase tracking-[0.08em] font-body ${statusColor}`}>{status}</span>
        </div>
        <p className="text-sm text-[#8A8578] font-body mt-1">{attorney.email}</p>
      </div>

      <div className="bg-white border border-[#E5E2DC] p-6 mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm">
          <Field label="Bar number" value={attorney.bar_number} />
          <Field label="Bar state" value={attorney.bar_state} />
          <Field label="Phone" value={attorney.phone_number} />
          <Field label="Consultation fee" value={`$${attorney.consult_fee}`} />
          <Field label="Practice area(s)" value={(attorney.practice_areas || [attorney.practice_area]).join(', ')} />
          <Field label="Office location" value={attorney.office_location} />
        </div>
      </div>

      <div className="bg-white border border-[#E5E2DC] p-6 mb-5">
        <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-3">Verification documents</p>
        <div className="flex flex-wrap gap-3">
          {attorney.id_document ? (
            <button onClick={() => viewDoc(attorney.id_document)} className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E2DC] text-sm font-body text-[#111418] hover:border-[#0a5dc2] hover:text-[#0a5dc2] transition-colors">
              <FileText className="w-4 h-4" /> State ID <ExternalLink className="w-3 h-3" />
            </button>
          ) : <span className="text-sm text-[#8A8578] font-body">No ID uploaded</span>}
          {attorney.bar_card_document ? (
            <button onClick={() => viewDoc(attorney.bar_card_document)} className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E2DC] text-sm font-body text-[#111418] hover:border-[#0a5dc2] hover:text-[#0a5dc2] transition-colors">
              <FileText className="w-4 h-4" /> Bar card <ExternalLink className="w-3 h-3" />
            </button>
          ) : <span className="text-sm text-[#8A8578] font-body">No bar card uploaded</span>}
        </div>
        <p className="text-xs text-[#8A8578] font-body mt-3">Tip: cross-check the name and bar number against your state's bar directory before approving.</p>
      </div>

      {status === 'pending' && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={approve}
            disabled={!!busy}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111418] text-white text-sm font-body hover:bg-[#0a5dc2] transition-colors disabled:opacity-40"
          >
            {busy === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Verify & approve
          </button>
          <button
            onClick={reject}
            disabled={!!busy}
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#E5E2DC] text-[#8A8578] text-sm font-body hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            {busy === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      )}
      {status === 'verified' && (
        <div className="inline-flex items-center gap-2 text-sm text-green-600 font-body">
          <CheckCircle2 className="w-4 h-4" /> Approved{attorney.verified_date ? ` on ${attorney.verified_date}` : ''}
        </div>
      )}
      {status === 'rejected' && (
        <div className="inline-flex items-center gap-2 text-sm text-red-600 font-body">
          <XCircle className="w-4 h-4" /> Rejected
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-1">{label}</p>
      <p className="text-[#111418] font-body">{value || '—'}</p>
    </div>
  );
}