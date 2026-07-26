import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Loader2, CalendarClock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { format } from 'date-fns';

export default function Bookings() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      if (!ok) { setLoading(false); return; }
      base44.auth.me().then((u) => {
        setUser(u);
        base44.entities.Booking.filter({ client_email: u.email })
          .then(setBookings)
          .catch(() => {})
          .finally(() => setLoading(false));
      }).catch(() => setLoading(false));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-2">{t('tab.bookings')}</p>
        <h1 className="font-serif text-[28px] text-[#111418] mb-6">{t('bookings.title')}</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#0a5dc2] animate-spin" />
          </div>
        ) : !user ? (
          <div className="text-center py-16">
            <p className="text-[#8A8578] font-body mb-4">{t('bookings.loginPrompt')}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-[#111418] text-white text-sm font-body"
            >
              {t('bookings.login')}
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <CalendarClock className="w-10 h-10 text-[#E5E2DC] mx-auto mb-4" />
            <p className="font-serif text-lg text-[#111418] mb-1">{t('bookings.empty')}</p>
            <p className="text-[#8A8578] font-body text-sm">{t('bookings.emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white border border-[#E5E2DC] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif text-[#111418]">{b.attorney_name || t('bookings.attorney')}</span>
                  <span className="text-xs uppercase tracking-[0.08em] text-[#8A8578] font-body">{b.status}</span>
                </div>
                {b.slot && (
                  <p className="text-sm text-[#8A8578] font-body">
                    {format(new Date(b.slot), 'EEE, MMM d · h:mm a')}
                  </p>
                )}
                {b.case_summary && (
                  <p className="text-xs text-[#8A8578] font-body mt-2 italic">"{b.case_summary}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}