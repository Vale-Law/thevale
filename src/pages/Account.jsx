import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n';
import { ChevronRight, LogIn, LogOut, User, CalendarClock, Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function Account() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const initialSection = searchParams.get('section');
  const [section, setSection] = useState(
    initialSection === 'bookings' || initialSection === 'settings' ? initialSection : 'account'
  );

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      if (ok) {
        base44.auth.me().then((u) => {
          setUser(u);
          setChecked(true);
          setBookingsLoading(true);
          base44.entities.Booking.filter({ client_email: u.email })
            .then(setBookings)
            .catch(() => {})
            .finally(() => setBookingsLoading(false));
        }).catch(() => setChecked(true));
      } else {
        setChecked(true);
      }
    });
  }, []);

  const [deleteRequested, setDeleteRequested] = useState(false);
  const logout = async () => { await base44.auth.logout('/'); };
  const requestDeletion = async () => {
    try {
      await base44.integrations.Core.SendEmail({
        to: 'olaolukuforiji@gmail.com',
        subject: 'Data deletion request',
        body: `User ${user?.full_name || ''} (${user?.email}) requested deletion of their account data and any booking descriptions they have written.`,
      });
    } catch (e) { /* best effort */ }
    setDeleteRequested(true);
  };

  const links = [
    { label: t('account.areas'), to: '/areas-of-help' },
    { label: t('account.forAttorneys'), to: '/for-attorneys' },
    { label: t('account.learn'), to: '/learn' },
    { label: t('account.financing'), to: '/financing' },
  ];

  const now = new Date();
  const upcoming = bookings
    .filter(b => b.slot && new Date(b.slot) >= now)
    .sort((a, b) => new Date(a.slot) - new Date(b.slot));
  const past = bookings
    .filter(b => b.slot && new Date(b.slot) < now)
    .sort((a, b) => new Date(b.slot) - new Date(a.slot));

  const navItems = [
    { key: 'account', label: t('account.title'), Icon: User },
    { key: 'bookings', label: t('account.navBookings'), Icon: CalendarClock },
    { key: 'settings', label: t('account.settings'), Icon: Settings },
  ];

  const renderBookingCard = (b) => (
    <div key={b.id} className="bg-white border border-[#E5E2DC] p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="font-serif text-[#111418]">{b.attorney_name || t('bookings.attorney')}</span>
        <span className="text-xs uppercase tracking-[0.08em] text-[#8A8578] font-body">{b.status}</span>
      </div>
      {b.sub_area && (
        <p className="text-sm text-[#8A8578] font-body">{b.sub_area}</p>
      )}
      {b.slot && (
        <p className="text-sm text-[#8A8578] font-body">
          {format(new Date(b.slot), 'EEE, MMM d · h:mm a')}
        </p>
      )}
      {b.case_summary && (
        <p className="text-xs text-[#8A8578] font-body mt-2 italic">"{b.case_summary}"</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Header />

      {/* Mobile / tablet: single column (unchanged) */}
      <div className="lg:hidden max-w-[640px] mx-auto px-5 py-8">
        <h1 className="font-serif text-[28px] text-[#111418] mb-6">{t('account.title')}</h1>

        <div className="bg-white border border-[#E5E2DC] p-5 mb-5">
          {checked && user ? (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body">{t('account.signedInAs')}</p>
                <p className="font-serif text-lg text-[#111418] truncate">{user.full_name || user.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E2DC] text-sm text-[#111418] font-body hover:border-[#111418] transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" /> {t('account.logout')}
              </button>
            </div>
          ) : checked ? (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#111418] text-white text-sm font-body"
            >
              <LogIn className="w-4 h-4" /> {t('account.login')}
            </button>
          ) : null}
        </div>

        <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-3">{t('account.language')}</p>
        <div className="bg-white border border-[#E5E2DC] p-5 mb-6">
          <LanguageSwitcher />
        </div>

        <div className="bg-white border border-[#E5E2DC] divide-y divide-[#E5E2DC]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center justify-between px-5 py-4 text-[#111418] font-body hover:bg-[#FAF9F7] transition-colors"
            >
              <span className="text-sm">{l.label}</span>
              <ChevronRight className="w-4 h-4 text-[#8A8578]" />
            </Link>
          ))}
        </div>

        <div className="bg-white border border-[#E5E2DC] p-5 mt-6">
          <h2 className="font-serif text-lg text-[#111418] mb-2">Delete my data</h2>
          <p className="text-sm text-[#8A8578] font-body mb-4">Request deletion of your account information and any booking descriptions you've written.</p>
          {deleteRequested ? (
            <p className="text-sm text-green-600 font-body">Request received — we'll email you a confirmation.</p>
          ) : (
            <button onClick={requestDeletion} className="px-4 py-2.5 border border-[#E5E2DC] text-sm text-[#111418] font-body hover:border-[#111418] transition-colors">Request deletion</button>
          )}
        </div>
      </div>

      {/* Desktop: two-column sidebar layout */}
      <div className="hidden lg:block">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-14">
          <h1 className="font-serif text-[40px] text-[#111418] mb-10">{t('account.title')}</h1>
          <div className="grid grid-cols-[220px_1fr] gap-12">
            <aside className="bg-white border border-[#E5E2DC] divide-y divide-[#E5E2DC] h-fit">
              {navItems.map(({ key, label, Icon }) => {
                const active = section === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left font-body text-sm transition-colors"
                    style={{
                      background: active ? '#FAF9F7' : '#fff',
                      color: active ? '#0a5dc2' : '#111418',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: active ? '#0a5dc2' : '#8A8578' }} />
                    {label}
                  </button>
                );
              })}
            </aside>

            <div className="max-w-[640px]">
              {!checked ? null : !user ? (
                <div className="bg-white border border-[#E5E2DC] p-10 text-center">
                  <p className="text-[#8A8578] font-body mb-4">{t('bookings.loginPrompt')}</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-[#111418] text-white text-sm font-body"
                  >
                    {t('account.login')}
                  </button>
                </div>
              ) : section === 'account' ? (
                <div className="space-y-6">
                  <div className="bg-white border border-[#E5E2DC] p-6">
                    <h2 className="font-serif text-[22px] text-[#111418] mb-5">{t('account.profile')}</h2>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-0.5">{t('account.signedInAs')}</dt>
                        <dd className="font-serif text-lg text-[#111418]">{user.full_name || user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-0.5">{t('account.email')}</dt>
                        <dd className="text-sm text-[#111418] font-body">{user.email}</dd>
                      </div>
                      {user.phone ? (
                        <div>
                          <dt className="text-[11px] uppercase tracking-[0.1em] text-[#8A8578] font-body mb-0.5">{t('account.phone')}</dt>
                          <dd className="text-sm text-[#111418] font-body">{user.phone}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                  <div className="bg-white border border-[#E5E2DC] divide-y divide-[#E5E2DC]">
                    {links.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="flex items-center justify-between px-5 py-4 text-[#111418] font-body hover:bg-[#FAF9F7] transition-colors"
                      >
                        <span className="text-sm">{l.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#8A8578]" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : section === 'bookings' ? (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-[22px] text-[#111418] mb-4">{t('account.upcoming')}</h2>
                    {bookingsLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="w-6 h-6 border-2 border-[#E5E2DC] border-t-[#0a5dc2] rounded-full animate-spin" />
                      </div>
                    ) : upcoming.length === 0 ? (
                      <p className="text-sm text-[#8A8578] font-body">{t('account.noUpcoming')}</p>
                    ) : (
                      <div className="space-y-3">{upcoming.map(renderBookingCard)}</div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif text-[22px] text-[#111418] mb-4">{t('account.past')}</h2>
                    {past.length === 0 ? (
                      <p className="text-sm text-[#8A8578] font-body">{t('account.noPast')}</p>
                    ) : (
                      <div className="space-y-3">{past.map(renderBookingCard)}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white border border-[#E5E2DC] p-6">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8578] font-body mb-3">{t('account.language')}</p>
                    <LanguageSwitcher />
                  </div>
                  <div className="bg-white border border-[#E5E2DC] p-6">
                    <h2 className="font-serif text-[22px] text-[#111418] mb-2">Delete my data</h2>
                    <p className="text-sm text-[#8A8578] font-body mb-4">Request deletion of your account information and any booking descriptions you've written. We'll email you a confirmation.</p>
                    {deleteRequested ? (
                      <p className="text-sm text-green-600 font-body">Request received — we'll email you a confirmation.</p>
                    ) : (
                      <button onClick={requestDeletion} className="px-4 py-2.5 border border-[#E5E2DC] text-sm text-[#111418] font-body hover:border-[#111418] transition-colors">Request deletion</button>
                    )}
                  </div>
                  <div className="bg-white border border-[#E5E2DC] p-6">
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E2DC] text-sm text-[#111418] font-body hover:border-[#111418] transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> {t('account.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}