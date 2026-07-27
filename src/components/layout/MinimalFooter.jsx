// DS v2 minimal footer for self-service scheduling surfaces (booking page,
// manage-booking links) — these are not marketplace pages, so the full
// multi-column Footer (browse/attorneys/learn/company) doesn't apply here.
export default function MinimalFooter() {
  return (
    <footer className="py-8 text-center">
      <p className="ds-type-label text-[var(--text-4)]">
        Scheduling by <span className="text-[var(--text-3)]">Brief</span>
      </p>
    </footer>
  );
}
