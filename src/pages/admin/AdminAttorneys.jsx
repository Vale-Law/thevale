import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldOff } from 'lucide-react';
import { Button, Card, Field } from '@/components/primitives';

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

  // Confirmation is the destructive Button's own double-click confirm --
  // no window.confirm() on top of it.
  const deactivate = async (a) => {
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
      <div className="mb-5 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Attorneys</h1>
      </div>

      <div className="mb-4 max-w-sm">
        <Field
          label="Search"
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Name, email, or bar state"
        />
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card tone="raised" className="p-10 text-center text-sm text-[var(--text-3)] ds-type-body-m">No verified attorneys.</Card>
      ) : (
        <Card tone="raised" className="p-0 divide-y divide-[var(--line)] overflow-hidden">
          {filtered.map(a => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{a.name}</p>
                <p className="text-xs text-[var(--text-3)] ds-type-body-m">{a.email} · {a.bar_state} · {(a.practice_areas || [a.practice_area]).filter(Boolean).join(', ')}</p>
              </div>
              <Button
                variant="destructive"
                size="compact"
                confirmLabel={`Deactivate ${a.name}?`}
                onClick={() => deactivate(a)}
                disabled={busy === a.id}
                className="text-xs"
              >
                {busy === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                Deactivate
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
