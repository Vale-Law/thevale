import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable floating panel that renders via portal to document.body.
 * Escapes all parent overflow:hidden / overflow-x:auto containers.
 * Positions itself below the trigger, clamped to the viewport.
 */
export default function FloatingPanel({ open, onClose, triggerRef, children, align = 'left', minWidth = 220 }) {
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

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[3000] bg-white"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${window.innerWidth - 16}px`,
        border: '1px solid #E5E2DC',
        borderRadius: 8,
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}