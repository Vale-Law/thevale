import * as React from "react"

import { cn } from "@/lib/utils"
import "./primitives.css"

/**
 * Field (DS §10 "Inputs"). Label always renders above the control at the
 * `label` type scale (never as a placeholder). Supports text/email/tel via
 * a plain <input> and a multi-line variant via <textarea> — both share
 * the same visual language (border/focus/error) from primitives.css.
 */
const Field = React.forwardRef(
  ({ className, label, error, hint, type = "text", id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const hintId = hint ? `${inputId}-hint` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    const isTextarea = type === "textarea"
    const Comp = isTextarea ? "textarea" : "input"

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="ds-type-label text-[var(--text-2)]"
        >
          {label}
        </label>

        <div className="relative">
          <Comp
            ref={ref}
            id={inputId}
            type={isTextarea ? undefined : type}
            data-error={error ? "true" : undefined}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
            className={cn(
              "ds-type-body-m ds-field-input",
              isTextarea ? "ds-field-textarea w-full px-3 py-2.5" : "h-11 w-full px-3",
              error ? "pr-9" : null,
              className
            )}
            {...props}
          />

          {error ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--noshow)]"
            >
              {/* Simple inline error icon slot — avoids pulling in an icon
                  dependency here; swap for the house icon set later if one
                  gets standardized. */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 4.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.9" fill="currentColor" />
              </svg>
            </span>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} className="text-[13px] leading-4 text-[var(--noshow)]">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-[13px] leading-4 text-[var(--text-2)]">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)
Field.displayName = "Field"

export { Field }
