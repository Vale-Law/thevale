import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MobileMenu from './MobileMenu';

const LOGO = 'https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/03090a7d8_A685878D-8D1E-4B4E-BD14-35608619A7D7.PNG';

export default function MobileTopBar() {
  const navigate = useNavigate();
  const loc = useLocation();
  const showBack = loc.pathname !== '/';

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-[1100] bg-[#FAF9F7] border-b border-[#E5E2DC] safe-pt">
      <div className="flex items-center px-5" style={{ height: 'var(--mobile-header-h)' }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-12 h-12 flex items-center justify-center -ml-1"
          >
            <ArrowLeft className="w-7 h-7 text-[#111418]" />
          </button>
        )}
        <Link to="/" className="flex items-center">
          <img
            src={LOGO}
            alt="Brief"
            className="h-16 w-auto max-w-[60vw] object-contain"
          />
        </Link>
        <div className="flex-1" />
        <MobileMenu />
      </div>
    </div>
  );
}