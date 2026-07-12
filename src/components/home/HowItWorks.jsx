import { Search, CalendarCheck, Wallet, Video } from 'lucide-react';

const steps = [
  { icon: Search, num: '01', title: 'Search & compare', desc: 'Filter by practice area, fee, language, and rating to find your match.' },
  { icon: CalendarCheck, num: '02', title: 'Book instantly', desc: 'Pick an available slot and secure your consultation in seconds.' },
  { icon: Wallet, num: '03', title: 'Pay your way', desc: 'Full payment, Klarna, Affirm, or LawFi — choose what works for you.' },
  { icon: Video, num: '04', title: 'Meet your lawyer', desc: 'Join a secure video call at your scheduled time. No office visit needed.' },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">How PACTO works</h2>
        <p className="text-muted-foreground text-center mb-12">From search to consultation in four simple steps</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, num, title, desc }) => (
            <div key={num} className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-primary bg-secondary px-2 py-1 rounded-full">{num}</span>
                <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}