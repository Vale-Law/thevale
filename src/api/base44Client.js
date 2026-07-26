// Supabase-backed replacement for the Base44 SDK client. Every call site in
// this app already calls `base44.auth.*` / `base44.entities.*` /
// `base44.integrations.Core.*` — this file preserves that exact shape so
// none of those ~140 call sites had to change; only the implementation
// moved from Base44's hosted backend to Supabase. See docs/MIGRATION.md.
import { supabase } from './supabaseClient';

const PROFILE_FIELDS = 'id, role, account_type, preferred_language, requires_spanish_attorney, email, full_name, phone, created_at';

function toAppUser(authUser, profile) {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: profile?.email || authUser.email,
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    role: profile?.role || 'user',
    account_type: profile?.account_type || null,
    preferredLanguage: profile?.preferred_language || null,
    requiresSpanishAttorney: profile?.requires_spanish_attorney || false,
    created_date: profile?.created_at || authUser.created_at,
  };
}

async function fetchProfile(userId) {
  const { data } = await supabase.from('profiles').select(PROFILE_FIELDS).eq('id', userId).maybeSingle();
  return data;
}

async function currentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

const auth = {
  async register({ email, password }) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  async loginViaEmailPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  loginWithProvider(provider, redirectPath) {
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirectPath || '/'}` },
    });
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
    if (error) throw error;
    return { access_token: data?.session?.access_token };
  },

  setToken() {
    // no-op — verifyOtp()/signInWithPassword() already establish the
    // Supabase session client-side; Base44's flow needed an explicit
    // token handoff, Supabase doesn't.
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  },

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async resetPassword({ newPassword }) {
    // Supabase authenticates the user via the recovery link itself (a
    // session is already active by the time they land on /reset-password)
    // rather than a token passed explicitly like Base44's flow.
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const profile = await fetchProfile(user.id);
    return toAppUser(user, profile);
  },

  async updateMe(fields) {
    const authFields = {};
    if ('email' in fields) authFields.email = fields.email;
    if ('password' in fields) authFields.password = fields.password;
    if (Object.keys(authFields).length) {
      const { error } = await supabase.auth.updateUser(authFields);
      if (error) throw error;
    }

    const profileFields = {};
    if ('full_name' in fields) profileFields.full_name = fields.full_name;
    if ('phone' in fields) profileFields.phone = fields.phone;
    if ('role' in fields) profileFields.role = fields.role;
    if ('account_type' in fields) profileFields.account_type = fields.account_type;
    if ('preferredLanguage' in fields) profileFields.preferred_language = fields.preferredLanguage;
    if ('requiresSpanishAttorney' in fields) profileFields.requires_spanish_attorney = fields.requiresSpanishAttorney;
    if ('email' in fields) profileFields.email = fields.email;

    if (Object.keys(profileFields).length) {
      const userId = await currentUserId();
      const { error } = await supabase.from('profiles').update(profileFields).eq('id', userId);
      if (error) throw error;
    }
  },

  logout(redirectUrl) {
    supabase.auth.signOut().then(() => {
      if (redirectUrl) window.location.href = redirectUrl;
    });
  },

  redirectToLogin(returnUrl) {
    window.location.href = `/login?from=${encodeURIComponent(returnUrl || '/')}`;
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
};

function makeEntity(table) {
  return {
    async list(sort, limit) {
      let query = supabase.from(table).select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const col = desc ? sort.slice(1) : sort;
        query = query.order(col === 'created_date' ? 'created_at' : col, { ascending: !desc });
      }
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    async filter(match) {
      const { data, error } = await supabase.from(table).select('*').match(match);
      if (error) throw error;
      return data;
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async create(fields) {
      const { data, error } = await supabase.from(table).insert(fields).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, fields) {
      const { data, error } = await supabase.from(table).update(fields).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
  };
}

const bookingEntity = makeEntity('bookings');
const bookingCreate = bookingEntity.create;
bookingEntity.create = async (fields) => bookingCreate({ ...fields, client_id: await currentUserId() });

const caseSummaryEntity = makeEntity('case_summaries');
const caseSummaryCreate = caseSummaryEntity.create;
caseSummaryEntity.create = async (fields) => caseSummaryCreate({ ...fields, created_by_id: await currentUserId() });

const entities = {
  Attorney: makeEntity('attorneys'),
  Booking: bookingEntity,
  CaseSummary: caseSummaryEntity,
  Waitlist: makeEntity('waitlist'),
  Review: makeEntity('reviews'),
  User: makeEntity('profiles'),
};

function fileExtension(name) {
  const idx = name?.lastIndexOf('.') ?? -1;
  return idx >= 0 ? name.slice(idx) : '';
}

const integrations = {
  Core: {
    async UploadFile({ file }) {
      const userId = await currentUserId();
      const path = `${userId}/${Date.now()}${fileExtension(file.name)}`;
      const { error } = await supabase.storage.from('attorney-photos').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('attorney-photos').getPublicUrl(path);
      return { file_url: data.publicUrl };
    },

    async UploadPrivateFile({ file }) {
      const userId = await currentUserId();
      const path = `${userId}/${Date.now()}${fileExtension(file.name)}`;
      const { error } = await supabase.storage.from('attorney-documents').upload(path, file, { upsert: true });
      if (error) throw error;
      return { file_uri: path };
    },

    async CreateFileSignedUrl({ file_uri }) {
      const { data, error } = await supabase.storage.from('attorney-documents').createSignedUrl(file_uri, 600);
      if (error) throw error;
      return { signed_url: data.signedUrl };
    },

    // Can't send email client-side with a provider API key — routed
    // through a Vercel serverless function instead. If no email provider
    // is configured yet, the function returns a non-2xx and callers here
    // already treat email failures as non-fatal (try/catch + console.error).
    async SendEmail({ to, subject, body }) {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      return res.json();
    },
  },
};

// No analytics backend is wired up post-migration; calls are no-ops so
// call sites (~10 of them) that fire-and-forget tracking events don't throw
// and block the navigation/booking logic that follows them.
const analytics = {
  track() {},
};

export const base44 = { auth, entities, integrations, analytics };
