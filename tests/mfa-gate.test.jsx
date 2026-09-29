import {afterEach,it,expect,vi} from 'vitest';
import {cleanup,render,screen,fireEvent} from '@testing-library/react';
const auth=vi.hoisted(()=>({assurance:vi.fn(),factors:vi.fn(),verifyMfa:vi.fn(),signOut:vi.fn()}));
vi.mock('../src/lib/providers',()=>({AuthProvider:auth}));
import MfaGate from '../src/features/auth/MfaGate';
afterEach(()=>{cleanup();vi.resetAllMocks();});
it('keeps the vault hidden until MFA assurance is confirmed',async()=>{
 auth.assurance.mockResolvedValueOnce({currentLevel:'aal1',nextLevel:'aal2'}).mockResolvedValueOnce({currentLevel:'aal1',nextLevel:'aal2'}).mockResolvedValueOnce({currentLevel:'aal2',nextLevel:'aal2'});
 auth.factors.mockResolvedValue({totp:[{id:'factor',status:'verified'}]});
 auth.verifyMfa.mockResolvedValue({});
 render(<MfaGate><div>Private workspace</div></MfaGate>);
 fireEvent.change(await screen.findByLabelText('Authenticator code'),{target:{value:'123456'}});
 fireEvent.click(screen.getByRole('button',{name:'Verify',exact:true}));
 await screen.findByRole('alert');
 expect(screen.queryByText('Private workspace')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Verify',exact:true}));
 await screen.findByText('Private workspace');
 expect(auth.verifyMfa).toHaveBeenCalledWith('factor','123456');
});
it('fails closed on an incomplete assurance response',async()=>{
 auth.assurance.mockResolvedValue({});
 render(<MfaGate><div>Private workspace</div></MfaGate>);
 await screen.findByRole('button',{name:'Retry'});
 expect(screen.queryByText('Private workspace')).toBeNull();
});
it('allows a confirmed account without an enrolled second factor',async()=>{
 auth.assurance.mockResolvedValue({currentLevel:'aal1',nextLevel:'aal1'});
 render(<MfaGate><div>Private workspace</div></MfaGate>);
 await screen.findByText('Private workspace');
});
