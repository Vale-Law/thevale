// Question definitions, case-summary generation, and screening data storage

const q = (id, question, options, tag) => ({ id, question, type: 'single', options, tag });

const filterNeutral = (a) => {
  if (!a) return null;
  const lower = a.toLowerCase();
  if (['no preference', 'not sure', 'prefer not to say', 'not applicable'].includes(lower)) return null;
  return a;
};

const langTag = (a) => {
  const f = filterNeutral(a);
  return f ? `Prefers ${f}-speaking attorney` : null;
};

const urgencyTag = (a) => {
  if (!a) return null;
  const l = a.toLowerCase();
  if (l.includes('very urgent') || l.includes('lawsuit') || l.includes('foreclosure pending')) return 'Very urgent';
  if (l.includes('urgent') || l.includes('immediately')) return 'Needs help urgently';
  if (l.includes('somewhat') || l.includes('soon') || l.includes('this week') || l.includes('deadline')) return 'Time-sensitive';
  if (l.includes('planning') || l.includes('exploring') || l.includes('gathering') || l.includes('researching')) return 'Exploring options';
  return a;
};

export const QUESTIONNAIRES = {
  immigration: {
    label: 'Immigration',
    questions: [
      q('matter_type', 'What do you need help with?', ['Green card / family visa', 'Citizenship & naturalization', 'Work or student visa', 'Facing deportation or removal', 'Asylum', 'DACA', 'Something else']),
      q('urgency', 'Is this time-sensitive?', ['Yes, urgent (court date or deadline soon)', 'Somewhat', 'No, just planning ahead'], urgencyTag),
      q('stage', 'Have you started this process already?', ['Just starting', 'In progress', 'Got a denial or request for more info', 'Not sure'], (a) => a === 'In progress' ? 'Process in progress' : filterNeutral(a)),
      q('language', 'Language preference for your attorney?', ['No preference', 'Spanish', 'Mandarin', 'Other'], langTag),
    ],
  },
  family: {
    label: 'Family Law & Divorce',
    questions: [
      q('matter_type', "What's this about?", ['Divorce or separation', 'Child custody', 'Child support', 'Adoption', 'Domestic violence / protection', 'Prenuptial agreement', 'Something else']),
      q('stage', 'Where are things right now?', ['Just exploring', 'Ready to file', 'Already in process', 'Responding to something filed against me']),
      q('children', 'Are children involved?', ['Yes', 'No'], (a) => a === 'Yes' ? 'Children involved' : 'No children'),
      q('contested', 'Settle peacefully or expect a contested case?', ['Hoping to settle / mediate', 'Expecting contested', 'Not sure yet'], (a) => a === 'Not sure yet' ? null : a),
    ],
  },
  personal_injury: {
    label: 'Personal Injury',
    questions: [
      q('matter_type', 'What kind of injury or accident?', ['Car/auto', 'Truck or motorcycle', 'Slip & fall', 'Medical malpractice', 'Dog bite', 'Workplace injury', 'Wrongful death', 'Other']),
      q('when', 'When did it happen?', ['Within the last week', 'Within the last few months', 'Over a year ago', 'Ongoing']),
      q('treatment', 'Did you receive medical treatment?', ['Yes', 'Not yet', 'Planning to'], (a) => a === 'Yes' ? 'Received medical treatment' : a === 'Not yet' ? 'No treatment yet' : a),
      q('insurance', 'Has an insurance company contacted you?', ['Yes', 'No', 'Not sure'], (a) => a === 'Yes' ? 'Insurance company contacted them' : null),
    ],
  },
  criminal: {
    label: 'Criminal Defense',
    questions: [
      q('matter_type', 'Type of charge or situation?', ['DUI/DWI', 'Drug-related', 'Theft or property', 'Assault', 'Federal charge', 'Expungement', 'Other']),
      q('stage', 'What stage are you at?', ['Just arrested / recently charged', 'Upcoming court date', 'Under investigation', 'Clearing a past record']),
      q('first_time', 'First-time matter?', ['Yes', 'No', 'Prefer not to say'], (a) => a === 'Yes' ? 'First-time matter' : a === 'No' ? 'Repeat matter' : null),
      q('urgency', 'How soon do you need help?', ['Immediately / urgent', 'This week', 'Just gathering info'], urgencyTag),
    ],
  },
  business: {
    label: 'Business & Tax',
    questions: [
      q('matter_type', 'What do you need help with?', ['Starting a business / LLC', 'Contracts', 'Partnership matters', 'Intellectual property / trademarks', 'Tax issue', 'Buying/selling a business', 'Employment agreements', 'Other']),
      q('stage', 'What stage is your business?', ['Idea / pre-launch', 'Newly formed', 'Established', 'Winding down']),
      q('scope', 'One-time or ongoing?', ['One-time project', 'Ongoing support']),
      q('urgency', 'Urgency?', ['Deadline-driven', 'Soon', 'Just planning'], urgencyTag),
    ],
  },
  employment: {
    label: 'Employment',
    questions: [
      q('matter_type', "What's going on?", ['Wrongful termination', 'Discrimination', 'Sexual harassment', 'Unpaid wages', "Workers' comp", 'Contract review', 'Other']),
      q('employed', 'Currently employed there?', ['Yes', 'No, I left/was let go', 'About to start a new role']),
      q('reported', 'Reported to HR yet?', ['Yes', 'No', 'Not applicable'], filterNeutral),
      q('urgency', 'Time-sensitive?', ['Urgent', 'Soon', 'Just exploring'], urgencyTag),
    ],
  },
  estate: {
    label: 'Estate Planning & Wills',
    questions: [
      q('matter_type', 'What do you need?', ['Create a will', 'Set up a trust', 'Power of attorney', 'Probate', 'Update documents', 'Other']),
      q('reason', "What's prompting this?", ['Planning ahead', 'Recent life change', 'A loved one passed away', 'Other']),
      q('complexity', 'Complexity?', ['Simple', 'Some assets/property', 'Complex (business, multiple properties)', 'Not sure'], filterNeutral),
    ],
  },
  real_estate: {
    label: 'Real Estate',
    questions: [
      q('matter_type', "What's the matter?", ['Buying/selling', 'Landlord/tenant', 'Eviction', 'Foreclosure', 'Construction dispute', 'Zoning/land use', 'Other']),
      q('role', 'Are you the owner, tenant, or buyer?', ['Owner', 'Tenant', 'Buyer', 'Other'], filterNeutral),
      q('urgency', 'Urgency?', ['Urgent', 'Soon', 'Just planning'], urgencyTag),
    ],
  },
  bankruptcy: {
    label: 'Bankruptcy & Debt',
    questions: [
      q('matter_type', 'What are you dealing with?', ['Considering bankruptcy', 'Debt collectors / harassment', 'Foreclosure', 'Credit issues', 'Other']),
      q('goal', 'Main goal?', ['Wipe out debt & restart', 'Reorganize and keep assets', 'Stop collection', 'Just exploring']),
      q('urgency', 'Urgency?', ['Very urgent (lawsuit/foreclosure pending)', 'Soon', 'Researching'], urgencyTag),
    ],
  },
  medical: {
    label: 'Medical Malpractice',
    questions: [
      q('who', 'Who was harmed?', ['Me', 'A family member', 'Someone who passed away']),
      q('type', 'What kind of situation?', ['Surgical error', 'Misdiagnosis', 'Birth injury', 'Medication error', 'Nursing home neglect', 'Other']),
      q('when', 'When did it occur?', ['Recently', 'Within the past year', 'Longer ago', 'Ongoing']),
      q('records', 'Have you obtained medical records?', ['Yes', 'No', 'Not sure how'], (a) => a === 'Yes' ? 'Has medical records' : a === 'No' ? 'No medical records yet' : null),
    ],
  },
};

