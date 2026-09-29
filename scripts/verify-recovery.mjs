import { readFile, stat } from 'node:fs/promises';
import { verifyRecoveryPackage } from '../src/modules/security/recoveryPackage.js';

async function secret() {
  if (!process.stdin.isTTY) throw new Error('Run in an interactive terminal to enter the recovery secret privately.');
  process.stderr.write('24-word recovery secret (input hidden): ');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => {
      process.stdin.removeListener('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stderr.write('\n');
      if (error) reject(error); else resolve(value);
      value = '';
    };
    const onData = bytes => {
      for (const char of bytes.toString('utf8')) {
        if (char === '\u0003') return finish(new Error('Cancelled.'));
        if (char === '\r' || char === '\n') return finish();
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (/^[a-zA-Z ]$/.test(char) && value.length < 512) value += char;
      }
    };
    process.stdin.on('data', onData);
  });
}

let phrase = '';
try {
  const path = process.argv[2];
  if (!path || process.argv.length !== 3) throw new Error('Usage: node scripts/verify-recovery.mjs <encrypted-vault.leqvor>');
  if ((await stat(path)).size > 100 * 1024 * 1024) throw new Error('Package exceeds this verifier’s 100 MB limit.');
  const pkg = JSON.parse(await readFile(path, 'utf8'));
  phrase = await secret();
  const result = await verifyRecoveryPackage(pkg, phrase);
  console.log(`Verified: ${result.records} records, ${result.people} people, ${result.files} files. No plaintext files were written.`);
  console.log('This verifies the supplied package, not its freshness or completeness against the original vault.');
} catch (error) {
  console.error(error instanceof SyntaxError ? 'Invalid package JSON.' : error.message);
  process.exitCode = 1;
} finally {
  phrase = '';
}
