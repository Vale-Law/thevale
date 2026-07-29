import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MobileMenu from './MobileMenu';
import BrandLogo from '@/components/brand/BrandLogo';

export default function MobileTopBar() {
  const navigate = useNavigate();
  const loc = useLocation();
  const showBack = loc.pathname !== '/';

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-[1100] bg-[var(--ground)] border-b border-[var(--line-2)] safe-pt">
      <div className="flex items-center px-5" style={{ height: 'var(--mobile-header-h)' }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-12 h-12 flex items-center justify-center -ml-1"
          >
            <ArrowLeft className="w-7 h-7 text-[var(--text)]" />
          </button>
        )}
        <Link to="/" className="flex items-center">
          <BrandLogo className="h-10 w-auto max-w-[60vw] object-contain" />
        </Link>
        <div className="flex-1" />
        <MobileMenu />
      </div>
    </div>
  );
}