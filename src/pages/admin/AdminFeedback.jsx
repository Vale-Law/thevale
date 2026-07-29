import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Loader2 } from 'lucide-react';
import { Card, Field } from '@/components/primitives';

/**
 * Internal operational-feedback signal, aggregated per attorney (F-03,
 * Sprint v1.2 Track B W3).
 *
 * Admin-only by RLS -- consultation_feedback has a single select policy
 * gated on is_admin(), so this page cannot render for anyone else even if
 * the route guard were bypassed.
 *
 * Deliberately aggregate-first: this is operational signal for Brief's
 * team, not a per-attorney scoreboard and not anything that renders
 * publicly. There is no composite score and no star display -- the three
 * signals stay separate so a low sample size reads as a low sample size
 * rather than a rating.
 */

const MIN_SAMPLE_FOR_RATE = 3;

function pct(numerator, denominator) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 100);
}

function Metric({ label, value, suffix = '%', muted }) {
  return (
    <div>
      <p className="ds-type-label text-[var(--text-3)] mb-1">{label}</p>
      <p
        className="text-lg [font-variant-numeric:tabular-nums]"
        style={{ fontFamily: 'var(--font-human)', color: muted ? 'var(--text-3)' : 'var(--text)' }}
      >
        {value === null ? '—' : `${value}${suffix}`}
      </p>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState([]);
  const [attorneys, setAttorneys] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data: fb, error: fbErr } = await supabase
          .from('consultation_feedback')
          .select('*')
          .order('created_at', { ascending: false });
        if (fbErr) throw fbErr;
        setRows(fb || []);

        const ids = [...new Set((fb || []).map(f => f.attorney_id))];
        if (ids.length) {
          const { data: atts } = await supabase.from('attorneys').select('id, name').in('id', ids);
          setAttorneys(Object.fromEntries((atts || []).map(a => [a.id, a.name])));
        }
      } catch (e) {
        setError(e.message || 'Could not load feedback.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byAttorney = rows.reduce((acc, r) => {
    (acc[r.attorney_id] ||= []).push(r);
    return acc;
  }, {});

  const summaries = Object.entries(byAttorney)
    .map(([attorneyId, list]) => {
      const attendedAnswers = list.filter(r => r.attended !== null);
      const feeAnswers = list.filter(r => r.fee_as_disclosed !== null);
      const formatAnswers = list.filter(r => r.format_as_disclosed !== null);
      const commAnswers = list.filter(r => r.communication_rating !== null);
      return {
        attorneyId,
        name: attorneys[attorneyId] || 'Unknown attorney',
        count: list.length,
        attendedRate: pct(attendedAnswers.filter(r => r.attended).length, attendedAnswers.length),
        feeRate: pct(feeAnswers.filter(r => r.fee_as_disclosed).length, feeAnswers.length),
        formatRate: pct(formatAnswers.filter(r => r.format_as_disclosed).length, formatAnswers.length),
        communication: commAnswers.length
          ? (commAnswers.reduce((s, r) => s + r.communication_rating, 0) / commAnswers.length).toFixed(1)
          : null,
        comments: list.filter(r => r.comment).slice(0, 3),
      };
    })
    .filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <div className="mb-5 pb-5 border-b border-[var(--line)]">
        <p className="ds-type-label text-[var(--text-3)] mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>Consultation feedback</h1>
        <p className="text-sm text-[var(--text-3)] ds-type-body-m mt-2">
          Internal operational signal from completed consultations. Not published anywhere and not shown to attorneys.
        </p>
      </div>

      <div className="mb-4 max-w-sm">
        <Field label="Search" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Attorney name" />
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" /></div>
      ) : error ? (
        <Card tone="raised" className="p-10 text-center text-sm ds-type-body-m" style={{ color: 'var(--noshow)' }}>{error}</Card>
      ) : summaries.length === 0 ? (
        <Card tone="raised" className="p-10 text-center text-sm text-[var(--text-3)] ds-type-body-m">
          No feedback yet. Request it from a completed consultation on the Bookings page.
        </Card>
      ) : (
        <div className="space-y-3">
          {summaries.map(s => {
            const thin = s.count < MIN_SAMPLE_FOR_RATE;
            return (
              <Card key={s.attorneyId} tone="raised" density="compact" className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <h2 className="text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{s.name}</h2>
                  <span className="text-xs text-[var(--text-3)] ds-type-body-m">
                    {s.count} response{s.count === 1 ? '' : 's'}
                    {thin ? ' · too few to read as a trend' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <Metric label="Attended" value={s.attendedRate} muted={thin} />
                  <Metric label="Fee as disclosed" value={s.feeRate} muted={thin} />
                  <Metric label="Format as disclosed" value={s.formatRate} muted={thin} />
                  <Metric label="Communication" value={s.communication} suffix=" / 5" muted={thin} />
                </div>
                {s.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--line)] space-y-2">
                    {s.comments.map(c => (
                      <p key={c.id} className="text-xs text-[var(--text-2)] ds-type-body-m leading-relaxed">“{c.comment}”</p>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
