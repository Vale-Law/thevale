import LegalLayout from '@/components/legal/LegalLayout';

const sections = [
  {
    heading: 'Agreement',
    paragraphs: [
      'By accessing or using Brief, you agree to these terms. If you do not agree, please do not use the platform.',
    ],
  },
  {
    heading: 'What Brief is and is not',
    paragraphs: [
      'Brief is an advertising platform that allows attorneys to list their availability and allows the public to search those listings and book consultations.',
      'Brief is not a law firm, does not practice law, does not give legal advice, and is not a lawyer referral service.',
      'Brief does not recommend, endorse, evaluate, rank, or vouch for any attorney, and makes no representation about any attorney\u2019s competence, experience, or fitness for any matter.',
      'Attorneys pay Brief a flat fee to be listed. This fee is not a share of any legal fee and does not vary with what an attorney charges or whether an attorney is retained.',
      'Attorneys are solely responsible for the content of their own profiles and for compliance with their state\u2019s rules of professional conduct.',
      'Using Brief does not create an attorney-client relationship between a user and Brief, or between a user and any attorney. Any attorney-client relationship is formed only by separate agreement between the user and the attorney.',
      'Users are responsible for choosing their own attorney.',
    ],
  },
  {
    heading: 'No attorney-client relationship with Brief',
    paragraphs: [
      'Using Brief does not create an attorney-client relationship between you and Brief. Any attorney-client relationship is formed solely between you and the individual attorney, on terms you agree directly with that attorney.',
    ],
  },
  {
    heading: 'Attorney listings and verification',
    paragraphs: [
      'Attorneys listed on Brief are independent professionals. They set their own fees, exercise their own independent professional judgment, and are solely responsible for the services they provide and for compliance with the rules of professional conduct in their jurisdictions.',
      'Where Brief displays a "License checked" date, it reflects only that Brief reviewed the attorney\u2019s bar number against publicly available state bar records at the time of application. It is a screening step, not a guarantee, endorsement, or warranty of any attorney\u2019s competence, availability, or results, and it is not a referral. Clients should exercise their own judgment when selecting an attorney.',
    ],
  },
  {
    heading: 'Consultations and payment',
    paragraphs: [
      'Consultation fees are set by each attorney and disclosed before booking. Clients pay attorneys directly. Brief charges attorneys a separate flat platform fee, which is disclosed to attorneys during the application process. Brief does not share in, take a portion of, or otherwise divide legal fees.',
    ],
  },
  {
    heading: 'Calendar connection',
    paragraphs: [
      'Attorneys who connect a calendar authorize Brief to read free/busy times for the sole purpose of displaying accurate availability. Attorneys are responsible for keeping their availability, blackout dates, and booking settings current, and may disconnect at any time.',
    ],
  },
  {
    heading: 'Intake descriptions',
    paragraphs: [
      'Before booking, a client may write a description of their situation to send to the attorney they book with. This description is sent only to that one attorney. The client may edit, skip, or decline to send it. Brief is not a law firm and transmitting this description does not create an attorney-client relationship.',
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: [
      'You agree not to use Brief to submit false or misleading information, to solicit or advertise without authorization, to interfere with the platform\u2019s operation or security, or to use the platform for any unlawful purpose.',
    ],
  },
  {
    heading: 'Cancellations and no-shows',
    paragraphs: [
      'Cancellation and rescheduling policies are set by each attorney and shown at the time of booking. Please review them before confirming a consultation.',
    ],
  },
  {
    heading: 'Disclaimers',
    paragraphs: [
      'Brief is provided on an \u201cas is\u201d and \u201cas available\u201d basis. To the fullest extent permitted by law, Brief disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. Brief does not warrant any particular outcome from any consultation or legal matter.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'To the fullest extent permitted by law, Brief is not liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss arising from your relationship with, or the services provided by, any attorney found through the platform.',
    ],
  },
  {
    heading: 'Changes to the platform and these terms',
    paragraphs: [
      'We may modify or discontinue features at any time, and may update these terms. Continued use after changes take effect constitutes acceptance. The \u201cLast updated\u201d date above reflects the most recent revision.',
    ],
  },
  {
    heading: 'Governing law',
    paragraphs: [
      'These terms are governed by the laws of the State of Texas, without regard to its conflict of laws principles.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about these terms can be sent to olaolukuforiji@gmail.com.',
    ],
  },
];

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of service"
      lastUpdated="July 24, 2026"
      sections={sections}
    />
  );
}