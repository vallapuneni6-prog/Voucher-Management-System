import { User, Voucher, VoucherStatus, Outlet, PackageTemplate, CustomerPackage, ServiceRecord } from './types';
import { SEED_USERS, SEED_PACKAGE_TEMPLATES, SEED_CUSTOMER_PACKAGES, SEED_SERVICE_RECORDS } from './seedData';

// The base URL of the backend API you deployed on BigRock
// It should point to the .php files.
const API_BASE_URL = '/api'; // Use a relative path as it's served from the same domain

// Helper function for handling API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        // If parsing fails, use the raw text. It might be a PHP error message.
        errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const login = async (username: string, password: string): Promise<User | null> => {
  // This would be a POST request in a real app.
  // For now, we are leaving the auth logic as-is since the backend doesn't have it yet.
  // A real implementation would look like:
  /*
  const response = await fetch(`${API_BASE_URL}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
  */
  // Keeping mock login for now until login endpoint is created on backend
  const users: User[] = SEED_USERS;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
  }
  return null;
};

export const getVouchers = (): Promise<Voucher[]> => {
  return fetch(`${API_BASE_URL}/vouchers.php`).then(handleResponse);
};

export const addVoucher = (newVoucherData: Omit<Voucher, 'id'>, outletCode: string): Promise<Voucher> => {
  // This endpoint would need to be created in PHP.
  // The PHP script would handle $_POST data.
  // For now, this will fail until vouchers.php is updated to handle POST requests.
  return fetch(`${API_BASE_URL}/vouchers.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...newVoucherData, outletCode }),
  }).then(handleResponse);
};

export const redeemVoucher = (voucherId: string, redemptionBillNo: string): Promise<Voucher | null> => {
  // This endpoint would need to be created in PHP.
  // The PHP script would handle PUT (or POST) data.
  return fetch(`${API_BASE_URL}/vouchers.php?action=redeem&id=${voucherId}`, {
    method: 'POST', // HTML forms don't support PUT, so POST is often used.
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redemptionBillNo }),
  }).then(handleResponse);
};

// --- CRUD operations need corresponding backend endpoints ---

export const getUsers = (): Promise<User[]> => {
  // return fetch(`${API_BASE_URL}/users.php`).then(handleResponse);
  // MOCKED until users.php is built
   const users: User[] = SEED_USERS;
   return Promise.resolve(users.map(u => {
       const { password, ...user } = u;
       return user;
   }));
};

export const addUser = (userData: Omit<User, 'id'>): Promise<User> => {
  return fetch(`${API_BASE_URL}/users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }).then(handleResponse);
};

export const updateUser = (updatedUserData: User): Promise<User> => {
  return fetch(`${API_BASE_URL}/users.php?id=${updatedUserData.id}`, {
    method: 'POST', // Using POST to simulate PUT
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedUserData),
  }).then(handleResponse);
};

export const deleteUser = (userId: string): Promise<void> => {
  return fetch(`${API_BASE_URL}/users.php?id=${userId}`, { method: 'DELETE' }).then(res => {
    if (!res.ok) throw new Error('Failed to delete user');
  });
};

export const getOutlets = (): Promise<Outlet[]> => {
  // return fetch(`${API_BASE_URL}/outlets.php`).then(handleResponse);
  // MOCKED until outlets.php is built
  return Promise.resolve([
      { id: 'o-1672532400000', name: 'MADINAGUDA', location: 'Hyderabad', code: 'NAT', address: '123 Main St', gstin: 'ABCDE12345', phone: '9876543210' }
  ]);
};

export const addOutlet = (outletData: Omit<Outlet, 'id'>): Promise<Outlet> => {
  return fetch(`${API_BASE_URL}/outlets.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outletData),
  }).then(handleResponse);
};

export const updateOutlet = (updatedOutletData: Outlet): Promise<Outlet> => {
  return fetch(`${API_BASE_URL}/outlets.php?id=${updatedOutletData.id}`, {
    method: 'POST', // Using POST to simulate PUT
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedOutletData),
  }).then(handleResponse);
};

export const deleteOutlet = (outletId: string): Promise<void> => {
  return fetch(`${API_BASE_URL}/outlets.php?id=${outletId}`, { method: 'DELETE' }).then(res => {
      if (!res.ok) throw new Error('Failed to delete outlet');
  });
};


// --- Package Management API ---
// These would also be converted to fetch calls once backend endpoints exist.
// For now, they will remain as mock promises to keep the UI functional.

const MOCK_API_LATENCY = 100;

export const getPackageTemplates = (): Promise<PackageTemplate[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(SEED_PACKAGE_TEMPLATES);
        }, MOCK_API_LATENCY);
    });
};

export const addPackageTemplate = (templateData: Omit<PackageTemplate, 'id'>): Promise<PackageTemplate> => {
    return Promise.reject(new Error("Add package template not implemented in API yet"));
};

export const deletePackageTemplate = (templateId: string): Promise<void> => {
    return Promise.reject(new Error("Delete package template not implemented in API yet"));
};

export const getCustomerPackages = (): Promise<CustomerPackage[]> => {
    return new Promise((resolve) => {
       setTimeout(() => resolve(SEED_CUSTOMER_PACKAGES), MOCK_API_LATENCY);
    });
};

export const getServiceRecords = (): Promise<ServiceRecord[]> => {
    return new Promise((resolve) => {
       setTimeout(() => resolve(SEED_SERVICE_RECORDS), MOCK_API_LATENCY);
    });
};

export const assignCustomerPackage = (
    assignmentData: Omit<CustomerPackage, 'id' | 'remainingServiceValue'>,
    initialServices: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[]
): Promise<{ newPackage: CustomerPackage, newRecords: ServiceRecord[] }> => {
    return Promise.reject(new Error("Assign package not implemented in API yet"));
};

export const redeemServicesFromPackage = (
    customerPackageId: string,
    servicesToRedeem: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[],
    redeemDate: Date
): Promise<{ updatedPackage: CustomerPackage, newRecords: ServiceRecord[] }> => {
     return Promise.reject(new Error("Redeem service not implemented in API yet"));
};
