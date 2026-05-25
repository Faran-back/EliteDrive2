import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage } from './authErrors';

describe('authErrors utility', () => {
  it('should map standard Firebase error codes to human-readable strings', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-email' })).toBe('The email address is not valid.');
    expect(getAuthErrorMessage({ code: 'auth/user-not-found' })).toBe('No user found with this email address.');
    expect(getAuthErrorMessage({ code: 'auth/wrong-password' })).toBe('Incorrect password. Please try again.');
    expect(getAuthErrorMessage({ code: 'auth/email-already-in-use' })).toBe('This email address is already in use by another account.');
    expect(getAuthErrorMessage({ code: 'auth/weak-password' })).toBe('The password is too weak. Please use at least 6 characters.');
    expect(getAuthErrorMessage({ code: 'auth/too-many-requests' })).toBe('Too many unsuccessful login attempts. Please try again later.');
  });

  it('should handle missing error argument or empty code gracefully', () => {
    expect(getAuthErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(getAuthErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    expect(getAuthErrorMessage({ message: 'Custom fallback message.' })).toBe('Custom fallback message.');
  });
});
