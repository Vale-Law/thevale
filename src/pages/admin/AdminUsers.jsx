import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { deriveRole } from '@/lib/roleUtils';
import { Card, Field } from '@/components/primitives';

// Role chip colors on existing tokens, mirroring the export's
// green/amber/grey mapping. staff is new in v1.2 (Track A's W0b) and
// uses --brass, the DS's existing secondary accent.
const ROLE = {
  attorney: { color: 'var(--confirmed)', label: 'Attorney' },
  admin: { color: 'var(--pending)', label: 'Admin' },
  staff: { color: 'var(--brass)', label: 'Staff' },
  client: { color: 'var(--completed)', label: 'Client' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    base44.entities.User.list('-created_date', 300)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    if (!q) return true;
    return `${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(q.toLowerCase());
  });

  const clientCount = users.filter(u => deriveRole(u) === 'client').length;
  const attorneyCount = users.filter(u => deriveRole(u) === 'attorney').length;

  return (
    <div>
      <div className="mb-5 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Users</h1>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mt-2">{clientCount} clients · {attorneyCount} attorneys · {users.length} total</p>
      </div>

      <div className="mb-4 max-w-sm">
        <Field
          label="Search"
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Name or email"
        />
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card tone="raised" className="p-10 text-center text-sm text-[var(--text-3)] ds-type-body-m">No users.</Card>
      ) : (
        <Card tone="raised" className="p-0 divide-y divide-[var(--line)] overflow-hidden">
          {filtered.map(u => {
            const r = ROLE[deriveRole(u)] || ROLE.client;
            return (
              <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-[var(--text)] truncate" style={{ fontFamily: 'var(--font-human)' }}>{u.full_name || u.email}</p>
                  {u.full_name && <p className="text-xs text-[var(--text-3)] ds-type-body-m truncate">{u.email}</p>}
                </div>
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="inline-block h-1.5 w-1.5 shrink-0 rounded-[var(--radius-full)]" style={{ backgroundColor: r.color }} />
                  <span className="text-[11px] uppercase tracking-[0.14em] ds-type-body-m" style={{ color: r.color }}>{r.label}</span>
                </span>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
