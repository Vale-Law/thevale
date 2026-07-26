-- The Vale: sample attorney directory data.
--
-- Eight fictional verified attorneys (two per practice area) plus client
-- reviews, so the Browse section and profile pages render with real-looking
-- content. Photos are hotlinked Unsplash portraits; emails/phones/bar numbers
-- are fictional (555-01xx range, .example.com domains).
--
-- Re-runnable: rows use fixed UUIDs and are deleted before insert (reviews
-- cascade). available_slots are generated relative to the run date, so
-- re-running this file refreshes the "Next available" times shown in the UI.
--
-- Run against the live project with: psql < supabase/seed.sql
-- (or paste into the Supabase SQL editor / apply via MCP execute_sql).

begin;

-- Builds sorted ISO-8601 slot strings (UTC) offset from today, matching the
-- text[] format the frontend parses with `new Date(slot)`.
create or replace function pg_temp.seed_slots(day_offsets int[], hours int[])
returns text[]
language sql
as $$
  select array_agg(
    to_char((current_date + d)::timestamp + make_interval(hours => h),
            'YYYY-MM-DD"T"HH24:MI:SS"+00:00"')
    order by d, h)
  from unnest(day_offsets) d, unnest(hours) h
$$;

delete from public.attorneys where id in (
  'aaaaaaaa-0000-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000002',
  'aaaaaaaa-0000-4000-8000-000000000003',
  'aaaaaaaa-0000-4000-8000-000000000004',
  'aaaaaaaa-0000-4000-8000-000000000005',
  'aaaaaaaa-0000-4000-8000-000000000006',
  'aaaaaaaa-0000-4000-8000-000000000007',
  'aaaaaaaa-0000-4000-8000-000000000008'
);

insert into public.attorneys (
  id, name, practice_area, practice_areas, photo, consult_fee, typical_retainer,
  location, state, city, distance, rating, review_count, years_experience,
  languages, languages_spoken, spanish_speaker, bilingual_staff,
  interpreter_available, translated_documents,
  verified, verification_status, verified_date,
  board_certified, board_cert_body, board_cert_specialty, board_cert_approved,
  education, bar_admission, bar_state, bar_number,
  specialties, bio, available_slots,
  email, phone_number, office_location,
  profile_attestation, profile_attestation_date
) values

-- ── Family Law ──────────────────────────────────────────────────────────
(
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Angela Reyes', 'Family Law',
  array['Family Law', 'Divorce', 'Child Custody', 'Adoption'],
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  95, 3500,
  'Houston, TX', 'TX', 'Houston', '1.8 mi',
  4.8, 5, 12,
  array['English', 'Spanish'], array['English', 'Spanish'],
  true, true, true, true,
  true, 'verified', current_date - 45,
  true, 'Texas Board of Legal Specialization', 'Family Law', true,
  'J.D., University of Houston Law Center',
  'State Bar of Texas, 2014', 'TX', '24098871',
  array[
    'Contested and uncontested divorce',
    'Child custody and visitation disputes',
    'Child and spousal support',
    'Property division',
    'Stepparent and relative adoption',
    'Protective orders',
    'Modification of existing orders'
  ],
  'Angela Reyes has spent twelve years guiding Houston families through divorce, custody, and adoption matters. Board certified in family law by the Texas Board of Legal Specialization, she is known for keeping cases out of the courtroom when possible — and for being a tenacious advocate when trial is unavoidable. She handles every consultation personally, in English or Spanish.',
  pg_temp.seed_slots(array[1, 2, 3], array[14, 16, 18]),
  'angela.reyes@reyesfamilylaw.example.com', '(713) 555-0142',
  '1200 Smith St, Suite 1400, Houston, TX 77002',
  true, now()
),
(
  'aaaaaaaa-0000-4000-8000-000000000002',
  'Daniel Whitmore', 'Family Law',
  array['Family Law', 'Divorce', 'Prenuptial Agreements'],
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  120, 5000,
  'Dallas, TX', 'TX', 'Dallas', '3.2 mi',
  4.7, 3, 9,
  array['English'], array['English'],
  false, false, false, false,
  true, 'verified', current_date - 30,
  false, null, null, false,
  'J.D., SMU Dedman School of Law',
  'State Bar of Texas, 2017', 'TX', '24115563',
  array[
    'High-asset divorce',
    'Prenuptial and postnuptial agreements',
    'Business owner divorce',
    'Complex property division',
    'Custody arrangements for professionals',
    'Mediation'
  ],
  'Daniel Whitmore represents professionals and business owners in divorce and marital agreements across the Dallas–Fort Worth metroplex. His practice focuses on complex property division — closely held businesses, stock compensation, and retirement assets — with a reputation for discreet, efficient resolutions.',
  pg_temp.seed_slots(array[2, 3, 5], array[15, 17, 19]),
  'dwhitmore@whitmorefamilylaw.example.com', '(214) 555-0187',
  '2100 Ross Ave, Suite 800, Dallas, TX 75201',
  true, now()
),

