import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { ArrowRight, ChevronDown, Link2, Check } from 'lucide-react';
import { computeMetrics } from '@/lib/metrics';
import { Card } from '@/components/primitives';
import PortalTopBar from '@/components/metrics/PortalTopBar';
import MetricCards from '@/components/metrics/MetricCards';
import WeeklyBookingsChart from '@/components/metrics/WeeklyBookingsChart';
import { ConfirmationRateCard, CompletedConsultsCard, AverageConsultsCard, TasksCard } from '@/components/metrics/DashboardSideCards';

const statusColor = { pending: 'var(--pending)', confirmed: 'var(--confirmed)', completed: 'var(--completed)', declined: 'var(--text-3)', no_show: 'var(--noshow)' };

const REQUEST_FILTERS = [
  { value: 'pending', label: 'Pending requests' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_show', label: 'No-show' },
  { value: 'all', label: 'All bookings' },
];

function slotOf(b) {
  return b.slot_start || b.slot;
}

export default function AttorneyDashboardPage() {
  const { attorney, firmAttorneyIds } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState('pending');
  const [copied, setCopied] = useState(false);

  // Firm-wide, not just this login's own attorney row -- see
  // AttorneyBookings.jsx for the same fix and why. Unchanged from before
  // this retrofit: same query, same state shape.
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
  const metrics = computeMetrics(bookings);

  // Default filter ('pending') reproduces exactly what this card showed
  // before the retrofit -- the dropdown only adds the ability to look at
  // other statuses from the same already-loaded list, never a new query.
  const filteredRequests = useMemo(
    () => (requestFilter === 'all' ? bookings : bookings.filter(b => b.status === requestFilter))
      .sort((a, b) => new Date(slotOf(b) || 0) - new Date(slotOf(a) || 0)),
    [bookings, requestFilter]
  );

  const copyBookingLink = async () => {
    if (!attorney?.slug) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/book/${attorney.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard denied -- non-fatal, button just doesn't confirm */ }
  };

  return (
    <div className="space-y-4">
      <PortalTopBar />

      <MetricCards metrics={metrics} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <WeeklyBookingsChart bookings={bookings} loading={loading} />

          <Card tone="raised">
            <p className="ds-type-label text-[var(--text-3)]">The pipeline</p>
            <div className="flex items-end justify-between gap-4 mb-4 mt-1">
              <h2 className="text-xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>
                {REQUEST_FILTERS.find(f => f.value === requestFilter)?.label}
              </h2>
              <div className="relative">
                <select
                  value={requestFilter}
                  onChange={(e) => setRequestFilter(e.target.value)}
                  className="appearance-none h-9 pl-3 pr-8 text-sm text-[var(--text)] bg-[var(--surface-sunk)] border border-[var(--line-2)] rounded-[var(--radius-s)] outline-none focus:border-[var(--accent)] cursor-pointer ds-type-body-m"
                >
                  {REQUEST_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[var(--text-3)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="rounded-[var(--radius-m)] border border-dashed border-[var(--line-2)] bg-[var(--surface-sunk)] px-6 py-12 text-center">
                <p className="text-base text-[var(--text)] mb-1" style={{ fontFamily: 'var(--font-human)' }}>No consults yet</p>
                <p className="text-sm text-[var(--text-3)] mb-5 ds-type-body-m">Share your booking link to start taking appointments.</p>
                {attorney?.slug && (
                  <button
                    onClick={copyBookingLink}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-s)] bg-[var(--accent)] text-[var(--accent-on)] text-sm font-semibold hover:bg-[var(--accent-press)] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    {copied ? 'Link copied' : 'Copy booking link'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.slice(0, 6).map(b => (
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
                <Link to="/attorney/bookings" className="text-xs text-[var(--accent)] ds-type-body-m hover:underline flex items-center gap-1 pt-1">
                  View all in Bookings <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <ConfirmationRateCard bookings={bookings} />
          <CompletedConsultsCard bookings={bookings} />
          <AverageConsultsCard bookings={bookings} />
          <TasksCard bookings={bookings} attorney={attorney} />

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
