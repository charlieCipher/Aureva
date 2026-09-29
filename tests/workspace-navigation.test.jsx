import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import Workspace from '../src/app/Workspace';
vi.mock('../src/supabase',()=>({supabase:null,supabaseConfig:{configured:false}}));
afterEach(()=>{cleanup();window.history.replaceState({},'', '/app');vi.restoreAllMocks();});
it('moves focus on section navigation and marks the mobile current page',()=>{
 window.history.replaceState({},'', '/app?preview=1');
 vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
 render(<Workspace demo/>);
 fireEvent.click(within(screen.getByRole('navigation',{name:'Main navigation'})).getByRole('button',{name:'People'}));
 expect(document.activeElement).toBe(screen.getByRole('main',{name:'People content'}));
 expect(within(screen.getByRole('navigation',{name:'Mobile navigation'})).getByRole('button',{name:'People'}).getAttribute('aria-current')).toBe('page');
 window.history.replaceState({},'', '/app/vault?preview=1');
 fireEvent.popState(window);
 expect(document.activeElement).toBe(screen.getByRole('main',{name:'Vault content'}));
 expect(within(screen.getByRole('navigation',{name:'Mobile navigation'})).getByRole('button',{name:'People'}).hasAttribute('aria-current')).toBe(false);
});
it('skip link targets the focusable main content',()=>{
 window.history.replaceState({},'', '/app?preview=1');
 render(<Workspace demo/>);
 fireEvent.click(screen.getByRole('link',{name:'Skip to content'}));
 expect(document.activeElement).toBe(screen.getByRole('main'));
});
