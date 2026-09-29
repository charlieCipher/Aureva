import {afterEach,it,expect,vi} from 'vitest';
import {act,cleanup,render,screen,fireEvent} from '@testing-library/react';
const service=vi.hoisted(()=>({create:vi.fn()}));
vi.mock('../src/features/vault/VaultContext',()=>({useVault:()=>({service})}));
import StatementForm from '../src/components/continuity/StatementForm';
afterEach(()=>{cleanup();vi.resetAllMocks();});
function setup(saved=vi.fn()){
 const view=render(<StatementForm section="Final wishes" onSaved={saved}/>);
 const title=screen.getByLabelText('Title'),body=screen.getByLabelText('Your intentions');
 fireEvent.change(title,{target:{value:'  My wishes  '}});
 fireEvent.change(body,{target:{value:'Preserve these intentions.'}});
 return {view,title,body,form:title.closest('form')};
}
it('rejects blank titles and whitespace-only intentions before encryption',()=>{
 const {title,body,form}=setup();
 fireEvent.change(title,{target:{value:'   '}});fireEvent.submit(form);
 expect(screen.getByRole('alert').textContent).toContain('title');
 fireEvent.change(title,{target:{value:'Wishes'}});
 fireEvent.change(body,{target:{value:' \n '}});fireEvent.submit(form);
 expect(screen.getByRole('alert').textContent).toContain('intentions');
 expect(service.create).not.toHaveBeenCalled();
 expect(document.activeElement).toBe(body);
});
it('deduplicates pending saves and ignores a result after closure',async()=>{
 let finish;service.create.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
 const saved=vi.fn(),{view,form}=setup(saved);
 fireEvent.submit(form);fireEvent.submit(form);
 expect(service.create).toHaveBeenCalledTimes(1);
 view.unmount();await act(async()=>finish({id:'s'}));
 expect(saved).not.toHaveBeenCalled();
});
it('retains rejected drafts for retry and clears them after success',async()=>{
 service.create.mockRejectedValueOnce(new Error('PRIVATE_ERROR')).mockResolvedValueOnce({id:'s'});
 const saved=vi.fn(),{title,body,form}=setup(saved);
 fireEvent.submit(form);await screen.findByRole('alert');
 expect(body.value).toBe('Preserve these intentions.');
 expect(screen.queryByText('PRIVATE_ERROR')).toBeNull();
 await act(async()=>fireEvent.submit(form));
 expect(saved).toHaveBeenCalledWith({id:'s'});
 expect(title.value).toBe('');expect(body.value).toBe('');
 expect(service.create).toHaveBeenLastCalledWith(expect.objectContaining({title:'My wishes',kind:'statement',section:'Final wishes'}),expect.objectContaining({description:'Preserve these intentions.'}),null);
});
