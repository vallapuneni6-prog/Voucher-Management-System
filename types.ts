export enum VoucherStatus {
  ISSUED = 'Issued',
  REDEEMED = 'Redeemed',
  EXPIRED = 'Expired',
}

export interface Outlet {
  id: string;
  name: string;
  location: string;
}

export interface Voucher {
  id: string;
  partnerName: string;
  partnerMobile: string;
  outletId: string; // Changed from outletName
  expiryDate: Date;
  issueDate: Date;
  redeemedDate?: Date;
  status: VoucherStatus;
  discountPercentage: number;
}

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  // FIX: Corrected a typo in the User interface. The 'password' property had a semicolon instead of a colon.
  password: string;
  role: Role;
  outletId?: string; // Users can be assigned to an outlet
}