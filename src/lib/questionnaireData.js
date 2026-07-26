// Question definitions, case-summary generation, and screening data storage
// Options use { value (English canonical, used for matching), en, es (display labels) }

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

const o = (value, en, es) => ({ value, en, es });

export const QUESTIONNAIRES = {
  immigration: {
    label: 'Immigration',
    questions: [
      q('matter_type',
        { en: 'What do you need help with?', es: '¿Con qué necesitas ayuda?' },
        [
          o('Green card / family visa', 'Green card / family visa', 'Green card / visa familiar'),
          o('Citizenship & naturalization', 'Citizenship & naturalization', 'Ciudadanía y naturalización'),
          o('Work or student visa', 'Work or student visa', 'Visa de trabajo o estudiante'),
          o('Facing deportation or removal', 'Facing deportation or removal', 'Enfrentando deportación o remoción'),
          o('Asylum', 'Asylum', 'Asilo'),
          o('DACA', 'DACA', 'DACA'),
          o('Something else', 'Something else', 'Otra cosa'),
        ]),
      q('urgency',
        { en: 'Is this time-sensitive?', es: '¿Es urgente?' },
        [
          o('Yes, urgent (court date or deadline soon)', 'Yes, urgent (court date or deadline soon)', 'Sí, urgente (fecha o plazo pronto)'),
          o('Somewhat', 'Somewhat', 'Algo'),
          o('No, just planning ahead', 'No, just planning ahead', 'No, solo planificando'),
        ], urgencyTag),
      q('stage',
        { en: 'Have you started this process already?', es: '¿Ya comenzaste este proceso?' },
        [
          o('Just starting', 'Just starting', 'Recién empezando'),
          o('In progress', 'In progress', 'En progreso'),
          o('Got a denial or request for more info', 'Got a denial or request for more info', 'Recibí una denegación o solicitud de más información'),
          o('Not sure', 'Not sure', 'No estoy seguro'),
        ], (a) => a === 'In progress' ? 'Process in progress' : filterNeutral(a)),
      q('language',
        { en: 'Language preference for your attorney?', es: '¿Preferencia de idioma para tu abogado?' },
        [
          o('No preference', 'No preference', 'Sin preferencia'),
          o('Spanish', 'Spanish', 'Español'),
          o('Mandarin', 'Mandarin', 'Mandarín'),
          o('Other', 'Other', 'Otro'),
        ], langTag),
    ],
  },
  family: {
    label: 'Family Law & Divorce',
    questions: [
      q('matter_type',
        { en: "What's this about?", es: '¿De qué se trata?' },
        [
          o('Divorce or separation', 'Divorce or separation', 'Divorcio o separación'),
          o('Child custody', 'Child custody', 'Custodia de hijos'),
          o('Child support', 'Child support', 'Manutención de hijos'),
          o('Adoption', 'Adoption', 'Adopción'),
          o('Domestic violence / protection', 'Domestic violence / protection', 'Violencia doméstica / protección'),
          o('Prenuptial agreement', 'Prenuptial agreement', 'Acuerdo prenupcial'),
          o('Something else', 'Something else', 'Otra cosa'),
        ]),
      q('stage',
        { en: 'Where are things right now?', es: '¿En qué punto estás ahora?' },
        [
          o('Just exploring', 'Just exploring', 'Solo explorando'),
          o('Ready to file', 'Ready to file', 'Listo para presentar'),
          o('Already in process', 'Already in process', 'Ya en proceso'),
          o('Responding to something filed against me', 'Responding to something filed against me', 'Respondiendo a algo presentado en mi contra'),
        ]),
      q('children',
        { en: 'Are children involved?', es: '¿Hay hijos involucrados?' },
        [
          o('Yes', 'Yes', 'Sí'),
          o('No', 'No', 'No'),
        ], (a) => a === 'Yes' ? 'Children involved' : 'No children'),
      q('contested',
        { en: 'Settle peacefully or expect a contested case?', es: '¿Esperas resolver pacíficamente o un caso disputado?' },
        [
          o('Hoping to settle / mediate', 'Hoping to settle / mediate', 'Espero resolver / mediar'),
          o('Expecting contested', 'Expecting contested', 'Espero que sea disputado'),
          o('Not sure yet', 'Not sure yet', 'Aún no estoy seguro'),
        ], (a) => a === 'Not sure yet' ? null : a),
    ],
  },
  personal_injury: {
    label: 'Personal Injury',
    questions: [
      q('matter_type',
        { en: 'What kind of injury or accident?', es: '¿Qué tipo de lesión o accidente?' },
        [
          o('Car/auto', 'Car/auto', 'Auto'),
          o('Truck or motorcycle', 'Truck or motorcycle', 'Camioneta o motocicleta'),
          o('Slip & fall', 'Slip & fall', 'Resbalón y caída'),
          o('Medical malpractice', 'Medical malpractice', 'Negligencia médica'),
          o('Dog bite', 'Dog bite', 'Mordida de perro'),
          o('Workplace injury', 'Workplace injury', 'Lesión laboral'),
          o('Wrongful death', 'Wrongful death', 'Muerte por negligencia'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('when',
        { en: 'When did it happen?', es: '¿Cuándo ocurrió?' },
        [
          o('Within the last week', 'Within the last week', 'En la última semana'),
          o('Within the last few months', 'Within the last few months', 'En los últimos meses'),
          o('Over a year ago', 'Over a year ago', 'Hace más de un año'),
          o('Ongoing', 'Ongoing', 'Continuo'),
        ]),
      q('treatment',
        { en: 'Did you receive medical treatment?', es: '¿Recibiste tratamiento médico?' },
        [
          o('Yes', 'Yes', 'Sí'),
          o('Not yet', 'Not yet', 'Aún no'),
          o('Planning to', 'Planning to', 'Planeo hacerlo'),
        ], (a) => a === 'Yes' ? 'Received medical treatment' : a === 'Not yet' ? 'No treatment yet' : a),
      q('insurance',
        { en: 'Has an insurance company contacted you?', es: '¿Te ha contactado una aseguradora?' },
        [
          o('Yes', 'Yes', 'Sí'),
          o('No', 'No', 'No'),
          o('Not sure', 'Not sure', 'No estoy seguro'),
        ], (a) => a === 'Yes' ? 'Insurance company contacted them' : null),
    ],
  },
  criminal: {
    label: 'Criminal Defense',
    questions: [
      q('matter_type',
        { en: 'Type of charge or situation?', es: '¿Tipo de cargo o situación?' },
        [
          o('DUI/DWI', 'DUI/DWI', 'DUI/DWI'),
          o('Drug-related', 'Drug-related', 'Relacionado con drogas'),
          o('Theft or property', 'Theft or property', 'Robo o propiedad'),
          o('Assault', 'Assault', 'Asalto'),
          o('Federal charge', 'Federal charge', 'Cargo federal'),
          o('Expungement', 'Expungement', 'Eliminación de antecedentes'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('stage',
        { en: 'What stage are you at?', es: '¿En qué etapa estás?' },
        [
          o('Just arrested / recently charged', 'Just arrested / recently charged', 'Recién arrestado / cargado'),
          o('Upcoming court date', 'Upcoming court date', 'Próxima fecha de corte'),
          o('Under investigation', 'Under investigation', 'Bajo investigación'),
          o('Clearing a past record', 'Clearing a past record', 'Limpiando un antecedente'),
        ]),
      q('first_time',
        { en: 'First-time matter?', es: '¿Es la primera vez?' },
        [
          o('Yes', 'Yes', 'Sí'),
          o('No', 'No', 'No'),
          o('Prefer not to say', 'Prefer not to say', 'Prefiero no decir'),
        ], (a) => a === 'Yes' ? 'First-time matter' : a === 'No' ? 'Repeat matter' : null),
      q('urgency',
        { en: 'How soon do you need help?', es: '¿Qué tan pronto necesitas ayuda?' },
        [
          o('Immediately / urgent', 'Immediately / urgent', 'Inmediatamente / urgente'),
          o('This week', 'This week', 'Esta semana'),
          o('Just gathering info', 'Just gathering info', 'Solo recopilando información'),
        ], urgencyTag),
    ],
  },
  business: {
    label: 'Business & Tax',
    questions: [
      q('matter_type',
        { en: 'What do you need help with?', es: '¿Con qué necesitas ayuda?' },
        [
          o('Starting a business / LLC', 'Starting a business / LLC', 'Iniciar un negocio / LLC'),
          o('Contracts', 'Contracts', 'Contratos'),
          o('Partnership matters', 'Partnership matters', 'Asuntos de socios'),
          o('Intellectual property / trademarks', 'Intellectual property / trademarks', 'Propiedad intelectual / marcas'),
          o('Tax issue', 'Tax issue', 'Asunto de impuestos'),
          o('Buying/selling a business', 'Buying/selling a business', 'Comprar/vender un negocio'),
          o('Employment agreements', 'Employment agreements', 'Acuerdos laborales'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('stage',
        { en: 'What stage is your business?', es: '¿En qué etapa está tu negocio?' },
        [
          o('Idea / pre-launch', 'Idea / pre-launch', 'Idea / pre-lanzamiento'),
          o('Newly formed', 'Newly formed', 'Recién formado'),
          o('Established', 'Established', 'Establecido'),
          o('Winding down', 'Winding down', 'Cerrando'),
        ]),
      q('scope',
        { en: 'One-time or ongoing?', es: '¿Único o continuo?' },
        [
          o('One-time project', 'One-time project', 'Proyecto único'),
          o('Ongoing support', 'Ongoing support', 'Apoyo continuo'),
        ]),
      q('urgency',
        { en: 'Urgency?', es: '¿Urgencia?' },
        [
          o('Deadline-driven', 'Deadline-driven', 'Con plazo'),
          o('Soon', 'Soon', 'Pronto'),
          o('Just planning', 'Just planning', 'Solo planificando'),
        ], urgencyTag),
    ],
  },
  employment: {
    label: 'Employment',
    questions: [
      q('matter_type',
        { en: "What's going on?", es: '¿Qué está pasando?' },
        [
          o('Wrongful termination', 'Wrongful termination', 'Despido injustificado'),
          o('Discrimination', 'Discrimination', 'Discriminación'),
          o('Sexual harassment', 'Sexual harassment', 'Acoso sexual'),
          o('Unpaid wages', 'Unpaid wages', 'Salarios impagos'),
          o("Workers' comp", "Workers' comp", 'Compensación laboral'),
          o('Contract review', 'Contract review', 'Revisión de contrato'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('employed',
        { en: 'Currently employed there?', es: '¿Actualmente empleado ahí?' },
        [
          o('Yes', 'Yes', 'Sí'),
          o('No, I left/was let go', 'No, I left/was let go', 'No, me fui/me despidieron'),
          o('About to start a new role', 'About to start a new role', 'A punto de empezar un nuevo rol'),
        ]),
      q('reported',
        { en: 'Reported to HR yet?', es: '¿Lo reportaste a RR.HH.?' },
        [
          o('Yes', 'Yes', 'Sí'),
          o('No', 'No', 'No'),
          o('Not applicable', 'Not applicable', 'No aplica'),
        ], filterNeutral),
      q('urgency',
        { en: 'Time-sensitive?', es: '¿Es urgente?' },
        [
          o('Urgent', 'Urgent', 'Urgente'),
          o('Soon', 'Soon', 'Pronto'),
          o('Just exploring', 'Just exploring', 'Solo explorando'),
        ], urgencyTag),
    ],
  },
  estate: {
    label: 'Estate Planning & Wills',
    questions: [
      q('matter_type',
        { en: 'What do you need?', es: '¿Qué necesitas?' },
        [
          o('Create a will', 'Create a will', 'Crear un testamento'),
          o('Set up a trust', 'Set up a trust', 'Crear un fideicomiso'),
          o('Power of attorney', 'Power of attorney', 'Poder notarial'),
          o('Probate', 'Probate', 'Sucesión testamentaria'),
          o('Update documents', 'Update documents', 'Actualizar documentos'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('reason',
        { en: "What's prompting this?", es: '¿Qué motiva esto?' },
        [
          o('Planning ahead', 'Planning ahead', 'Planificando'),
          o('Recent life change', 'Recent life change', 'Cambio reciente en mi vida'),
          o('A loved one passed away', 'A loved one passed away', 'Un ser querido falleció'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('complexity',
        { en: 'Complexity?', es: '¿Complejidad?' },
        [
          o('Simple', 'Simple', 'Sencillo'),
          o('Some assets/property', 'Some assets/property', 'Algunos bienes/propiedades'),
          o('Complex (business, multiple properties)', 'Complex (business, multiple properties)', 'Complejo (negocio, múltiples propiedades)'),
          o('Not sure', 'Not sure', 'No estoy seguro'),
        ], filterNeutral),
    ],
  },
  real_estate: {
    label: 'Real Estate',
    questions: [
      q('matter_type',
        { en: "What's the matter?", es: '¿De qué se trata?' },
        [
          o('Buying/selling', 'Buying/selling', 'Comprar/vender'),
          o('Landlord/tenant', 'Landlord/tenant', 'Propietario/inquilino'),
          o('Eviction', 'Eviction', 'Desalojo'),
          o('Foreclosure', 'Foreclosure', 'Ejecución hipotecaria'),
          o('Construction dispute', 'Construction dispute', 'Disputa de construcción'),
          o('Zoning/land use', 'Zoning/land use', 'Zonificación/uso de suelo'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('role',
        { en: 'Are you the owner, tenant, or buyer?', es: '¿Eres propietario, inquilino o comprador?' },
        [
          o('Owner', 'Owner', 'Propietario'),
          o('Tenant', 'Tenant', 'Inquilino'),
          o('Buyer', 'Buyer', 'Comprador'),
          o('Other', 'Other', 'Otro'),
        ], filterNeutral),
      q('urgency',
        { en: 'Urgency?', es: '¿Urgencia?' },
        [
          o('Urgent', 'Urgent', 'Urgente'),
          o('Soon', 'Soon', 'Pronto'),
          o('Just planning', 'Just planning', 'Solo planificando'),
        ], urgencyTag),
    ],
  },
  bankruptcy: {
    label: 'Bankruptcy & Debt',
    questions: [
      q('matter_type',
        { en: 'What are you dealing with?', es: '¿Con qué estás lidiando?' },
        [
          o('Considering bankruptcy', 'Considering bankruptcy', 'Considerando quiebra'),
          o('Debt collectors / harassment', 'Debt collectors / harassment', 'Cobradores de deuda / acoso'),
          o('Foreclosure', 'Foreclosure', 'Ejecución hipotecaria'),
          o('Credit issues', 'Credit issues', 'Problemas de crédito'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('goal',
        { en: 'Main goal?', es: '¿Meta principal?' },
        [
          o('Wipe out debt & restart', 'Wipe out debt & restart', 'Eliminar deudas y reiniciar'),
          o('Reorganize and keep assets', 'Reorganize and keep assets', 'Reorganizar y conservar bienes'),
          o('Stop collection', 'Stop collection', 'Detener el cobro'),
          o('Just exploring', 'Just exploring', 'Solo explorando'),
        ]),
      q('urgency',
        { en: 'Urgency?', es: '¿Urgencia?' },
        [
          o('Very urgent (lawsuit/foreclosure pending)', 'Very urgent (lawsuit/foreclosure pending)', 'Muy urgente (demanda/ejecución pendiente)'),
          o('Soon', 'Soon', 'Pronto'),
          o('Researching', 'Researching', 'Investigando'),
        ], urgencyTag),
    ],
  },
  medical: {
    label: 'Medical Malpractice',
    questions: [
      q('who',
        { en: 'Who was harmed?', es: '¿Quién resultó afectado?' },
        [
          o('Me', 'Me', 'Yo'),
          o('A family member', 'A family member', 'Un familiar'),
          o('Someone who passed away', 'Someone who passed away', 'Alguien que falleció'),
        ]),
      q('type',
        { en: 'What kind of situation?', es: '¿Qué tipo de situación?' },
        [
          o('Surgical error', 'Surgical error', 'Error quirúrgico'),
          o('Misdiagnosis', 'Misdiagnosis', 'Diagnóstico erróneo'),
          o('Birth injury', 'Birth injury', 'Lesión al nacer'),
          o('Medication error', 'Medication error', 'Error de medicación'),
          o('Nursing home neglect', 'Nursing home neglect', 'Negligencia en asilo'),
          o('Other', 'Other', 'Otro'),
        ]),
      q('when',
        { en: 'When did it occur?', es: '¿Cuándo ocurrió?' },
        [
          o('Recently', 'Recently', 'Recientemente'),
          o('Within the past year', 'Within the past year', 'En el último año'),
          o('Longer ago', 'Longer ago', 'Hace más tiempo'),
          o('Ongoing', 'Ongoing', 'Continuo'),
        ]),
      q('records',
        { en: 'Have you obtained medical records?', es: '¿Has obtenido tus registros médicos?' },
        [
          o('Yes', 'Yes', 'Sí'),
          o('No', 'No', 'No'),
          o('Not sure how', 'Not sure how', 'No estoy seguro cómo'),
        ], (a) => a === 'Yes' ? 'Has medical records' : a === 'No' ? 'No medical records yet' : null),
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

function genericQuestionnaire(label, language) {
  const l = language || 'en';
  return {
    label,
    questions: [
      q('matter_type',
        { en: 'What best describes your situation?', es: '¿Qué describe mejor tu situación?' },
        [
          o('Need legal advice', 'Need legal advice', 'Necesito asesoría legal'),
          o('Need representation', 'Need representation', 'Necesito representación'),
          o('Reviewing documents', 'Reviewing documents', 'Revisando documentos'),
          o('Filing or responding to something', 'Filing or responding to something', 'Presentando o respondiendo a algo'),
          o('Something else', 'Something else', 'Otra cosa'),
        ]),
      q('stage',
        { en: 'What stage are you at?', es: '¿En qué etapa estás?' },
        [
          o('Just exploring options', 'Just exploring options', 'Solo explorando opciones'),
          o('Ready to take action', 'Ready to take action', 'Listo para actuar'),
          o('Already in process', 'Already in process', 'Ya en proceso'),
          o('Dealing with an urgent issue', 'Dealing with an urgent issue', 'Lidiando con un asunto urgente'),
        ]),
      q('preference',
        { en: 'Any preference for your attorney?', es: '¿Alguna preferencia para tu abogado?' },
        [
          o('No preference', 'No preference', 'Sin preferencia'),
          o('Spanish-speaking', 'Spanish-speaking', 'Que hable español'),
          o('Experienced (10+ years)', 'Experienced (10+ years)', 'Experiencia (10+ años)'),
          o('Female attorney', 'Female attorney', 'Abogada mujer'),
          o('Male attorney', 'Male attorney', 'Abogado hombre'),
        ], filterNeutral),
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