export default function AttorneyBeat({ heading, children }) {
  return (
    <section className="py-16 lg:py-24 px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl sm:text-4xl text-[var(--text)] leading-[1.15] mb-5">
            {heading}
          </h2>
          <div className="text-base sm:text-lg text-[var(--text-2)] font-body leading-[1.7] space-y-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
