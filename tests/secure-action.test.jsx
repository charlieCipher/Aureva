import {afterEach,it,expect,vi} from 'vitest';
import {cleanup,render,screen,fireEvent,act} from '@testing-library/react';
const auth=vi.hoisted(()=>({reauthenticate:vi.fn()}));
vi.mock('../src/lib/providers',()=>({AuthProvider:auth}));
import SecureAction from '../src/components/security/SecureAction';
afterEach(()=>{cleanup();vi.resetAllMocks();});
it('does not execute an action when its dialog was closed during reauthentication',async()=>{
 let resolve;auth.reauthenticate.mockImplementation(()=>new Promise(r=>resolve=r));
 const execute=vi.fn(),view=render(<SecureAction title="Export" onVerified={execute}/>);
 fireEvent.change(screen.getByLabelText('Account password'),{target:{value:'test password'}});
 fireEvent.submit(screen.getByLabelText('Account password').closest('form'));
 view.unmount();await act(async()=>resolve());
 expect(execute).not.toHaveBeenCalled();
});
it('prevents duplicate pending submissions and executes once after verification',async()=>{
 let resolve;auth.reauthenticate.mockImplementation(()=>new Promise(r=>resolve=r));
 const execute=vi.fn();render(<SecureAction title="Export" onVerified={execute}/>);
 const form=screen.getByLabelText('Account password').closest('form');
 fireEvent.change(screen.getByLabelText('Account password'),{target:{value:'test password'}});
 fireEvent.submit(form);fireEvent.submit(form);
 expect(auth.reauthenticate).toHaveBeenCalledTimes(1);
 await act(async()=>resolve());expect(execute).toHaveBeenCalledTimes(1);
 expect(screen.getByLabelText('Account password').value).toBe('');
});
it('never executes after rejected reauthentication',async()=>{
 auth.reauthenticate.mockRejectedValue(new Error('incorrect'));
 const execute=vi.fn();render(<SecureAction title="Delete" onVerified={execute}/>);
 fireEvent.submit(screen.getByLabelText('Account password').closest('form'));
 await screen.findByRole('alert');expect(execute).not.toHaveBeenCalled();
});
it('clears password and OTP after failure, then requires fresh verification on retry',async()=>{
 auth.reauthenticate.mockRejectedValueOnce(new Error('PRIVATE_AUTH_FAILURE')).mockResolvedValueOnce(undefined);
 const execute=vi.fn();render(<SecureAction title="Export" onVerified={execute}/>);
 const password=screen.getByLabelText('Account password'),code=screen.getByLabelText('Authenticator code, if enabled'),form=password.closest('form');
 fireEvent.change(password,{target:{value:'synthetic password'}});fireEvent.change(code,{target:{value:'123456'}});
 fireEvent.submit(form);await screen.findByRole('alert');
 expect(password.value).toBe('');expect(code.value).toBe('');
 expect(screen.queryByText('PRIVATE_AUTH_FAILURE')).toBeNull();expect(execute).not.toHaveBeenCalled();
 fireEvent.change(password,{target:{value:'fresh synthetic password'}});fireEvent.change(code,{target:{value:'654321'}});
 await act(async()=>fireEvent.submit(form));
 expect(auth.reauthenticate).toHaveBeenLastCalledWith('fresh synthetic password','654321');
 expect(execute).toHaveBeenCalledTimes(1);
 expect(password.value).toBe('');expect(code.value).toBe('');
});
it('keeps verification controls disabled through the action and clears credentials if it fails',async()=>{
 auth.reauthenticate.mockResolvedValue(undefined);
 let rejectAction;const execute=vi.fn(()=>new Promise((_resolve,reject)=>{rejectAction=reject;}));
 render(<SecureAction title="Export" onVerified={execute}/>);
 const password=screen.getByLabelText('Account password'),code=screen.getByLabelText('Authenticator code, if enabled'),form=password.closest('form');
 fireEvent.change(password,{target:{value:'synthetic password'}});
 await act(async()=>fireEvent.submit(form));
 expect(password.disabled).toBe(true);expect(code.disabled).toBe(true);
 fireEvent.submit(form);expect(execute).toHaveBeenCalledTimes(1);
 await act(async()=>rejectAction(new Error('PRIVATE_ACTION_FAILURE')));
 expect(password.disabled).toBe(false);expect(password.value).toBe('');expect(code.value).toBe('');
 expect(screen.getByRole('alert')).toBeTruthy();
 expect(screen.queryByText('PRIVATE_ACTION_FAILURE')).toBeNull();
});
