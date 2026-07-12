import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import PracticeAreaIcons from '@/components/home/PracticeAreaIcons';
import AttorneyBrowse from '@/components/search/AttorneyBrowse';
import CommonSituations from '@/components/home/CommonSituations';
import HowBriefWorks from '@/components/home/HowBriefWorks';
import ValueStrip from '@/components/home/ValueStrip';
import ForAttorneysStrip from '@/components/home/ForAttorneysStrip';
import FounderVision from '@/components/home/FounderVision';
import LocationPicker from '@/components/search/LocationPicker';
import QuestionnaireModal from '@/components/search/QuestionnaireModal';
import { storeScreeningData } from '@/lib/questionnaireData';

const AREA_MAP = {
  'Business & Tax Law': 'Business Formation',
  'Business & Tax': 'Business Formation',
  'Family Law & Divorce': 'Family Law',
  'Criminal Defense': 'Personal Injury',
  'Estate Planning & Wills': 'Business Formation',
  'Employment': 'Personal Injury',
  'Bankruptcy & Debt': 'Business Formation',
};

const SITUATION_MAP = {
  'Divorce': 'Family Law',
  'Divorce & Separation': 'Family Law',
  'Child Custody': 'Family Law',
  'Child Support': 'Family Law',
  'Adoption': 'Family Law',
  'Domestic Violence': 'Family Law',
  'Prenuptial Agreements': 'Family Law',
  'Alimony & Support': 'Family Law',
  'Guardianship': 'Family Law',
  'Eviction': 'Family Law',
  'Evictions': 'Family Law',
  'Car Accident': 'Personal Injury',
  'Car & Auto Accidents': 'Personal Injury',
  'Truck Accidents': 'Personal Injury',
  'Motorcycle Accidents': 'Personal Injury',
  'Slip & Fall': 'Personal Injury',
  'Slip and Fall': 'Personal Injury',
  'Medical Malpractice': 'Personal Injury',
  'Birth Injury': 'Personal Injury',
  'Dog Bites & Animal Attacks': 'Personal Injury',
  'Nursing Home Neglect': 'Personal Injury',
  'Wrongful Death': 'Personal Injury',
  'Product Liability': 'Personal Injury',
  'Workplace Injury': 'Personal Injury',
  "Workers' Compensation": 'Personal Injury',
  'Workers’ Compensation': 'Personal Injury',
  'Wrongful Termination': 'Personal Injury',
  'Contract Review': 'Business Formation',
  'Business Negotiation': 'Business Formation',
  'Starting a Business': 'Business Formation',
  'Business Formation & LLCs': 'Business Formation',
  'Contracts & Agreements': 'Business Formation',
  'Partnerships': 'Business Formation',
  'Intellectual Property': 'Business Formation',
  'Trademarks & Copyright': 'Business Formation',
  'Tax': 'Business Formation',
  'Mergers & Acquisitions': 'Business Formation',
  'Employment Agreements': 'Business Formation',
  'IP Dispute': 'Business Formation',
  'Green Card Application': 'Immigration',
  'Family Visas': 'Immigration',
  'Green Cards': 'Immigration',
  'Citizenship & Naturalization': 'Immigration',
  'Work Visas': 'Immigration',
  'Asylum': 'Immigration',
  'Deportation Defense': 'Immigration',
  'DACA': 'Immigration',
  'DUI & DWI': 'Personal Injury',
  'Drug Charges': 'Personal Injury',
  'Theft & Property Crimes': 'Personal Injury',
  'Assault': 'Personal Injury',
  'Expungement': 'Personal Injury',
  'Juvenile Defense': 'Personal Injury',
  'Federal Charges': 'Personal Injury',
  'White Collar': 'Personal Injury',
  'Workplace Discrimination': 'Personal Injury',
  'Sexual Harassment': 'Personal Injury',
  'Wage Disputes': 'Personal Injury',
  'Social Security & Disability': 'Personal Injury',
  'Real Estate': 'Business Formation',
  'Landlord & Tenant': 'Family Law',
  'Foreclosure': 'Business Formation',
  'Construction Disputes': 'Business Formation',
  'Land Use & Zoning': 'Business Formation',
  'Bankruptcy': 'Business Formation',
  'Debt Relief': 'Business Formation',
  'Debt Collection Defense': 'Business Formation',
  'Consumer Protection': 'Business Formation',
  'Identity Theft': 'Business Formation',
  'Credit Disputes': 'Business Formation',
  'Wills & Trusts': 'Business Formation',
  'Estate Planning': 'Business Formation',
  'Probate': 'Business Formation',
  'Power of Attorney': 'Business Formation',
  'Elder Law': 'Business Formation',
  'Lawsuits & Litigation': 'Business Formation',
  'Appeals': 'Business Formation',
  'Arbitration & Mediation': 'Business Formation',
  'Civil Rights': 'Personal Injury',
  'Privacy & Data': 'Business Formation',
  'Class Actions': 'Business Formation',
  'General Practice': 'Business Formation',
};

