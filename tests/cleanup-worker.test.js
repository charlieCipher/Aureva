// @vitest-environment node
import {it,expect,vi} from 'vitest';
import {cleanupBatch} from '../scripts/ciphertext-cleanup.mjs';
const id='10000000-0000-4000-8000-000000000001';
const job={id,owner_id:id,storage_path:`${id}/${id}/${id}`};
it('acknowledges jobs only after successful storage removal',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>[job]}).mockResolvedValueOnce({ok:true}).mockResolvedValueOnce({ok:true});
 expect(await cleanupBatch({url:'https://example.invalid',key:'fake',fetcher})).toEqual({completed:1,failed:0});
 expect(fetcher.mock.calls[1][1].body).toContain(job.storage_path);
 expect(fetcher.mock.calls[2][1].method).toBe('DELETE');
});
it('retains a failed storage deletion for retry',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>[job]}).mockResolvedValueOnce({ok:false});
 expect(await cleanupBatch({url:'https://example.invalid',key:'fake',fetcher})).toEqual({completed:0,failed:1});
 expect(fetcher).toHaveBeenCalledTimes(2);
});
it('does not delete objects outside the queued owner path',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>[{...job,owner_id:'other'}]});
 expect(await cleanupBatch({url:'https://example.invalid',key:'fake',fetcher})).toEqual({completed:0,failed:1});
 expect(fetcher).toHaveBeenCalledTimes(1);
});
it('rejects malformed batches before deleting anything',async()=>{
 const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({error:'unexpected'})});
 await expect(cleanupBatch({url:'https://example.invalid',key:'fake',fetcher})).rejects.toThrow('Invalid cleanup batch');
 expect(fetcher).toHaveBeenCalledTimes(1);
});
it('skips malformed jobs and keeps processing valid jobs',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>[null,{...job,storage_path:'../../private'},job]}).mockResolvedValue({ok:true});
 expect(await cleanupBatch({url:'https://example.invalid',key:'fake',fetcher})).toEqual({completed:1,failed:2});
 expect(fetcher).toHaveBeenCalledTimes(3);
});
it('keeps the queue entry when storage times out',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>[job]}).mockImplementation((_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout')),{once:true})));
 expect(await cleanupBatch({url:'https://example.invalid',key:'fake',fetcher,timeoutMs:10})).toEqual({completed:0,failed:1});
 expect(fetcher).toHaveBeenCalledTimes(2);
 expect(fetcher.mock.calls[1][1].redirect).toBe('error');
});
it('retries storage deletion after an acknowledgement failure',async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce({ok:true,json:async()=>[job]}).mockResolvedValueOnce({ok:true}).mockResolvedValueOnce({ok:false});
 expect(await cleanupBatch({url:'https://example.invalid',key:'fake',fetcher})).toEqual({completed:0,failed:1});
 fetcher.mockResolvedValueOnce({ok:true,json:async()=>[job]}).mockResolvedValueOnce({ok:true}).mockResolvedValueOnce({ok:true});
 expect(await cleanupBatch({url:'https://example.invalid',key:'fake',fetcher})).toEqual({completed:1,failed:0});
});
it('rejects invalid worker configuration before sending credentials',async()=>{
 const fetcher=vi.fn();
 for(const config of [{url:'http://example.invalid'},{url:'https://example.invalid/?token=secret'},{limit:NaN},{limit:101},{timeoutMs:0}]) {
  await expect(cleanupBatch({url:'https://example.invalid',key:'fake',fetcher,...config})).rejects.toThrow();
 }
 expect(fetcher).not.toHaveBeenCalled();
});
