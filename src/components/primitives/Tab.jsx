import * as React from "react"

import { cn } from "@/lib/utils"
import "./primitives.css"

const STATUS_TOKEN = {
  pending: "var(--pending)",
  confirmed: "var(--confirmed)",
  completed: "var(--completed)",
  no_show: "var(--noshow)",
}

/**
 * Tab (DS §9 — "the record signature"). A file-folder tab meant to sit on
 * a Card's top edge: 6px tall / 56px wide, 20px inset from the left,
 * rounded on the top two corners only, growing to 9px on hover.
 *
 * Positioning judgment call: the component only knows `position: absolute;
 * top: 0; left: 20px` (from primitives.css's `.ds-tab`) — it does NOT set
 * position on any ancestor. The parent Card in this same file boundary
 * already carries `relative` (see Card.jsx) so `<Card><Tab status=.../>...
 * </Card>` positions correctly out of the box; if Tab is ever used inside
 * a non-Card container, that container is responsible for `position:
 * relative` (or equivalent), same as any absolutely-positioned child.
 *
 * `status` maps to the booking-status tokens and takes precedence over the
 * generic `color` escape hatch (reserved for Phase-2 practice-area colors).
 */
const Tab = React.forwardRef(({ className, status, color, style, ...props }, ref) => {
  const background = (status && STATUS_TOKEN[status]) || color || "var(--pending)"

  return (
    <div
      ref={ref}
      role="presentation"
      className={cn("ds-tab", className)}
      style={{ backgroundColor: background, ...style }}
      {...props}
    />
  )
})
Tab.displayName = "Tab"

export { Tab }
