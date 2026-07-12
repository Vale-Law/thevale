import { Sliders } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function FilterSidebar({ filters, onChange }) {
  return (
    <aside className="lg:w-56 flex-shrink-0">
      <div className="sticky top-32 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-4 h-4 text-[#8A8578]" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body">Filters</span>
        </div>

        {/* Practice Area */}
        <div>
          <label className="text-xs text-[#111418] font-medium mb-2 block font-body">Practice Area</label>
          <select
            value={filters.area}
            onChange={e => onChange({ ...filters, area: e.target.value })}
            className="w-full text-sm border border-[#E5E2DC] bg-white px-3 py-2.5 text-[#111418] outline-none focus:border-[#111418] transition-colors font-body appearance-none cursor-pointer"
          >
            <option value="all">All areas</option>
            <option value="Family Law">Family Law</option>
            <option value="Immigration">Immigration</option>
            <option value="Business Formation">Business Formation</option>
          </select>
        </div>

        {/* Max fee */}
        <div>
          <label className="text-xs text-[#111418] font-medium mb-2 block font-body">
            Max consultation fee — <span className="text-[#0a5dc2]">${filters.maxFee}</span>
          </label>
          <Slider
            min={50}
            max={500}
            step={25}
            value={[filters.maxFee]}
            onValueChange={([v]) => onChange({ ...filters, maxFee: v })}
            className="mt-2"
          />
        </div>

        {/* Language */}
        <div>
          <label className="text-xs text-[#111418] font-medium mb-2 block font-body">Language</label>
          <select
            value={filters.language}
            onChange={e => onChange({ ...filters, language: e.target.value })}
            className="w-full text-sm border border-[#E5E2DC] bg-white px-3 py-2.5 text-[#111418] outline-none focus:border-[#111418] transition-colors font-body appearance-none cursor-pointer"
          >
            <option value="all">Any language</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Mandarin">Mandarin</option>
            <option value="Hindi">Hindi</option>
            <option value="Vietnamese">Vietnamese</option>
          </select>
        </div>

        {/* Min rating */}
        <div>
          <label className="text-xs text-[#111418] font-medium mb-2 block font-body">Minimum rating</label>
          <div className="flex flex-wrap gap-2">
            {['all', '4.5', '4.7', '4.9'].map(r => (
              <button
                key={r}
                onClick={() => onChange({ ...filters, minRating: r })}
                className={`text-xs px-3 py-1.5 border transition-all duration-200 font-body ${
                  filters.minRating === r
                    ? 'bg-[#111418] text-white border-[#111418]'
                    : 'border-[#E5E2DC] text-[#8A8578] hover:border-[#111418] hover:text-[#111418]'
                }`}
              >
                {r === 'all' ? 'Any' : `${r}+`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}