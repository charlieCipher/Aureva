-- Aureva V4 secure-vault foundation. Apply with `supabase db push` or the
-- Supabase SQL editor before enabling encrypted record creation in production.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  tier text not null default 'free' check (tier in ('free', 'premium', 'family', 'admin')),
  family_code_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists tier text not null default 'free';
alter table public.profiles add column if not exists family_code_hash text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'Other' check (category in ('Personal', 'Financial', 'Legal', 'Medical', 'Property', 'Other')),
  encrypted_payload jsonb not null,
  integrity_hash text not null,
  encryption_version text not null default 'aureva-v4-aes-gcm',
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing Aureva projects can adopt V4 without deleting prior records.
alter table public.assets add column if not exists category text;
alter table public.assets add column if not exists encrypted_payload jsonb;
alter table public.assets add column if not exists integrity_hash text;
alter table public.assets add column if not exists encryption_version text;
alter table public.assets add column if not exists file_path text;

create table if not exists public.integrity_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  hash_value text not null,
  event_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.trusted_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_name text,
  device_info jsonb not null default '{}'::jsonb,
  session_token_hash text not null,
  trusted boolean not null default false,
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now()
);

create table if not exists public.recovery_status (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  recovery_confirmed boolean not null default false,
  confirmed_at timestamptz,
  practiced_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.system_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  state text not null default 'NORMAL' check (state in ('NORMAL', 'SUSPICIOUS', 'PROTECTED', 'HIGH_RISK', 'LOCKDOWN')),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  severity text not null check (severity in ('INFO', 'WARNING', 'CRITICAL')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.policy_acceptance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  policy_name text not null,
  policy_version text not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, policy_name, policy_version)
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  relationship text,
  contact_hint text,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE', 'REVOKED')),
  created_at timestamptz not null default now(),
  unique (asset_id, family_member_id)
);

create table if not exists public.legacy_statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  encrypted_payload jsonb not null,
  integrity_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shield_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_label text not null,
  approver_label text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'DENIED', 'REVOKED')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.integrity_logs enable row level security;
alter table public.trusted_sessions enable row level security;
alter table public.recovery_status enable row level security;
alter table public.system_state enable row level security;
alter table public.audit_logs enable row level security;
alter table public.policy_acceptance enable row level security;
alter table public.family_members enable row level security;
alter table public.asset_assignments enable row level security;
alter table public.legacy_statements enable row level security;
alter table public.shield_requests enable row level security;

create policy "aureva_own_profiles" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "aureva_own_assets" on public.assets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aureva_own_integrity_logs" on public.integrity_logs for select using (asset_id in (select id from public.assets where user_id = auth.uid()));
create policy "aureva_own_sessions" on public.trusted_sessions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aureva_own_recovery" on public.recovery_status for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aureva_own_system_state" on public.system_state for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aureva_read_own_audit_logs" on public.audit_logs for select using (user_id = auth.uid());
create policy "aureva_insert_own_audit_logs" on public.audit_logs for insert with check (user_id = auth.uid());
create policy "aureva_own_policy_acceptance" on public.policy_acceptance for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aureva_own_family_members" on public.family_members for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aureva_own_assignments" on public.asset_assignments for all using (asset_id in (select id from public.assets where user_id = auth.uid())) with check (asset_id in (select id from public.assets where user_id = auth.uid()));
create policy "aureva_own_legacy_statements" on public.legacy_statements for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aureva_own_shield_requests" on public.shield_requests for all using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('vault', 'vault', false) on conflict (id) do update set public = false;
create policy "aureva_private_vault_read" on storage.objects for select using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aureva_private_vault_insert" on storage.objects for insert with check (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aureva_private_vault_update" on storage.objects for update using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "aureva_private_vault_delete" on storage.objects for delete using (bucket_id = 'vault' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_aureva_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'name') on conflict (id) do nothing;
  insert into public.recovery_status (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.system_state (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_aureva on auth.users;
create trigger on_auth_user_created_aureva after insert on auth.users for each row execute procedure public.handle_new_aureva_user();
