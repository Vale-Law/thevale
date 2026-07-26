import LegalLayout from '@/components/legal/LegalLayout';

const sections = [
  {
    heading: 'Overview',
    paragraphs: [
      'Brief is an advertising platform that lists attorneys and lets the public search those listings and book consultations. Brief is not a law firm and does not give legal advice. This policy explains what information we collect, how we use it, and the choices you have.',
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: [
      'From clients: name, email address, phone number, location, and the description you write about your situation when booking a consultation.',
      'From attorneys: name, email address, bar number and licensing state, practice areas, office location, consultation fee, profile text, and verification documents you upload during the application process.',
      'Automatically: basic device and usage information, such as browser type and pages visited, used to operate and improve the platform.',
    ],
  },
  {
    heading: 'Calendar information',
    paragraphs: [
      'Attorneys may choose to connect a Google Calendar or Microsoft Outlook calendar to Brief so that clients see accurate availability.',
      'When an attorney connects a calendar, Brief accesses only free/busy times from that calendar. Brief does not read event titles, descriptions, locations, attendees, attachments, or any other calendar content. Brief does not create, modify, or delete events on a connected calendar.',
      'Brief uses this free/busy information for one purpose only: to calculate which consultation times are available to offer to clients. Free/busy data is never sold, never used for advertising, never used to train machine learning models, and never shared with third parties.',
      'Attorneys may disconnect a calendar at any time from their Brief dashboard. On disconnection, Brief immediately stops accessing the calendar, deletes the stored access credentials, and reverts the attorney\u2019s availability to their manually configured hours.',
      "Brief's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
    ],
  },
  {
    heading: 'How we use information',
    paragraphs: [
      'To operate the platform and list attorneys for the public to search.',
      'To schedule, confirm, and manage consultations.',
      'To check attorney bar licensing status.',
      'To communicate with you about your account, bookings, and support requests.',
      'To maintain the security and integrity of the platform and comply with legal obligations.',
    ],
  },
  {
    heading: 'How we share information',
    paragraphs: [
      'When a client books a consultation, the description they wrote about their situation is shared only with the attorney they booked with, so that the attorney can prepare. It is not sent to any other attorney.',
      'With service providers who help us operate the platform, such as hosting, database, and email providers, under confidentiality obligations.',
      'When required by law, legal process, or to protect the rights and safety of our users.',
      'We do not sell personal information.',
    ],
  },
  {
    heading: 'Sensitive information we may handle',
    paragraphs: [
      'The description you write about your situation may include sensitive personal information about your legal matter, your family, your finances, your health, or your immigration status. You choose what to write, you can edit or clear it at any time before booking, and you can skip it entirely. Brief transmits your description only to the single attorney you book with.',
    ],
  },
  {
    heading: 'Confidentiality and legal advice',
    paragraphs: [
      'Brief is not a law firm and does not provide legal advice. Information you share through Brief before you formally engage an attorney may not be protected by the attorney-client privilege. Please avoid sharing sensitive details until you have established a relationship directly with an attorney.',
    ],
  },
  {
    heading: 'Booking descriptions — retention and deletion',
    paragraphs: [
      'We delete the free-text description of your situation from a booking record 90 days after the consultation date, or immediately upon your request, whichever comes first. We retain booking metadata (date, attorney, and client) for legitimate business and legal purposes, but the written description itself is purged and is no longer readable by anyone, including the attorney.',
      'To request earlier deletion of your description or your data, use the "Delete my data" option on your account page, or contact us using the details below.',
    ],
  },
  {
    heading: 'Data retention',
    paragraphs: [
      'We retain account and booking records for as long as your account is active and as needed for legitimate business and legal purposes. Calendar access credentials are deleted immediately upon disconnection or account closure. Booking description text is deleted per the section above.',
    ],
  },
  {
    heading: 'Security',
    paragraphs: [
      'We use industry-standard safeguards including encryption in transit, encrypted storage of access credentials, and access controls. No system is perfectly secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You may access, correct, or request deletion of your information, disconnect a connected calendar at any time, and opt out of non-essential communications. You may also request deletion of your booking descriptions immediately using the "Delete my data" option on your account page.',
    ],
  },
  {
    heading: 'Children',
    paragraphs: [
      'Brief is not directed to anyone under 18 and we do not knowingly collect information from children.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. We will revise the \u201cLast updated\u201d date above and, where changes are significant, provide additional notice.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about this policy can be sent to olaolukuforiji@gmail.com.',
    ],
  },
];

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy policy"
      lastUpdated="July 24, 2026"
      sections={sections}
    />
  );
}