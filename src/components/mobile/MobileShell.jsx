import MobileTopBar from './MobileTopBar';
import MobileTabBar from './MobileTabBar';

export default function MobileShell({ children }) {
  return (
    <>
      <MobileTopBar />
      <div className="mobile-shell-pad">
        {children}
      </div>
      <MobileTabBar />
    </>
  );
}