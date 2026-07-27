import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import "./primitives.css"

// DS §10 — Card. `tone="raised"` (default) sits on --surface and lifts on
// hover; `tone="recessed"` sits on --ground and never lifts (no shadow).
// `position: relative` is kept on the root so a <Tab> can be absolutely
// positioned against this card's top edge by the caller (see Tab.jsx).
const cardVariants = cva("relative rounded-[var(--radius-m)] border border-[var(--line)]", {
  variants: {
    tone: {
      raised: "bg-[var(--surface)] ds-card--raised",
      recessed: "bg-[var(--ground)]",
    },
    density: {
      comfortable: "p-6",
      compact: "p-4",
    },
  },
  defaultVariants: {
    tone: "raised",
    density: "comfortable",
  },
})

/**
 * Card (DS §10). Note: the hover lift + shadow (`--shadow-raised`, 2px
 * translateY) only applies in `tone="raised"` — recessed cards are meant
 * to read as de-emphasized/static, so they opt out of the hover treatment
 * entirely rather than just muting it.
 */
const Card = React.forwardRef(
  ({ className, tone = "raised", density = "comfortable", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ tone, density, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card, cardVariants }
