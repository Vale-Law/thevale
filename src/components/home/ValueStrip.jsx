import { useNavigate } from 'react-router-dom';

export default function ValueStrip() {
  const navigate = useNavigate();
  return (
    <section className="bg-[#F4E4D0] py-20 lg:py-28 px-6 lg:px-8 text-center">
      <div className="max-w-[760px] mx-auto">
        <h2 className="font-serif font-medium text-[30px] lg:text-[44px] text-[#111418] leading-[1.1]">
          Thousands of attorneys. One place.
        </h2>
        <p className="text-[#5d5d5d] font-body mt-4 max-w-xl mx-auto leading-relaxed">
          Brief is the quickest way to find, compare, and book the right lawyer for your situation — with transparent pricing and flexible financing.
        </p>
        <button
          onClick={() => navigate('/?browse=1')}
          className="mt-8 px-7 py-3 rounded-full bg-[#111418] text-white text-sm font-body font-medium hover:bg-[#0a5dc2] transition-colors"
        >
          Browse attorneys
        </button>
      </div>
    </section>
  );
}