import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import People from '../src/app/People';

afterEach(cleanup);
it('restores people after clearing both search and relationship filters', () => {
  render(<People people={[{id:'test',display_name:'Example Person',relationship:'Advisor'}]} records={[]} demo />);
  fireEvent.change(screen.getByLabelText('Filter by relationship'), {target:{value:'Advisor'}});
  fireEvent.change(screen.getByLabelText('Search family members'), {target:{value:'No such person'}});
  expect(screen.getByText('No matching people')).toBeTruthy();
  expect(screen.queryByRole('table')).toBeNull();
  fireEvent.click(screen.getByRole('button', {name:'Clear people filters'}));
  expect(screen.getByLabelText('Search family members').value).toBe('');
  expect(screen.getByLabelText('Filter by relationship').value).toBe('All Roles');
  expect(screen.getByRole('table')).toBeTruthy();
});
