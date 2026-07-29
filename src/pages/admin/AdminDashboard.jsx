import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ClipboardCheck, Scale, CalendarClock, Users, ArrowRight } from 'lucide-react';
import { Card } from '@/components/primitives';

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
    { icon: ClipboardCheck, label: 'Pending applications', value: stats.pending, to: '/admin/applications' },
    { icon: Scale, label: 'Verified attorneys', value: stats.verified, to: '/admin/attorneys' },
    { icon: CalendarClock, label: 'Total bookings', value: stats.bookings, to: '/admin/bookings' },
    { icon: Users, label: 'Total users', value: stats.users, to: '/admin/users' },
  ];

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {cards.map(({ icon: Icon, label, value, to }) => (
          <Link key={label} to={to} className="block group">
            <Card tone="raised" density="compact" className="p-5 h-full hover:border-[var(--line-2)] transition-colors">
              <Icon className="w-4 h-4 text-[var(--text-3)] mb-3" />
              <p className="ds-type-label text-[var(--text-3)] mb-2">{label}</p>
              <div className="text-3xl text-[var(--text)] leading-none [font-variant-numeric:tabular-nums]" style={{ fontFamily: 'var(--font-human)' }}>
                {loading ? '—' : value}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card tone="raised">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Recent pending applications</h2>
          <Link to="/admin/applications" className="text-xs text-[var(--accent)] ds-type-body-m hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-[var(--text-3)] ds-type-body-m py-4">Loading…</p>
        ) : recentPending.length === 0 ? (
          <p className="text-sm text-[var(--text-3)] ds-type-body-m py-8 text-center">No pending applications.</p>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {recentPending.map(a => (
              <Link key={a.id} to={`/admin/applications/${a.id}`} className="flex items-center justify-between py-3 text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                <div>
                  <p style={{ fontFamily: 'var(--font-human)' }}>{a.name}</p>
                  <p className="text-xs text-[var(--text-3)] ds-type-body-m">{a.bar_state} · Bar #{a.bar_number} · ${a.consult_fee}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-3)]" />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
