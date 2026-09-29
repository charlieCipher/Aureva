import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
const service = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('../src/features/vault/VaultContext', () => ({ useVault: () => ({ service }) }));
import RecordWizard from '../src/app/RecordWizard';
afterEach(() => { cleanup(); vi.resetAllMocks(); });
function advance() { fireEvent.click(screen.getByRole('button', { name: 'Continue', exact: true })); }
it('focuses each new step heading and restores an invalid field after final validation', () => {
  const { form } = review();
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Review & Encrypt' }));
  fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
  expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Who needs to know?' }));
  advance();
  form.elements.title.value = '   ';
  fireEvent.submit(form);
  expect(document.activeElement).toBe(screen.getByLabelText('Record title'));
  expect(form.elements.title.closest('fieldset').hidden).toBe(false);
  expect(service.create).not.toHaveBeenCalled();
});
function review(onSaved = vi.fn()) {
  const view = render(<RecordWizard onSaved={onSaved} onCancel={() => {}} />);
  fireEvent.change(screen.getByLabelText('Record title'), { target: { value: 'Test record' } });
  for (let i = 0; i < 4; i++) advance();
  return { view, form: screen.getByRole('button', { name: 'Save encrypted record' }).closest('form') };
}
it('rejects whitespace-only titles at the first step', () => {
  render(<RecordWizard onSaved={vi.fn()} onCancel={() => {}} />);
  fireEvent.change(screen.getByLabelText('Record title'), { target: { value: '   ' } });
  advance();
  expect(screen.getByRole('alert').textContent).toContain('not blank');
  expect(document.activeElement).toBe(screen.getByLabelText('Record title'));
  expect(service.create).not.toHaveBeenCalled();
});
it('rejects an oversized attachment before encryption and allows replacing it', () => {
  render(<RecordWizard onSaved={vi.fn()} onCancel={() => {}} />);
  fireEvent.change(screen.getByLabelText('Record title'), { target: { value: 'Test' } });
  advance(); advance();
  const file = new File(['test'], 'test.txt');
  Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 });
  fireEvent.change(screen.getByLabelText('Supporting document'), { target: { files: [file] } });
  advance();
  expect(screen.getByRole('alert').textContent).toContain('10 MB');
  expect(service.create).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Supporting document'), { target: { files: [] } });
  advance();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Who needs to know?' })).toBeTruthy();
});
it('submits only once while saving and ignores a late result after unmount', async () => {
  let finish;
  service.create.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const saved = vi.fn();
  const { view, form } = review(saved);
  fireEvent.submit(form); fireEvent.submit(form);
  expect(service.create).toHaveBeenCalledTimes(1);
  view.unmount();
  await act(async () => finish({ id: 'saved-record' }));
  expect(saved).not.toHaveBeenCalled();
});
it('allows retry after a rejected save while keeping raw errors private', async () => {
  service.create.mockRejectedValueOnce(new Error('PRIVATE_CANARY')).mockResolvedValueOnce({ id: 'saved' });
  const saved = vi.fn(); const { form } = review(saved);
  fireEvent.submit(form);
  await screen.findByRole('alert');
  expect(screen.queryByText(/PRIVATE_CANARY/)).toBeNull();
  await act(async () => fireEvent.submit(form));
  expect(saved).toHaveBeenCalledWith({ id: 'saved' });
});
