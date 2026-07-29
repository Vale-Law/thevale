import { useNavigate } from 'react-router-dom';

export default function CtaBand() {
  const navigate = useNavigate();

  return (
    <section className="bg-[var(--ground)] py-24 lg:py-32 px-6 lg:px-8 text-center">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-serif font-bold text-[40px] lg:text-[60px] text-[var(--text)] leading-[1.05] mb-8">
          Find Your Lawyer Today.
        </h2>
        <button
          onClick={() => navigate('/areas-of-help')}
          className="inline-flex items-center px-10 py-4 bg-[var(--text)] text-[var(--ground)] text-sm font-medium hover:bg-[var(--accent)] transition-all duration-200 hover:scale-[1.02]"
        >
          Browse Attorneys →
        </button>
      </div>
    </section>
  );
}