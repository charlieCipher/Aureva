import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
const auth=vi.hoisted(()=>({factors:vi.fn(),enrollMfa:vi.fn(),verifyMfa:vi.fn(),assurance:vi.fn()}));
vi.mock('../src/lib/providers',()=>({AuthProvider:auth}));
import MfaSetup from '../src/components/security/MfaSetup';
afterEach(()=>{cleanup();vi.resetAllMocks();});
it.each(['aal1','aal2'])('enrollment only succeeds with verified factor and AAL2: %s',async level=>{
 auth.factors.mockResolvedValueOnce({totp:[]}).mockResolvedValue({totp:[{id:'factor',status:'verified'}]});
 auth.enrollMfa.mockResolvedValue({id:'factor',totp:{qr_code:'data:image/svg+xml,<svg/>'}});
 auth.verifyMfa.mockResolvedValue({});auth.assurance.mockResolvedValue({currentLevel:level});
 render(<MfaSetup/>);fireEvent.click(screen.getByRole('button',{name:'Set up authenticator'}));
 const code=await screen.findByLabelText('Authenticator code');
 fireEvent.change(code,{target:{value:'123456'}});fireEvent.submit(code.closest('form'));
 if(level==='aal2') expect((await screen.findByRole('status')).textContent).toContain('enabled');
 else {await screen.findByRole('alert');expect(screen.queryByRole('status')).toBeNull();}
});
