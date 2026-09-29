-- Additive V5 foundation. Existing V4 data is preserved for explicit migration.
begin;
create table public.vaults (
 id uuid primary key, owner_id uuid not null unique references auth.users(id) on delete cascade,
 wrapped_vmk_password jsonb not null, wrapped_vmk_recovery jsonb not null,
 kdf_salt text not null, kdf_parameters jsonb not null, recovery_salt text not null,
 crypto_version text not null check(crypto_version='leqvor-v5'), recovery_verified_at timestamptz not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,owner_id)
);
create table public.records (
 id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
 vault_id uuid not null, encrypted_metadata jsonb not null, encrypted_payload jsonb not null,
 wrapped_dek jsonb not null, crypto_version text not null check(crypto_version='leqvor-v5'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(vault_id,owner_id) references public.vaults(id,owner_id) on delete cascade,
 unique(id,owner_id,vault_id)
);
create table public.record_files (
 id uuid primary key, record_id uuid not null, owner_id uuid not null, vault_id uuid not null,
 encrypted_filename jsonb not null, wrapped_file_dek jsonb not null, storage_path text not null unique,
 crypto_version text not null check(crypto_version='leqvor-v5'), created_at timestamptz not null default now(),
 foreign key(record_id,owner_id,vault_id) references public.records(id,owner_id,vault_id) on delete cascade,
 check(storage_path=owner_id::text||'/'||record_id::text||'/'||id::text)
);
create table public.trusted_people (
 id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade, vault_id uuid not null,
 linked_user_id uuid references auth.users(id), encrypted_metadata jsonb not null, encrypted_payload jsonb not null,
 wrapped_dek jsonb not null, crypto_version text not null check(crypto_version='leqvor-v5'),
 status text not null default 'unverified' check(status in ('unverified','verified','revoked')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(vault_id,owner_id) references public.vaults(id,owner_id) on delete cascade
);
create table public.user_sharing_keys (
 owner_id uuid primary key references auth.users(id) on delete cascade, vault_id uuid not null,
 public_key jsonb not null, encrypted_private_key jsonb not null, crypto_version text not null,
 created_at timestamptz not null default now(), foreign key(vault_id,owner_id) references public.vaults(id,owner_id)
);
create table public.record_grants (
 id uuid primary key, record_id uuid not null, owner_id uuid not null, vault_id uuid not null,
 recipient_id uuid not null references auth.users(id), encrypted_record_key jsonb not null,
 sender_public_material jsonb not null, permissions text not null check(permissions='view'),
 grant_version integer not null check(grant_version>0), status text not null default 'pending' check(status in ('pending','active','revoked')),
 created_at timestamptz not null default now(), revoked_at timestamptz,
 foreign key(record_id,owner_id,vault_id) references public.records(id,owner_id,vault_id) on delete cascade,
 check(recipient_id<>owner_id)
);
create table public.security_events (
 id uuid primary key, owner_id uuid not null references auth.users(id), sequence bigint not null,
 event_type text not null, severity text not null check(severity in('INFO','WARNING','CRITICAL')),
 device_id uuid, encrypted_details jsonb, previous_hash text, event_hash text not null, signature jsonb,
 created_at timestamptz not null default now(), unique(owner_id,sequence)
);
create table public.record_versions (
 id uuid primary key, record_id uuid not null references public.records(id) on delete cascade,
 owner_id uuid not null references auth.users(id), version integer not null, previous_hash text,
 ciphertext_hash text not null, version_hash text not null, client_signature jsonb,
 crypto_version text not null, created_at timestamptz not null default now(),unique(record_id,version)
);
create table public.integrity_checkpoints (
 id uuid primary key, owner_id uuid not null references auth.users(id), manifest_hash text not null,
 signature jsonb not null, created_at timestamptz not null default now()
);
-- Fail closed: policies are restrictive as well as permissive, so future broad
-- policies cannot silently turn owner-only tables into cross-account access.
do $$ declare t text; begin
 foreach t in array array['vaults','records','record_files','trusted_people'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('alter table public.%I force row level security',t);
 execute format('create policy owner_access on public.%I for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid())',t);
 execute format('create policy owner_boundary on public.%I as restrictive for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid())',t);
 execute format('revoke all on public.%I from anon',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
 foreach t in array array['user_sharing_keys','record_grants','security_events','record_versions','integrity_checkpoints'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('alter table public.%I force row level security',t);
 execute format('create policy owner_read on public.%I for select to authenticated using(owner_id=auth.uid())',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
-- Verified identities, grants, and signed history require trusted server flows.
-- No client may mark itself verified or activate a grant.
create function public.v5_prevent_identity_change() returns trigger language plpgsql set search_path=public as $$
begin
 if new.owner_id<>old.owner_id or new.id<>old.id then raise exception 'Immutable identity'; end if;
 return new;
end $$;
do $$ declare t text; begin foreach t in array array['vaults','records','record_files','trusted_people'] loop
 execute format('create trigger immutable_identity before update on public.%I for each row execute function public.v5_prevent_identity_change()',t);
end loop;end $$;
create function public.v5_protect_person_status() returns trigger language plpgsql set search_path=public as $$
begin
 if auth.role()='authenticated' and (new.status<>'unverified' or new.linked_user_id is not null) then raise exception 'Identity verification requires server validation';end if;
 return new;
end $$;
create trigger protect_person_status before insert or update on public.trusted_people for each row execute function public.v5_protect_person_status();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('vault-v5','vault-v5',false,16000000,array['application/json']) on conflict(id) do update set public=false,file_size_limit=16000000,allowed_mime_types=array['application/json'];
create policy v5_storage_read on storage.objects for select to authenticated using(bucket_id='vault-v5' and (storage.foldername(name))[1]=auth.uid()::text);
create policy v5_storage_insert on storage.objects for insert to authenticated with check(bucket_id='vault-v5' and (storage.foldername(name))[1]=auth.uid()::text and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}$');
create policy v5_storage_delete on storage.objects for delete to authenticated using(bucket_id='vault-v5' and (storage.foldername(name))[1]=auth.uid()::text);
create policy v5_storage_boundary on storage.objects as restrictive for all to authenticated using(bucket_id<>'vault-v5' or (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id<>'vault-v5' or (storage.foldername(name))[1]=auth.uid()::text);
create index records_owner_created on public.records(owner_id,created_at desc);
create index files_record_owner on public.record_files(record_id,owner_id);
-- Ciphertext record + file metadata commit as one Postgres transaction.
create function public.save_v5_record_bundle(record_data jsonb,file_data jsonb default null)
returns public.records language plpgsql security invoker set search_path=public as $$
declare r public.records; f public.record_files; saved public.records;
begin
 r:=jsonb_populate_record(null::public.records,record_data);
 if r.owner_id is distinct from auth.uid() then raise exception 'Owner mismatch' using errcode='42501';end if;
 insert into public.records(id,owner_id,vault_id,encrypted_metadata,encrypted_payload,wrapped_dek,crypto_version)
 values(r.id,r.owner_id,r.vault_id,r.encrypted_metadata,r.encrypted_payload,r.wrapped_dek,r.crypto_version) returning * into saved;
 if file_data is not null then
 f:=jsonb_populate_record(null::public.record_files,file_data);
 if f.owner_id is distinct from auth.uid() or f.record_id<>saved.id or f.vault_id<>saved.vault_id then raise exception 'File identity mismatch' using errcode='42501';end if;
 insert into public.record_files(id,record_id,owner_id,vault_id,encrypted_filename,wrapped_file_dek,storage_path,crypto_version)
 values(f.id,f.record_id,f.owner_id,f.vault_id,f.encrypted_filename,f.wrapped_file_dek,f.storage_path,f.crypto_version);
 end if;
 return saved;
end $$;
revoke all on function public.save_v5_record_bundle(jsonb,jsonb) from public,anon;
grant execute on function public.save_v5_record_bundle(jsonb,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
