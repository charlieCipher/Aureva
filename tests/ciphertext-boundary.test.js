// @vitest-environment node
import { expect, it } from 'vitest';
import { ciphertextEnvelope, encryptedWrite } from '../src/lib/ciphertextBoundary.js';
const envelope={crypto_version:'leqvor-v5',algorithm:'AES-256-GCM',aad_version:1,nonce:'AAAAAAAAAAAAAAAA',ciphertext:'AAAAAAAAAAAAAAAAAAAAAA=='};
it('accepts encrypted records without carrying UI state',()=>{
  const row={id:'id',owner_id:'owner',vault_id:'vault',crypto_version:'leqvor-v5',encrypted_metadata:envelope,encrypted_payload:envelope,wrapped_dek:envelope};
  expect(encryptedWrite('record',row)).toEqual(row);
});
it('rejects secret canaries in every write schema without echoing them',()=>{
  for(const kind of ['record','person','vault','file'])
    for(const field of ['title','notes','password','recovery_phrase','private_key','instructions']) {
      let error;
      try{encryptedWrite(kind,{[field]:'SECRET_CANARY'});}catch(e){error=e;}
      expect(error).toBeInstanceOf(Error);
      expect(error.message).not.toContain('SECRET_CANARY');
    }
});
it('rejects nested plaintext in ciphertext and KDF envelopes',()=>{
  expect(()=>ciphertextEnvelope({...envelope,plaintext:'SECRET_CANARY'})).toThrow();
  expect(()=>encryptedWrite('vault',{kdf_parameters:{algorithm:'Argon2id',t:3,m:65536,p:1,dkLen:32,password:'SECRET_CANARY'}})).toThrow();
});
it('rejects unauthenticated formats and malformed nonce/ciphertext',()=>{
  for(const change of [{algorithm:'AES-CBC'},{nonce:'short'},{ciphertext:'plaintext notes'},{ciphertext:'A'.repeat(25)},{ciphertext:'A'.repeat(23)+'=='}])
    expect(()=>ciphertextEnvelope({...envelope,...change})).toThrow();
});
it('allows partial password-wrapper replacement',()=>{
  expect(encryptedWrite('vault',{kdf_salt:'salt',kdf_parameters:{algorithm:'Argon2id',t:3,m:65536,p:1,dkLen:32},wrapped_vmk_password:envelope})).toHaveProperty('wrapped_vmk_password');
});
