-- Seed a realistic booking pipeline for every attorney that has none.
--
-- The admin dashboard (base44.entities.Booking.list via src/pages/admin/AdminDashboard.jsx)
-- and the attorney dashboard (src/lib/metrics.js, computeMetrics over the
-- firm's bookings) both compute their numbers directly from the bookings
-- table. With zero rows in that table, both dashboards are legitimately
-- empty -- not broken, just never exercised with any data. This backfills
-- a believable pipeline per attorney: 3 completed consultations (spread
-- over the past several weeks, so the weekly-bookings chart has a real
-- shape), one upcoming confirmed consultation, and one new pending
-- request -- plus the matching booking_status_events audit trail and
-- consultation_charges ledger entries those statuses imply.
--
-- Idempotent: skips any attorney that already has at least one booking
-- (real or previously seeded), so it's safe to re-run and will never
-- touch a real attorney's real pipeline.
--
-- Client names/emails are fictional, reusing the same .example.com
-- convention as supabase/seed.sql (RFC 2606 reserved domain -- these can
-- never actually receive mail).
--
-- Wave 1 guard: this file is DEMO DATA and must never execute as part of
-- the ordered production migrate path (supabase db push / migration up
-- would otherwise fabricate completed bookings, 'charged'
-- consultation_charges rows, and fake client PII for every real attorney
-- with an empty pipeline). The do-block below therefore exits immediately
-- unless the session explicitly opts in. To seed a local/dev database:
--
--   psql "$DB_URL" \
--     -c "set vale.seed_demo_pipeline = 'on'" \
--     -f supabase/migrations/20260728120000_seed_demo_booking_pipeline.sql
--
-- (both -c and -f run on the same connection, so the session GUC is still
-- set when the file executes). A plain migration run never sets the GUC,
-- so in production this file is a no-op.

begin;

do $$
declare
  att record;
  client_names text[] := array[
    'Monica Herrera', 'David Kowalski', 'Brianna Silva', 'Terrence Wallace',
    'Yesenia Cardenas', 'Preston Vaughn', 'Caroline Ashford', 'Marcus Tran',
    'Lucia Mendoza', 'Jorge Castillo', 'Aisha Mohammed', 'Kevin O''Rourke'
  ];
  n_clients int;
  booking_id uuid;
  i int;
  chosen_name text;
  slot_ts timestamptz;
  fee numeric;
begin
  if coalesce(current_setting('vale.seed_demo_pipeline', true), '') <> 'on' then
    raise notice 'seed_demo_booking_pipeline: skipped (set vale.seed_demo_pipeline = ''on'' in this session to run the demo seed; see file header)';
    return;
  end if;

  n_clients := array_length(client_names, 1);

  for att in select id, name, consult_fee from public.attorneys loop
    if exists (select 1 from public.bookings where attorney_id = att.id) then
      continue;
    end if;

    fee := coalesce(att.consult_fee, 100);

    -- Three completed consultations, spread over the past ~2 months.
    for i in 1..3 loop
      chosen_name := client_names[1 + floor(random() * n_clients)::int];
      slot_ts := now() - (interval '1 week' * (i * 2 + (att.consult_fee::int % 3)))
                 + (interval '1 day' * (floor(random() * 5))::int)
                 + interval '14 hours';
      booking_id := gen_random_uuid();

      insert into public.bookings (
        id, client_name, client_email, client_phone,
        attorney_id, attorney_name, slot, slot_start, slot_end,
        status, urgency, payment_method, source,
        confirmed_at, confirmed_by, created_at, updated_at
      ) values (
        booking_id, chosen_name,
        lower(regexp_replace(chosen_name, '[^a-zA-Z]', '.', 'g')) || '@example.com',
        '(555) 555-01' || lpad((i * 7)::text, 2, '0'),
        att.id, att.name, slot_ts, slot_ts, slot_ts + interval '30 minutes',
        'completed', 'Soon', 'full', 'directory',
        slot_ts - interval '2 days', 'client',
        slot_ts - interval '3 days', slot_ts
      );

      insert into public.booking_status_events (booking_id, from_status, to_status, actor_role, created_at) values
        (booking_id, null, 'pending', 'client', slot_ts - interval '3 days'),
        (booking_id, 'pending', 'confirmed', 'staff', slot_ts - interval '2 days'),
        (booking_id, 'confirmed', 'completed', 'system', slot_ts + interval '1 hour');

      insert into public.consultation_charges (booking_id, attorney_id, amount_cents, status, charged_at)
      values (booking_id, att.id, (fee * 100)::int, 'charged', slot_ts + interval '1 hour');
    end loop;

    -- One upcoming confirmed consultation.
    slot_ts := now() + interval '4 days' + interval '15 hours';
    booking_id := gen_random_uuid();
    chosen_name := client_names[1 + floor(random() * n_clients)::int];
    insert into public.bookings (
      id, client_name, client_email, client_phone,
      attorney_id, attorney_name, slot, slot_start, slot_end,
      status, urgency, payment_method, source,
      confirmed_at, confirmed_by, created_at, updated_at
    ) values (
      booking_id, chosen_name,
      lower(regexp_replace(chosen_name, '[^a-zA-Z]', '.', 'g')) || '@example.com',
      '(555) 555-0180',
      att.id, att.name, slot_ts, slot_ts, slot_ts + interval '30 minutes',
      'confirmed', 'Soon', 'full', 'directory',
      now() - interval '1 day', 'client',
      now() - interval '2 days', now() - interval '1 day'
    );
    insert into public.booking_status_events (booking_id, from_status, to_status, actor_role, created_at) values
      (booking_id, null, 'pending', 'client', now() - interval '2 days'),
      (booking_id, 'pending', 'confirmed', 'staff', now() - interval '1 day');
    insert into public.consultation_charges (booking_id, attorney_id, amount_cents, status)
    values (booking_id, att.id, (fee * 100)::int, 'pending');

    -- One new, undecided request -- gives the "needs action" pipeline
    -- state a real row to show, not just a zero.
    slot_ts := now() + interval '9 days' + interval '10 hours';
    booking_id := gen_random_uuid();
    chosen_name := client_names[1 + floor(random() * n_clients)::int];
    insert into public.bookings (
      id, client_name, client_email, client_phone,
      attorney_id, attorney_name, slot, slot_start, slot_end,
      status, urgency, payment_method, source,
      created_at, updated_at
    ) values (
      booking_id, chosen_name,
      lower(regexp_replace(chosen_name, '[^a-zA-Z]', '.', 'g')) || '@example.com',
      '(555) 555-0199',
      att.id, att.name, slot_ts, slot_ts, slot_ts + interval '30 minutes',
      'pending', 'Just exploring', 'full', 'directory',
      now() - interval '6 hours', now() - interval '6 hours'
    );
    insert into public.booking_status_events (booking_id, from_status, to_status, actor_role, created_at) values
      (booking_id, null, 'pending', 'client', now() - interval '6 hours');
  end loop;
end $$;

commit;
