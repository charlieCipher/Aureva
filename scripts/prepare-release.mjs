import { mkdir, mkdtemp, readdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import { checkBuild } from './check-build.mjs';

export async function prepareRelease(source, outputRoot) {
  const issues = await checkBuild(source);
  if (issues.length) throw new Error('Build validation failed; candidate was not created.');
  const root = resolve(outputRoot);
  const relation = relative(resolve(source),root);
  if (relation === '' || (!isAbsolute(relation) && relation !== '..' && !relation.startsWith('..'+sep))) throw new Error('Separate build and candidate directories required.');
  await mkdir(root,{recursive:true});
  const destination = await mkdtemp(join(root,'candidate-'));
  const manifest = {format:'leqvor-build-manifest-v1',created_at:new Date().toISOString(),files:[]};
  async function copy(directory) {
    for (const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      const input=join(directory,entry.name), path=relative(source,input).replaceAll('\\','/');
      const output=join(destination,'dist',path);
      if (entry.isSymbolicLink()) throw new Error('Symlink rejected.');
      if (entry.isDirectory()) { await mkdir(output,{recursive:true}); await copy(input); }
      else {
        await copyFile(input,output);
        const bytes=await readFile(output);
        manifest.files.push({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
      }
    }
  }
  await mkdir(join(destination,'dist'));
  await copy(resolve(source));
  await writeFile(join(destination,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  return destination;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(`Prepared local candidate: ${await prepareRelease(resolve('dist'),resolve('.local-release'))}`); }
  catch { console.error('Release preparation failed. No deployment was performed.'); process.exitCode=1; }
}
