import { Calendar, Briefcase, Scale, Globe, MapPin } from 'lucide-react';

export default function Highlights({ attorney }) {
  const items = [];
  if ((attorney.available_slots || []).length > 0) {
    items.push({ icon: Calendar, label: 'Accepting new clients', desc: 'Available for new client consultations on Brief' });
  }
  if (attorney.years_experience) {
    items.push({ icon: Briefcase, label: `${attorney.years_experience} years in practice`, desc: 'Licensed attorney experience' });
  }
  if (attorney.board_cert_approved && attorney.board_cert_body) {
    items.push({ icon: Scale, label: 'Board certified', desc: attorney.board_cert_body });
  }
  if (attorney.bar_state) {
    items.push({ icon: MapPin, label: `Licensed in ${attorney.bar_state}`, desc: attorney.bar_number ? `Bar #${attorney.bar_number}` : 'State bar member' });
  }
  if ((attorney.languages || []).length > 0) {
    items.push({ icon: Globe, label: 'Languages spoken', desc: attorney.languages.join(', ') });
  }

  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {items.slice(0, 4).map((it, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EAF2FB] flex items-center justify-center shrink-0">
            <it.icon className="w-4 h-4 text-[#0a5dc2]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#111418] font-body">{it.label}</p>
            <p className="text-xs text-[#8A8578] font-body mt-0.5">{it.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}