import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const statusColors = { pending: 'text-yellow-600', confirmed: 'text-green-600', completed: 'text-blue-600', declined: 'text-red-600' };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    base44.entities.Booking.list('-created_date', 300)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const filtered = status === 'all' ? bookings : bookings.filter(b => b.status === status);

  return (
    <div>
      <div className="mb-5 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Admin</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Bookings</h1>
      </div>

      <div className="flex flex-wrap gap-1 mb-5 border-b border-[#E5E2DC]">
        {['all', 'pending', 'confirmed', 'completed', 'declined'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2.5 text-sm font-body capitalize transition-colors ${status === s ? 'border-b-2 border-[#111418] text-[#111418]' : 'text-[#8A8578] hover:text-[#111418]'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E2DC] p-10 text-center text-sm text-[#8A8578] font-body">No bookings.</div>
      ) : (
        <div className="bg-white border border-[#E5E2DC] divide-y divide-[#E5E2DC]">
          {filtered.map(b => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-serif text-[#111418]">{b.client_name}</p>
                <p className="text-xs text-[#8A8578] font-body">
                  Attorney: {b.attorney_name || '—'} · {b.client_email}
                </p>
                {b.slot && (
                  <p className="text-xs text-[#111418] font-body mt-0.5">
                    {format(new Date(b.slot), 'EEE, MMM d · h:mm a')}
                  </p>
                )}
                {b.case_summary && (
                  <p className="text-xs text-[#8A8578] font-body mt-1 line-clamp-1">{b.case_summary}</p>
                )}
              </div>
              <span className={`text-xs uppercase tracking-[0.08em] font-body ${statusColors[b.status] || ''}`}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}