import { useState } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Modal from '../src/components/Modal';

const originals = Object.fromEntries(['showModal', 'close'].map(name => [name, Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name)]));
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: vi.fn(function () { this.open = true; }) });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: vi.fn(function () { this.open = false; }) });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  for (const [name, descriptor] of Object.entries(originals)) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else delete HTMLDialogElement.prototype[name];
  }
});
it('wraps keyboard focus and skips disabled, hidden and non-tabbable controls', () => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 100, height: 44 }]);
  render(<Modal onClose={() => {}}><input aria-label="Name" />
    <button disabled>Unavailable</button><button hidden>Hidden</button>
    <button tabIndex={-1}>Programmatic</button><button>Save</button></Modal>);
  const close = screen.getByRole('button', { name: 'Close form' });
  const save = screen.getByRole('button', { name: 'Save' });
  close.focus(); fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(save);
  save.focus(); fireEvent.keyDown(save, { key: 'Tab' });
  expect(document.activeElement).toBe(close);
  save.disabled = true;
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(screen.getByRole('textbox'));
});
function Example() {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Open contact</button>
    {open && <Modal title="Trusted person details" onClose={() => setOpen(false)}><input aria-label="Contact name" /></Modal>}</>;
}
it('names the modal and restores the opener after closing', () => {
  render(<Example />);
  const opener = screen.getByRole('button', { name: 'Open contact' });
  opener.focus(); fireEvent.click(opener);
  expect(screen.getByRole('dialog', { name: 'Trusted person details' }).getAttribute('aria-modal')).toBe('true');
  screen.getByRole('textbox').focus();
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});
it('routes native Escape cancellation through React cleanup', () => {
  render(<Example />);
  const opener = screen.getByRole('button', { name: 'Open contact' });
  opener.focus(); fireEvent.click(opener);
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});
