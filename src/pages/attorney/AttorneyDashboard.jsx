import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { computeMetrics } from '@/lib/metrics';
import { Card } from '@/components/primitives';
import MetricCards from '@/components/metrics/MetricCards';
import WeeklyBookingsChart from '@/components/metrics/WeeklyBookingsChart';

const statusColor = { pending: 'var(--pending)', confirmed: 'var(--confirmed)', completed: 'var(--completed)', declined: 'var(--text-3)', no_show: 'var(--noshow)' };

function slotOf(b) {
  return b.slot_start || b.slot;
}

export default function AttorneyDashboardPage() {
  const { attorney, firmAttorneyIds } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firm-wide, not just this login's own attorney row -- see
  // AttorneyBookings.jsx for the same fix and why.
  useEffect(() => {
    if (!firmAttorneyIds?.length) { setLoading(false); return; }
    (async () => {
      try {
        const { data, error } = await supabase.from('bookings').select('*').in('attorney_id', firmAttorneyIds);
        if (error) throw error;
        setBookings(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [firmAttorneyIds]);

  const upcoming = bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status))
    .sort((a, b) => new Date(slotOf(a)) - new Date(slotOf(b)));
  const newRequests = bookings.filter(b => b.status === 'pending');
  const metrics = computeMetrics(bookings);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-5 border-b border-[var(--line)]">
        <div>
          <p className="ds-type-label text-[var(--text-3)] mb-1">Attorney Portal</p>
          <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Dashboard</h1>
        </div>
        {attorney && (
          <div className="inline-flex items-center px-3 py-1.5 rounded-[var(--radius-full)] bg-[var(--surface-sunk)] text-[var(--accent)] text-xs ds-type-body-m">
            {attorney?.verified && attorney?.verified_date ? `License checked ${format(new Date(attorney.verified_date), 'MMM d, yyyy')}` : 'License check pending'}
          </div>
        )}
      </div>

      <MetricCards metrics={metrics} loading={loading} className="mb-6" />
      <WeeklyBookingsChart metrics={metrics} loading={loading} className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card tone="raised" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>New booking requests</h2>
            <Link to="/attorney/bookings" className="text-xs text-[var(--accent)] ds-type-body-m hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {newRequests.length === 0 ? (
            <p className="text-sm text-[var(--text-3)] ds-type-body-m py-8 text-center">No new requests. You're all caught up.</p>
          ) : (
            <div className="space-y-3">
              {newRequests.slice(0, 4).map(b => (
                <Link
                  key={b.id}
                  to="/attorney/bookings"
                  className="block rounded-[var(--radius-s)] border border-[var(--line)] p-4 hover:border-[var(--accent)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{b.client_name}</span>
                    <span className="text-xs uppercase tracking-[0.08em] ds-type-body-m" style={{ color: statusColor[b.status] || 'var(--text-3)' }}>{b.status}</span>
                  </div>
                  {slotOf(b) && (
                    <p className="text-sm text-[var(--text-3)] ds-type-body-m">
                      {format(new Date(slotOf(b)), 'EEE, MMM d · h:mm a')}
                    </p>
                  )}
                  {b.case_summary && (
                    <p
                      className="text-xs text-[var(--text)] ds-type-body-m mt-2 line-clamp-2 px-2 py-1.5 rounded-[var(--radius-xs)]"
                      style={{ backgroundColor: 'var(--surface-sunk)', borderLeft: '2px solid var(--accent)' }}
                    >
                      {b.case_summary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card tone="raised">
          {attorney ? (
            <>
              <h2 className="text-lg text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-human)' }}>Profile completeness</h2>
              <Completeness attorney={attorney} />
              <Link to="/attorney/profile" className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--accent)] ds-type-body-m hover:underline">
                Edit profile <ArrowRight className="w-3 h-3" />
              </Link>
              <div className="mt-6 pt-5 border-t border-[var(--line)]">
                <h3 className="ds-type-label text-[var(--text-3)] mb-2">Next consultation</h3>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-[var(--text-3)] ds-type-body-m">Nothing scheduled.</p>
                ) : (
                  <div>
                    <p className="text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{upcoming[0].client_name}</p>
                    <p className="text-sm text-[var(--text-3)] ds-type-body-m">{format(new Date(slotOf(upcoming[0])), 'EEE, MMM d · h:mm a')}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-human)' }}>Next consultation</h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-[var(--text-3)] ds-type-body-m">Nothing scheduled.</p>
              ) : (
                <div>
                  <p className="text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{upcoming[0].client_name}</p>
                  <p className="text-sm text-[var(--text-3)] ds-type-body-m">{format(new Date(slotOf(upcoming[0])), 'EEE, MMM d · h:mm a')}</p>
                </div>
              )}
            </>
          )}
        </Card>
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
        <span className="text-2xl text-[var(--text)] [font-variant-numeric:tabular-nums]" style={{ fontFamily: 'var(--font-human)' }}>{pct}%</span>
        <span className="text-xs text-[var(--text-3)] ds-type-body-m">{done}/{fields.length} complete</span>
      </div>
      <div className="h-2 rounded-[var(--radius-full)] overflow-hidden mb-3" style={{ backgroundColor: 'var(--surface-sunk)' }}>
        <div className="h-full rounded-[var(--radius-full)] transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
      </div>
      <ul className="space-y-1.5">
        {fields.map(f => (
          <li key={f.label} className="flex items-center gap-2 text-sm ds-type-body-m">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.ok ? 'var(--confirmed)' : 'var(--line-2)' }} />
            <span style={{ color: f.ok ? 'var(--text)' : 'var(--text-3)' }}>{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
