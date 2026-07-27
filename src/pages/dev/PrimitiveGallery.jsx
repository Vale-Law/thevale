import React from "react"

import {
  Button,
  Field,
  Card,
  Tab,
  StatusDot,
  TimeSlot,
  Halftone,
} from "@/components/primitives"

const STATUSES = ["pending", "confirmed", "completed", "no_show"]
const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

/**
 * Dev-only verification gallery for the 7 Brief Design System v2
 * primitives in src/components/primitives/**. Not wired into any router
 * yet — a later unit imports this component and mounts a route for it.
 */
export default function PrimitiveGallery() {
  const [selectedSlot, setSelectedSlot] = React.useState("10:00 AM")

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 p-8">
      <header>
        <h1 className="text-2xl font-bold">Primitive Gallery</h1>
        <p className="text-sm text-[var(--text-2)]">
          Verification surface for src/components/primitives — every state, side by side.
        </p>
      </header>

      <Section title="Button">
        <div className="flex flex-col gap-6">
          {["primary", "secondary", "ghost", "destructive"].map((variant) => (
            <div key={variant} className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wide text-[var(--text-2)]">
                {variant}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant={variant} size="default">
                  {variant === "destructive" ? "Delete booking" : "Default size"}
                </Button>
                <Button variant={variant} size="compact">
                  Compact
                </Button>
                {variant === "destructive" ? (
                  <Button
                    variant="destructive"
                    confirmLabel="Really delete?"
                    onClick={() => window.alert("Deleted (confirmed)")}
                  >
                    Delete client record
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Field">
        <div className="grid max-w-md grid-cols-1 gap-6">
          <Field label="Full name" placeholder="Jane Doe" hint="As it appears on your ID" />
          <Field
            label="Email"
            type="email"
            defaultValue="not-an-email"
            error="Enter a valid email address"
          />
          <Field label="Phone" type="tel" placeholder="(555) 555-5555" />
          <Field
            label="Notes for the attorney"
            type="textarea"
            placeholder="Anything we should know before the call?"
          />
        </div>
      </Section>

      <Section title="Card + Tab">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {["raised", "recessed"].map((tone) =>
            ["comfortable", "compact"].map((density) => (
              <Card key={`${tone}-${density}`} tone={tone} density={density} className="pt-6">
                <Tab status={STATUSES[(tone === "raised" ? 0 : 2) + (density === "compact" ? 1 : 0)]} />
                <p className="text-sm font-semibold">
                  tone="{tone}" density="{density}"
                </p>
                <p className="mt-1 text-sm text-[var(--text-2)]">
                  Raised cards lift + shadow on hover; recessed cards stay flat.
                </p>
              </Card>
            ))
          )}
        </div>
        <div className="flex flex-wrap gap-6 pt-2">
          {STATUSES.map((status) => (
            <Card key={status} tone="raised" density="compact" className="relative w-40 pt-5">
              <Tab status={status} />
              <p className="text-xs">{STATUS_LABEL[status]}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="StatusDot">
        <div className="flex flex-wrap gap-6">
          {STATUSES.map((status) => (
            <div key={status} className="flex items-center gap-2 text-sm">
              <StatusDot status={status} />
              {STATUS_LABEL[status]}
            </div>
          ))}
        </div>
      </Section>

      <Section title="TimeSlot">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"].map(
            (time, i) => {
              const unavailable = i === 1 || i === 4
              return (
                <TimeSlot
                  key={time}
                  selected={selectedSlot === time}
                  unavailable={unavailable}
                  onClick={() => setSelectedSlot(time)}
                >
                  {time}
                </TimeSlot>
              )
            }
          )}
        </div>
      </Section>

      <Section title="Halftone">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {["down", "radial", "up"].map((direction) => (
            <Halftone key={direction} direction={direction} className="rounded-[var(--radius-m)] bg-[var(--ground)] p-8">
              <p className="text-sm font-semibold">direction="{direction}"</p>
              <p className="mt-1 text-sm text-[var(--text-2)]">
                Content renders normally; the halftone texture sits behind it.
              </p>
            </Halftone>
          ))}
        </div>
      </Section>
    </div>
  )
}
