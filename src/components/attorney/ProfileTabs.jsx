const TABS = [
  { id: 'highlights', label: 'Highlights' },
  { id: 'about', label: 'About' },
  { id: 'practice-areas', label: 'Practice areas' },
  { id: 'location', label: 'Location' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faqs', label: 'FAQs' },
];

export default function ProfileTabs({ active, onSelect }) {
  return (
    <div className="sticky top-[calc(env(safe-area-inset-top)+var(--mobile-header-h))] lg:top-[var(--header-height)] z-30 -mx-6 lg:mx-0 px-6 lg:px-0 bg-[#FAF9F7]/95 backdrop-blur-sm border-b border-[#E5E2DC]">
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`whitespace-nowrap py-3 text-sm font-body border-b-2 transition-colors ${active === tab.id ? 'border-[#0a5dc2] text-[#111418] font-medium' : 'border-transparent text-[#8A8578] hover:text-[#111418]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}