-- ── Immigration ─────────────────────────────────────────────────────────
(
  'aaaaaaaa-0000-4000-8000-000000000003',
  'Marco Alvarez', 'Immigration',
  array['Immigration', 'Green Cards', 'Citizenship', 'Deportation Defense'],
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  49, 2500,
  'Phoenix, AZ', 'AZ', 'Phoenix', '0.9 mi',
  4.8, 6, 14,
  array['English', 'Spanish'], array['English', 'Spanish'],
  true, true, true, true,
  true, 'verified', current_date - 60,
  false, null, null, false,
  'J.D., Arizona State University Sandra Day O''Connor College of Law',
  'State Bar of Arizona, 2012', 'AZ', '028841',
  array[
    'Family-based green cards',
    'Naturalization and citizenship',
    'Deportation and removal defense',
    'DACA renewals',
    'Fiancé(e) and spouse visas',
    'Consular processing',
    'Waivers of inadmissibility'
  ],
  'Marco Alvarez founded his Phoenix practice to serve the community he grew up in. Over fourteen years he has handled thousands of family-based petitions, naturalizations, and removal defense cases. His entire office is bilingual, consultations are offered in English or Spanish, and every client receives translated copies of their filings.',
  pg_temp.seed_slots(array[1, 2, 4], array[14, 17, 20]),
  'marco@alvarezimmigration.example.com', '(602) 555-0114',
  '3300 N Central Ave, Suite 1100, Phoenix, AZ 85012',
  true, now()
),
(
  'aaaaaaaa-0000-4000-8000-000000000004',
  'Amara Osei', 'Immigration',
  array['Immigration', 'Work Visas', 'Asylum'],
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  75, 3000,
  'Atlanta, GA', 'GA', 'Atlanta', '2.5 mi',
  5.0, 4, 8,
  array['English', 'French'], array['English', 'French'],
  false, true, true, true,
  true, 'verified', current_date - 21,
  false, null, null, false,
  'J.D., Emory University School of Law',
  'State Bar of Georgia, 2018', 'GA', '994518',
  array[
    'Employment-based visas (H-1B, L-1, O-1)',
    'PERM labor certification',
    'Asylum and refugee protection',
    'Student visa transitions',
    'Green cards through employment',
    'Startup founder visas'
  ],
  'Amara Osei practices employment-based immigration and humanitarian law in Atlanta. She works with tech employers, universities, and startup founders on work visas and green cards, and maintains an active asylum docket. Consultations are available in English and French, with interpreters arranged for other languages.',
  pg_temp.seed_slots(array[3, 4, 6], array[15, 18]),
  'aosei@oseilaw.example.com', '(404) 555-0139',
  '1180 Peachtree St NE, Suite 2100, Atlanta, GA 30309',
  true, now()
),

