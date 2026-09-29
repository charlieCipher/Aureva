begin;

-- Format validation only: the server cannot prove that supplied bytes were
-- encrypted. Authentication of ciphertext remains the trusted client's job.
create function public.v5_valid_ciphertext(value jsonb) returns boolean
language plpgsql immutable parallel safe set search_path='' as $$
declare payload text;
begin
 if value is null or jsonb_typeof(value) <> 'object' then return false; end if;
 if value - array['crypto_version','algorithm','aad_version','nonce','ciphertext'] <> '{}'::jsonb
    or value->>'crypto_version' is distinct from 'leqvor-v5'
    or value->>'algorithm' is distinct from 'AES-256-GCM'
    or value->'aad_version' is distinct from '1'::jsonb
    or jsonb_typeof(value->'nonce') is distinct from 'string'
    or jsonb_typeof(value->'ciphertext') is distinct from 'string' then return false; end if;
 if value->>'nonce' !~ '^[A-Za-z0-9+/]{16}$' then return false; end if;
 payload := value->>'ciphertext';
 return length(payload) between 24 and 20971520
    and length(payload) % 4 = 0
    and payload ~ '^[A-Za-z0-9+/]+={0,2}$';
end $$;
revoke all on function public.v5_valid_ciphertext(jsonb) from public;
grant execute on function public.v5_valid_ciphertext(jsonb) to authenticated, service_role;

-- NOT VALID preserves existing rows without rewriting private data. New writes
-- and updates are checked immediately. Validate historical rows separately.
alter table public.vaults add constraint vault_ciphertext_envelopes check (
 public.v5_valid_ciphertext(wrapped_vmk_password) and public.v5_valid_ciphertext(wrapped_vmk_recovery)
) not valid;
alter table public.records add constraint record_ciphertext_envelopes check (
 public.v5_valid_ciphertext(encrypted_metadata) and public.v5_valid_ciphertext(encrypted_payload)
 and public.v5_valid_ciphertext(wrapped_dek)
) not valid;
alter table public.record_files add constraint file_ciphertext_envelopes check (
 public.v5_valid_ciphertext(encrypted_filename) and public.v5_valid_ciphertext(wrapped_file_dek)
) not valid;
alter table public.trusted_people add constraint person_ciphertext_envelopes check (
 public.v5_valid_ciphertext(encrypted_metadata) and public.v5_valid_ciphertext(encrypted_payload)
 and public.v5_valid_ciphertext(wrapped_dek)
) not valid;
notify pgrst, 'reload schema';
commit;
