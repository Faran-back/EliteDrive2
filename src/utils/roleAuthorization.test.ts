import { describe, it, expect } from 'vitest';
import { checkUserPermission, canAccessDashboard } from './roleAuthorization';
import { User } from '../types';

describe('Role Authorization policy engine', () => {
  const customerUser: User = {
    id: 'u_customer',
    name: 'Jane Customer',
    email: 'jane@example.com',
    phone: '+923001234567',
    role: 'customer',
    rewardPoints: 0,
    avatar: '',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2026-06-01'
  };

  const managerUser: User = {
    id: 'u_manager',
    name: 'Mark Manager',
    email: 'mark@example.com',
    phone: '+923007654321',
    role: 'manager',
    rewardPoints: 50,
    avatar: '',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2026-06-01'
  };

  const adminUser: User = {
    id: 'u_admin',
    name: 'Adil Admin',
    email: 'test@test.com',
    phone: '+923009999999',
    role: 'admin',
    rewardPoints: 100,
    avatar: '',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2026-06-01'
  };

  describe('checkUserPermission', () => {
    it('customer: should be able to view vehicles and create/cancel own bookings, but not edit vehicles', () => {
      expect(checkUserPermission(customerUser, 'VIEW_VEHICLES')).toBe(true);
      expect(checkUserPermission(customerUser, 'CREATE_BOOKING')).toBe(true);
      expect(checkUserPermission(customerUser, 'CANCEL_OWN_BOOKING')).toBe(true);

      // Forbidden
      expect(checkUserPermission(customerUser, 'MANAGE_VEHICLES')).toBe(false);
      expect(checkUserPermission(customerUser, 'APPROVE_REJECT_BOOKING')).toBe(false);
      expect(checkUserPermission(customerUser, 'MANAGE_USER_ROLES')).toBe(false);
    });

    it('manager: should have management capabilities but not change general user roles', () => {
      expect(checkUserPermission(managerUser, 'VIEW_VEHICLES')).toBe(true);
      expect(checkUserPermission(managerUser, 'MANAGE_VEHICLES')).toBe(true);
      expect(checkUserPermission(managerUser, 'APPROVE_REJECT_BOOKING')).toBe(true);
      expect(checkUserPermission(managerUser, 'VERIFY_CNIC')).toBe(true);

      // Forbidden
      expect(checkUserPermission(managerUser, 'MANAGE_USER_ROLES')).toBe(false);
    });

    it('admin: should be granted access to everything', () => {
      expect(checkUserPermission(adminUser, 'MANAGE_USER_ROLES')).toBe(true);
      expect(checkUserPermission(adminUser, 'VIEW_ALL_USERS')).toBe(true);
      expect(checkUserPermission(adminUser, 'APPROVE_REJECT_BOOKING')).toBe(true);
    });

    it('should deny all rules for null or undefined users', () => {
      expect(checkUserPermission(null, 'VIEW_VEHICLES')).toBe(false);
      expect(checkUserPermission(undefined, 'CREATE_BOOKING')).toBe(false);
    });
  });

  describe('canAccessDashboard', () => {
    it('should enforce proper dashboard access limits', () => {
      // Customer
      expect(canAccessDashboard(customerUser, 'manager')).toBe(false);
      expect(canAccessDashboard(customerUser, 'admin')).toBe(false);

      // Manager
      expect(canAccessDashboard(managerUser, 'manager')).toBe(true);
      expect(canAccessDashboard(managerUser, 'admin')).toBe(false);

      // Admin
      expect(canAccessDashboard(adminUser, 'manager')).toBe(true);
      expect(canAccessDashboard(adminUser, 'admin')).toBe(true);
    });

    it('should deny unauthorized / unauthenticated visits', () => {
      expect(canAccessDashboard(null, 'manager')).toBe(false);
      expect(canAccessDashboard(undefined, 'admin')).toBe(false);
    });
  });
});
