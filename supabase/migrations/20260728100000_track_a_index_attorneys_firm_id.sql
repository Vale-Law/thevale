-- Performance: attorneys.firm_id has no covering index (flagged by the
-- advisor after this sprint's work), and it's now a hot path -- every
-- firm-wide query this sprint added (AuthContext.jsx's loadFirmFor,
-- AttorneyBookings.jsx / AttorneyDashboard.jsx's firm-scoped booking
-- reads) filters attorneys by firm_id on every page load.
create index attorneys_firm_id_idx on public.attorneys(firm_id);
