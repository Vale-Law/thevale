import { Star } from 'lucide-react';

export default function StarRow({ rating = 0, className = 'w-4 h-4' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${className} ${i <= Math.round(rating) ? 'fill-[#FFC107] text-[#FFC107]' : 'fill-[var(--surface-sunk)] text-[var(--text-4)]'}`}
        />
      ))}
    </div>
  );
}