function resolveArea(param) {
  if (!param) return null;
  return AREA_MAP[param] || SITUATION_MAP[param] || param;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [attorneys, setAttorneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    state: '',
    city: '',
    areas: [],
    languages: [],
    maxFee: 500,
    minRating: 'all',
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingArea, setPendingArea] = useState('');
  const [pendingAreaLabel, setPendingAreaLabel] = useState('');
  const [pendingLocation, setPendingLocation] = useState({ state: '', city: '' });
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [screening, setScreening] = useState(null);
  const browseRef = useRef(null);
  const processedParams = useRef(false);

  useEffect(() => {
    base44.entities.Attorney.list().then(data => {
      setAttorneys(data);
      setLoading(false);
    });
  }, []);

  // Handle URL params — open location picker when area/situation selected
  useEffect(() => {
    if (processedParams.current) return;
    const area = searchParams.get('area');
    const situation = searchParams.get('situation');
    const browse = searchParams.get('browse');

    let resolvedArea = null;
    let rawLabel = '';
    if (area) { resolvedArea = resolveArea(area); rawLabel = area; }
    else if (situation) { resolvedArea = resolveArea(situation); rawLabel = situation; }

    if (resolvedArea) {
      setPendingArea(resolvedArea);
      setPendingAreaLabel(rawLabel || resolvedArea);
      setPickerOpen(true);
      processedParams.current = true;
      setSearchParams({}, { replace: true });
    } else if (browse) {
      setTimeout(() => {
        browseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      processedParams.current = true;
    }
  }, [searchParams, setSearchParams]);

  const handleGallerySelect = (area) => {
    const resolvedArea = area ? resolveArea(area) : null;
    if (resolvedArea) {
      setPendingArea(resolvedArea);
      setPendingAreaLabel(area || resolvedArea);
      setPickerOpen(true);
    }
  };

  const handleLocationSubmit = (stateCode, city) => {
    setPickerOpen(false);
    setPendingLocation({ state: stateCode, city });
    setQuestionnaireOpen(true);
  };

  const handleHeroSearch = (area, stateCode, city) => {
    const resolvedArea = area ? resolveArea(area) : null;
    setPendingArea(resolvedArea || '');
    setPendingAreaLabel(area || resolvedArea || '');
    if (stateCode && city) {
      setPendingLocation({ state: stateCode, city });
      setQuestionnaireOpen(true);
    } else {
      setPickerOpen(true);
    }
  };

  const handleQuestionnaireComplete = (screeningData) => {
    setQuestionnaireOpen(false);
    storeScreeningData(screeningData);
    setScreening(screeningData);
    setFilters(f => ({
      ...f,
      state: pendingLocation.state,
      city: pendingLocation.city,
      location: `${pendingLocation.city}, ${pendingLocation.state}`,
      areas: pendingArea ? [pendingArea] : f.areas,
    }));
    setTimeout(() => {
      browseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Header />
      <Hero onSearch={handleHeroSearch} />
      <PracticeAreaIcons onSelect={handleGallerySelect} />
      <div ref={browseRef} style={{ '--header-height': '148px' }}>
        <AttorneyBrowse attorneys={attorneys} loading={loading} filters={filters} onChange={setFilters} screening={screening} requireSpanish={screening?.requiresSpanish} />
      </div>
      <CommonSituations onSelect={handleGallerySelect} />
      <HowBriefWorks />
      <ValueStrip />
      <ForAttorneysStrip />
      <FounderVision />
      <Footer />

      <LocationPicker
        area={pendingArea}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSubmit={handleLocationSubmit}
      />

      <QuestionnaireModal
        open={questionnaireOpen}
        areaLabel={pendingAreaLabel}
        location={pendingLocation}
        onClose={() => setQuestionnaireOpen(false)}
        onComplete={handleQuestionnaireComplete}
      />
    </div>
  );
}