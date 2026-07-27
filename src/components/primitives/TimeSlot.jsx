import * as React from "react"

import { cn } from "@/lib/utils"
import "./primitives.css"

/**
 * TimeSlot (DS §10 "Time slots"). Unavailable slots are visually
 * de-emphasized (--surface-sunk fill, --text-4 text) and non-interactive —
 * DS explicitly forbids signalling "unavailable" with a strikethrough, so
 * this never applies text-decoration: line-through regardless of state.
 */
const TimeSlot = React.forwardRef(
  ({ className, selected = false, unavailable = false, onClick, disabled, ...props }, ref) => {
    const isDisabled = disabled || unavailable

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-pressed={selected}
        aria-disabled={unavailable || undefined}
        onClick={unavailable ? undefined : onClick}
        className={cn(
          "ds-type-data ds-timeslot h-11 w-full",
          selected
            ? "border-transparent bg-[var(--accent)] text-[var(--accent-on)]"
            : unavailable
            ? "border-transparent bg-[var(--surface-sunk)] text-[var(--text-4)]"
            : "border-[var(--line)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--accent)]",
          className
        )}
        {...props}
      />
    )
  }
)
TimeSlot.displayName = "TimeSlot"

export { TimeSlot }
