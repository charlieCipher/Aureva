// @vitest-environment node
import { mkdtemp,writeFile,readFile,rm,readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { it,expect,afterEach } from 'vitest';
import { prepareRelease } from '../scripts/prepare-release.mjs';
const roots=[];
afterEach(async()=>{for(const root of roots.splice(0)) await rm(root,{recursive:true,force:true});});
async function fixture() {
 const root=await mkdtemp(join(tmpdir(),'leqvor-candidate-test-')); roots.push(root);
 const {mkdir}=await import('node:fs/promises');
 const build=join(root,'build'); await mkdir(build);
 await writeFile(join(build,'index.html'),'<title>LEQVOR</title>');
 await writeFile(join(build,'_headers'),"script-src 'self'; frame-ancestors 'none'");
 return {root,build};
}
it('copies an isolated candidate and fingerprints the exact bytes',async()=>{
 const {root,build}=await fixture();
 const candidate=await prepareRelease(build,join(root,'candidates'));
 const manifest=JSON.parse(await readFile(join(candidate,'manifest.json'),'utf8'));
 expect(manifest.files).toHaveLength(2);
 for(const file of manifest.files) {
   const bytes=await readFile(join(candidate,'dist',file.path));
   expect(file.bytes).toBe(bytes.length);
   expect(file.sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
 }
 await writeFile(join(build,'index.html'),'changed source');
 expect(await readFile(join(candidate,'dist','index.html'),'utf8')).toBe('<title>LEQVOR</title>');
});
it('rejects secrets in output before creating a candidate',async()=>{
 const {root,build}=await fixture();
 await writeFile(join(build,'.env'),'SYNTHETIC_SECRET');
 await expect(prepareRelease(build,join(root,'candidates'))).rejects.toThrow('Build validation failed');
 expect(await readdir(root)).toEqual(['build']);
});
it('rejects a candidate directory nested in the build',async()=>{
 const {build}=await fixture();
 await expect(prepareRelease(build,join(build,'nested'))).rejects.toThrow('Separate build');
});
