import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import { deriveRole } from '@/lib/roleUtils';

function roleLabel(user) {
  const r = deriveRole(user);
  if (r === 'attorney') return 'Attorney';
  if (r === 'admin') return 'Admin';
  return 'Client';
}

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
      <div className="mb-5 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Admin</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Users</h1>
        <p className="text-sm text-[#8A8578] font-body mt-2">{clientCount} clients · {attorneyCount} attorneys · {users.length} total</p>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8578]" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search users…"
          className="w-full pl-9 pr-3 py-2.5 border border-[#E5E2DC] text-sm font-body outline-none focus:border-[#111418] bg-white"
        />
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2DC] p-10 text-center text-sm text-[#8A8578] font-body">No users.</div>
      ) : (
        <div className="bg-white border border-[#E5E2DC] divide-y divide-[#E5E2DC]">
          {filtered.map(u => (
            <div key={u.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-serif text-[#111418] truncate">{u.full_name || u.email}</p>
                {u.full_name && <p className="text-xs text-[#8A8578] font-body truncate">{u.email}</p>}
              </div>
              <span className="text-xs uppercase tracking-[0.08em] font-body text-[#8A8578]">{roleLabel(u)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}