import ArticleLayout from '@/components/learn/ArticleLayout';

const sections = [
  {
    heading: 'How personal injury cases work',
    content: [
      { type: 'p', text: 'A personal injury case arises when someone is hurt due to another person\'s negligence or intentional conduct. Common cases include car accidents, slip-and-falls, medical malpractice, and workplace injuries.' },
      { type: 'p', text: 'To win a personal injury case, you generally must prove four elements: duty (the defendant owed you a duty of care), breach (they violated that duty), causation (the breach caused your injury), and damages (you suffered actual harm).' },
    ],
  },
  {
    heading: 'The contingency fee model explained',
    pullQuote: 'With contingency fees, you pay your attorney nothing unless you win. Their success is directly tied to yours.',
    content: [
      { type: 'p', text: 'Almost all personal injury attorneys in Texas work on a contingency fee basis — meaning you pay nothing upfront, and your attorney takes a percentage of your settlement or verdict, typically 33%.' },
      { type: 'p', text: 'This model makes legal representation accessible regardless of your financial situation. If you lose, you owe nothing in attorney fees (though you may still owe case expenses like filing fees or expert witnesses).' },
      { type: 'stat', value: '33%', label: 'Typical contingency fee percentage in Texas' },
    ],
  },
  {
    heading: 'Typical case timeline',
    content: [
      { type: 'ul', items: [
        'Day 1–30: Medical treatment, evidence gathering, attorney retention',
        'Month 1–6: Investigation, demand letter preparation, negotiation with insurer',
        'Month 3–12: Settlement negotiation or lawsuit filing if needed',
        'Month 6–24: Discovery, depositions, potential trial',
        'Final: Settlement or verdict and disbursement',
      ]},
      { type: 'p', text: 'Most personal injury cases settle before trial. The timeline varies significantly based on injury severity, liability clarity, and insurance company behavior.' },
    ],
  },
  {
    heading: 'What your case may be worth',
    content: [
      { type: 'p', text: 'Personal injury damages fall into two categories: economic (medical bills, lost wages, future care costs) and non-economic (pain and suffering, emotional distress, loss of enjoyment of life).' },
      { type: 'p', text: 'Key factors that affect case value:' },
      { type: 'ul', items: [
        'Severity and permanence of your injuries',
        'Clarity of the other party\'s liability',
        'Your percentage of fault (Texas uses modified comparative negligence)',
        'The defendant\'s insurance policy limits',
        'Quality of documentation (medical records, photos, witness statements)',
      ]},
    ],
  },
  {
    heading: 'Dealing with insurance adjusters',
    pullQuote: 'An insurance adjuster\'s job is to pay you as little as possible. You are not required to give a recorded statement.',
    content: [
      { type: 'p', text: 'Insurance adjusters work for the insurance company — not for you. They are trained to minimize payouts. Common tactics include asking for recorded statements, offering quick low-ball settlements, and disputing injury causation.' },
      { type: 'p', text: 'You are generally not required to give a recorded statement to the other driver\'s insurer. Before speaking with any adjuster, consider consulting an attorney — most personal injury lawyers offer free consultations.' },
    ],
  },
  {
    heading: 'When to hire a personal injury lawyer',
    content: [
      { type: 'p', text: 'You should strongly consider hiring an attorney if:' },
      { type: 'ul', items: [
        'Your injuries are serious or require ongoing treatment',
        'Liability is disputed',
        'You\'ve been offered a quick settlement (often too low)',
        'You\'re still treating and don\'t know the full extent of your injuries',
        'Multiple parties may be liable',
      ]},
      { type: 'p', text: 'The statute of limitations for personal injury in Texas is 2 years from the date of injury. Missing this deadline generally bars your claim entirely.' },
    ],
  },
  {
    heading: 'Red flags in personal injury firms',
    content: [
      { type: 'ul', items: [
        'Unsolicited contact ("ambulance chasers") — illegal in Texas',
        'Pressuring you to treat with specific doctors or clinics',
        'Guaranteeing a specific settlement amount',
        'Unable to tell you who will actually handle your case',
        'Excessive case volume with little personal attention',
      ]},
      { type: 'p', text: 'A good personal injury attorney will give you an honest assessment of your case, explain the contingency fee agreement clearly, and communicate with you throughout the process.' },
    ],
  },
];

export default function LearnPersonalInjury() {
  return (
    <ArticleLayout
      label="Personal Injury Law"
      title="How personal injury cases work — and what your case may be worth."
      readTime="10 min read"
      sections={sections}
      ctaArea="Family Law"
    />
  );
}