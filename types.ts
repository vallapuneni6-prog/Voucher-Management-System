export enum VoucherStatus {
    ISSUED = "Issued",
    REDEEMED = "Redeemed",
    EXPIRED = "Expired",
}

export interface Outlet {
    id: string;
    name: string;
    location: string;
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
    partnerName: string;
    partnerMobile: string;
    outletId: string;
    issueDate: Date;
    expiryDate: Date;
    redeemedDate?: Date;
    status: VoucherStatus;
    discountPercentage: number;
    billNo: string;
    redemptionBillNo?: string;
}
