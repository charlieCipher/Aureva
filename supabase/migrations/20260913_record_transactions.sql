begin;
alter table public.records add column revision bigint not null default 1 check(revision>0);

-- Independent of record/account foreign keys so cleanup survives cascaded deletion.
create table public.ciphertext_cleanup_jobs (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null,
 storage_path text not null unique,
 created_at timestamptz not null default now()
);
alter table public.ciphertext_cleanup_jobs enable row level security;
alter table public.ciphertext_cleanup_jobs force row level security;
revoke all on public.ciphertext_cleanup_jobs from public,anon,authenticated;
grant select,delete on public.ciphertext_cleanup_jobs to service_role;

create function public.enqueue_v5_ciphertext_cleanup() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.ciphertext_cleanup_jobs(owner_id,storage_path)
 values(old.owner_id,old.owner_id::text||'/'||old.record_id::text||'/'||old.id::text)
 on conflict(storage_path) do nothing;
 return old;
end $$;
revoke all on function public.enqueue_v5_ciphertext_cleanup() from public,anon,authenticated;
create trigger queue_ciphertext_cleanup before delete on public.record_files
for each row execute function public.enqueue_v5_ciphertext_cleanup();

-- Serialize updates under the row lock. The supplied revision must match.
create function public.update_v5_record(target_id uuid,expected_revision bigint,record_data jsonb)
returns public.records language plpgsql security definer set search_path='' as $$
declare current_row public.records; saved public.records;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 select * into current_row from public.records where id=target_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Record unavailable' using errcode='42501';end if;
 if expected_revision is distinct from current_row.revision then raise exception 'Record changed. Reload before saving.' using errcode='40001';end if;
 if (record_data->>'id')::uuid is distinct from target_id or
    (record_data->>'owner_id')::uuid is distinct from auth.uid() or
    (record_data->>'vault_id')::uuid is distinct from current_row.vault_id or
    record_data->>'crypto_version' is distinct from 'leqvor-v5' then
   raise exception 'Identity mismatch' using errcode='42501';
 end if;
 update public.records set encrypted_metadata=record_data->'encrypted_metadata',
 encrypted_payload=record_data->'encrypted_payload',wrapped_dek=record_data->'wrapped_dek',
 revision=revision+1,updated_at=clock_timestamp() where id=target_id returning * into saved;
 return saved;
end $$;

create function public.delete_v5_record(target_id uuid,expected_revision bigint)
returns void language plpgsql security definer set search_path='' as $$
declare current_row public.records;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 select * into current_row from public.records where id=target_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Record unavailable' using errcode='42501';end if;
 if expected_revision is distinct from current_row.revision then raise exception 'Record changed. Reload before deleting.' using errcode='40001';end if;
 -- File metadata, grants and cleanup jobs change in the same database transaction.
 delete from public.records where id=target_id;
end $$;
revoke update,delete on public.records from authenticated;
revoke all on function public.update_v5_record(uuid,bigint,jsonb),public.delete_v5_record(uuid,bigint) from public,anon;
grant execute on function public.update_v5_record(uuid,bigint,jsonb),public.delete_v5_record(uuid,bigint) to authenticated;
notify pgrst,'reload schema';
commit;
