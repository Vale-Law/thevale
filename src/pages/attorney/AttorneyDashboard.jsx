import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Users, CalendarClock, Star, TrendingUp, ArrowRight } from 'lucide-react';

const statusColors = { pending: 'text-yellow-600', confirmed: 'text-green-600', completed: 'text-blue-600', declined: 'text-red-600' };

export default function AttorneyDashboardPage() {
  const { attorney } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attorney?.id) return;
    base44.entities.Booking.filter({ attorney_id: attorney.id })
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [attorney?.id]);

  const upcoming = bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status))
    .sort((a, b) => new Date(a.slot) - new Date(b.slot));
  const newRequests = bookings.filter(b => b.status === 'pending');

  const metrics = [
    { icon: Users, label: 'Total bookings', value: bookings.length },
    { icon: CalendarClock, label: 'Upcoming', value: upcoming.length },
    { icon: Star, label: 'Avg rating', value: `${attorney?.rating || 0}★` },
    { icon: TrendingUp, label: 'Reviews', value: attorney?.review_count || 0 },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-5 border-b border-[#E5E2DC]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Attorney Portal</p>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Dashboard</h1>
        </div>
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#EAF2FB] text-[#0a5dc2] text-xs font-body">
          {attorney?.verified && attorney?.verified_date ? `License checked ${format(new Date(attorney.verified_date), 'MMM d, yyyy')}` : 'License check pending'}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#E5E2DC] mb-8">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white p-5">
            <Icon className="w-4 h-4 text-[#8A8578] mb-3" />
            <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">{label}</p>
            <div className="font-serif text-3xl text-[#111418] leading-none">{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E5E2DC] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[#111418]">New booking requests</h2>
            <Link to="/attorney/bookings" className="text-xs text-[#0a5dc2] font-body hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {newRequests.length === 0 ? (
            <p className="text-sm text-[#8A8578] font-body py-8 text-center">No new requests. You're all caught up.</p>
          ) : (
            <div className="space-y-3">
              {newRequests.slice(0, 4).map(b => (
                <Link key={b.id} to="/attorney/bookings" className="block border border-[#E5E2DC] p-4 hover:border-[#0a5dc2] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-[#111418]">{b.client_name}</span>
                    <span className={`text-xs uppercase tracking-[0.08em] font-body ${statusColors[b.status] || ''}`}>{b.status}</span>
                  </div>
                  {b.slot && (
                    <p className="text-sm text-[#8A8578] font-body">
                      {format(new Date(b.slot), 'EEE, MMM d · h:mm a')}
                    </p>
                  )}
                  {b.case_summary && (
                    <p className="text-xs text-[#111418] font-body mt-2 line-clamp-2 bg-[#EAF2FB] border-l-2 border-[#0a5dc2] px-2 py-1.5">{b.case_summary}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E5E2DC] p-6">
          <h2 className="font-serif text-lg text-[#111418] mb-4">Profile completeness</h2>
          <Completeness attorney={attorney} />
          <Link to="/attorney/profile" className="mt-4 inline-flex items-center gap-1 text-xs text-[#0a5dc2] font-body hover:underline">
            Edit profile <ArrowRight className="w-3 h-3" />
          </Link>
          <div className="mt-6 pt-5 border-t border-[#E5E2DC]">
            <h3 className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-2">Next consultation</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-[#8A8578] font-body">Nothing scheduled.</p>
            ) : (
              <div>
                <p className="font-serif text-[#111418]">{upcoming[0].client_name}</p>
                <p className="text-sm text-[#8A8578] font-body">{format(new Date(upcoming[0].slot), 'EEE, MMM d · h:mm a')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Completeness({ attorney }) {
  const fields = [
    { label: 'Bio', ok: !!attorney?.bio },
    { label: 'Photo', ok: !!attorney?.photo },
    { label: 'Consultation fee', ok: !!attorney?.consult_fee },
    { label: 'Office location', ok: !!attorney?.office_location },
    { label: 'Availability slots', ok: (attorney?.available_slots || []).length > 0 },
    { label: 'Languages', ok: (attorney?.languages_spoken || []).length > 0 },
  ];
  const done = fields.filter(f => f.ok).length;
  const pct = Math.round((done / fields.length) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-serif text-2xl text-[#111418]">{pct}%</span>
        <span className="text-xs text-[#8A8578] font-body">{done}/{fields.length} complete</span>
      </div>
      <div className="h-2 bg-[#F4F2EE] rounded-full overflow-hidden mb-3">
        <div className="h-full bg-[#0a5dc2] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-1.5">
        {fields.map(f => (
          <li key={f.label} className="flex items-center gap-2 text-sm font-body">
            <span className={`w-1.5 h-1.5 rounded-full ${f.ok ? 'bg-green-500' : 'bg-[#D8D4CC]'}`} />
            <span className={f.ok ? 'text-[#111418]' : 'text-[#8A8578]'}>{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}