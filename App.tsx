import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { login, getVouchers, addVoucher, redeemVoucher, getUsers, getOutlets, getPackageTemplates, addPackageTemplate, deletePackageTemplate, getCustomerPackages, assignCustomerPackage, getServiceRecords, addUser, updateUser, deleteUser, addOutlet, updateOutlet, deleteOutlet, redeemServicesFromPackage } from './api';
import { User, Voucher, VoucherStatus, Outlet, PackageTemplate, CustomerPackage, ServiceRecord } from './types';
import { Login } from './components/Login';
import { IssueVoucher } from './components/IssueVoucher';
import { RedeemVoucher } from './components/RedeemVoucher';
import { Packages } from './components/Packages';
import { Home } from './components/Home';
import { Users } from './components/Users';
import { Outlets } from './components/Outlets';
import { TicketIcon, CheckCircleIcon, PackageIcon, LogoutIcon, HomeIcon, UsersIcon, StoreIcon } from './components/icons';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full pt-20">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) { return null; }
  });
  const [activeTab, setActiveTab] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [packageTemplates, setPackageTemplates] = useState<PackageTemplate[]>([]);
  const [customerPackages, setCustomerPackages] = useState<CustomerPackage[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);

  const hydrateVoucherDates = (vouchers: any[]): Voucher[] => {
    return vouchers.map((v) => ({
      ...v,
      expiryDate: new Date(v.expiryDate),
      issueDate: new Date(v.issueDate),
      redeemedDate: v.redeemedDate ? new Date(v.redeemedDate) : undefined,
    }));
  };
  
  const hydrateCustomerPackageDates = (packages: any[]): CustomerPackage[] => {
    return packages.map((p) => ({
      ...p,
      assignedDate: new Date(p.assignedDate),
    }));
  };

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      setError(null);
      Promise.all([
        getVouchers(),
        getUsers(),
        getOutlets(),
        getPackageTemplates(),
        getCustomerPackages(),
        getServiceRecords(),
      ]).then(([vouchersData, usersData, outletsData, templatesData, customerPackagesData, serviceRecordsData]) => {
        setVouchers(hydrateVoucherDates(vouchersData));
        setUsers(usersData);
        setOutlets(outletsData);
        setPackageTemplates(templatesData);
        setCustomerPackages(hydrateCustomerPackageDates(customerPackagesData));
        setServiceRecords(serviceRecordsData.map(r => ({...r, redeemedDate: new Date(r.redeemedDate)})));
      }).catch(err => {
        console.error("Failed to load initial data:", err);
        setError("Failed to load application data. Please try refreshing the page.");
      }).finally(() => {
        setIsLoading(false);
      });
      setActiveTab(currentUser.role === 'admin' ? 'home' : 'issue');
    } else {
        setIsLoading(false);
    }
  }, [currentUser]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const user = await login(username, password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setActiveTab(user.role === 'admin' ? 'home' : 'issue');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActiveTab('');
  };

  const handleIssueVoucher = async (newVoucher: Omit<Voucher, 'id' | 'issueDate' | 'status' | 'outletId'>): Promise<Voucher> => {
    if (!currentUser?.outletId) throw new Error("User has no outlet assigned.");
    
    const currentUserOutlet = outlets.find(o => o.id === currentUser.outletId);
    if (!currentUserOutlet) throw new Error("Could not find user's outlet information.");

    const voucherData = {
      ...newVoucher,
      outletId: currentUser.outletId,
      issueDate: new Date(),
      status: VoucherStatus.ISSUED,
    };
    const createdVoucher = await addVoucher(voucherData as any, currentUserOutlet.code);
    const hydratedVoucher = hydrateVoucherDates([createdVoucher])[0];
    setVouchers(prev => [...prev, hydratedVoucher]);
    return hydratedVoucher;
  };

  const handleRedeemVoucher = async (voucherId: string, redemptionBillNo: string): Promise<boolean> => {
    const redeemedVoucher = await redeemVoucher(voucherId, redemptionBillNo);
    if (redeemedVoucher) {
      setVouchers(prev => prev.map(v => v.id === voucherId ? hydrateVoucherDates([redeemedVoucher])[0] : v));
      return true;
    }
    return false;
  };
  
  // User/Outlet CRUD Handlers
  const handleAddUser = async (user: Omit<User, 'id'>) => { try { const newUser = await addUser(user); setUsers(prev => [...prev, newUser]); } catch (e) { alert(`Error: ${e instanceof Error ? e.message : String(e)}`); }};
  const handleUpdateUser = async (user: User) => { try { const updatedUser = await updateUser(user); setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u)); } catch (e) { alert(`Error: ${e instanceof Error ? e.message : String(e)}`); }};
  const handleDeleteUser = async (id: string) => { try { await deleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)); } catch (e) { alert(`Error: ${e instanceof Error ? e.message : String(e)}`); }};

  const handleAddOutlet = async (outlet: Omit<Outlet, 'id'>) => { try { const newOutlet = await addOutlet(outlet); setOutlets(prev => [...prev, newOutlet]); } catch (e) { alert(`Error: ${e instanceof Error ? e.message : String(e)}`); }};
  const handleUpdateOutlet = async (outlet: Outlet) => { try { const updatedOutlet = await updateOutlet(outlet); setOutlets(prev => prev.map(o => o.id === updatedOutlet.id ? updatedOutlet : o)); } catch (e) { alert(`Error: ${e instanceof Error ? e.message : String(e)}`); }};
  const handleDeleteOutlet = async (id: string) => { try { await deleteOutlet(id); setOutlets(prev => prev.filter(o => o.id !== id)); } catch (e) { alert(`Error: ${e instanceof Error ? e.message : String(e)}`); }};

  // Package Handlers
  const handleAddPackageTemplate = async (template: Omit<PackageTemplate, 'id'>) => {
    try {
      const newTemplate = await addPackageTemplate(template);
      setPackageTemplates(prev => [...prev, newTemplate]);
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  const handleDeletePackageTemplate = async (id: string) => {
    try {
      await deletePackageTemplate(id);
      setPackageTemplates(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  const handleAssignPackage = async (
    assignment: Omit<CustomerPackage, 'id' | 'assignedDate' | 'outletId' | 'remainingServiceValue' | 'packageTemplateId'>,
    templateId: string,
    initialServices: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[],
    date: string
  ): Promise<CustomerPackage> => {
      if (!currentUser?.outletId) throw new Error("User has no outlet assigned.");
      const assignmentData = {
          ...assignment,
          packageTemplateId: templateId,
          outletId: currentUser.outletId,
          assignedDate: new Date(date),
      };
      
      const { newPackage, newRecords } = await assignCustomerPackage(assignmentData, initialServices);
      
      const hydratedPackage = hydrateCustomerPackageDates([newPackage])[0];
      setCustomerPackages(prev => [...prev, hydratedPackage]);
      setServiceRecords(prev => [...prev, ...newRecords.map(r => ({...r, redeemedDate: new Date(r.redeemedDate)}))]);
      return hydratedPackage;
  };
  
  const handleRedeemFromPackage = async (
    customerPackageId: string,
    servicesToRedeem: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[],
    date: string
  ): Promise<void> => {
      const redeemDate = new Date(date);
      const { updatedPackage, newRecords } = await redeemServicesFromPackage(customerPackageId, servicesToRedeem, redeemDate);
      
      setCustomerPackages(prev => prev.map(p => p.id === customerPackageId ? hydrateCustomerPackageDates([updatedPackage])[0] : p));
      setServiceRecords(prev => [...prev, ...newRecords.map(r => ({...r, redeemedDate: new Date(r.redeemedDate)}))]);
  };

  const userCustomerPackages = useMemo(() => {
    return customerPackages.filter(p => p.outletId === currentUser?.outletId);
  }, [customerPackages, currentUser]);
  
  const allCustomerPackages = useMemo(() => {
    return customerPackages;
  }, [customerPackages]);


  const currentUserOutlet = useMemo(() => {
    if (!currentUser || !currentUser.outletId) return null;
    return outlets.find(o => o.id === currentUser.outletId) ?? null;
  }, [currentUser, outlets]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  const renderContent = () => {
    if (currentUser.role === 'admin') {
      switch (activeTab) {
        case 'home': return <Home vouchers={vouchers} packages={customerPackages} outlets={outlets} isAdmin={true} />;
        case 'packages': return <Packages isAdmin={true} packageTemplates={packageTemplates} onAddTemplate={handleAddPackageTemplate} onDeleteTemplate={handleDeletePackageTemplate} customerPackages={customerPackages} outlets={outlets} serviceRecords={serviceRecords} />;
        case 'users': return <Users users={users} outlets={outlets} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />;
        case 'outlets': return <Outlets outlets={outlets} onAdd={handleAddOutlet} onUpdate={handleUpdateOutlet} onDelete={handleDeleteOutlet} />;
        default: return <Home vouchers={vouchers} packages={customerPackages} outlets={outlets} isAdmin={true} />;
      }
    } else { // Regular user
      if (!currentUserOutlet) return <div className="text-center p-8">Error: User outlet not found.</div>;
      switch (activeTab) {
        case 'issue': return <IssueVoucher onIssueVoucher={handleIssueVoucher} outlet={currentUserOutlet} />;
        case 'redeem': return <RedeemVoucher vouchers={vouchers} onRedeemVoucher={handleRedeemVoucher} />;
        case 'packages': return <Packages isAdmin={false} packageTemplates={packageTemplates} customerPackages={userCustomerPackages} onAssignPackage={handleAssignPackage} onRedeemFromPackage={handleRedeemFromPackage} outlets={outlets} allCustomerPackages={allCustomerPackages} serviceRecords={serviceRecords} outlet={currentUserOutlet} />;
        default: return <IssueVoucher onIssueVoucher={handleIssueVoucher} outlet={currentUserOutlet} />;
      }
    }
  };

  const TabButton = ({ tab, icon, label }: { tab: string, icon: React.ReactElement, label: string }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${activeTab === tab ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}>
       <div className={`p-2 rounded-full ${activeTab === tab ? 'bg-brand-primary-light' : ''}`}>
        {icon}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );

  const SidebarButton = ({ tab, icon, label }: { tab: string, icon: React.ReactElement, label: string }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex items-center w-full px-4 py-3 transition-colors duration-200 rounded-lg ${activeTab === tab ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-brand-primary-light hover:text-brand-primary'}`}>
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );

  const userNav = (
    <>
      <SidebarButton tab="issue" icon={<TicketIcon />} label="Issue Voucher" />
      <SidebarButton tab="redeem" icon={<CheckCircleIcon />} label="Redeem Voucher" />
      <SidebarButton tab="packages" icon={<PackageIcon />} label="Packages" />
    </>
  );

  const userMobileNav = (
     <>
      <TabButton tab="issue" icon={<TicketIcon />} label="Issue" />
      <TabButton tab="redeem" icon={<CheckCircleIcon />} label="Redeem" />
      <TabButton tab="packages" icon={<PackageIcon />} label="Packages" />
    </>
  );

  const adminNav = (
    <>
      <SidebarButton tab="home" icon={<HomeIcon />} label="Home" />
      <SidebarButton tab="packages" icon={<PackageIcon />} label="Packages" />
      <SidebarButton tab="users" icon={<UsersIcon />} label="Users" />
      <SidebarButton tab="outlets" icon={<StoreIcon />} label="Outlets" />
    </>
  );

  const adminMobileNav = (
    <>
      <TabButton tab="home" icon={<HomeIcon />} label="Home" />
      <TabButton tab="packages" icon={<PackageIcon />} label="Packages" />
      <TabButton tab="users" icon={<UsersIcon />} label="Users" />
      <TabButton tab="outlets" icon={<StoreIcon />} label="Outlets" />
    </>
  );

  return (
    <div className="h-screen w-screen text-brand-text-primary font-sans flex overflow-hidden bg-brand-background">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-surface border-r border-brand-border flex-shrink-0">
        <div className="h-20 flex flex-col items-center justify-center px-6 border-b border-brand-border text-center">
           <h1 className="text-3xl font-bold text-brand-primary">naturals</h1>
           <p className="text-[10px] text-brand-text-secondary tracking-[0.15em] mt-1">VOUCHER PORTAL</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {currentUser.role === 'admin' ? adminNav : userNav}
        </nav>
        <div className="px-4 py-4 border-t border-brand-border">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-brand-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg">
            <LogoutIcon />
            <span className="ml-4 font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header for mobile */}
        <header className="md:hidden flex items-center justify-between bg-brand-surface p-4 border-b border-brand-border">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-brand-primary">naturals</h1>
            <p className="text-[10px] text-brand-text-secondary tracking-widest">VOUCHER PORTAL</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-brand-text-secondary hover:text-red-500">
            <LogoutIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {isLoading ? <LoadingSpinner /> : error ? <div className="text-red-500 text-center">{error}</div> : renderContent()}
        </div>

        {/* Bottom Nav for mobile */}
        <nav className="md:hidden bg-brand-surface border-t border-brand-border h-20 flex items-center">
          {currentUser.role === 'admin' ? adminMobileNav : userMobileNav}
        </nav>
      </main>
    </div>
  );
};

export default App;
