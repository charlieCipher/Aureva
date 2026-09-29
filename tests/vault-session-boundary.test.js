// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VaultSession } from '../src/modules/security/VaultSession.js';
vi.mock('../src/lib/providers',()=>({DatabaseProvider:{},ObjectStorageProvider:{}}));
import { V5VaultService } from '../src/modules/vault/V5VaultService.js';
const sessions=[];
afterEach(()=>sessions.splice(0).forEach(s=>s.dispose()));
describe('vault operation boundaries',()=>{
  it('invalidates pending write authorization across lock and unlock',async()=>{
    const session=new VaultSession();sessions.push(session);session.unlock({});
    let resume;
    const wait=new Promise(resolve=>resume=resolve),write=vi.fn();
    const operation=session.run(async(_key,assertActive)=>{await wait;assertActive();write();});
    session.lock();session.unlock({});resume();
    await expect(operation).rejects.toThrow('vault locked');
    expect(write).not.toHaveBeenCalled();
  });
  it('rejects foreign records before touching providers',async()=>{
    const session=new VaultSession();sessions.push(session);
    const db={files:vi.fn(),updateRecord:vi.fn()},storage={download:vi.fn()};
    const service=new V5VaultService(session,{owner_id:'owner',id:'vault'},db,storage);
    const foreign={id:'record',owner_id:'other',vault_id:'vault'};
    expect(()=>service.reveal(foreign)).toThrow('does not belong');
    await expect(service.update(foreign,{},{})).rejects.toThrow('does not belong');
    await expect(service.download(foreign)).rejects.toThrow('does not belong');
    expect(db.updateRecord).not.toHaveBeenCalled();expect(storage.download).not.toHaveBeenCalled();
  });
  it('delegates deletion atomically without deleting client-side objects',async()=>{
    const session=new VaultSession();sessions.push(session);session.unlock({});
    const db={deleteRecord:vi.fn().mockResolvedValue(undefined)},storage={remove:vi.fn()};
    const service=new V5VaultService(session,{owner_id:'owner',id:'vault'},db,storage);
    await service.remove({id:'record',owner_id:'owner',vault_id:'vault',revision:3});
    expect(db.deleteRecord).toHaveBeenCalledWith('record',3);
    expect(storage.remove).not.toHaveBeenCalled();
  });
  it('rejects unversioned deletion before dispatch',async()=>{
    const session=new VaultSession();sessions.push(session);session.unlock({});
    const db={deleteRecord:vi.fn()};
    const service=new V5VaultService(session,{owner_id:'owner',id:'vault'},db,{});
    await expect(service.remove({id:'record',owner_id:'owner',vault_id:'vault'})).rejects.toThrow('version unavailable');
    expect(db.deleteRecord).not.toHaveBeenCalled();
  });
  it('requires an unlocked vault before listing attachments', async () => {
    const session = new VaultSession(); sessions.push(session);
    const db = { files: vi.fn() };
    const service = new V5VaultService(session, { owner_id: 'owner', id: 'vault' }, db, {});
    await expect(service.files({ id: 'record', owner_id: 'owner', vault_id: 'vault' })).rejects.toThrow('Unlock');
    expect(db.files).not.toHaveBeenCalled();
  });
  it.each(['foreign-owner', 'other-record', 'tampered-path'])('rejects %s attachment metadata', async variant => {
    const session = new VaultSession(); sessions.push(session); session.unlock({});
    const row = { id: 'file', record_id: 'record', owner_id: 'owner', vault_id: 'vault', storage_path: 'owner/record/file' };
    if (variant === 'foreign-owner') row.owner_id = 'other';
    if (variant === 'other-record') { row.record_id = 'other'; row.storage_path = 'owner/other/file'; }
    if (variant === 'tampered-path') row.storage_path = 'owner/record/../file';
    const storage = { download: vi.fn() };
    const service = new V5VaultService(session, { owner_id: 'owner', id: 'vault' }, { files: async () => [row] }, storage);
    await expect(service.files({ id: 'record', owner_id: 'owner', vault_id: 'vault' })).rejects.toThrow();
    if (variant !== 'other-record') await expect(service.download(row)).rejects.toThrow();
    expect(storage.download).not.toHaveBeenCalled();
  });
  it.each(['list', 'people', 'files', 'download'])('stops %s after a pending read crosses lock/unlock', async method => {
    const session = new VaultSession(); sessions.push(session); session.unlock({});
    let resume;
    const wait = new Promise(resolve => { resume = resolve; });
    const row = { id: 'file', record_id: 'record', owner_id: 'owner', vault_id: 'vault', storage_path: 'owner/record/file' };
    const service = new V5VaultService(session, { owner_id: 'owner', id: 'vault' },
      { listRecords: () => wait, people: () => wait, files: () => wait }, { download: () => wait });
    const pending = service[method](row);
    session.lock(); session.unlock({});
    // Deliberately invalid ciphertext would cause a crypto error if reached.
    resume(method === 'download' ? {} : [row]);
    await expect(pending).rejects.toThrow('vault locked');
  });
});
