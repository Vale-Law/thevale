import { useNavigate } from 'react-router-dom';

export default function CtaBand() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#F5F0E8] py-24 lg:py-32 px-6 lg:px-8 text-center">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="font-serif font-bold text-[40px] lg:text-[60px] text-[#111418] leading-[1.05] mb-8">
          Find Your Lawyer Today.
        </h2>
        <button
          onClick={() => navigate('/?browse=1')}
          className="inline-flex items-center px-10 py-4 bg-[#111418] text-white text-sm font-medium hover:bg-[#0a5dc2] transition-all duration-200 hover:scale-[1.02]"
        >
          Browse Attorneys →
        </button>
      </div>
    </section>
  );
}