-- Disposable staging database only; apply all migrations first.
begin;
insert into auth.users(id,email) values('10000000-0000-4000-8000-000000000011','transactions@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000011',true);
insert into public.vaults(id,owner_id,wrapped_vmk_password,wrapped_vmk_recovery,kdf_salt,kdf_parameters,recovery_salt,crypto_version,recovery_verified_at)
values('30000000-0000-4000-8000-000000000013',auth.uid(),'{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','fixture','{}','fixture','leqvor-v5',now());
insert into public.records(id,owner_id,vault_id,encrypted_metadata,encrypted_payload,wrapped_dek,crypto_version)
values('40000000-0000-4000-8000-000000000014',auth.uid(),'30000000-0000-4000-8000-000000000013','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','leqvor-v5');
insert into public.record_files(id,record_id,owner_id,vault_id,encrypted_filename,wrapped_file_dek,storage_path,crypto_version)
values('50000000-0000-4000-8000-000000000015','40000000-0000-4000-8000-000000000014',auth.uid(),'30000000-0000-4000-8000-000000000013','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}','{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}',auth.uid()::text||'/40000000-0000-4000-8000-000000000014/50000000-0000-4000-8000-000000000015','leqvor-v5');
do $$declare r public.records;begin
 select * into r from public.records where id='40000000-0000-4000-8000-000000000014';
 r:=public.update_v5_record(r.id,1,to_jsonb(r));
 if r.revision<>2 then raise exception 'FAIL: revision not incremented';end if;
 begin
 perform public.update_v5_record(r.id,1,to_jsonb(r));
 raise exception 'FAIL: stale update accepted';
 exception when serialization_failure then null;end;
 begin
 perform public.delete_v5_record(r.id,1);
 raise exception 'FAIL: stale delete accepted';
 exception when serialization_failure then null;end;
 perform public.delete_v5_record(r.id,2);
 if exists(select 1 from public.record_files where record_id=r.id) then raise exception 'FAIL: attachments remain';end if;
 begin
 perform * from public.ciphertext_cleanup_jobs;
 raise exception 'FAIL: client may read cleanup queue';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$begin
 if (select count(*) from public.ciphertext_cleanup_jobs where owner_id='10000000-0000-4000-8000-000000000011')<>1 then
 raise exception 'FAIL: cleanup job missing';end if;
end $$;
rollback;
