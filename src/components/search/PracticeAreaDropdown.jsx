import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import FloatingPanel from '@/components/ui/FloatingPanel';

const POPULAR = [
  'Family Law & Divorce',
  'Personal Injury',
  'Immigration',
  'Criminal Defense',
  'Business & Tax',
  'Estate Planning & Wills',
  'Employment',
  'Real Estate',
  'Bankruptcy & Debt',
  'Medical Malpractice',
];

const MORE_AZ = [
  'Adoption',
  'Alimony & Support',
  'Appeals',
  'Arbitration & Mediation',
  'Car Accidents',
  'Child Custody',
  'Child Support',
  'Civil Rights',
  'Consumer Protection',
  'Contracts & Agreements',
  'DUI & DWI',
  'Domestic Violence',
  'Drug Charges',
  'Elder Law',
  'Evictions',
  'Expungement',
  'Foreclosure',
  'Green Cards',
  'Guardianship',
  'Identity Theft',
  'Intellectual Property',
  'Landlord & Tenant',
  'Lawsuits & Litigation',
  'Probate',
  'Slip & Fall',
  'Social Security & Disability',
  'Trademarks & Copyright',
  'Trusts',
  'Wills',
  "Workers' Compensation",
  'Workplace Discrimination',
  'Wrongful Death',
  'Wrongful Termination',
];

const ALL_ITEMS = [...POPULAR, ...MORE_AZ];

export default function PracticeAreaDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredPopular = useMemo(() => {
    if (!query) return POPULAR;
    const q = query.toLowerCase();
    return POPULAR.filter(item => item.toLowerCase().includes(q));
  }, [query]);

  const filteredMore = useMemo(() => {
    if (!query) return MORE_AZ;
    const q = query.toLowerCase();
    return MORE_AZ.filter(item => item.toLowerCase().includes(q));
  }, [query]);

  const flatFiltered = useMemo(() => [...filteredPopular, ...filteredMore], [filteredPopular, filteredMore]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatFiltered.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (flatFiltered[activeIndex]) {
        selectItem(flatFiltered[activeIndex]);
      }
      return;
    }
  };

  const selectItem = (item) => {
    onChange(item);
    setOpen(false);
  };

  // Sync active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open]);

  let runningIndex = -1;
  const renderItem = (item) => {
    runningIndex++;
    const idx = runningIndex;
    return (
      <button
        key={item}
        data-active={idx === activeIndex}
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => selectItem(item)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-body text-[#111418] transition-colors"
        style={{ background: idx === activeIndex ? '#EAF2FB' : 'transparent' }}
      >
        <span>{item}</span>
        {idx === activeIndex && <ChevronDown className="w-3.5 h-3.5 text-[#0a5dc2]" style={{ transform: 'rotate(-90deg)' }} />}
      </button>
    );
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Display / trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#111418] bg-transparent outline-none border-0 border-b sm:border-b-0 sm:border-r border-[#E5E2DC] font-body cursor-pointer text-left overflow-hidden"
      >
        <Search className="w-4 h-4 text-[#8A8578] flex-shrink-0" />
        <span className={`truncate whitespace-nowrap flex-1 ${value ? 'text-[#111418]' : 'text-[#8A8578]'}`}>
          {value || 'Search Legal Issues'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#8A8578] flex-shrink-0" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }} />
      </button>

      {/* Dimmed backdrop */}
      {open && <div className="fixed inset-0 z-[2900] bg-black/10" onClick={() => setOpen(false)} />}

      <FloatingPanel open={open} onClose={() => setOpen(false)} triggerRef={containerRef} minWidth={440}>
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E2DC]">
          <Search className="w-4 h-4 text-[#8A8578] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search Legal Issues"
            className="flex-1 text-sm text-[#111418] bg-transparent outline-none font-body placeholder:text-[#8A8578]"
          />
        </div>

        {/* List */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 340 }}>
          {flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#8A8578] font-body">
              No practice areas match "{query}"
            </div>
          ) : (
            <>
              {filteredPopular.length > 0 && (
                <div className="pt-2">
                  <p className="px-4 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body">
                    Popular Practice Areas
                  </p>
                  {filteredPopular.map(renderItem)}
                </div>
              )}
              {filteredMore.length > 0 && (
                <div className="pt-2 border-t border-[#E5E2DC]">
                  <p className="px-4 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body">
                    More Areas (A–Z)
                  </p>
                  {filteredMore.map(renderItem)}
                </div>
              )}
            </>
          )}
        </div>
      </FloatingPanel>
    </div>
  );
}