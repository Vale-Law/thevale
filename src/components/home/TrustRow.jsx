import { ShieldCheck, CreditCard, Clock } from 'lucide-react';

const items = [
  { icon: ShieldCheck, label: 'Bar-verified attorneys' },
  { icon: CreditCard, label: 'Klarna & Affirm accepted' },
  { icon: Clock, label: '24h response guarantee' },
];

export default function TrustRow() {
  return (
    <div className="bg-white border-b border-border py-5">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="w-5 h-5 text-accent" />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}