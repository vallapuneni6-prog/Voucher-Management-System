import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { login, getVouchers, addVoucher, redeemVoucher, getUsers, addUser, updateUser, deleteUser, getOutlets, addOutlet, updateOutlet, deleteOutlet } from './api';
import { User, Voucher, VoucherStatus, Outlet } from './types';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { IssueVoucher } from './components/IssueVoucher';
import { RedeemVoucher } from './components/RedeemVoucher';
import { Users } from './components/Users';
import { Outlets } from './components/Outlets';
import { HomeIcon, TicketIcon, CheckCircleIcon, UsersIcon, StoreIcon, LogoutIcon } from './components/icons';

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
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const hydrateVoucherDates = (vouchers: any[]): Voucher[] => {
    return vouchers.map((v) => ({
      ...v,
      expiryDate: new Date(v.expiryDate),
      issueDate: new Date(v.issueDate),
      redeemedDate: v.redeemedDate ? new Date(v.redeemedDate) : undefined,
    }));
  };

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      Promise.all([
        getVouchers(),
        getUsers(),
        getOutlets(),
      ]).then(([vouchersData, usersData, outletsData]) => {
        setVouchers(hydrateVoucherDates(vouchersData));
        setUsers(usersData);
        setOutlets(outletsData);
        setIsLoading(false);
      });
    } else {
        setIsLoading(false);
    }
  }, [currentUser]);

  const updateVoucherStatus = useCallback(() => {
    const now = new Date();
    setVouchers(currentVouchers => {
      const needsUpdate = currentVouchers.some(v => v.status === VoucherStatus.ISSUED && v.expiryDate < now);
      if (needsUpdate) {
          const updated = currentVouchers.map(v => 
            (v.status === VoucherStatus.ISSUED && v.expiryDate < now)
              ? { ...v, status: VoucherStatus.EXPIRED }
              : v
          );
          localStorage.setItem('vouchers', JSON.stringify(updated));
          return updated;
      }
      return currentVouchers;
    });
  }, []);

  useEffect(() => {
    updateVoucherStatus();
    const interval = setInterval(updateVoucherStatus, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [updateVoucherStatus]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const user = await login(username, password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setActiveTab('home');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleIssueVoucher = async (newVoucher: Omit<Voucher, 'id' | 'issueDate' | 'status' | 'outletId'>) => {
    if (currentUser?.role !== 'user' || !currentUser.outletId) return;
    const voucherData = {
      ...newVoucher,
      outletId: currentUser.outletId,
      issueDate: new Date(),
      status: VoucherStatus.ISSUED,
    };
    const createdVoucher = await addVoucher(voucherData as any);
    setVouchers(prev => [...prev, ...hydrateVoucherDates([createdVoucher])]);
  };

  const handleRedeemVoucher = async (voucherId: string, redemptionBillNo: string): Promise<boolean> => {
    const redeemedVoucher = await redeemVoucher(voucherId, redemptionBillNo);
    if (redeemedVoucher) {
      setVouchers(prev => prev.map(v => v.id === voucherId ? hydrateVoucherDates([redeemedVoucher])[0] : v));
      return true;
    }
    return false;
  };

  const handleAddUser = async (user: Omit<User, 'id'>) => {
    const newUser = await addUser(user);
    setUsers(p => [...p, newUser]);
  };

  const handleUpdateUser = async (user: User) => {
    const updatedUser = await updateUser(user);
    setUsers(p => p.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    setUsers(p => p.filter(u => u.id !== id));
  };

  const handleAddOutlet = async (outlet: Omit<Outlet, 'id'>) => {
    const newOutlet = await addOutlet(outlet);
    setOutlets(p => [...p, newOutlet]);
  };

  const handleUpdateOutlet = async (outlet: Outlet) => {
    const updatedOutlet = await updateOutlet(outlet);
    setOutlets(p => p.map(o => o.id === updatedOutlet.id ? updatedOutlet : o));
  };

  const handleDeleteOutlet = async (id: string) => {
    await deleteOutlet(id);
    getUsers().then(setUsers);
    setOutlets(p => p.filter(o => o.id !== id));
  };

  const userVouchers = useMemo(() => {
    if (currentUser?.role === 'admin') return vouchers;
    return vouchers.filter(v => v.outletId === currentUser?.outletId);
  }, [vouchers, currentUser]);

  const currentUserOutletName = useMemo(() => {
    if (!currentUser || !currentUser.outletId) return 'N/A';
    return outlets.find(o => o.id === currentUser.outletId)?.name ?? 'Unknown Outlet';
  }, [currentUser, outlets]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderAdminContent = () => {
    switch (activeTab) {
      case 'users': return <Users users={users} outlets={outlets} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />;
      case 'outlets': return <Outlets outlets={outlets} onAdd={handleAddOutlet} onUpdate={handleUpdateOutlet} onDelete={handleDeleteOutlet} />;
      case 'home':
      default: return <Home vouchers={vouchers} outlets={outlets} isAdmin={true} />;
    }
  };

  const renderUserContent = () => {
    switch (activeTab) {
      case 'issue': return <IssueVoucher vouchers={userVouchers} onIssueVoucher={handleIssueVoucher} outletName={currentUserOutletName} />;
      case 'redeem': return <RedeemVoucher vouchers={vouchers} redeemedVouchersForOutlet={userVouchers.filter(v => v.status === VoucherStatus.REDEEMED)} onRedeemVoucher={handleRedeemVoucher} />;
      case 'home':
      default: return <Home vouchers={userVouchers} outlets={outlets} isAdmin={false} />;
    }
  };

  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const TabButton = ({ tab, icon, label }: { tab: string, icon: React.ReactElement, label: string }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${activeTab === tab ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const SidebarButton = ({ tab, icon, label }: { tab: string, icon: React.ReactElement, label: string }) => (
    <button onClick={() => setActiveTab(tab)} className={`flex items-center w-full px-4 py-3 transition-colors duration-200 rounded-lg ${activeTab === tab ? 'bg-brand-primary text-white' : 'text-brand-text-secondary hover:bg-gray-700 hover:text-brand-text-primary'}`}>
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );

  const adminNav = (
    <>
      <SidebarButton tab="home" icon={<HomeIcon />} label="Home" />
      <SidebarButton tab="users" icon={<UsersIcon />} label="Users" />
      <SidebarButton tab="outlets" icon={<StoreIcon />} label="Outlets" />
    </>
  );

  const userNav = (
    <>
      <SidebarButton tab="home" icon={<HomeIcon />} label="Home" />
      <SidebarButton tab="issue" icon={<TicketIcon />} label="Issue Voucher" />
      <SidebarButton tab="redeem" icon={<CheckCircleIcon />} label="Redeem Voucher" />
    </>
  );

  const adminMobileNav = (
     <>
      <TabButton tab="home" icon={<HomeIcon />} label="Home" />
      <TabButton tab="users" icon={<UsersIcon />} label="Users" />
      <TabButton tab="outlets" icon={<StoreIcon />} label="Outlets" />
    </>
  );

  const userMobileNav = (
     <>
      <TabButton tab="home" icon={<HomeIcon />} label="Home" />
      <TabButton tab="issue" icon={<TicketIcon />} label="Issue Voucher" />
      <TabButton tab="redeem" icon={<CheckCircleIcon />} label="Redeem Voucher" />
    </>
  );

  return (
    <div className="h-screen w-screen bg-brand-background text-brand-text-primary font-sans flex overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-surface border-r border-gray-700 flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-700">
          <TicketIcon />
          <h1 className="ml-3 text-xl font-bold">Voucher Mgmt</h1>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {currentUser.role === 'admin' ? adminNav : userNav}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="text-sm">Welcome, <span className="font-bold capitalize">{currentUser.username}</span></div>
          <div className="text-xs text-brand-text-secondary">({currentUser.role})</div>
          <button onClick={handleLogout} className="w-full mt-4 flex items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            <LogoutIcon />
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header for mobile */}
        <header className="flex-shrink-0 bg-brand-surface border-b border-gray-700 md:hidden">
           <div className="p-4 flex justify-between items-center">
             <div className="text-sm">Welcome, <span className="font-bold capitalize">{currentUser.username}</span> ({currentUser.role})</div>
            <button onClick={handleLogout} className="flex items-center text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors p-2 -mr-2 rounded-md">
              <LogoutIcon />
            </button>
           </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {isLoading ? <LoadingSpinner /> : (currentUser.role === 'admin' ? renderAdminContent() : renderUserContent())}
          </div>
        </main>

        {/* Bottom Nav for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-brand-surface border-t border-gray-700 shadow-lg md:hidden">
          <div className="flex h-full">
            {currentUser.role === 'admin' ? adminMobileNav : userMobileNav}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;