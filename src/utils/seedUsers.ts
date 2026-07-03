import crypto from 'crypto';

export interface SeedableUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'customer';
  phone?: string;
  isVerified?: boolean;
  isBlacklisted?: boolean;
  outstandingBalance?: number;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
  cnic?: string;
  licenseNumber?: string;
}

export interface SeedableState {
  users: SeedableUser[];
  [key: string]: unknown;
}

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'elitedrivesalt', 1000, 64, 'sha512').toString('hex');
}

const seededUsers: SeedableUser[] = [
  {
    id: 'usr_admin_seed',
    name: 'Ahmed Admin',
    email: 'ahmed@gmail.com',
    phone: '+923001112233',
    passwordHash: hashPassword('password'),
    role: 'admin',
    isVerified: true,
    isBlacklisted: false,
    outstandingBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    avatarUrl: '',
    cnic: '',
    licenseNumber: '',
  },
  {
    id: 'usr_manager_seed',
    name: 'Manager User',
    email: 'managered@gmail.com',
    phone: '+923004445566',
    passwordHash: hashPassword('password'),
    role: 'manager',
    isVerified: true,
    isBlacklisted: false,
    outstandingBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    avatarUrl: '',
    cnic: '',
    licenseNumber: '',
  },
];

export function ensureSeedUsers<T extends SeedableState>(state: T): T {
  const existingEmails = new Set((state.users || []).map((user) => user.email?.toLowerCase()).filter(Boolean));

  for (const seedUser of seededUsers) {
    if (!existingEmails.has(seedUser.email.toLowerCase())) {
      state.users.push({ ...seedUser });
      existingEmails.add(seedUser.email.toLowerCase());
    }
  }

  return state;
}
