-- Read-only aggregate inspection AFTER installing the envelope validator.
-- Run with a maintenance role that can inspect all rows; owner RLS would hide gaps.
-- Do not return payloads, identifiers or failing-row details.
select 'vaults' as table_name,count(*) as malformed_rows from public.vaults
where not (public.v5_valid_ciphertext(wrapped_vmk_password)
 and public.v5_valid_ciphertext(wrapped_vmk_recovery))
union all
select 'records',count(*) from public.records
where not (public.v5_valid_ciphertext(encrypted_metadata)
 and public.v5_valid_ciphertext(encrypted_payload) and public.v5_valid_ciphertext(wrapped_dek))
union all
select 'record_files',count(*) from public.record_files
where not (public.v5_valid_ciphertext(encrypted_filename) and public.v5_valid_ciphertext(wrapped_file_dek))
union all
select 'trusted_people',count(*) from public.trusted_people
where not (public.v5_valid_ciphertext(encrypted_metadata)
 and public.v5_valid_ciphertext(encrypted_payload) and public.v5_valid_ciphertext(wrapped_dek));
