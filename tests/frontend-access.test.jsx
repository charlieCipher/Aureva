import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AccessPlanner from '../src/components/people/AccessPlanner';
import SecurityDetails from '../src/components/security/SecurityDetails';
import { detailPreferences, saveDetailPreferences, policySummary } from '../src/components/security/previewPreferences';
vi.mock('../src/components/security/VaultControls', () => ({ default: () => <div>Vault controls</div> }));
afterEach(cleanup);
const people = [{ id: 'p', display_name: 'Priya', relationship: 'Spouse' }];
const records = [{ id: 'r', title: 'Property Deed', category: 'Property' }];
it('requires explicit selections and review before saving a sample access plan', () => {
  const onSave = vi.fn();
  render(<AccessPlanner demo people={people} records={records} onSave={onSave}/>);
  expect(screen.getByRole('button', {name:'Review sample access'}).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Trusted person'), {target:{value:'p'}});
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', {name:'Review sample access'}));
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', {name:'Save sample plan'}));
  expect(onSave).toHaveBeenCalledWith({person:'p',records:['r'],permission:'View only',condition:'Owner approval'});
  expect(screen.getByRole('status').textContent).toContain('Sample plan saved');
});
it('never grants access from the disconnected live interface', () => {
  const onSave = vi.fn();
  render(<AccessPlanner people={people} records={records} onSave={onSave}/>);
  fireEvent.change(screen.getByLabelText('Trusted person'), {target:{value:'p'}});
  fireEvent.click(screen.getByRole('checkbox'));
  expect(screen.getByRole('button', {name:'Review sample access'}).disabled).toBe(true);
  expect(onSave).not.toHaveBeenCalled();
});
it('keeps live Shield configuration disabled', () => {
  const onSave = vi.fn();
  render(<SecurityDetails name="Shield approvals" onSave={onSave}/>);
  expect(screen.getByRole('button', {name:'Save preview preferences'}).disabled).toBe(true);
  expect(screen.getByRole('group').disabled).toBe(true);
});
it('saves preview preferences explicitly and restores passed state', () => {
  const onSave = vi.fn();
  render(<SecurityDetails demo name="PIN scrambling" preferences={{'Randomize the PIN keypad':true}} onSave={onSave}/>);
  expect(screen.getByRole('checkbox').checked).toBe(true);
  fireEvent.click(screen.getByRole('button', {name:'Save preview preferences'}));
  expect(onSave).toHaveBeenCalledWith({'Randomize the PIN keypad':true});
});
it('keeps individual and grouped notification settings consistent', () => {
  let preferences = saveDetailPreferences({}, 'Security alerts', { 'Security alerts': false });
  expect(detailPreferences('Notification Preferences', preferences)['Security alerts']).toBe(false);
  preferences = saveDetailPreferences(preferences, 'Notification Preferences', { 'Security alerts': true, 'Product updates': true });
  expect(detailPreferences('Security alerts', preferences)['Security alerts']).toBe(true);
  expect(detailPreferences('Product updates', preferences)['Product updates']).toBe(true);
});
it('persists confirmed sample removals across reopening', () => {
  const onSave = vi.fn();
  const view = render(<SecurityDetails demo name="Trusted devices" onSave={onSave}/>);
  fireEvent.click(screen.getAllByRole('button', {name:'Remove'})[1]);
  expect(onSave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', {name:'Confirm sample removal'}));
  const saved = onSave.mock.calls[0][0];
  view.unmount();
  render(<SecurityDetails demo name="Trusted devices" preferences={saved} onSave={onSave}/>);
  expect(screen.queryByText('iPhone 15 Pro')).toBeNull();
  expect(screen.getByText('MacBook Pro')).toBeTruthy();
});
it('summarizes saved optional policies without implying live activation', () => {
  expect(policySummary('Duress Protection', {'Duress Protection': {'Prepare an ordinary alternate vault': true}})).toBe('Preview configured');
  expect(policySummary('Cold Lock', {'Cold Lock': {timeout:'10'}})).toBe('10 min');
  expect(policySummary('PIN scrambling', {})).toBe('Off');
});
