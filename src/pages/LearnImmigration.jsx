import ArticleLayout from '@/components/learn/ArticleLayout';

const sections = [
  {
    heading: 'The U.S. immigration system at a glance',
    content: [
      { type: 'p', text: 'The U.S. immigration system is administered by several federal agencies — primarily U.S. Citizenship and Immigration Services (USCIS), the Department of State, and Immigration and Customs Enforcement (ICE). Understanding which agency handles your case is the first step.' },
      { type: 'p', text: 'Immigration law covers everything from temporary work visas to permanent residence (a "green card") to full U.S. citizenship. The type of benefit you seek determines the process, the timeline, and the cost.' },
    ],
  },
  {
    heading: 'Family-based visas',
    pullQuote: 'If you have a U.S. citizen spouse, parent, or adult child, you may qualify for a family-based green card with no annual cap.',
    content: [
      { type: 'p', text: 'Family-based immigration allows U.S. citizens and lawful permanent residents to sponsor certain relatives for green cards. Immediate relatives of U.S. citizens — spouses, unmarried children under 21, and parents — face no annual numerical limits.' },
      { type: 'ul', items: ['Spouse of U.S. citizen: typically 12–24 months', 'Adult children of U.S. citizens: 2–7 years depending on country of birth', 'Siblings of U.S. citizens: can take 10+ years for some nationalities'] },
    ],
  },
  {
    heading: 'Employment visas',
    content: [
      { type: 'p', text: 'Employment-based immigration covers workers from professionals in specialty occupations (H-1B) to outstanding researchers (EB-1) to those with advanced degrees in national interest areas (EB-2 NIW).' },
      { type: 'stat', value: '65,000', label: 'H-1B visas issued annually through lottery' },
      { type: 'p', text: 'The H-1B visa requires a sponsoring employer and is subject to an annual lottery. The EB-2 National Interest Waiver (NIW) does not require employer sponsorship and is popular with academics, researchers, and certain professionals.' },
    ],
  },
  {
    heading: 'Green cards & adjustment of status',
    content: [
      { type: 'p', text: 'A lawful permanent resident card ("green card") grants you the right to live and work in the U.S. indefinitely. You can apply for a green card through family relationships, employment, refugee status, or the diversity lottery.' },
      { type: 'p', text: 'If you are already in the U.S. on a valid visa, you may be able to "adjust status" without leaving the country. If you are abroad, you will go through "consular processing" at a U.S. embassy or consulate.' },
    ],
  },
  {
    heading: 'Naturalization & citizenship',
    pullQuote: 'Most green card holders can apply for citizenship after 5 years of permanent residence — or 3 years if married to a U.S. citizen.',
    content: [
      { type: 'p', text: 'Naturalization is the process by which a non-citizen becomes a U.S. citizen. Requirements include 5 years of continuous permanent residence (3 if married to a U.S. citizen), good moral character, basic English, and civics knowledge.' },
      { type: 'p', text: 'The naturalization interview typically takes place 8–14 months after filing Form N-400. You will be tested on English language skills and U.S. civics.' },
    ],
  },
  {
    heading: 'When you need a lawyer (and when you don\'t)',
    content: [
      { type: 'p', text: 'Some immigration cases are straightforward enough for self-representation — for example, a simple citizenship application for someone who has lived in the U.S. for years without complications.' },
      { type: 'p', text: 'However, an attorney is strongly recommended if:' },
      { type: 'ul', items: ['You have ever been arrested or had a criminal conviction', 'You have previously been deported or removed from the U.S.', 'You have overstayed a visa', 'You are in removal (deportation) proceedings', 'Your case involves complex employment-based categories like EB-1 or EB-2 NIW'] },
    ],
  },
  {
    heading: 'What a consultation costs',
    content: [
      { type: 'stat', value: '$130–$200', label: 'Typical immigration consultation fee' },
      { type: 'p', text: 'Immigration attorney consultation fees typically range from $130 to $200 for a 45–60 minute session. Retainers for full representation vary widely: a simple adjustment of status case may cost $2,500–$4,000, while a complex employment petition can run $5,000–$10,000.' },
      { type: 'p', text: 'PACTO\'s financing options (Klarna, Affirm, LawFi) allow you to split the consultation fee or finance a retainer into monthly installments.' },
    ],
  },
  {
    heading: 'Questions to ask your attorney',
    content: [
      { type: 'ul', items: [
        'What is the most likely path to my immigration goal, and what are the alternatives?',
        'What are the biggest risks or obstacles in my case?',
        'What is your experience with cases like mine?',
        'What is included in your retainer, and how do you bill for additional work?',
        'What is a realistic timeline for my case?',
      ]},
    ],
  },
];

export default function LearnImmigration() {
  return (
    <ArticleLayout
      label="Immigration Law"
      title="Immigration law, explained in plain English."
      readTime="12 min read"
      sections={sections}
      ctaArea="Immigration"
    />
  );
}