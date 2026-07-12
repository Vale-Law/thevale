import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function FounderVision() {
  const ref = useScrollReveal();

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#F5F0E8]" ref={ref}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Founders */}
        <div className="fade-up-child order-2 lg:order-1">
          <div className="grid grid-cols-2 gap-8 max-w-[440px]">
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-4 flex-shrink-0"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid #E5E2DC',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src="https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/1de2ebd74_41332B7C-06D0-403E-9152-5D77CA2FB580.jpeg"
                  alt="Ola Kuforiji"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
              <h3 className="font-serif text-[18px] text-[#111418] mb-0.5">Ola Kuforiji</h3>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body">Co-Founder</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-4 flex-shrink-0"
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid #E5E2DC',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src="https://media.base44.com/images/public/6a20eafdf3fbb0512c514d25/b93616956_IMG_0310.PNG"
                  alt="Timothy Ogunlowo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </div>
              <h3 className="font-serif text-[18px] text-[#111418] mb-0.5">Timothy Ogunlowo</h3>
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8A8578] font-body">Co-Founder</p>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="fade-up-child order-1 lg:order-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] mb-5 font-body">Our vision</p>
          <h2 className="font-serif font-medium text-[28px] lg:text-[38px] text-[#111418] leading-[1.1] mb-6">
            Legal help should be for everyone.
          </h2>
          <p className="text-[#8A8578] leading-relaxed mb-4">
            Brief connects everyday people with great lawyers — and removes the barriers that have kept good legal help out of reach for too long.
          </p>
          <p className="text-[#8A8578] leading-relaxed mb-4">
            The legal system has never worked equally for everyone. Getting a good lawyer has come down to who you know and what you can afford. We don't think it should be that way.
          </p>
          <p className="text-[#8A8578] leading-relaxed mb-4">
            So we built Brief to change it. Every attorney is licensed, vetted, and verified, with honest, upfront pricing — and with flexible financing.
          </p>
          <p className="text-[#8A8578] leading-relaxed">
            The best attorneys, made accessible. Schedule today, and get the help you deserve.
          </p>
        </div>
      </div>
    </section>
  );
}