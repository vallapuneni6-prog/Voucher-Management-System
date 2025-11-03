import { User, Voucher, Outlet, PackageTemplate, CustomerPackage, ServiceRecord } from './types';
import { SEED_USERS, SEED_PACKAGE_TEMPLATES, SEED_CUSTOMER_PACKAGES, SEED_SERVICE_RECORDS } from './seedData';

// The base URL of the backend API you deployed on BigRock
// This should point to the /api folder inside public_html
const API_BASE_URL = '/api'; // Use a relative path as it's served from the same domain

// Helper function for handling API responses from the PHP backend
const handleResponse = async (response: Response) => {
  // For 204 No Content, we don't need to parse JSON
  if (response.status === 204) {
    return;
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
        // Try to parse as JSON first
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        // If parsing fails, it might be a direct PHP error message string
        // Strip HTML tags that might come from PHP error reporting
        errorMessage = errorText.replace(/<[^>]*>?/gm, '').trim() || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const login = async (username: string, password: string): Promise<User | null> => {
  // IMPORTANT: This is still a mock login.
  // You will need to create a `login.php` endpoint that securely checks credentials.
  /*
  const response = await fetch(`${API_BASE_URL}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
  */
  console.warn("Using mock login. Please implement a secure backend login endpoint.");
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
  // The PHP script should handle POST data.
  return fetch(`${API_BASE_URL}/vouchers.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', ...newVoucherData, outletCode }),
  }).then(handleResponse);
};

export const redeemVoucher = (voucherId: string, redemptionBillNo: string): Promise<Voucher> => {
  return fetch(`${API_BASE_URL}/vouchers.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'redeem', id: voucherId, redemptionBillNo }),
  }).then(handleResponse);
};

// --- User CRUD ---

export const getUsers = (): Promise<User[]> => {
  return fetch(`${API_BASE_URL}/users.php`).then(handleResponse);
};

export const addUser = (userData: Omit<User, 'id'>): Promise<User> => {
  return fetch(`${API_BASE_URL}/users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', ...userData }),
  }).then(handleResponse);
};

export const updateUser = (updatedUserData: User): Promise<User> => {
  return fetch(`${API_BASE_URL}/users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', ...updatedUserData }),
  }).then(handleResponse);
};

// FIX: Corrected incomplete fetch call and implemented missing API functions.
export const deleteUser = (userId: string): Promise<void> => {
  return fetch(`${API_BASE_URL}/users.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id: userId }),
  }).then(handleResponse);
};

// --- Outlet CRUD ---
export const getOutlets = (): Promise<Outlet[]> => {
  return fetch(`${API_BASE_URL}/outlets.php`).then(handleResponse);
};

export const addOutlet = (outletData: Omit<Outlet, 'id'>): Promise<Outlet> => {
  return fetch(`${API_BASE_URL}/outlets.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', ...outletData }),
  }).then(handleResponse);
};

export const updateOutlet = (updatedOutletData: Outlet): Promise<Outlet> => {
  return fetch(`${API_BASE_URL}/outlets.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', ...updatedOutletData }),
  }).then(handleResponse);
};

export const deleteOutlet = (outletId: string): Promise<void> => {
  return fetch(`${API_BASE_URL}/outlets.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id: outletId }),
  }).then(handleResponse);
};

// --- Package and Service CRUD ---
export const getPackageTemplates = (): Promise<PackageTemplate[]> => {
  return fetch(`${API_BASE_URL}/packages.php?type=templates`).then(handleResponse);
};

export const addPackageTemplate = (templateData: Omit<PackageTemplate, 'id'>): Promise<PackageTemplate> => {
  return fetch(`${API_BASE_URL}/packages.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_template', ...templateData }),
  }).then(handleResponse);
};

export const deletePackageTemplate = (templateId: string): Promise<void> => {
  return fetch(`${API_BASE_URL}/packages.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete_template', id: templateId }),
  }).then(handleResponse);
};

export const getCustomerPackages = (): Promise<CustomerPackage[]> => {
  return fetch(`${API_BASE_URL}/packages.php?type=customer_packages`).then(handleResponse);
};

export const assignCustomerPackage = (
  assignmentData: Omit<CustomerPackage, 'id' | 'remainingServiceValue'>, 
  initialServices: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[]
): Promise<{ newPackage: CustomerPackage, newRecords: ServiceRecord[] }> => {
  return fetch(`${API_BASE_URL}/packages.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'assign_package', packageData: assignmentData, servicesData: initialServices }),
  }).then(handleResponse);
};

export const getServiceRecords = (): Promise<ServiceRecord[]> => {
  return fetch(`${API_BASE_URL}/packages.php?type=service_records`).then(handleResponse);
};

export const redeemServicesFromPackage = (
    customerPackageId: string,
    servicesToRedeem: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[],
    redeemDate: Date
): Promise<{ updatedPackage: CustomerPackage, newRecords: ServiceRecord[] }> => {
    return fetch(`${API_BASE_URL}/packages.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'redeem_services', 
            packageId: customerPackageId, 
            servicesData: servicesToRedeem,
            redeemDate: redeemDate.toISOString() 
        }),
    }).then(handleResponse);
};
