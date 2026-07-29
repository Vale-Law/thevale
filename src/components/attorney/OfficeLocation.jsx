import { MapPin, Navigation } from 'lucide-react';

export default function OfficeLocation({ attorney }) {
  const address = attorney.office_location || [attorney.city, attorney.state].filter(Boolean).join(', ');
  if (!address) return null;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div>
      <h2 className="font-serif text-xl text-[var(--text)] mb-4">Office location</h2>
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="w-full sm:w-[400px] shrink-0">
          <iframe
            title="Office location map"
            src={mapSrc}
            className="w-full h-[300px] sm:h-[400px] rounded-xl border border-[var(--line-2)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="flex-1">
          {attorney.office_location && <p className="text-sm font-medium text-[var(--text)] font-body">{attorney.office_location}</p>}
          <p className="text-sm text-[var(--text-2)] font-body mt-1 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {address}
          </p>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] font-medium font-body mt-3 hover:underline">
            <Navigation className="w-4 h-4" /> Get directions
          </a>
        </div>
      </div>
    </div>
  );
}