import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminApplicationsPage() {
  const [searchParams] = useSearchParams();
  const flash = searchParams.get('flash');
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Attorney.list('-created_date', 200);
      setAttorneys(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const status = (a) => a.verification_status || (a.verified ? 'verified' : 'pending');
  const counts = {
    pending: attorneys.filter(a => status(a) === 'pending').length,
    verified: attorneys.filter(a => status(a) === 'verified').length,
    rejected: attorneys.filter(a => a.verification_status === 'rejected').length,
  };
  const filtered = filter === 'all' ? attorneys : attorneys.filter(a => status(a) === filter);

  return (
    <div>
      <div className="mb-5 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Admin</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Attorney Applications</h1>
      </div>

      {flash && (
        <div className={`mb-4 flex items-center gap-2 px-4 py-3 border font-body text-sm ${
          flash === 'approved'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {flash === 'approved'
            ? <><CheckCircle2 className="w-4 h-4" /> Attorney approved — they've been emailed and can now log in to their dashboard.</>
            : <><XCircle className="w-4 h-4" /> Application rejected.</>
          }
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-5 border-b border-[#E5E2DC]">
        {[
          { key: 'pending', label: `Pending (${counts.pending})` },
          { key: 'verified', label: `Verified (${counts.verified})` },
          { key: 'rejected', label: `Rejected (${counts.rejected})` },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-body transition-colors ${
              filter === tab.key ? 'border-b-2 border-[#111418] text-[#111418]' : 'text-[#8A8578] hover:text-[#111418]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2DC] p-10 text-center text-sm text-[#8A8578] font-body">
          No {filter !== 'all' ? filter : ''} applications.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const s = status(a);
            return (
              <Link key={a.id} to={`/admin/applications/${a.id}`} className="block bg-white border border-[#E5E2DC] p-5 hover:border-[#0a5dc2] transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif text-lg text-[#111418]">{a.name}</span>
                      <span className={`text-xs uppercase tracking-[0.08em] font-body ${s === 'pending' ? 'text-yellow-600' : s === 'verified' ? 'text-green-600' : 'text-red-600'}`}>{s}</span>
                    </div>
                    <p className="text-sm text-[#8A8578] font-body">{a.email}</p>
                    <p className="text-xs text-[#8A8578] font-body">{a.bar_state} · Bar #{a.bar_number} · {(a.practice_areas || [a.practice_area]).join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl text-[#111418]">${a.consult_fee}</span>
                    <ArrowRight className="w-4 h-4 text-[#8A8578]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}