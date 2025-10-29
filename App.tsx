import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Home from './components/Home';
import IssueVoucher from './components/IssueVoucher';
import RedeemVoucher from './components/RedeemVoucher';
import Login from './components/Login';
import Users from './components/Users';
import Outlets from './components/Outlets';
import { HomeIcon, TicketIcon, CheckCircleIcon, UsersIcon, StoreIcon, LogoutIcon } from './components/icons';
import { Voucher, VoucherStatus, User, Outlet } from './types';
import * as api from './api'; // Import the new API layer

type AdminTab = 'home' | 'users' | 'outlets';
type UserTab = 'home' | 'issue' | 'redeem';

// A simple loading spinner component
const LoadingSpinner: React.FC = () => (
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

  const [activeTab, setActiveTab] = useState<AdminTab | UserTab>('home');
  const [isLoading, setIsLoading] = useState(true);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  
  const hydrateVoucherDates = (vouchers: Voucher[]): Voucher[] => {
    return vouchers.map((v: any) => ({
      ...v,
      expiryDate: new Date(v.expiryDate),
      issueDate: new Date(v.issueDate),
      redeemedDate: v.redeemedDate ? new Date(v.redeemedDate) : undefined,
    }));
  };

  // Fetch all data on initial load
  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      Promise.all([
        api.getVouchers(),
        api.getUsers(),
        api.getOutlets(),
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


  // Voucher status updater
  const updateVoucherStatus = useCallback(() => {
    const now = new Date();
    setVouchers(currentVouchers => {
      const needsUpdate = currentVouchers.some(v => v.status === VoucherStatus.ISSUED && v.expiryDate < now);
      if (needsUpdate) {
          return currentVouchers.map(v => 
            (v.status === VoucherStatus.ISSUED && v.expiryDate < now)
              ? { ...v, status: VoucherStatus.EXPIRED }
              : v
          );
      }
      return currentVouchers;
    });
  }, []);

  useEffect(() => {
    updateVoucherStatus();
    const interval = setInterval(updateVoucherStatus, 60 * 60 * 1000); // Check hourly
    return () => clearInterval(interval);
  }, [updateVoucherStatus]);
  
  // Login/Logout Handlers
  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const user = await api.login(username, password);
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

  // CRUD Handlers
  const handleIssueVoucher = async (newVoucher: Omit<Voucher, 'id' | 'issueDate' | 'status'>) => {
    if (currentUser?.role !== 'user' || !currentUser.outletId) return;
    const voucherData = {
      ...newVoucher,
      outletId: currentUser.outletId,
      issueDate: new Date(),
      status: VoucherStatus.ISSUED,
    };
    const createdVoucher = await api.addVoucher(voucherData);
    setVouchers(prev => [...prev, ...hydrateVoucherDates([createdVoucher])]);
  };

  const handleRedeemVoucher = async (voucherId: string): Promise<boolean> => {
    const redeemedVoucher = await api.redeemVoucher(voucherId);
    if (redeemedVoucher) {
      setVouchers(prev => prev.map(v => v.id === voucherId ? hydrateVoucherDates([redeemedVoucher])[0] : v));
      return true;
    }
    return false;
  };

  const handleAddUser = async (user: Omit<User, 'id'>) => {
    const newUser = await api.addUser(user);
    setUsers(p => [...p, newUser]);
  };
  const handleUpdateUser = async (user: User) => {
    const updatedUser = await api.updateUser(user);
    setUsers(p => p.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  const handleDeleteUser = async (id: string) => {
    await api.deleteUser(id);
    setUsers(p => p.filter(u => u.id !== id));
  };

  const handleAddOutlet = async (outlet: Omit<Outlet, 'id'>) => {
    const newOutlet = await api.addOutlet(outlet);
    setOutlets(p => [...p, newOutlet]);
  };
  const handleUpdateOutlet = async (outlet: Outlet) => {
    const updatedOutlet = await api.updateOutlet(outlet);
    setOutlets(p => p.map(o => o.id === updatedOutlet.id ? updatedOutlet : o));
  };
  const handleDeleteOutlet = async (id: string) => {
    await api.deleteOutlet(id);
    // Refetch users since outlets affect them
    api.getUsers().then(setUsers);
    setOutlets(p => p.filter(o => o.id !== id));
  };

  // Memoized data filtering
  const userVouchers = useMemo(() => {
    if (currentUser?.role === 'admin') return vouchers;
    return vouchers.filter(v => v.outletId === currentUser?.outletId);
  }, [vouchers, currentUser]);

  // Render logic
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const TabButton: React.FC<{ tab: AdminTab | UserTab; icon: React.ReactElement; label: string }> = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        activeTab === tab ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
  
  const renderAdminContent = () => {
    switch (activeTab as AdminTab) {
      case 'users': return <Users users={users} outlets={outlets} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />;
      case 'outlets': return <Outlets outlets={outlets} onAdd={handleAddOutlet} onUpdate={handleUpdateOutlet} onDelete={handleDeleteOutlet} />;
      case 'home':
      default: return <Home vouchers={vouchers} outlets={outlets} isAdmin={true} />;
    }
  };
  
  const renderUserContent = () => {
    switch (activeTab as UserTab) {
      case 'issue': return <IssueVoucher vouchers={userVouchers} outlets={outlets} onIssueVoucher={handleIssueVoucher} />;
      case 'redeem': return <RedeemVoucher vouchers={vouchers} redeemedVouchersForOutlet={userVouchers.filter(v => v.status === VoucherStatus.REDEEMED)} outlets={outlets} onRedeemVoucher={handleRedeemVoucher} />;
      case 'home':
      default: return <Home vouchers={userVouchers} outlets={outlets} isAdmin={false} />;
    }
  }

  return (
    <div className="h-screen w-screen bg-brand-background text-brand-text-primary font-sans flex flex-col">
       <header className="flex-shrink-0 bg-brand-surface border-b border-gray-700">
         <div className="max-w-md mx-auto p-4 flex justify-between items-center">
           <div className="text-sm">
             Welcome, <span className="font-bold capitalize">{currentUser.username}</span> ({currentUser.role})
           </div>
           <button onClick={handleLogout} className="flex items-center text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors p-2 -mr-2 rounded-md">
             <LogoutIcon />
             <span className="ml-2">Logout</span>
           </button>
         </div>
       </header>

      <div className="flex-grow overflow-y-auto pb-20">
        <div className="max-w-md mx-auto p-4">
            {isLoading ? <LoadingSpinner /> : (currentUser.role === 'admin' ? renderAdminContent() : renderUserContent())}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-brand-surface border-t border-gray-700 shadow-lg">
        <div className="max-w-md mx-auto flex h-full">
          {currentUser.role === 'admin' ? (
            <>
              <TabButton tab="home" icon={<HomeIcon />} label="Home" />
              <TabButton tab="users" icon={<UsersIcon />} label="Users" />
              <TabButton tab="outlets" icon={<StoreIcon />} label="Outlets" />
            </>
          ) : (
            <>
              <TabButton tab="home" icon={<HomeIcon />} label="Home" />
              <TabButton tab="issue" icon={<TicketIcon />} label="Issue Voucher" />
              <TabButton tab="redeem" icon={<CheckCircleIcon />} label="Redeem Voucher" />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default App;
