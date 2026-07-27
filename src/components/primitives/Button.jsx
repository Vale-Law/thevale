import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import "./primitives.css"

// DS §10 — Button. 44px height / 20px horizontal padding / --radius-s,
// never pill-shaped. Colors all come from tokens.css custom properties —
// no Tailwind default palette, no hard-coded hex.
const buttonVariants = cva(
  [
    "ds-type-body-m",
    "inline-flex items-center justify-center gap-2",
    "font-semibold whitespace-nowrap select-none",
    "rounded-[var(--radius-s)] px-5",
    "transition-colors duration-150",
    "ds-button",
    "disabled:opacity-50 disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-[var(--accent-on)] border border-transparent hover:bg-[var(--accent-press)] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.16)]",
        secondary:
          "bg-transparent text-[var(--text-2)] border border-[var(--line-2)] hover:bg-[var(--surface-sunk)]",
        ghost:
          "bg-transparent text-[var(--text-2)] border border-transparent hover:bg-[var(--surface-sunk)]",
        // No dedicated "on-noshow" text token was specified in the DS, so
        // this reuses --accent-on (the existing "text-on-filled-surface"
        // token) rather than inventing a new token name.
        destructive:
          "bg-[var(--noshow)] text-[var(--accent-on)] border border-transparent hover:brightness-90 active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.16)]",
      },
      size: {
        // 44px default height, 36px "compact" — see compoundVariants below,
        // which forces primary back to 44px even when size="compact" is
        // requested (DS §4: primary never shrinks).
        default: "h-11",
        compact: "h-9",
      },
    },
    compoundVariants: [
      { variant: "primary", size: "compact", class: "h-11" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

const CONFIRM_TIMEOUT_MS = 3000

/**
 * Button (DS §10). `variant="destructive"` always requires a confirming
 * click: the first click swaps the button's own label to `confirmLabel`
 * (default "Confirm?") and arms a ~3s window; a second click within that
 * window fires `onClick`, otherwise the label reverts. This keeps the
 * confirm interaction self-contained with no external dialog dependency.
 */
const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "default",
      confirmLabel = "Confirm?",
      onClick,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const [confirming, setConfirming] = React.useState(false)
    const timeoutRef = React.useRef(null)

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, [])

    const isDestructive = variant === "destructive"

    const handleClick = (event) => {
      if (!isDestructive) {
        onClick?.(event)
        return
      }

      if (!confirming) {
        setConfirming(true)
        timeoutRef.current = setTimeout(() => {
          setConfirming(false)
          timeoutRef.current = null
        }, CONFIRM_TIMEOUT_MS)
        return
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setConfirming(false)
      onClick?.(event)
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        disabled={disabled}
        aria-label={
          isDestructive && confirming
            ? `${confirmLabel} (click again to confirm)`
            : undefined
        }
        {...props}
      >
        {isDestructive && confirming ? confirmLabel : children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
