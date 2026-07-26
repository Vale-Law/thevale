import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ClipboardCheck, Scale, CalendarClock, Users, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ pending: 0, verified: 0, bookings: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [recentPending, setRecentPending] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [attorneys, bookings, users] = await Promise.all([
          base44.entities.Attorney.list('-created_date', 200),
          base44.entities.Booking.list('-created_date', 200),
          base44.entities.User.list('-created_date', 200),
        ]);
        const status = (a) => a.verification_status || (a.verified ? 'verified' : 'pending');
        const pending = attorneys.filter(a => status(a) === 'pending');
        setStats({
          pending: pending.length,
          verified: attorneys.filter(a => status(a) === 'verified').length,
          bookings: bookings.length,
          users: users.length,
        });
        setRecentPending(pending.slice(0, 5));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { icon: ClipboardCheck, label: 'Pending applications', value: stats.pending, to: '/admin/applications', accent: '#0a5dc2' },
    { icon: Scale, label: 'Verified attorneys', value: stats.verified, to: '/admin/attorneys' },
    { icon: CalendarClock, label: 'Total bookings', value: stats.bookings, to: '/admin/bookings' },
    { icon: Users, label: 'Total users', value: stats.users, to: '/admin/users' },
  ];

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Admin</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5E2DC] mb-8">
        {cards.map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to} className="bg-white p-5 hover:bg-[#F7F8FA] transition-colors group">
            <Icon className="w-4 h-4 text-[#8A8578] mb-3" />
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">{label}</p>
            <div className="font-serif text-3xl text-[#111418] leading-none">{loading ? '—' : value}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#E5E2DC] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-[#111418]">Recent pending applications</h2>
          <Link to="/admin/applications" className="text-xs text-[#0a5dc2] font-body hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-[#8A8578] font-body py-4">Loading…</p>
        ) : recentPending.length === 0 ? (
          <p className="text-sm text-[#8A8578] font-body py-8 text-center">No pending applications.</p>
        ) : (
          <div className="divide-y divide-[#E5E2DC]">
            {recentPending.map(a => (
              <Link key={a.id} to={`/admin/applications/${a.id}`} className="flex items-center justify-between py-3 hover:text-[#0a5dc2] transition-colors">
                <div>
                  <p className="font-serif text-[#111418]">{a.name}</p>
                  <p className="text-xs text-[#8A8578] font-body">{a.bar_state} · Bar #{a.bar_number} · ${a.consult_fee}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8578]" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}