export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '10vh auto', padding: '0 24px', lineHeight: 1.6 }}>
      <h1>Brief backend</h1>
      <p>This service is running. It exposes the calendar + booking API:</p>
      <ul>
        <li><code>GET  /api/calendar/google/connect?attorney_id=…</code></li>
        <li><code>GET  /api/calendar/microsoft/connect?attorney_id=…</code></li>
        <li><code>GET  /api/attorneys/[id]/slots</code> — free times only</li>
        <li><code>POST /api/bookings</code></li>
      </ul>
      <p style={{ color: '#666' }}>See <code>README.md</code> for setup and testing.</p>
    </main>
  );
}
