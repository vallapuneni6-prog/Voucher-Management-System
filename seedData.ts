import { Outlet, User, Voucher, PackageTemplate, CustomerPackage, ServiceRecord } from './types';

// All seed data is cleared to allow for a fresh start with a database.
// An initial admin user is kept to allow the first login and system setup.

export const SEED_OUTLETS: Outlet[] = [];

export const SEED_USERS: User[] = [
  { id: 'u-admin', username: 'admin', password: 'admin123', role: 'admin' },
];

export const SEED_VOUCHERS: Voucher[] = [];

export const SEED_PACKAGE_TEMPLATES: PackageTemplate[] = [];

export const SEED_CUSTOMER_PACKAGES: CustomerPackage[] = [];

export const SEED_SERVICE_RECORDS: ServiceRecord[] = [];
