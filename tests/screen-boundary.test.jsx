import { lazy } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import ScreenBoundary from '../src/components/ui/ScreenBoundary';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('announces loading and renders the screen when its module arrives', async () => {
  let finish;
  const Screen = lazy(() => new Promise(resolve => { finish = resolve; }));
  render(<ScreenBoundary><Screen /></ScreenBoundary>);
  expect(screen.getByRole('status').textContent).toContain('Opening LEQVOR');
  await act(async () => finish({ default: () => <h1>Loaded screen</h1> }));
  expect(screen.getByRole('heading', { name: 'Loaded screen' })).toBeTruthy();
  expect(screen.queryByRole('status')).toBeNull();
});

it('replaces a failed module with a recoverable message without showing raw errors', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const Screen = lazy(() => Promise.reject(new Error('PRIVATE_ERROR_CANARY')));
  render(<ScreenBoundary><Screen /></ScreenBoundary>);
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Reload LEQVOR' })).toBeTruthy();
  expect(screen.queryByText(/PRIVATE_ERROR_CANARY/)).toBeNull();
});
