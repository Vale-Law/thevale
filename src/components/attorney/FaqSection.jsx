import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

export default function FaqSection({ attorney }) {
  const areas = (attorney.practice_areas && attorney.practice_areas.length)
    ? attorney.practice_areas
    : (attorney.practice_area ? [attorney.practice_area] : []);
  const address = attorney.office_location || [attorney.city, attorney.state].filter(Boolean).join(', ');

  const faqs = [];
  if (areas.length) faqs.push({ q: `What are ${attorney.name}'s practice areas?`, a: `${attorney.name} handles: ${areas.join(', ')}.` });
  if (attorney.consult_fee != null) faqs.push({ q: `What is ${attorney.name}'s consultation fee?`, a: `The consultation fee is $${attorney.consult_fee}.` });
  if ((attorney.languages || []).length) faqs.push({ q: `Which languages does ${attorney.name} speak?`, a: attorney.languages.join(', ') });
  if ((attorney.available_slots || []).length) faqs.push({ q: `Is ${attorney.name} accepting new clients?`, a: `Yes, ${attorney.name} has consultations available on Brief.` });
  if (address) faqs.push({ q: `Where is ${attorney.name} located?`, a: address });
  if (attorney.years_experience != null) faqs.push({ q: `How long has ${attorney.name} been in practice?`, a: `${attorney.years_experience} years.` });

  if (faqs.length === 0) return null;
  return (
    <div>
      <h2 className="font-serif text-xl text-[var(--text)] mb-4">FAQs</h2>
      <Accordion type="single" collapsible className="border border-[var(--line-2)] rounded-xl px-5">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="border-b border-[var(--line-2)] last:border-0">
            <AccordionTrigger className="text-sm font-medium text-[var(--text)] font-body text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-[var(--text-2)] font-body">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}