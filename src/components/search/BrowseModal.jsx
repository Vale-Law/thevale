import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

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

export default function BrowseModal({ open, onClose }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('areas');

  const handleExplore = () => {
    onClose();
    navigate('/areas-of-help');
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[2000]" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed left-1/2 top-20 -translate-x-1/2 z-[2100] bg-[#FAF9F7] w-[92vw] max-w-[680px] max-h-[80vh] flex flex-col"
        style={{ borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
      >
        {/* Tabs + close */}
        <div className="flex items-center justify-between px-6 border-b border-[#E5E2DC]">
          <div className="flex gap-6">
            <button
              onClick={() => setTab('areas')}
              className="pb-3 pt-4 text-sm font-body relative transition-colors"
              style={{ color: tab === 'areas' ? '#111418' : '#8A8578' }}
            >
              Practice Areas
              {tab === 'areas' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#111418]" />}
            </button>
            <button
              onClick={() => setTab('situations')}
              className="pb-3 pt-4 text-sm font-body relative transition-colors"
              style={{ color: tab === 'situations' ? '#111418' : '#8A8578' }}
            >
              Common Situations
              {tab === 'situations' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#111418]" />}
            </button>
          </div>
          <button onClick={onClose} className="text-[#8A8578] hover:text-[#111418] transition-colors mb-3 mt-4" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {tab === 'areas' ? (
            <>
              <h3 className="font-serif text-[22px] text-[#111418] mb-5">Browse Top Practice Areas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              {PRACTICE_AREAS.map(area => (
                <Link
                  key={area}
                  to={`/?area=${encodeURIComponent(area)}`}
                  onClick={onClose}
                  className="text-sm font-body text-[#111418] underline underline-offset-4 decoration-[#E5E2DC] hover:decoration-[#111418] transition-all"
                >
                  {area}
                </Link>
              ))}
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E2DC]">
              <button
                onClick={handleExplore}
                className="text-sm font-body font-medium text-[#0a5dc2] hover:text-[#111418] transition-colors"
              >
                Explore Areas of Help →
              </button>
              </div>
              </>
          ) : (
            <>
              <h3 className="font-serif text-[22px] text-[#111418] mb-5">Browse By Situation</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              {SITUATIONS.map(sit => (
                <Link
                  key={sit}
                  to={`/?situation=${encodeURIComponent(sit)}`}
                  onClick={onClose}
                  className="text-sm font-body text-[#111418] underline underline-offset-4 decoration-[#E5E2DC] hover:decoration-[#111418] transition-all"
                >
                  {sit}
                </Link>
              ))}
              </div>
              <div className="mt-6 pt-5 border-t border-[#E5E2DC]">
              <button
                onClick={handleExplore}
                className="text-sm font-body font-medium text-[#0a5dc2] hover:text-[#111418] transition-colors"
              >
                Explore Areas of Help →
              </button>
              </div>
              </>
          )}
        </div>
      </div>
    </>
  );
}