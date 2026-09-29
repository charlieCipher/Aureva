// Test-only receiver. Synthetic secrets travel over IPC, never command arguments.
import { readFile } from 'node:fs/promises';
import { verifyRecoveryPackage } from '../../src/modules/security/recoveryPackage.js';

process.once('message', async ({ path, phrase }) => {
  try {
    const pkg = JSON.parse(await readFile(path, 'utf8'));
    const counts = await verifyRecoveryPackage(pkg, phrase);
    phrase = '';
    process.send({ ok: true, counts }, () => process.disconnect());
  } catch {
    phrase = '';
    process.send({ ok: false }, () => process.disconnect());
  }
});
