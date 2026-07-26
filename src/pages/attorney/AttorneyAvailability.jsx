import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Loader2, Plus, X } from 'lucide-react';

export default function AttorneyAvailabilityPage() {
  const { attorney, reloadAttorney } = useAuth();
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attorney?.id) return;
    setSlots(attorney.available_slots || []);
    setLoading(false);
  }, [attorney?.id, attorney?.available_slots]);

  const persist = async (next) => {
    if (!attorney?.id) return;
    setSaving(true);
    try {
      await base44.entities.Attorney.update(attorney.id, { available_slots: next });
      setSlots(next);
      await reloadAttorney();
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => {
    if (!newSlot) return;
    const iso = new Date(newSlot).toISOString();
    const next = [...slots, iso].sort((a, b) => new Date(a) - new Date(b));
    persist(next);
    setNewSlot('');
  };

  const removeSlot = (idx) => {
    persist(slots.filter((_, i) => i !== idx));
  };

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" /></div>;
  }

  const future = slots.filter(s => new Date(s) >= new Date());
  const pastSlots = slots.filter(s => new Date(s) < new Date());

  return (
    <div>
      <div className="mb-6 pb-5 border-b border-[#E5E2DC]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-1 font-body">Attorney Portal</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#111418]">Availability</h1>
        <p className="text-sm text-[#8A8578] font-body mt-2 max-w-lg">
          These are the times clients can book a consultation with you. Add slots in your local time zone.
        </p>
      </div>

      <div className="bg-white border border-[#E5E2DC] p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="datetime-local"
            value={newSlot}
            onChange={e => setNewSlot(e.target.value)}
            className="flex-1 border border-[#E5E2DC] px-4 py-2.5 text-sm outline-none focus:border-[#111418] font-body"
          />
          <button
            onClick={addSlot}
            disabled={!newSlot || saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111418] text-white text-sm font-body hover:bg-[#0a5dc2] transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add slot
          </button>
        </div>

        <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-3">Available slots ({future.length})</p>
        {future.length === 0 ? (
          <p className="text-sm text-[#8A8578] font-body py-4">No upcoming slots. Add one above so clients can book you.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {future.map((s, i) => (
              <span key={s + i} className="inline-flex items-center gap-2 text-sm border border-[#E5E2DC] px-3 py-2 font-body text-[#111418]">
                <span className="text-[#0a5dc2]">{format(new Date(s), 'EEE, MMM d')}</span>
                <span className="text-[#8A8578]">{format(new Date(s), 'h:mm a')}</span>
                <button onClick={() => removeSlot(i)} className="text-[#8A8578] hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {pastSlots.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#E5E2DC]">
            <p className="text-xs uppercase tracking-[0.1em] text-[#8A8578] font-body mb-3">Past slots ({pastSlots.length})</p>
            <div className="flex flex-wrap gap-2 opacity-60">
              {pastSlots.map((s, i) => (
                <span key={s + i} className="inline-flex items-center gap-2 text-sm border border-[#E5E2DC] px-3 py-2 font-body text-[#8A8578]">
                  {format(new Date(s), 'MMM d, h:mm a')}
                  <button onClick={() => removeSlot(slots.indexOf(s))} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}