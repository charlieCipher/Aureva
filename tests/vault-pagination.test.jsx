import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Vault from '../src/app/Vault';

afterEach(cleanup);
it('resets pagination when a parent search changes and stays reset when cleared', () => {
  const records = Array.from({length: 6}, (_, i) => ({id:String(i),title:`Record ${i}`,category:'Property',demo:true}));
  const props = {records, setSearch:vi.fn(), go:vi.fn(), demo:true};
  const {rerender} = render(<Vault {...props} search="" />);
  fireEvent.click(screen.getByRole('button', {name:'Records page 2'}));
  expect(screen.getByRole('button', {name:'Records page 2'}).getAttribute('aria-current')).toBe('page');
  rerender(<Vault {...props} search="Record 0" />);
  expect(screen.getByRole('button', {name:'Records page 1'}).getAttribute('aria-current')).toBe('page');
  rerender(<Vault {...props} search="" />);
  expect(screen.getByRole('button', {name:'Records page 1'}).getAttribute('aria-current')).toBe('page');
});
