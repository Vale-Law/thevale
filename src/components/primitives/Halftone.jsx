import * as React from "react"

import { cn } from "@/lib/utils"
import "./primitives.css"

const DIRECTION_CLASS = {
  down: "", // tokens.css's base `.halftone::before` mask is already a downward fade.
  radial: "ds-halftone--radial",
  up: "ds-halftone--up",
}

/**
 * Halftone (DS §8.1 — "the surface signature"). Layout-transparent wrapper:
 * it applies the `.halftone` class (position: relative; isolation: isolate
 * + a textured ::before, from tokens.css) to whatever's inside, without
 * forcing any size of its own. `direction="down"` (default) uses tokens.css's
 * base mask as-is; `radial` and `up` swap in an alternate mask-image via the
 * modifier classes in primitives.css, since tokens.css's spec only defines a
 * fixed downward gradient.
 */
const Halftone = React.forwardRef(({ className, direction = "down", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("halftone", DIRECTION_CLASS[direction], className)}
      {...props}
    >
      {children}
    </div>
  )
})
Halftone.displayName = "Halftone"

export { Halftone }
