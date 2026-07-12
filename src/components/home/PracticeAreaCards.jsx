import { useNavigate } from 'react-router-dom';
import { Heart, Globe, Briefcase } from 'lucide-react';

const areas = [
  {
    icon: Heart,
    title: 'Family Law',
    desc: 'Divorce, custody, adoption, and domestic matters handled with care.',
  },
  {
    icon: Globe,
    title: 'Immigration',
    desc: 'Visas, green cards, citizenship, and deportation defense.',
  },
  {
    icon: Briefcase,
    title: 'Business Formation',
    desc: 'LLCs, contracts, trademarks, and startup legal needs.',
  },
];

export default function PracticeAreaCards() {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Browse by practice area</h2>
        <p className="text-muted-foreground text-center mb-10">Select an area to see available attorneys</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {areas.map(({ icon: Icon, title, desc }) => (
            <button
              key={title}
              onClick={() => navigate(`/?area=${encodeURIComponent(title)}`)}
              className="bg-white border border-border rounded-xl p-6 text-left hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}