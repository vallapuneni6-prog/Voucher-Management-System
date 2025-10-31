import { Outlet, User, Voucher, VoucherStatus, VoucherType, PackageTemplate, CustomerPackage, ServiceRecord } from './types';

export const SEED_OUTLETS: Outlet[] = [
  { 
    id: 'o-1', 
    name: 'MADINAGUDA', 
    location: 'Hyderabad', 
    code: 'NAT',
    address: 'PLOT NO.92, 3RD FLOOR,\nSPRING CHAMBERS, MADINAGUDA\nHYDERABAD, 500049',
    gstin: '36ACBFA9565H1Z6',
    phone: '8885879444',
  },
  { 
    id: 'o-2', 
    name: 'UPTOWN MALL', 
    location: '456 Market Ave', 
    code: 'UPM',
    address: '123 Mall Road\nUPTOWN, 500050',
    gstin: '36XYZAB1234C1Z5',
    phone: '9998887776',
  },
];

export const SEED_USERS: User[] = [
  { id: 'u-admin', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'u-1', username: 'user1', password: 'user123', role: 'user', outletId: 'o-1' },
  { id: 'u-2', username: 'user2', password: 'user123', role: 'user', outletId: 'o-2' },
];

export const SEED_VOUCHERS: any[] = [
  {
    id: 'VC-ABC123',
    recipientName: 'John Doe',
    recipientMobile: '5551111111',
    outletId: 'o-1',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 25)),
    status: VoucherStatus.ISSUED,
    type: VoucherType.PARTNER,
    discountPercentage: 15,
    billNo: 'B-202401',
  },
  {
    id: 'VC-DEF456',
    recipientName: 'Jane Smith',
    recipientMobile: '5552222222',
    outletId: 'o-2',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 20)),
    status: VoucherStatus.ISSUED,
    type: VoucherType.FAMILY_FRIENDS,
    discountPercentage: 20,
    billNo: 'B-202402',
  },
  {
    id: 'VC-GHI789',
    recipientName: 'Peter Jones',
    recipientMobile: '5553333333',
    outletId: 'o-1',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 28)),
    status: VoucherStatus.REDEEMED,
    type: VoucherType.PARTNER,
    redeemedDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    discountPercentage: 10,
    billNo: 'B-202403',
    redemptionBillNo: 'R-202405',
  },
    {
    id: 'VC-JKL012',
    recipientName: 'Mary Williams',
    recipientMobile: '5554444444',
    outletId: 'o-1',
    issueDate: new Date(new Date().setDate(new Date().getDate() - 40)),
    expiryDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    status: VoucherStatus.EXPIRED,
    type: VoucherType.FAMILY_FRIENDS,
    discountPercentage: 25,
    billNo: 'B-202404',
  },
];

export const SEED_PACKAGE_TEMPLATES: PackageTemplate[] = [
  { id: 'pt-1', name: 'Pay 5000 Get 7500', packageValue: 5000, serviceValue: 7500 },
  { id: 'pt-2', name: 'Pay 10000 Get 16000', packageValue: 10000, serviceValue: 16000 },
  { id: 'pt-3', name: 'Pay 15K Get 21K', packageValue: 15000, serviceValue: 21000 },
];

export const SEED_CUSTOMER_PACKAGES: CustomerPackage[] = [
    { id: 'cp-1', customerName: 'Alice Johnson', customerMobile: '5551234567', packageTemplateId: 'pt-1', outletId: 'o-1', assignedDate: new Date(), remainingServiceValue: 7500 },
    { id: 'cp-2', customerName: 'Bob Williams', customerMobile: '5557654321', packageTemplateId: 'pt-2', outletId: 'o-2', assignedDate: new Date(new Date().setDate(new Date().getDate() - 10)), remainingServiceValue: 16000 },
];

export const SEED_SERVICE_RECORDS: ServiceRecord[] = [];