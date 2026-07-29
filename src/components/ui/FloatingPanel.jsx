import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable floating panel that renders via portal to document.body.
 * Escapes all parent overflow:hidden / overflow-x:auto containers.
 * Positions itself below the trigger, clamped to the viewport.
 */
export default function FloatingPanel({ open, onClose, triggerRef, children, align = 'left', minWidth = 220, theme = 'legacy' }) {
  const panelRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const panelWidth = Math.min(minWidth, vw - 16);
    let left = align === 'right' ? rect.right - panelWidth : rect.left;
    left = Math.max(8, Math.min(left, vw - panelWidth - 8));
    setCoords({ top: rect.bottom + 8, left });
  }, [triggerRef, align, minWidth]);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e) => {
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      onClose();
    };
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, onClose, triggerRef, updatePosition]);

  if (!open) return null;

  // `theme="tokens"` opts a DS v2 caller (DashboardShell) into tokens.css
  // colors, which follow light/dark mode. Legacy marketplace callers
  // (SearchFilterBar, PracticeAreaDropdown, LanguageSwitcher, AccountMenu)
  // default to the original hardcoded light styling, since their own
  // surrounding content is still hardcoded light too -- switching only
  // this panel to tokens would flip its background dark in dark mode
  // while the page around it stayed light, the same mismatch this prop
  // exists to avoid.
  const themedStyle = theme === 'tokens'
    ? { border: '1px solid var(--line)', borderRadius: 'var(--radius-s)', boxShadow: 'var(--shadow-overlay)' }
    : { border: '1px solid var(--line-2)', borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' };

  return createPortal(
    <div
      ref={panelRef}
      className={theme === 'tokens' ? 'fixed z-[3000] bg-[var(--surface)]' : 'fixed z-[3000] bg-[var(--surface)]'}
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${window.innerWidth - 16}px`,
        ...themedStyle,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}