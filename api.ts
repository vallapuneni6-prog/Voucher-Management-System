import { User, Voucher, VoucherStatus, Outlet } from './types';
import { SEED_OUTLETS, SEED_USERS, SEED_VOUCHERS } from './seedData';

const MOCK_API_LATENCY = 500;

const getFromStorage = (key: string, seedData: any[]) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(key, JSON.stringify(seedData));
      return seedData;
    }
  } catch (error) {
    console.error(`Error with localStorage for key "${key}":`, error);
    return seedData;
  }
};

export const login = (username: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users: User[] = getFromStorage('users', SEED_USERS);
      const user = users.find(u => u.username === username && u.password === password);
      resolve(user || null);
    }, MOCK_API_LATENCY);
  });
};

export const getVouchers = (): Promise<Voucher[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const vouchers = getFromStorage('vouchers', SEED_VOUCHERS);
      resolve(vouchers);
    }, MOCK_API_LATENCY);
  });
};

export const addVoucher = (newVoucherData: Omit<Voucher, 'id'>): Promise<Voucher> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const vouchers: Voucher[] = getFromStorage('vouchers', SEED_VOUCHERS);
      const newVoucher: Voucher = {
        ...newVoucherData,
        id: `VC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      };
      const updatedVouchers = [...vouchers, newVoucher];
      localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
      resolve(newVoucher);
    }, MOCK_API_LATENCY);
  });
};

export const redeemVoucher = (voucherId: string, redemptionBillNo: string): Promise<Voucher | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const vouchers: Voucher[] = getFromStorage('vouchers', SEED_VOUCHERS);
            let redeemedVoucher: Voucher | null = null;
            const updatedVouchers = vouchers.map(v => {
                if (v.id === voucherId && v.status === VoucherStatus.ISSUED) {
                    redeemedVoucher = { 
                        ...v, 
                        status: VoucherStatus.REDEEMED, 
                        redeemedDate: new Date(),
                        redemptionBillNo: redemptionBillNo,
                    };
                    return redeemedVoucher;
                }
                return v;
            });

            if (redeemedVoucher) {
                localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
            }
            resolve(redeemedVoucher);
        }, MOCK_API_LATENCY);
    });
};

export const getUsers = (): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getFromStorage('users', SEED_USERS));
        }, MOCK_API_LATENCY);
    });
};

export const addUser = (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users: User[] = getFromStorage('users', SEED_USERS);
            const newUser: User = { ...userData, id: `u-${Date.now()}` };
            const updatedUsers = [...users, newUser];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            resolve(newUser);
        }, MOCK_API_LATENCY);
    });
};

export const updateUser = (updatedUserData: User): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users: User[] = getFromStorage('users', SEED_USERS);
            const updatedUsers = users.map(u => u.id === updatedUserData.id ? updatedUserData : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            resolve(updatedUserData);
        }, MOCK_API_LATENCY);
    });
};

export const deleteUser = (userId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users: User[] = getFromStorage('users', SEED_USERS);
            const updatedUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            resolve();
        }, MOCK_API_LATENCY);
    });
};

export const getOutlets = (): Promise<Outlet[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getFromStorage('outlets', SEED_OUTLETS));
        }, MOCK_API_LATENCY);
    });
};

export const addOutlet = (outletData: Omit<Outlet, 'id'>): Promise<Outlet> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const outlets: Outlet[] = getFromStorage('outlets', SEED_OUTLETS);
            const newOutlet: Outlet = { ...outletData, id: `o-${Date.now()}` };
            const updatedOutlets = [...outlets, newOutlet];
            localStorage.setItem('outlets', JSON.stringify(updatedOutlets));
            resolve(newOutlet);
        }, MOCK_API_LATENCY);
    });
};

export const updateOutlet = (updatedOutletData: Outlet): Promise<Outlet> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const outlets: Outlet[] = getFromStorage('outlets', SEED_OUTLETS);
            const updatedOutlets = outlets.map(o => o.id === updatedOutletData.id ? updatedOutletData : o);
            localStorage.setItem('outlets', JSON.stringify(updatedOutlets));
            resolve(updatedOutletData);
        }, MOCK_API_LATENCY);
    });
};

export const deleteOutlet = (outletId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Remove outletId from any user assigned to this outlet
            const users: User[] = getFromStorage('users', SEED_USERS);
            const updatedUsers = users.map(u => u.outletId === outletId ? {...u, outletId: undefined} : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            const outlets: Outlet[] = getFromStorage('outlets', SEED_OUTLETS);
            const updatedOutlets = outlets.filter(o => o.id !== outletId);
            localStorage.setItem('outlets', JSON.stringify(updatedOutlets));
            resolve();
        }, MOCK_API_LATENCY);
    });
};
