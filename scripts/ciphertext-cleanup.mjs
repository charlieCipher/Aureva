// Server-only worker. Never import this module into the browser build.
export async function cleanupBatch({url,key,fetcher=fetch,limit=50,timeoutMs=15000}) {
  const origin=new URL(url);
  if(!['https:','http:'].includes(origin.protocol) || (origin.protocol!=='https:' && !['localhost','127.0.0.1'].includes(origin.hostname))) throw new Error('HTTPS required.');
  if(origin.username || origin.password || origin.search || origin.hash || origin.pathname!=='/') throw new Error('Use a service origin without credentials, query or path.');
  if(typeof key!=='string' || !key.trim()) throw new Error('Server cleanup credentials are required.');
  if(!Number.isInteger(limit) || limit<1 || limit>100) throw new Error('Batch size must be between 1 and 100.');
  if(!Number.isInteger(timeoutMs) || timeoutMs<1 || timeoutMs>60000) throw new Error('Request timeout must be between 1 and 60000 milliseconds.');
  const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
  // Keep the deadline active while consuming a response body, too. Refuse
  // redirects so server credentials never follow a relocated endpoint.
  const request=async(path,options={},readBody=false)=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try {
      const response=await fetcher(new URL(path,origin),{...options,headers,redirect:'error',signal:controller.signal});
      if(!response.ok) throw new Error('Cleanup request failed.');
      return readBody?await response.json():undefined;
    } finally {clearTimeout(timer);}
  };
  let jobs;
  try {jobs=await request(`/rest/v1/ciphertext_cleanup_jobs?select=id,owner_id,storage_path&order=created_at.asc,id.asc&limit=${limit}`,{},true);}
  catch {throw new Error('Cleanup queue unavailable.');}
  if(!Array.isArray(jobs) || jobs.length>limit) throw new Error('Invalid cleanup batch.');
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  let completed=0,failed=0;
  for(const job of jobs) {
    const parts=typeof job?.storage_path==='string'?job.storage_path.split('/'):[];
    if(!job || !uuid.test(job.id) || parts.length!==3 || !parts.every(p=>uuid.test(p)) || parts[0]!==job.owner_id){failed++;continue;}
    try {
      await request('/storage/v1/object/vault-v5',{method:'DELETE',body:JSON.stringify({prefixes:[job.storage_path]})});
      await request(`/rest/v1/ciphertext_cleanup_jobs?id=eq.${job.id}`,{method:'DELETE'});
      completed++;
    } catch {failed++;}
  }
  return {completed,failed};
}

if(process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  try {
    const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!url||!key) throw new Error('Server cleanup credentials are required.');
    const outcome=await cleanupBatch({url,key});
    console.log(JSON.stringify(outcome));
    if(outcome.failed) process.exitCode=1;
  } catch {console.error('Cleanup worker failed; inspect server configuration.');process.exitCode=1;}
}