-- ── Business Formation ──────────────────────────────────────────────────
(
  'aaaaaaaa-0000-4000-8000-000000000005',
  'Michael Brennan', 'Business Formation',
  array['Business Formation', 'LLC Formation', 'Contracts'],
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  150, 2500,
  'Austin, TX', 'TX', 'Austin', '1.1 mi',
  4.5, 4, 15,
  array['English'], array['English'],
  false, false, false, false,
  true, 'verified', current_date - 90,
  false, null, null, false,
  'J.D., The University of Texas School of Law',
  'State Bar of Texas, 2011', 'TX', '24076692',
  array[
    'LLC and corporation formation',
    'Founder and operating agreements',
    'Commercial contracts and leases',
    'Equity and vesting structures',
    'Business purchases and sales',
    'Registered agent and compliance'
  ],
  'Michael Brennan has spent fifteen years helping Austin founders and small businesses start, structure, and grow. From single-member LLCs to multi-founder startups raising outside capital, he handles formation, governance, and the contracts that keep companies out of trouble later. Flat-fee packages available for most formations.',
  pg_temp.seed_slots(array[2, 4, 5], array[16, 18, 20]),
  'mbrennan@brennanbusinesslaw.example.com', '(512) 555-0170',
  '600 Congress Ave, Suite 1900, Austin, TX 78701',
  true, now()
),
(
  'aaaaaaaa-0000-4000-8000-000000000006',
  'Sarah Mitchell', 'Business Formation',
  array['Business Formation', 'Startups', 'Trademarks'],
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  125, 2000,
  'Denver, CO', 'CO', 'Denver', '4.0 mi',
  4.7, 3, 7,
  array['English'], array['English'],
  false, false, false, false,
  true, 'verified', current_date - 14,
  false, null, null, false,
  'J.D., University of Colorado Law School',
  'Colorado Bar, 2019', 'CO', '52447',
  array[
    'Startup incorporation and structuring',
    'Trademark search and registration',
    'Co-founder disputes and buyouts',
    'SAFE and convertible note review',
    'Independent contractor agreements',
    'E-commerce terms and policies'
  ],
  'Sarah Mitchell works with early-stage companies and creative entrepreneurs across Colorado. Her practice pairs business formation with brand protection — incorporating your company and locking down its trademarks in one engagement. Before law school she ran her own e-commerce business, and it shows in her practical, founder-first advice.',
  pg_temp.seed_slots(array[1, 3, 5], array[15, 17]),
  'sarah@mitchellventures.example.com', '(720) 555-0126',
  '1801 California St, Suite 2600, Denver, CO 80202',
  true, now()
),

-- ── Personal Injury ─────────────────────────────────────────────────────
(
  'aaaaaaaa-0000-4000-8000-000000000007',
  'Robert Feldman', 'Personal Injury',
  array['Personal Injury', 'Car Accidents', 'Slip & Fall'],
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  100, null,
  'Chicago, IL', 'IL', 'Chicago', '2.2 mi',
  4.7, 6, 22,
  array['English'], array['English'],
  false, true, true, false,
  true, 'verified', current_date - 120,
  false, null, null, false,
  'J.D., Loyola University Chicago School of Law',
  'Illinois State Bar, 2004', 'IL', '6284471',
  array[
    'Car and truck accidents',
    'Slip and fall / premises liability',
    'Rideshare accident claims',
    'Uninsured motorist claims',
    'Wrongful death',
    'Insurance settlement negotiation',
    'Catastrophic injury'
  ],
  'Robert Feldman has represented injured Chicagoans for over two decades, recovering millions in settlements and verdicts against insurers who undervalue claims. Cases are handled on contingency — you pay nothing unless he recovers for you — and he personally returns every client call within one business day.',
  pg_temp.seed_slots(array[4, 5, 7], array[14, 16]),
  'rfeldman@feldmaninjurylaw.example.com', '(312) 555-0158',
  '161 N Clark St, Suite 3000, Chicago, IL 60601',
  true, now()
),
(
  'aaaaaaaa-0000-4000-8000-000000000008',
  'Jessica Moran', 'Personal Injury',
  array['Personal Injury', 'Car Accidents', 'Medical Malpractice'],
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces&auto=format&q=80',
  85, null,
  'Miami, FL', 'FL', 'Miami', '1.5 mi',
  5.0, 3, 6,
  array['English', 'Spanish'], array['English', 'Spanish'],
  true, true, false, true,
  true, 'verified', current_date - 10,
  false, null, null, false,
  'J.D., University of Miami School of Law',
  'The Florida Bar, 2020', 'FL', '1024587',
  array[
    'Car and motorcycle accidents',
    'Medical malpractice',
    'Hurricane and property injury claims',
    'Boating accidents',
    'Negligent security',
    'PIP insurance disputes'
  ],
  'Jessica Moran fights for injury victims across South Florida. A former insurance defense associate, she knows exactly how carriers evaluate claims — and uses it to her clients'' advantage. She offers consultations in English and Spanish and takes cases on contingency.',
  pg_temp.seed_slots(array[1, 2, 3], array[16, 19, 21]),
  'jmoran@moraninjurylaw.example.com', '(305) 555-0193',
  '801 Brickell Ave, Suite 900, Miami, FL 33131',
  true, now()
);

