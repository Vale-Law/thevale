import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Card, StatusDot } from '@/components/primitives';

// Application-review statuses mapped onto DS v2 semantic status tokens
// (StatusDot keys): pending -> --pending, verified -> --confirmed,
// rejected -> --noshow. Labels stay explicit so color never stands alone.
const APP_STATUS = {
  pending: { dot: 'pending', color: 'var(--pending)', label: 'Pending' },
  verified: { dot: 'confirmed', color: 'var(--confirmed)', label: 'Approved' },
  rejected: { dot: 'no_show', color: 'var(--noshow)', label: 'Rejected' },
};

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
      <div className="mb-5 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Attorney Applications</h1>
      </div>

      {flash && (
        <div
          className="mb-4 flex items-center gap-2 px-4 py-3 border rounded-[var(--radius-m)] ds-type-body-m text-sm"
          style={
            flash === 'approved'
              ? {
                  backgroundColor: 'color-mix(in srgb, var(--confirmed) 10%, transparent)',
                  borderColor: 'var(--confirmed)',
                  color: 'var(--confirmed)',
                }
              : {
                  backgroundColor: 'color-mix(in srgb, var(--noshow) 10%, transparent)',
                  borderColor: 'var(--noshow)',
                  color: 'var(--noshow)',
                }
          }
        >
          {flash === 'approved'
            ? <><CheckCircle2 className="w-4 h-4" /> Attorney approved — they've been emailed and can now log in to their dashboard.</>
            : <><XCircle className="w-4 h-4" /> Application rejected.</>
          }
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-5 border-b border-[var(--line)]">
        {[
          { key: 'pending', label: `Pending (${counts.pending})` },
          { key: 'verified', label: `Verified (${counts.verified})` },
          { key: 'rejected', label: `Rejected (${counts.rejected})` },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm ds-type-body-m transition-colors ${
              filter === tab.key
                ? 'border-b-2 border-[var(--accent)] text-[var(--text)]'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card tone="raised" className="p-10 text-center text-sm text-[var(--text-3)] ds-type-body-m">
          No {filter !== 'all' ? filter : ''} applications.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const s = APP_STATUS[status(a)] || APP_STATUS.pending;
            return (
              <Link key={a.id} to={`/admin/applications/${a.id}`} className="block group">
                <Card tone="raised" density="compact" className="p-5 hover:border-[var(--line-2)] transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{a.name}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <StatusDot status={s.dot} className="h-1.5 w-1.5" />
                          <span className="text-[11px] uppercase tracking-[0.14em] ds-type-body-m" style={{ color: s.color }}>{s.label}</span>
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-3)] ds-type-body-m">{a.email}</p>
                      <p className="text-xs text-[var(--text-3)] ds-type-body-m">{a.bar_state} · Bar #{a.bar_number} · {(a.practice_areas || [a.practice_area]).filter(Boolean).join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>${a.consult_fee}</span>
                      <ArrowRight className="w-4 h-4 text-[var(--text-3)]" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
