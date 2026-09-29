-- Run against a disposable Supabase database AFTER applying migrations.
-- Uses server-side RLS, not frontend filtering. Always rolls fixtures back.
begin;
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','v5-a@example.invalid'),
 ('20000000-0000-4000-8000-000000000002','v5-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.vaults(id,owner_id,wrapped_vmk_password,wrapped_vmk_recovery,kdf_salt,kdf_parameters,recovery_salt,crypto_version,recovery_verified_at)
values('30000000-0000-4000-8000-000000000003',auth.uid(),'{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','fixture','{}','fixture','leqvor-v5',now());
insert into public.records(id,owner_id,vault_id,encrypted_metadata,encrypted_payload,wrapped_dek,crypto_version)
values('40000000-0000-4000-8000-000000000004',auth.uid(),'30000000-0000-4000-8000-000000000003','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','leqvor-v5');
do $$begin if (select count(*) from public.records where id='40000000-0000-4000-8000-000000000004')<>1 then raise exception 'FAIL: owner cannot read own record';end if;end $$;
insert into storage.objects(bucket_id,name) values('vault-v5',auth.uid()::text||'/40000000-0000-4000-8000-000000000004/50000000-0000-4000-8000-000000000005');
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
do $$declare affected int;begin
 if exists(select 1 from storage.objects where bucket_id='vault-v5') then raise exception 'FAIL: foreign storage visible';end if;
 begin
 insert into storage.objects(bucket_id,name) values('vault-v5','10000000-0000-4000-8000-000000000001/40000000-0000-4000-8000-000000000004/50000000-0000-4000-8000-000000000006');
 raise exception 'FAIL: foreign storage insert accepted';
 exception when insufficient_privilege then null;end;
 if exists(select 1 from public.records where id='40000000-0000-4000-8000-000000000004') then raise exception 'FAIL: UUID guessing allows read';end if;
 begin update public.records set encrypted_payload='{"changed":true}' where id='40000000-0000-4000-8000-000000000004';get diagnostics affected=row_count;if affected<>0 then raise exception 'FAIL: cross-account update';end if; exception when insufficient_privilege then null;end;
 begin delete from public.records where id='40000000-0000-4000-8000-000000000004';get diagnostics affected=row_count;if affected<>0 then raise exception 'FAIL: cross-account delete';end if; exception when insufficient_privilege then null;end;
 begin update public.records set owner_id=auth.uid() where id='40000000-0000-4000-8000-000000000004';get diagnostics affected=row_count;if affected<>0 then raise exception 'FAIL: owner takeover';end if; exception when insufficient_privilege then null;end;
 begin
 insert into public.records(id,owner_id,vault_id,encrypted_metadata,encrypted_payload,wrapped_dek,crypto_version) values('50000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','leqvor-v5');
 raise exception 'FAIL: impersonated owner insert';
 exception when insufficient_privilege then null;
 end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$begin
 begin perform * from public.records;raise exception 'FAIL: anonymous select granted';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
