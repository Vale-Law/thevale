import * as React from "react"

import { cn } from "@/lib/utils"

const STATUS_TOKEN = {
  pending: "var(--pending)",
  confirmed: "var(--confirmed)",
  completed: "var(--completed)",
  no_show: "var(--noshow)",
  // See Tab.jsx -- reuses --oxblood, no dedicated token for this status.
  disputed: "var(--oxblood)",
}

/**
 * StatusDot (DS §2.3 — "never signal status by color alone"). Renders only
 * the colored dot, never the label — callers compose it with their own
 * text, e.g. `<StatusDot status="pending" /> Pending`, so the color is
 * always paired with a real word rather than standing alone.
 */
const StatusDot = React.forwardRef(({ className, status, style, ...props }, ref) => {
  const background = (status && STATUS_TOKEN[status]) || "var(--text-2)"

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("inline-block h-2 w-2 shrink-0 rounded-[var(--radius-full)]", className)}
      style={{ backgroundColor: background, ...style }}
      {...props}
    />
  )
})
StatusDot.displayName = "StatusDot"

export { StatusDot }
