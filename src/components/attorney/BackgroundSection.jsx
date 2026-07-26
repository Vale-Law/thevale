import { format } from 'date-fns';

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div className="border-b border-[#E5E2DC] py-4 last:border-0">
      <p className="text-sm font-medium text-[#111418] font-body">{label}</p>
      <div className="text-sm text-[#525961] font-body mt-1">{children}</div>
    </div>
  );
}

export default function BackgroundSection({ attorney }) {
  const langs = attorney.languages && attorney.languages.length ? attorney.languages.join(', ') : '';
  const showBoard = attorney.board_cert_approved && attorney.board_cert_body && attorney.board_cert_document;
  const hasAny =
    attorney.bar_state || attorney.bar_admission || attorney.bar_number ||
    attorney.verified_date || showBoard || attorney.education ||
    attorney.years_experience != null || langs;
  if (!hasAny) return null;

  return (
    <div>
      <h2 className="font-serif text-xl text-[#111418] mb-2">Education and background</h2>
      <Row label="Bar admissions">
        {attorney.bar_admission && <p>{attorney.bar_admission}</p>}
        {attorney.bar_state && <p>Licensed in {attorney.bar_state}{attorney.bar_number ? ` · Bar #${attorney.bar_number}` : ''}</p>}
      </Row>
      {attorney.verified_date && (
        <Row label="License status">License checked {format(new Date(attorney.verified_date), 'MMM d, yyyy')}</Row>
      )}
      {showBoard && (
        <Row label="Board certifications">
          {attorney.board_cert_body}{attorney.board_cert_specialty ? ` — ${attorney.board_cert_specialty}` : ''}
        </Row>
      )}
      {attorney.education && <Row label="Education">{attorney.education}</Row>}
      {attorney.years_experience != null && <Row label="Years in practice">{attorney.years_experience}</Row>}
      {langs && <Row label="Languages spoken">{langs}</Row>}
    </div>
  );
}