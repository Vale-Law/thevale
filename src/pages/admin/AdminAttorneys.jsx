import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, ShieldOff } from 'lucide-react';

export default function AdminAttorneysPage() {
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setAttorneys(await base44.entities.Attorney.list('-created_date', 300));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deactivate = async (a) => {
    if (!confirm(`Deactivate ${a.name}? They will no longer appear in client search.`)) return;
    setBusy(a.id);
    try {
      await base44.entities.Attorney.update(a.id, { verification_status: 'rejected', verified: false });
      await load();
    } finally {
      setBusy('');
    }
  };

  const verified = attorneys.filter(a => (a.verification_status || (a.verified ? 'verified' : 'pending')) === 'verified');
  const filtered = verified.filter(a => {
    if (!q) return true;
    const s = `${a.name} ${a.email} ${a.bar_state}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="mb-5 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Admin</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Attorneys</h1>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8578]" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search attorneys…"
          className="w-full pl-9 pr-3 py-2.5 border border-[#E5E2DC] text-sm font-body outline-none focus:border-[#111418] bg-white"
        />
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2DC] p-10 text-center text-sm text-[#8A8578] font-body">No verified attorneys.</div>
      ) : (
        <div className="bg-white border border-[#E5E2DC] divide-y divide-[#E5E2DC]">
          {filtered.map(a => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-serif text-[#111418]">{a.name}</p>
                <p className="text-xs text-[#8A8578] font-body">{a.email} · {a.bar_state} · ${(a.practice_areas || [a.practice_area]).join(', ')}</p>
              </div>
              <button
                onClick={() => deactivate(a)}
                disabled={busy === a.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E5E2DC] text-xs font-body text-[#8A8578] hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-40"
              >
                {busy === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                Deactivate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}