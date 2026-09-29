import { expect, it } from 'vitest';
import { validateNewPassword } from '../src/lib/passwordPolicy';
import { createVaultEnvelope, rewrapVaultPassword } from '../src/modules/security/v5Crypto';

it('accepts 16 characters and longer without truncating passwords', () => {
  expect(() => validateNewPassword('a'.repeat(15))).toThrow('16 characters');
  expect(() => validateNewPassword('a'.repeat(16))).not.toThrow();
  expect(() => validateNewPassword('a'.repeat(24))).not.toThrow();
});

it('rejects short new vault passwords before generating or replacing keys', async () => {
  await expect(createVaultEnvelope('owner', 'a'.repeat(15), '')).rejects.toThrow('16 characters');
  await expect(rewrapVaultPassword({}, '', 'a'.repeat(15))).rejects.toThrow('16 characters');
});
