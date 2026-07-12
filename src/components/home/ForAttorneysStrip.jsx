import { useNavigate } from 'react-router-dom';

export default function ForAttorneysStrip() {
  const navigate = useNavigate();
  const bullets = [
  'Reach thousands of clients ready to book',
  'Set your own availability and pricing',
  'Get paid within 2 days of each consultation'];

  return (
    <section className="bg-white py-20 lg:py-28 px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#EAF2FB] order-2 lg:order-1">
          <img src="https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/19b53e696_ChatGPT_Image_Jul_3__2026_at_01_23_54_AM.png"

          alt="Attorney on Brief"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center top' }} />
          
        </div>
        <div className="order-1 lg:order-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-3">For attorneys</p>
          <h2 className="font-serif font-medium text-[28px] lg:text-[38px] text-[#111418] leading-[1.1] mb-5">
            Are you an attorney looking for new clients?
          </h2>
          <ul className="space-y-3 mb-8">
            {bullets.map((b) =>
            <li key={b} className="flex items-start gap-3 text-[#111418] font-body text-[15px] leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0a5dc2] mt-2 shrink-0" />
                {b}
              </li>
            )}
          </ul>
          <button
            onClick={() => navigate('/for-attorneys')}
            className="px-7 py-3 rounded-full bg-[#111418] text-white text-sm font-body font-medium hover:bg-[#0a5dc2] transition-colors">
            
            List your practice on Brief
          </button>
        </div>
      </div>
    </section>);

}