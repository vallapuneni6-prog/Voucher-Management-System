export enum VoucherStatus {
    ISSUED = "Issued",
    REDEEMED = "Redeemed",
    EXPIRED = "Expired",
}

export enum VoucherType {
    PARTNER = "Partner",
    FAMILY_FRIENDS = "Family & Friends",
}

export interface Outlet {
    id: string;
    name: string;
    location: string;
    code: string;
    address: string;
    gstin: string;
    phone: string;
}

export interface User {
    id: string;
    username: string;
    password?: string;
    role: 'admin' | 'user';
    outletId?: string;
}

export interface Voucher {
    id: string;
    recipientName: string;
    recipientMobile: string;
    outletId: string;
    issueDate: Date;
    expiryDate: Date;
    redeemedDate?: Date;
    status: VoucherStatus;
    type: VoucherType;
    discountPercentage: number;
    billNo: string;
    redemptionBillNo?: string;
}

export interface PackageTemplate {
    id: string;
    name: string;
    packageValue: number;
    serviceValue: number;
}

export interface CustomerPackage {
    id: string;
    customerName: string;
    customerMobile: string;
    packageTemplateId: string;
    outletId: string;
    assignedDate: Date;
    remainingServiceValue: number;
}

export interface ServiceRecord {
  id: string;
  customerPackageId: string;
  serviceName: string;
  serviceValue: number;
  redeemedDate: Date;
  transactionId: string;
}