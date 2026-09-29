-- Compatible repair for the existing Aureva database.
-- Does not delete records or rewrite existing private content.
begin;
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text, tier text not null default 'free',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create table if not exists public.assets (
 id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id),
 title text not null, created_at timestamptz not null default now()
);
alter table public.assets add column if not exists category text;
alter table public.assets add column if not exists encrypted_payload jsonb;
alter table public.assets add column if not exists integrity_hash text;
alter table public.assets add column if not exists encryption_version text;
alter table public.assets add column if not exists file_path text;
alter table public.assets add column if not exists updated_at timestamptz not null default now();
-- Old databases require type even though V4 writes category.
do $$ begin
 if exists (select 1 from information_schema.columns where table_schema='public' and table_name='assets' and column_name='type') then
  alter table public.assets alter column type set default 'Other';
 end if;
end $$;
create table if not exists public.family_members (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 display_name text not null, relationship text, contact_hint text, created_at timestamptz not null default now()
);
create table if not exists public.asset_assignments (
 id uuid primary key default gen_random_uuid(), asset_id uuid not null references public.assets(id) on delete cascade,
 family_member_id uuid not null references public.family_members(id) on delete cascade,
 status text not null default 'PENDING' check(status in ('PENDING','ACTIVE','REVOKED')),
 created_at timestamptz not null default now(), unique(asset_id,family_member_id)
);
create table if not exists public.legacy_statements (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, encrypted_payload jsonb not null, integrity_hash text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.family_members enable row level security;
alter table public.asset_assignments enable row level security;
alter table public.legacy_statements enable row level security;
drop policy if exists "Anyone can read assets for family view" on public.assets;
drop policy if exists "Anyone can read profiles by family code" on public.profiles;
drop policy if exists "aureva_own_profiles" on public.profiles;
create policy "aureva_own_profiles" on public.profiles for all to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists "aureva_own_assets" on public.assets;
create policy "aureva_own_assets" on public.assets for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "aureva_own_family_members" on public.family_members;
create policy "aureva_own_family_members" on public.family_members for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "aureva_own_assignments" on public.asset_assignments;
create policy "aureva_own_assignments" on public.asset_assignments for all to authenticated
 using(asset_id in(select id from public.assets where user_id=auth.uid()) and family_member_id in(select id from public.family_members where user_id=auth.uid()))
 with check(asset_id in(select id from public.assets where user_id=auth.uid()) and family_member_id in(select id from public.family_members where user_id=auth.uid()));
drop policy if exists "aureva_own_legacy_statements" on public.legacy_statements;
create policy "aureva_own_legacy_statements" on public.legacy_statements for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create or replace function public.aureva_protect_profile_tier() returns trigger
 language plpgsql set search_path=public as $$
 begin
 if auth.role() in ('anon','authenticated') then
  if TG_OP='INSERT' then
   if coalesce(new.tier,'free') <> 'free' then raise exception 'Account tier is managed by the server'; end if;
  elsif new.tier is distinct from old.tier then raise exception 'Account tier is managed by the server';
  end if;
 end if;
 return new;
 end $$;
drop trigger if exists aureva_profile_tier_guard on public.profiles;
create trigger aureva_profile_tier_guard before insert or update on public.profiles for each row execute function public.aureva_protect_profile_tier();
create or replace function public.handle_new_aureva_user() returns trigger
 language plpgsql security definer set search_path=public as $$
 begin
 insert into public.profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'name') on conflict(id) do nothing;
 return new;
 end $$;
drop trigger if exists on_auth_user_created_aureva on auth.users;
create trigger on_auth_user_created_aureva after insert on auth.users for each row execute function public.handle_new_aureva_user();
insert into public.profiles(id,full_name) select id,raw_user_meta_data->>'name' from auth.users on conflict(id) do nothing;
insert into storage.buckets(id,name,public) values('vault','vault',false) on conflict(id) do update set public=false;
drop policy if exists "aureva_private_vault_read" on storage.objects;
create policy "aureva_private_vault_read" on storage.objects for select to authenticated using(bucket_id='vault' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "aureva_private_vault_insert" on storage.objects;
create policy "aureva_private_vault_insert" on storage.objects for insert to authenticated with check(bucket_id='vault' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "aureva_private_vault_delete" on storage.objects;
create policy "aureva_private_vault_delete" on storage.objects for delete to authenticated using(bucket_id='vault' and (storage.foldername(name))[1]=auth.uid()::text);
create index if not exists aureva_assets_owner_created on public.assets(user_id,created_at desc);
create index if not exists aureva_family_owner on public.family_members(user_id);
create index if not exists aureva_legacy_owner_updated on public.legacy_statements(user_id,updated_at desc);
-- Approval rows are not trusted grants. Prevent owners from self-approving if an earlier V4 migration created this table.
do $$ begin
 if to_regclass('public.shield_requests') is not null then
  execute 'drop policy if exists "aureva_own_shield_requests" on public.shield_requests';
  execute 'drop policy if exists "aureva_read_requests" on public.shield_requests';
  execute 'create policy "aureva_read_requests" on public.shield_requests for select to authenticated using(user_id=auth.uid())';
 end if;
end $$;
notify pgrst, 'reload schema';
commit;

