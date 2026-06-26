import { User } from '../types';

export type UserRole = 'customer' | 'manager' | 'admin';

export type ActionType = 
  | 'VIEW_VEHICLES'
  | 'MANAGE_VEHICLES' // Add, update, delete vehicles
  | 'CREATE_BOOKING'
  | 'APPROVE_REJECT_BOOKING' // Manager/Admin operation
  | 'CANCEL_OWN_BOOKING'
  | 'CANCEL_ANY_BOOKING' // Admin/Manager operation
  | 'VIEW_ALL_USERS'
  | 'MANAGE_USER_ROLES'
  | 'VIEW_DASHBOARD_STATS'
  | 'VERIFY_CNIC';

const ROLE_PERMISSIONS: Record<UserRole, ActionType[]> = {
  customer: [
    'VIEW_VEHICLES',
    'CREATE_BOOKING',
    'CANCEL_OWN_BOOKING',
  ],
  manager: [
    'VIEW_VEHICLES',
    'MANAGE_VEHICLES',
    'CREATE_BOOKING',
    'APPROVE_REJECT_BOOKING',
    'CANCEL_OWN_BOOKING',
    'CANCEL_ANY_BOOKING',
    'VIEW_DASHBOARD_STATS',
    'VERIFY_CNIC',
  ],
  admin: [
    'VIEW_VEHICLES',
    'MANAGE_VEHICLES',
    'CREATE_BOOKING',
    'APPROVE_REJECT_BOOKING',
    'CANCEL_OWN_BOOKING',
    'CANCEL_ANY_BOOKING',
    'VIEW_ALL_USERS',
    'MANAGE_USER_ROLES',
    'VIEW_DASHBOARD_STATS',
    'VERIFY_CNIC',
  ],
};

/**
 * Checks if a user has permission to perform an action.
 */
export const checkUserPermission = (user: User | null | undefined, action: ActionType): boolean => {
  if (!user) return false;
  
  const role = (user.role || 'customer') as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  return permissions.includes(action);
};

/**
 * Checks if a user is authorized to access a dashboard.
 */
export const canAccessDashboard = (user: User | null | undefined, dashboardType: 'admin' | 'manager'): boolean => {
  if (!user) return false;
  
  const role = user.role || 'customer';
  if (role === 'admin') return true;
  if (dashboardType === 'manager' && role === 'manager') return true;
  
  return false;
};
