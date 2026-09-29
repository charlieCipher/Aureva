-- Disposable database only. Format fixtures are NOT cryptographic ciphertext.
begin;
insert into auth.users(id,email) values('10000000-0000-4000-8000-000000000021','envelopes@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000021',true);
do $$
declare
 e jsonb := '{"crypto_version":"leqvor-v5","algorithm":"AES-256-GCM","aad_version":1,"nonce":"AAAAAAAAAAAAAAAA","ciphertext":"AAAAAAAAAAAAAAAAAAAAAA=="}';
 invalid jsonb; r public.records;
 v uuid := '30000000-0000-4000-8000-000000000023';
 rid uuid := '40000000-0000-4000-8000-000000000024';
 fid uuid := '50000000-0000-4000-8000-000000000025';
begin
 if not public.v5_valid_ciphertext(e) then raise exception 'FAIL: valid envelope rejected'; end if;
 foreach invalid in array array[
   null::jsonb, 'null'::jsonb, '{}'::jsonb, '[]'::jsonb, '"plaintext"'::jsonb,
   e - 'nonce', e || '{"plaintext":"SECRET_CANARY"}', e || '{"aad_version":"1"}',
   e || '{"nonce":123}', e || '{"algorithm":"AES-CBC"}',
   e || '{"ciphertext":"AAAAAAAAAAAAAAAAAAAAAAA=="}'
 ] loop
   if public.v5_valid_ciphertext(invalid) then raise exception 'FAIL: malformed envelope accepted'; end if;
 end loop;
 insert into public.vaults(id,owner_id,wrapped_vmk_password,wrapped_vmk_recovery,kdf_salt,kdf_parameters,recovery_salt,crypto_version,recovery_verified_at)
 values(v,auth.uid(),e,e,'fixture','{}','fixture','leqvor-v5',now());
 begin
   update public.vaults set wrapped_vmk_recovery='{"plaintext":"SECRET_CANARY"}' where id=v;
   raise exception 'FAIL: plaintext recovery wrapper accepted';
 exception when check_violation then null; end;
 insert into public.records(id,owner_id,vault_id,encrypted_metadata,encrypted_payload,wrapped_dek,crypto_version)
 values(rid,auth.uid(),v,e,e,e,'leqvor-v5') returning * into r;
 begin
   perform public.update_v5_record(rid,1,to_jsonb(r) || '{"encrypted_payload":{"plaintext":"SECRET_CANARY"}}');
   raise exception 'FAIL: RPC bypassed ciphertext constraint';
 exception when check_violation then null; end;
 if (select revision from public.records where id=rid) <> 1 then raise exception 'FAIL: rejected edit changed revision'; end if;
 begin
   insert into public.record_files(id,record_id,owner_id,vault_id,encrypted_filename,wrapped_file_dek,storage_path,crypto_version)
   values(fid,rid,auth.uid(),v,'{}',e,auth.uid()::text||'/'||rid::text||'/'||fid::text,'leqvor-v5');
   raise exception 'FAIL: malformed filename envelope accepted';
 exception when check_violation then null; end;
 begin
   insert into public.trusted_people(id,owner_id,vault_id,encrypted_metadata,encrypted_payload,wrapped_dek,crypto_version)
   values(fid,auth.uid(),v,e,e,'{}','leqvor-v5');
   raise exception 'FAIL: malformed person key accepted';
 exception when check_violation then null; end;
end $$;
reset role;
rollback;
