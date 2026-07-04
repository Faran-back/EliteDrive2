import { describe, expect, it } from 'vitest';
import { resolveNotificationBehavior } from './notifications';

describe('resolveNotificationBehavior', () => {
  it('prefers browser notifications when the browser permission is granted', () => {
    expect(resolveNotificationBehavior({ supportsBrowserNotifications: true, permission: 'granted' })).toBe('browser');
  });

  it('falls back to panel-only delivery when browser notifications are unavailable', () => {
    expect(resolveNotificationBehavior({ supportsBrowserNotifications: false, permission: 'granted' })).toBe('panel');
  });

  it('falls back to panel-only delivery when browser permission is not granted', () => {
    expect(resolveNotificationBehavior({ supportsBrowserNotifications: true, permission: 'default' })).toBe('panel');
  });
});
