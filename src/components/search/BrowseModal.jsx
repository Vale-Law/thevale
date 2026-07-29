import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import BottomSheet from '@/components/mobile/BottomSheet';

const PRACTICE_AREAS = [
  'Family Law',
  'Immigration',
  'Personal Injury',
  'Business & Tax Law',
  'Medical Malpractice',
  'Criminal Defense',
  'Estate Planning',
  'Real Estate Law',
  'Employment Law',
  'Bankruptcy',
];

const SITUATIONS = [
  'Divorce',
  'Car Accident',
  'Contract Review',
  'Business Negotiation',
  'IP Dispute',
  'Child Custody',
  'Green Card Application',
  'Workplace Injury',
  'Starting a Business',
  'Wrongful Termination',
  'Slip and Fall',
  'Eviction',
];

const AREA_LABELS = {
  'Family Law': 'area.familyLaw',
  'Immigration': 'area.immigration',
  'Personal Injury': 'area.personalInjury',
  'Business & Tax Law': 'practiceIcons.businessTax',
  'Medical Malpractice': 'browseModal.medicalMalpractice',
  'Criminal Defense': 'practiceIcons.criminalDefense',
  'Estate Planning': 'browseModal.estatePlanning',
  'Real Estate Law': 'browseModal.realEstate',
  'Employment Law': 'browseModal.employment',
  'Bankruptcy': 'browseModal.bankruptcy',
};

const SITUATION_LABELS = {
  'Divorce': 'situation.divorce',
  'Car Accident': 'situation.carAccident',
  'Contract Review': 'browseModal.contractReview',
  'Business Negotiation': 'browseModal.businessNegotiation',
  'IP Dispute': 'browseModal.ipDispute',
  'Child Custody': 'situation.childCustody',
  'Green Card Application': 'situation.greenCard',
  'Workplace Injury': 'browseModal.workplaceInjury',
  'Starting a Business': 'browseModal.startingBusiness',
  'Wrongful Termination': 'browseModal.wrongfulTermination',
  'Slip and Fall': 'situation.slipFall',
  'Eviction': 'browseModal.eviction',
};

export default function BrowseModal({ open, onClose }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState('areas');

  const handleExplore = () => {
    onClose();
    navigate('/areas-of-help');
  };

  const labelFor = (item, map) => {
    const key = map[item];
    return key ? t(key) : item;
  };

  return (
    <BottomSheet open={open} onClose={onClose} desktopMaxWidth={680}>
      <div className="flex items-center justify-between px-6 border-b border-[var(--line-2)]">
        <div className="flex gap-6">
          <button
            onClick={() => setTab('areas')}
            className="pb-3 pt-4 text-sm font-body relative transition-colors"
            style={{ color: tab === 'areas' ? 'var(--text)' : 'var(--text-3)' }}
          >
            {t('browseModal.practiceAreas')}
            {tab === 'areas' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--text)]" />}
          </button>
          <button
            onClick={() => setTab('situations')}
            className="pb-3 pt-4 text-sm font-body relative transition-colors"
            style={{ color: tab === 'situations' ? 'var(--text)' : 'var(--text-3)' }}
          >
            {t('browseModal.commonSituations')}
            {tab === 'situations' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[var(--text)]" />}
          </button>
        </div>
        <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text)] transition-colors mb-3 mt-4 p-2 -mr-2" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        {tab === 'areas' ? (
          <>
            <h3 className="font-serif text-[22px] text-[var(--text)] mb-5">{t('browseModal.browseAreas')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              {PRACTICE_AREAS.map(area => (
                <Link
                  key={area}
                  to={`/?area=${encodeURIComponent(area)}`}
                  onClick={onClose}
                  className="text-sm font-body text-[var(--text)] underline underline-offset-4 decoration-[var(--line-2)] hover:decoration-[var(--text)] transition-all"
                >
                  {labelFor(area, AREA_LABELS)}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-[var(--line-2)]">
              <button
                onClick={handleExplore}
                className="text-sm font-body font-medium text-[var(--accent)] hover:text-[var(--text)] transition-colors"
              >
                {t('browseModal.explore')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-serif text-[22px] text-[var(--text)] mb-5">{t('browseModal.browseSituations')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              {SITUATIONS.map(sit => (
                <Link
                  key={sit}
                  to={`/?situation=${encodeURIComponent(sit)}`}
                  onClick={onClose}
                  className="text-sm font-body text-[var(--text)] underline underline-offset-4 decoration-[var(--line-2)] hover:decoration-[var(--text)] transition-all"
                >
                  {labelFor(sit, SITUATION_LABELS)}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-[var(--line-2)]">
              <button
                onClick={handleExplore}
                className="text-sm font-body font-medium text-[var(--accent)] hover:text-[var(--text)] transition-colors"
              >
                {t('browseModal.explore')}
              </button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}