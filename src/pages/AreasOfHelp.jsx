import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const CATEGORIES = [
  {
    heading: 'Family & Relationships',
    description: 'The people closest to you.',
    options: [
      'Divorce & Separation', 'Child Custody', 'Child Support', 'Adoption',
      'Domestic Violence', 'Prenuptial Agreements', 'Alimony & Support', 'Guardianship',
    ],
  },
  {
    heading: 'Injury & Accidents',
    description: "When someone else's actions hurt you.",
    options: [
      'Car & Auto Accidents', 'Truck Accidents', 'Motorcycle Accidents', 'Slip & Fall',
      'Medical Malpractice', 'Birth Injury', 'Dog Bites & Animal Attacks',
      'Nursing Home Neglect', 'Wrongful Death', 'Product Liability',
    ],
  },
  {
    heading: 'Immigration',
    description: 'Building your life in a new country.',
    options: [
      'Family Visas', 'Green Cards', 'Citizenship & Naturalization', 'Work Visas',
      'Asylum', 'Deportation Defense', 'DACA',
    ],
  },
  {
    heading: 'Criminal Defense',
    description: 'Protecting your rights and your record.',
    options: [
      'DUI & DWI', 'Drug Charges', 'Theft & Property Crimes', 'Assault',
      'Expungement', 'Juvenile Defense', 'Federal Charges', 'White Collar',
    ],
  },
  {
    heading: 'Business & Tax',
    description: 'For your company, big or small.',
    options: [
      'Business Formation & LLCs', 'Contracts & Agreements', 'Partnerships',
      'Intellectual Property', 'Trademarks & Copyright', 'Tax',
      'Mergers & Acquisitions', 'Employment Agreements',
    ],
  },
  {
    heading: 'Work & Employment',
    description: 'Standing up for yourself at work.',
    options: [
      'Wrongful Termination', 'Workplace Discrimination', 'Sexual Harassment',
      'Wage Disputes', 'Workers’ Compensation', 'Social Security & Disability',
    ],
  },
  {
    heading: 'Property & Housing',
    description: 'Your home and your land.',
    options: [
      'Real Estate', 'Landlord & Tenant', 'Foreclosure', 'Construction Disputes',
      'Land Use & Zoning', 'Evictions',
    ],
  },
  {
    heading: 'Money & Debt',
    description: 'Getting back on solid ground.',
    options: [
      'Bankruptcy', 'Debt Relief', 'Debt Collection Defense', 'Consumer Protection',
      'Identity Theft', 'Credit Disputes',
    ],
  },
  {
    heading: 'Estate & Elder',
    description: 'Planning ahead and protecting family.',
    options: [
      'Wills & Trusts', 'Estate Planning', 'Probate', 'Power of Attorney', 'Elder Law',
    ],
  },
  {
    heading: 'Disputes & Everything Else',
    description: 'When you need to resolve or fight back.',
    options: [
      'Lawsuits & Litigation', 'Appeals', 'Arbitration & Mediation', 'Civil Rights',
      'Privacy & Data', 'Class Actions', 'General Practice',
    ],
  },
];

function CategorySection({ category, index }) {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className={index === 0 ? 'pb-24 lg:pb-32' : 'pb-24 lg:pb-32'}
    >
      <div className="fade-up-child">
        <h2 className="font-serif text-[28px] lg:text-[40px] text-[#111418] leading-[1.05] mb-2">
          {category.heading}
        </h2>
        {category.description && (
          <p className="text-sm text-[#8A8578] font-body italic mb-2">
            {category.description}
          </p>
        )}
        <div className="border-t border-[#E5E2DC] mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-4">
          {category.options.map(opt => (
            <Link
              key={opt}
              to={`/?situation=${encodeURIComponent(opt)}`}
              className="text-sm font-body text-[#111418] underline underline-offset-4 decoration-[#E5E2DC] hover:decoration-[#0a5dc2] hover:text-[#0a5dc2] transition-all w-fit"
            >
              {opt}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AreasOfHelp() {
  const ref = useScrollReveal();

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />

      {/* Hero */}
      <section className="pt-20 lg:pt-28 pb-16 lg:pb-20 px-6 lg:px-8" ref={ref}>
        <div className="max-w-[1200px] mx-auto">
          <div className="fade-up-child">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-4 font-body">
              Find your match
            </p>
            <h1 className="font-serif text-[40px] lg:text-[64px] text-[#111418] leading-[1.02] mb-6 max-w-[700px]">
              Explore Areas of Help
            </h1>
            <p className="font-body text-base lg:text-lg text-[#8A8578] leading-relaxed max-w-[640px]">
              Whatever you're facing, there's a lawyer for it. Find your situation below and we'll connect you with attorneys who handle it.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="border-t border-[#E5E2DC]" />
      </div>

      {/* Categories */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-20 lg:pt-24">
        {CATEGORIES.map((cat, i) => (
          <CategorySection key={cat.heading} category={cat} index={i} />
        ))}
      </div>

      {/* Closing CTA */}
      <section className="px-6 lg:px-8 pb-24 lg:pb-32">
        <div className="max-w-[1200px] mx-auto">
          <div className="fade-up-child border-t border-[#E5E2DC] pt-16 text-center">
            <h2 className="font-serif text-[28px] lg:text-[36px] text-[#111418] leading-[1.1] mb-8">
              Not sure which one fits?
            </h2>
            <Link
              to="/booking"
              className="inline-flex items-center px-8 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-300"
            >
              Talk to us →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}