export default function CityGifBanner() {
  return (
    <section className="w-full" style={{ overflow: 'hidden' }}>
      <img
        src="/images/hero-nyc.gif"
        alt="Busy Times Square street scene with traffic, pedestrians, and neon billboards"
        className="w-full"
        style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
      />
    </section>
  );
}