-- ============================================================
-- RecepCall MVP — Database Schema
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Clean up old schema (safe to run even if nothing exists)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles cascade;

-- ============================================================
-- TABLES
-- ============================================================

-- 1. BUSINESSES
-- Each account/company that uses RecepCall
create table public.businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Minha Empresa',
  phone_number text,
  timezone    text not null default 'Europe/Lisbon',
  greeting_message text default 'Olá! Bem-vindo à nossa empresa. Como posso ajudá-lo?',
  created_at  timestamptz not null default now()
);

-- 2. USERS_BUSINESS
-- Links Supabase auth users to businesses (supports multi-tenant)
create table public.users_business (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner', 'admin', 'staff')),
  created_at  timestamptz not null default now(),
  unique(user_id, business_id)
);

-- 3. SERVICES
-- Services offered by a business (used for appointment booking)
create table public.services (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  name             text not null,
  duration_minutes integer not null default 30,
  price            numeric(10,2),
  created_at       timestamptz not null default now()
);

-- 4. APPOINTMENTS
-- Bookings created from AI calls or manually
create table public.appointments (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  service_id     uuid references public.services(id) on delete set null,
  customer_name  text not null,
  customer_phone text not null,
  start_time     timestamptz not null,
  end_time       timestamptz not null,
  status         text not null default 'booked' check (status in ('booked', 'cancelled', 'completed')),
  created_at     timestamptz not null default now()
);

-- 5. CALLS
-- Phone calls handled by the AI receptionist
create table public.calls (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  caller_phone     text,
  duration_seconds integer not null default 0,
  transcript       text,
  outcome          text not null default 'missed' check (outcome in ('booked', 'question', 'missed')),
  appointment_id   uuid references public.appointments(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_users_business_user     on public.users_business(user_id);
create index idx_users_business_business on public.users_business(business_id);
create index idx_services_business       on public.services(business_id);
create index idx_appointments_business   on public.appointments(business_id);
create index idx_appointments_start      on public.appointments(start_time);
create index idx_appointments_status     on public.appointments(status);
create index idx_calls_business          on public.calls(business_id);
create index idx_calls_created           on public.calls(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.businesses     enable row level security;
alter table public.users_business enable row level security;
alter table public.services       enable row level security;
alter table public.appointments   enable row level security;
alter table public.calls          enable row level security;

-- Helper function: returns true if the current user belongs to a business
create or replace function public.user_belongs_to_business(b_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users_business
    where user_id = auth.uid() and business_id = b_id
  );
$$;

-- BUSINESSES: read/update only your own
create policy "businesses_select" on public.businesses
  for select using (public.user_belongs_to_business(id));
create policy "businesses_update" on public.businesses
  for update using (public.user_belongs_to_business(id));

-- USERS_BUSINESS: see your own memberships, owners can insert new members
create policy "users_business_select" on public.users_business
  for select using (user_id = auth.uid());
create policy "users_business_insert" on public.users_business
  for insert with check (
    exists (
      select 1 from public.users_business ub
      where ub.user_id = auth.uid()
        and ub.business_id = business_id
        and ub.role = 'owner'
    )
  );

-- SERVICES: full CRUD scoped to your business
create policy "services_select" on public.services
  for select using (public.user_belongs_to_business(business_id));
create policy "services_insert" on public.services
  for insert with check (public.user_belongs_to_business(business_id));
create policy "services_update" on public.services
  for update using (public.user_belongs_to_business(business_id));
create policy "services_delete" on public.services
  for delete using (public.user_belongs_to_business(business_id));

-- APPOINTMENTS: read/write/update scoped to your business
create policy "appointments_select" on public.appointments
  for select using (public.user_belongs_to_business(business_id));
create policy "appointments_insert" on public.appointments
  for insert with check (public.user_belongs_to_business(business_id));
create policy "appointments_update" on public.appointments
  for update using (public.user_belongs_to_business(business_id));

-- CALLS: read/write scoped to your business
create policy "calls_select" on public.calls
  for select using (public.user_belongs_to_business(business_id));
create policy "calls_insert" on public.calls
  for insert with check (public.user_belongs_to_business(business_id));

-- ============================================================
-- AUTO-CREATE BUSINESS ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_business_id uuid;
begin
  insert into public.businesses (name)
  values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'company_name'), ''), 'Minha Empresa'))
  returning id into new_business_id;

  insert into public.users_business (user_id, business_id, role)
  values (new.id, new_business_id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- EXAMPLE SEED DATA (uncomment to test)
-- ============================================================

/*
-- Create a test business
insert into public.businesses (id, name, phone_number, timezone, greeting_message)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Clínica Saúde Total',
  '+351912345678',
  'Europe/Lisbon',
  'Olá! Bem-vindo à Clínica Saúde Total. Como posso ajudá-lo?'
);

-- Create test services
insert into public.services (business_id, name, duration_minutes, price) values
  ('a0000000-0000-0000-0000-000000000001', 'Consulta Geral',     30, 50.00),
  ('a0000000-0000-0000-0000-000000000001', 'Limpeza Dentária',   45, 75.00),
  ('a0000000-0000-0000-0000-000000000001', 'Consulta Urgente',   15, 35.00);

-- Create test appointment
insert into public.appointments (business_id, service_id, customer_name, customer_phone, start_time, end_time, status)
values (
  'a0000000-0000-0000-0000-000000000001',
  (select id from public.services where name = 'Consulta Geral' limit 1),
  'Maria Silva',
  '+351923456789',
  now() + interval '1 day',
  now() + interval '1 day' + interval '30 minutes',
  'booked'
);

-- Log a test call
insert into public.calls (business_id, caller_phone, duration_seconds, transcript, outcome, appointment_id)
values (
  'a0000000-0000-0000-0000-000000000001',
  '+351923456789',
  95,
  'IA: Olá! Bem-vindo à Clínica Saúde Total. Como posso ajudá-lo?
Cliente: Gostaria de marcar uma consulta geral.
IA: Com certeza! Temos horário disponível amanhã às 10h. Serve-lhe?
Cliente: Perfeito, pode marcar.
IA: Marcado! Consulta geral amanhã às 10h. Até lá!',
  'booked',
  (select id from public.appointments limit 1)
);
*/

-- ============================================================
-- EXAMPLE QUERIES (reference for frontend)
-- ============================================================

/*
-- Get the current user's business
select b.* from public.businesses b
inner join public.users_business ub on ub.business_id = b.id
where ub.user_id = auth.uid()
limit 1;

-- Create an appointment
insert into public.appointments (business_id, service_id, customer_name, customer_phone, start_time, end_time)
values (:business_id, :service_id, 'João Santos', '+351934567890', '2026-03-12 14:00', '2026-03-12 14:30');

-- List today's appointments
select a.*, s.name as service_name
from public.appointments a
left join public.services s on s.id = a.service_id
where a.business_id = :business_id
  and a.start_time >= current_date
  and a.start_time < current_date + interval '1 day'
  and a.status = 'booked'
order by a.start_time;

-- Log a call
insert into public.calls (business_id, caller_phone, duration_seconds, transcript, outcome)
values (:business_id, '+351945678901', 62, 'transcrição...', 'question');

-- Dashboard stats: calls today
select count(*) as total,
       count(*) filter (where outcome = 'booked') as booked,
       count(*) filter (where outcome = 'question') as questions,
       count(*) filter (where outcome = 'missed') as missed,
       coalesce(avg(duration_seconds), 0) as avg_duration
from public.calls
where business_id = :business_id
  and created_at >= current_date;
*/
