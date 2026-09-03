import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  accessControlInternals,
  credentialsAreValid,
  hasPersistentAccess,
  persistAccess,
  revokeAccess,
} from '../auth/access_control.js';
import { LoginScreen } from '../components/auth/LoginScreen.js';

describe('registry access gate', () => {
  afterEach(() => revokeAccess());

  it('accepts only the configured credentials with normalized username casing', () => {
    expect(credentialsAreValid('upbound', 'rmf2026')).toBe(true);
    expect(credentialsAreValid(' UPBOUND ', 'rmf2026')).toBe(true);
    expect(credentialsAreValid('upbound', 'wrong')).toBe(false);
    expect(credentialsAreValid('other', 'rmf2026')).toBe(false);
  });

  it('persists and revokes trusted-device access through a cookie', () => {
    expect(hasPersistentAccess()).toBe(false);
    persistAccess();
    expect(document.cookie).toContain(`${accessControlInternals.ACCESS_COOKIE_NAME}=`);
    expect(hasPersistentAccess()).toBe(true);
    revokeAccess();
    expect(hasPersistentAccess()).toBe(false);
  });

  it('shows a generic error for invalid credentials and clears it during correction', () => {
    render(<LoginScreen onAuthenticated={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'upbound' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in securely' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/username or password is incorrect/i);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'rmf2026' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('authenticates, persists access, and supports password visibility', () => {
    const onAuthenticated = vi.fn();
    render(<LoginScreen onAuthenticated={onAuthenticated} />);
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'upbound' } });
    fireEvent.change(password, { target: { value: 'rmf2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in securely' }));
    expect(onAuthenticated).toHaveBeenCalledOnce();
    expect(hasPersistentAccess()).toBe(true);
  });
});
