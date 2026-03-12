-- ============================================================
-- Integrations table — stores OAuth tokens for third-party services
-- Run this in the Supabase SQL Editor
-- ============================================================

create table public.integrations (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  provider         text not null,
  access_token     text not null,
  refresh_token    text,
  token_expires_at timestamptz,
  account_email    text,
  created_at       timestamptz not null default now(),
  unique(business_id, provider)
);

create index idx_integrations_business on public.integrations(business_id);

alter table public.integrations enable row level security;

create policy "integrations_select" on public.integrations
  for select using (public.user_belongs_to_business(business_id));

create policy "integrations_delete" on public.integrations
  for delete using (public.user_belongs_to_business(business_id));
