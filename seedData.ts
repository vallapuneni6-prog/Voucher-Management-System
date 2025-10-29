import { User, Outlet, Voucher, VoucherStatus } from './types';

// Seed Outlets
export const SEED_OUTLETS: Outlet[] = [
  { id: 'o-1', name: 'Downtown Branch', location: '123 Main St' },
  { id: 'o-2', name: 'Uptown Mall', location: '456 Market Ave' },
];

// Seed Users
export const SEED_USERS: User[] = [
  { id: 'u-admin', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'u-1', username: 'user1', password: 'user123', role: 'user', outletId: 'o-1' },
  { id: 'u-2', username: 'user2', password: 'user123', role: 'user', outletId: 'o-2' },
];

// Seed Vouchers
export const SEED_VOUCHERS: Voucher[] = [
  {
    id: 'VC-ABC123',
    partnerName: 'John Doe',
    partnerMobile: '555-1111',
    outletId: 'o-1',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 25)),
    status: VoucherStatus.ISSUED,
    discountPercentage: 15,
  },
  {
    id: 'VC-DEF456',
    partnerName: 'Jane Smith',
    partnerMobile: '555-2222',
    outletId: 'o-2',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 20)),
    status: VoucherStatus.ISSUED,
    discountPercentage: 20,
  },
  {
    id: 'VC-GHI789',
    partnerName: 'Peter Jones',
    partnerMobile: '555-3333',
    outletId: 'o-1',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 28)),
    status: VoucherStatus.REDEEMED,
    redeemedDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    discountPercentage: 10,
  },
    {
    id: 'VC-JKL012',
    partnerName: 'Mary Williams',
    partnerMobile: '555-4444',
    outletId: 'o-1',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 40)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    status: VoucherStatus.EXPIRED,
    discountPercentage: 25,
  },
];