-- ── Reviews (counts and averages match each attorney's rating/review_count) ──

insert into public.reviews (attorney_id, reviewer_name, rating, review_text, date) values
-- Angela Reyes — 5 reviews, avg 4.8
('aaaaaaaa-0000-4000-8000-000000000001', 'Monica Herrera', 5, 'Angela handled my custody case with so much care. She explained every step in Spanish for my mother and never made us feel rushed.', current_date - 22),
('aaaaaaaa-0000-4000-8000-000000000001', 'David Kowalski', 5, 'Divorce is awful but Angela made the process bearable. She settled everything in mediation and saved us a trial.', current_date - 58),
('aaaaaaaa-0000-4000-8000-000000000001', 'Brianna Silva', 4, 'Very knowledgeable and responsive. The retainer was on the higher side but you get what you pay for.', current_date - 101),
('aaaaaaaa-0000-4000-8000-000000000001', 'Terrence Wallace', 5, 'She won primary custody for me as a father, which two other lawyers told me was a long shot. Forever grateful.', current_date - 145),
('aaaaaaaa-0000-4000-8000-000000000001', 'Yesenia Cardenas', 5, 'We finalized our adoption in under five months. Angela treated our family like her own.', current_date - 190),

-- Daniel Whitmore — 3 reviews, avg 4.7
('aaaaaaaa-0000-4000-8000-000000000002', 'Preston Vaughn', 5, 'Daniel protected my business through a difficult divorce. Discreet, strategic, and worth every penny.', current_date - 35),
('aaaaaaaa-0000-4000-8000-000000000002', 'Caroline Ashford', 4, 'Solid attorney. The prenup process was smooth, though scheduling could occasionally take a few days.', current_date - 88),
('aaaaaaaa-0000-4000-8000-000000000002', 'Marcus Tran', 5, 'He untangled stock options, a 401k, and a family business without us ever setting foot in court.', current_date - 130),

-- Marco Alvarez — 6 reviews, avg 4.8
('aaaaaaaa-0000-4000-8000-000000000003', 'Lucia Mendoza', 5, 'Marco got my mother her green card after years of us being told it was impossible. His office treats you like family.', current_date - 15),
('aaaaaaaa-0000-4000-8000-000000000003', 'Jorge Castillo', 5, 'Ganamos mi caso de residencia. Todo el personal habla español y siempre contestan el teléfono.', current_date - 47),
('aaaaaaaa-0000-4000-8000-000000000003', 'Aisha Mohammed', 5, 'He stopped my husband''s deportation and reopened his case. We can never thank him enough.', current_date - 84),
('aaaaaaaa-0000-4000-8000-000000000003', 'Kevin O''Rourke', 4, 'Handled my wife''s visa professionally start to finish. Paperwork took a while but that was USCIS, not him.', current_date - 122),
('aaaaaaaa-0000-4000-8000-000000000003', 'Paola Jimenez', 5, 'I became a citizen last month thanks to Marco. He prepped me for the interview until I felt totally confident.', current_date - 160),
('aaaaaaaa-0000-4000-8000-000000000003', 'Samuel Adeyemi', 5, 'Clear fees, honest advice, and he answers questions himself instead of passing you to an assistant.', current_date - 201),

-- Amara Osei — 4 reviews, avg 5.0
('aaaaaaaa-0000-4000-8000-000000000004', 'Priya Raghavan', 5, 'Amara moved my H-1B to my new employer flawlessly and flagged an issue two other firms missed.', current_date - 19),
('aaaaaaaa-0000-4000-8000-000000000004', 'Jean-Baptiste Kamga', 5, 'Elle a gagné mon dossier d''asile. Professionnelle, patiente, et toujours honnête sur les délais.', current_date - 66),
('aaaaaaaa-0000-4000-8000-000000000004', 'Derek Boateng', 5, 'As a startup founder my visa situation was complicated. Amara built a strategy that actually worked.', current_date - 118),
('aaaaaaaa-0000-4000-8000-000000000004', 'Hannah Lindgren', 5, 'She guided me from student visa to green card over two years. Organized, kind, and incredibly sharp.', current_date - 175),

-- Michael Brennan — 4 reviews, avg 4.5
('aaaaaaaa-0000-4000-8000-000000000005', 'Tyler Nakamura', 4, 'Formed our LLC quickly and the operating agreement was thorough. Communication was mostly email, which suited me fine.', current_date - 28),
('aaaaaaaa-0000-4000-8000-000000000005', 'Renee Duplessis', 5, 'Michael restructured our partnership before a big contract and it saved us from a mess six months later.', current_date - 71),
('aaaaaaaa-0000-4000-8000-000000000005', 'Colin McAllister', 5, 'The flat-fee formation package was exactly as advertised. No surprise bills, everything filed on time.', current_date - 109),
('aaaaaaaa-0000-4000-8000-000000000005', 'Dana Whitfield', 4, 'Great contract review for our lease. Took a few days longer than quoted but the result was worth it.', current_date - 150),

-- Sarah Mitchell — 3 reviews, avg 4.7
('aaaaaaaa-0000-4000-8000-000000000006', 'Alexis Romero', 5, 'Sarah incorporated my company and registered two trademarks in one engagement. She talks like a founder, not a lawyer.', current_date - 24),
('aaaaaaaa-0000-4000-8000-000000000006', 'Grant Pedersen', 5, 'She caught a co-founder equity problem in our documents that would have blown up our seed round.', current_date - 77),
('aaaaaaaa-0000-4000-8000-000000000006', 'Mei-Ling Chow', 4, 'Responsive and practical. Slightly higher rates than online services, but the personal advice is the point.', current_date - 125),

-- Robert Feldman — 6 reviews, avg 4.7
('aaaaaaaa-0000-4000-8000-000000000007', 'Antoine Gibson', 5, 'The insurance company offered me $9,000. Bob settled my case for many times that. Enough said.', current_date - 31),
('aaaaaaaa-0000-4000-8000-000000000007', 'Karen Wisniewski', 5, 'After my fall outside a grocery store, Bob handled everything while I focused on recovery. True professional.', current_date - 69),
('aaaaaaaa-0000-4000-8000-000000000007', 'Miguel Santana', 4, 'Strong result on my car accident claim. The case took over a year, but he was upfront about the timeline.', current_date - 104),
('aaaaaaaa-0000-4000-8000-000000000007', 'Deborah Okafor', 5, 'He returned my first call within the hour and my case calls every time after. Rare in this field.', current_date - 141),
('aaaaaaaa-0000-4000-8000-000000000007', 'Frank Castellano', 4, 'Experienced and no-nonsense. His team did most of the day-to-day contact, but Bob ran the strategy.', current_date - 182),
('aaaaaaaa-0000-4000-8000-000000000007', 'Latasha Bryant', 5, 'Won my rideshare accident case when two other firms turned it down. Twenty years of experience shows.', current_date - 220),

-- Jessica Moran — 3 reviews, avg 5.0
('aaaaaaaa-0000-4000-8000-000000000008', 'Camila Fuentes', 5, 'Jessica conoce los seguros por dentro y por fuera. Consiguió el triple de la oferta inicial por mi accidente.', current_date - 26),
('aaaaaaaa-0000-4000-8000-000000000008', 'Brandon Leclerc', 5, 'Former insurance lawyer = she knew their playbook. Settled my motorcycle case in four months.', current_date - 80),
('aaaaaaaa-0000-4000-8000-000000000008', 'Gloria Esteban', 5, 'Compassionate with my mother''s malpractice case and relentless with the hospital''s insurer.', current_date - 133);

commit;
