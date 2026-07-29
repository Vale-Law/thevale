import { Link } from 'react-router-dom';
import { TrendingUp, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { confirmationRateThisWeek, completedSummary, avgConsultsPerWeek, weeklyTasks } from '@/lib/metrics';

function Ring({ rate }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
      <circle cx="42" cy="42" r={r} fill="none" strokeWidth="8" stroke="var(--line)" />
      <circle
        cx="42" cy="42" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 42 42)"
        stroke="var(--accent)" style={{ transition: 'stroke-dashoffset var(--motion-slow)' }}
      />
      <text x="42" y="47" textAnchor="middle" style={{ fontSize: 18, fontWeight: 600, fill: 'var(--text)', fontFamily: 'var(--font-system)' }}>
        {rate}%
      </text>
    </svg>
  );
}

const cardCls = 'rounded-[var(--radius-m)] border border-[var(--line)] bg-[var(--surface)] p-5';

export function ConfirmationRateCard({ bookings }) {
  const { total, confirmed, rate } = confirmationRateThisWeek(bookings);
  return (
    <div className={cardCls}>
      <p className="ds-type-label text-[var(--text-3)]">This week — confirmation rate</p>
      {total === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-[var(--text-3)] ds-type-body-m">No bookings this week yet.</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 mt-4">
          <Ring rate={rate} />
          <div>
            <p className="text-sm text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{confirmed} of {total} confirmed</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Confirmed vs. booked this week</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CompletedConsultsCard({ bookings }) {
  const { done, scheduled, rate } = completedSummary(bookings);
  return (
    <div className={cardCls}>
      <p className="ds-type-label text-[var(--text-3)]">Completed consults</p>
      {scheduled === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-[var(--text-3)] ds-type-body-m">No completed consults yet.</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 mt-4">
          <Ring rate={rate} />
          <div>
            <p className="text-sm text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>{done} completed</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Of {scheduled} scheduled consults</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AverageConsultsCard({ bookings }) {
  const avg = avgConsultsPerWeek(bookings);
  return (
    <div className={cardCls}>
      <p className="ds-type-label text-[var(--text-3)]">Average consults / week</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-3xl [font-variant-numeric:tabular-nums]" style={{ fontFamily: 'var(--font-human)', color: 'var(--text)' }}>{avg}</p>
        {bookings.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs ds-type-body-m" style={{ color: 'var(--confirmed)' }}>
            <TrendingUp className="w-3.5 h-3.5" /> live
          </span>
        )}
      </div>
      <p className="text-[11px] text-[var(--text-3)] mt-2">Based on your booking history.</p>
    </div>
  );
}

export function TasksCard({ bookings, attorney }) {
  const tasks = weeklyTasks(bookings, attorney);
  return (
    <div className={cardCls}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--text)]" style={{ fontFamily: 'var(--font-human)' }}>This week's tasks</p>
        <span className="ds-type-label text-[var(--text-3)]">Action list</span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {tasks.map((t) => {
          const color = t.done ? 'var(--confirmed)' : 'var(--pending)';
          const Icon = t.done ? CheckCircle2 : t.key === 'pending' ? AlertCircle : Circle;
          const linkTo = t.key === 'pending' || t.key === 'upcoming' ? '/attorney/bookings'
            : t.key === 'availability' ? '/attorney/availability' : '/attorney/profile';
          return (
            <Link
              key={t.key}
              to={linkTo}
              className="flex items-center justify-between gap-3 -mx-2 px-2 py-2.5 rounded-[var(--radius-s)] transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-sunk)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <p className="text-sm text-[var(--text)] truncate ds-type-body-m">{t.label}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] shrink-0 ds-type-body-m" style={{ color }}>
                <Icon className="w-3.5 h-3.5" />
                {t.note}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
