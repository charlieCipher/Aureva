-- Read-only post-migration inspection. Safe to run without test accounts.
-- Every returned ready value must be true. This does not test authenticated CRUD.
with expected(name) as (
 values ('vaults'),('records'),('record_files'),('trusted_people'),
 ('user_sharing_keys'),('record_grants'),('security_events'),
 ('record_versions'),('integrity_checkpoints'),('ciphertext_cleanup_jobs')
)
select 'table:' || expected.name as check_name,
 coalesce(c.relrowsecurity and c.relforcerowsecurity,false) as ready
from expected
left join pg_namespace n on n.nspname='public'
left join pg_class c on c.relnamespace=n.oid and c.relname=expected.name and c.relkind='r'
union all
select 'private ciphertext bucket', exists (
 select 1 from storage.buckets where id='vault-v5' and not public
 and file_size_limit=16000000 and allowed_mime_types=array['application/json']
)
union all
select 'record revision', exists (
 select 1 from information_schema.columns where table_schema='public'
 and table_name='records' and column_name='revision'
 and data_type='bigint' and is_nullable='NO'
)
union all
select 'RPC:' || signature, to_regprocedure(signature) is not null
from (values ('public.save_v5_record_bundle(jsonb,jsonb)'),
 ('public.update_v5_record(uuid,bigint,jsonb)'),
 ('public.delete_v5_record(uuid,bigint)')) f(signature)
order by check_name;

-- Presence enforces new writes. Historical validation is a separate rollout gate.
with expected(table_name,constraint_name) as (
 values ('vaults','vault_ciphertext_envelopes'),
 ('records','record_ciphertext_envelopes'),
 ('record_files','file_ciphertext_envelopes'),
 ('trusted_people','person_ciphertext_envelopes')
)
select e.table_name,e.constraint_name,c.oid is not null as ready,
 coalesce(c.convalidated,false) as historical_rows_validated
from expected e
left join pg_constraint c on c.conrelid=to_regclass('public.' || e.table_name)
 and c.conname=e.constraint_name and c.contype='c'
order by e.table_name;

-- Inspect policy definitions and privileges, not customer row contents.
select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
from pg_policies
where (schemaname='public' and tablename in
 ('vaults','records','record_files','trusted_people','record_grants','ciphertext_cleanup_jobs'))
 or (schemaname='storage' and policyname like 'v5_%')
order by schemaname,tablename,policyname;

select table_name,grantee,privilege_type
from information_schema.role_table_grants
where table_schema='public' and table_name in ('records','ciphertext_cleanup_jobs')
and grantee in ('anon','authenticated','service_role')
order by table_name,grantee,privilege_type;
