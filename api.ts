import { User, Voucher, VoucherStatus, Outlet, PackageTemplate, CustomerPackage, ServiceRecord } from './types';
import { SEED_OUTLETS, SEED_USERS, SEED_VOUCHERS, SEED_PACKAGE_TEMPLATES, SEED_CUSTOMER_PACKAGES, SEED_SERVICE_RECORDS } from './seedData';

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

export const addVoucher = (newVoucherData: Omit<Voucher, 'id'>, outletCode: string): Promise<Voucher> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const vouchers: Voucher[] = getFromStorage('vouchers', SEED_VOUCHERS);
      const newVoucher: Voucher = {
        ...newVoucherData,
        id: `${outletCode}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
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

// --- New Package Management API ---

export const getPackageTemplates = (): Promise<PackageTemplate[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(getFromStorage('packageTemplates', SEED_PACKAGE_TEMPLATES));
        }, MOCK_API_LATENCY);
    });
};

export const addPackageTemplate = (templateData: Omit<PackageTemplate, 'id'>): Promise<PackageTemplate> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const templates: PackageTemplate[] = getFromStorage('packageTemplates', SEED_PACKAGE_TEMPLATES);
            const newTemplate: PackageTemplate = { ...templateData, id: `pt-${Date.now()}` };
            const updated = [...templates, newTemplate];
            localStorage.setItem('packageTemplates', JSON.stringify(updated));
            resolve(newTemplate);
        }, MOCK_API_LATENCY);
    });
};

export const deletePackageTemplate = (templateId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const templates: PackageTemplate[] = getFromStorage('packageTemplates', SEED_PACKAGE_TEMPLATES);
            const updated = templates.filter(t => t.id !== templateId);
            localStorage.setItem('packageTemplates', JSON.stringify(updated));
            resolve();
        }, MOCK_API_LATENCY);
    });
};

export const getCustomerPackages = (): Promise<CustomerPackage[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const packages = getFromStorage('customerPackages', SEED_CUSTOMER_PACKAGES);
            resolve(packages);
        }, MOCK_API_LATENCY);
    });
};

export const getServiceRecords = (): Promise<ServiceRecord[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const records = getFromStorage('serviceRecords', SEED_SERVICE_RECORDS);
            resolve(records);
        }, MOCK_API_LATENCY);
    });
};

export const assignCustomerPackage = (
    assignmentData: Omit<CustomerPackage, 'id' | 'remainingServiceValue'>,
    initialServices: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[]
): Promise<{ newPackage: CustomerPackage, newRecords: ServiceRecord[] }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const packages: CustomerPackage[] = getFromStorage('customerPackages', SEED_CUSTOMER_PACKAGES);
            const templates: PackageTemplate[] = getFromStorage('packageTemplates', SEED_PACKAGE_TEMPLATES);
            const serviceRecords: ServiceRecord[] = getFromStorage('serviceRecords', SEED_SERVICE_RECORDS);

            const template = templates.find(t => t.id === assignmentData.packageTemplateId);
            if (!template) {
                return reject(new Error("Package template not found"));
            }

            const totalInitialServiceValue = initialServices.reduce((sum, service) => sum + service.serviceValue, 0);
            
            if (totalInitialServiceValue > template.serviceValue) {
                return reject(new Error("Initial services value cannot exceed total package service value."));
            }
            
            const remainingServiceValue = template.serviceValue - totalInitialServiceValue;

            const newPackageId = `cp-${Date.now()}`;
            const newPackage: CustomerPackage = { 
                ...assignmentData, 
                id: newPackageId,
                remainingServiceValue
            };
            
            const transactionId = `txn-${Date.now()}`;
            const newRecords: ServiceRecord[] = initialServices.map(service => ({
                id: `sr-${Date.now()}-${Math.random()}`,
                customerPackageId: newPackageId,
                serviceName: service.serviceName,
                serviceValue: service.serviceValue,
                redeemedDate: assignmentData.assignedDate,
                transactionId: transactionId,
            }));

            const updatedPackages = [...packages, newPackage];
            const updatedRecords = [...serviceRecords, ...newRecords];
            
            localStorage.setItem('customerPackages', JSON.stringify(updatedPackages));
            localStorage.setItem('serviceRecords', JSON.stringify(updatedRecords));

            resolve({ newPackage, newRecords });
        }, MOCK_API_LATENCY);
    });
};

export const redeemServicesFromPackage = (
    customerPackageId: string,
    servicesToRedeem: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[],
    redeemDate: Date
): Promise<{ updatedPackage: CustomerPackage, newRecords: ServiceRecord[] }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const packages: CustomerPackage[] = getFromStorage('customerPackages', SEED_CUSTOMER_PACKAGES);
            const serviceRecords: ServiceRecord[] = getFromStorage('serviceRecords', SEED_SERVICE_RECORDS);

            const packageIndex = packages.findIndex(p => p.id === customerPackageId);
            if (packageIndex === -1) {
                return reject(new Error("Customer package not found."));
            }

            const customerPackage = packages[packageIndex];
            const totalRedemptionValue = servicesToRedeem.reduce((sum, service) => sum + service.serviceValue, 0);

            if (totalRedemptionValue > customerPackage.remainingServiceValue) {
                return reject(new Error("Redemption value exceeds remaining balance."));
            }

            const updatedPackage: CustomerPackage = {
                ...customerPackage,
                remainingServiceValue: customerPackage.remainingServiceValue - totalRedemptionValue
            };
            
            const transactionId = `txn-${Date.now()}`;
            const newRecords: ServiceRecord[] = servicesToRedeem.map(service => ({
                id: `sr-${Date.now()}-${Math.random()}`,
                customerPackageId: customerPackageId,
                serviceName: service.serviceName,
                serviceValue: service.serviceValue,
                redeemedDate: redeemDate,
                transactionId: transactionId,
            }));
            
            const updatedPackages = [...packages];
            updatedPackages[packageIndex] = updatedPackage;
            const updatedRecords = [...serviceRecords, ...newRecords];

            localStorage.setItem('customerPackages', JSON.stringify(updatedPackages));
            localStorage.setItem('serviceRecords', JSON.stringify(updatedRecords));

            resolve({ updatedPackage, newRecords });
        }, MOCK_API_LATENCY);
    });
};