export const AREA_TO_QUESTIONNAIRE = {
  'Family Law': 'family',
  'Family Law & Divorce': 'family',
  'Immigration': 'immigration',
  'Personal Injury': 'personal_injury',
  'Criminal Defense': 'criminal',
  'Business & Tax': 'business',
  'Business & Tax Law': 'business',
  'Business Formation': 'business',
  'Employment': 'employment',
  'Estate Planning & Wills': 'estate',
  'Real Estate': 'real_estate',
  'Bankruptcy & Debt': 'bankruptcy',
  'Medical Malpractice': 'medical',
};

function genericQuestionnaire(label) {
  return {
    label,
    questions: [
      q('matter_type', 'What best describes your situation?', ['Need legal advice', 'Need representation', 'Reviewing documents', 'Filing or responding to something', 'Something else']),
      q('stage', 'What stage are you at?', ['Just exploring options', 'Ready to take action', 'Already in process', 'Dealing with an urgent issue']),
      q('preference', 'Any preference for your attorney?', ['No preference', 'Spanish-speaking', 'Experienced (10+ years)', 'Female attorney', 'Male attorney'], filterNeutral),
    ],
  };
}

export function getQuestionnaire(areaLabel) {
  if (!areaLabel) return null;
  const key = AREA_TO_QUESTIONNAIRE[areaLabel];
  if (key && QUESTIONNAIRES[key]) return QUESTIONNAIRES[key];
  return genericQuestionnaire(areaLabel);
}

export function generateCaseSummary(areaLabel, answers, location) {
  if (!answers || Object.keys(answers).length === 0) {
    return 'Client skipped screening — limited details.';
  }
  const questionnaire = getQuestionnaire(areaLabel);
  const tags = [areaLabel || 'Legal matter'];

  if (questionnaire) {
    for (const question of questionnaire.questions) {
      const answer = answers[question.id];
      if (!answer) continue;
      const tag = question.tag ? question.tag(answer) : answer;
      if (tag) tags.push(tag);
    }
  } else {
    tags.push(...Object.values(answers).filter(Boolean));
  }

  return tags.filter(Boolean).join(' · ');
}

export function extractUrgency(answers) {
  if (!answers) return null;
  const urgencyAnswer = answers.urgency || '';
  if (!urgencyAnswer) return null;
  const l = urgencyAnswer.toLowerCase();
  if (l.includes('urgent') || l.includes('immediately') || l.includes('very urgent')) return 'Urgent';
  if (l.includes('somewhat') || l.includes('soon') || l.includes('this week') || l.includes('deadline')) return 'Soon';
  if (l.includes('planning') || l.includes('exploring') || l.includes('gathering') || l.includes('researching')) return 'Just exploring';
  return null;
}

export function extractLanguagePreference(answers) {
  if (!answers) return '';
  const lang = answers.language || answers.preference || '';
  if (!lang) return '';
  const l = lang.toLowerCase();
  if (l === 'no preference' || l === 'not sure' || l === '') return '';
  if (l.includes('spanish')) return 'Spanish';
  if (l.includes('mandarin')) return 'Mandarin';
  return lang;
}

export function extractSubArea(answers) {
  if (!answers) return '';
  return answers.matter_type || '';
}

const STORAGE_KEY = 'brief_screening';

export function storeScreeningData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* ignore */ }
}

export function getScreeningData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearScreeningData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
}