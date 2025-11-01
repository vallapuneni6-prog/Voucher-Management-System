import React, { useMemo, useState } from 'react';
import { Voucher, Outlet, VoucherStatus, CustomerPackage } from '../types';
import { StatCard } from './StatCard';

interface HomeProps {
  vouchers: Voucher[];
  packages: CustomerPackage[];
  outlets: Outlet[];
  isAdmin: boolean;
}

export const Home: React.FC<HomeProps> = ({ vouchers, packages, outlets, isAdmin }) => {
  const [selectedOutletId, setSelectedOutletId] = useState('all');

  const statusStyles: { [key in VoucherStatus]: string } = {
    [VoucherStatus.ISSUED]: 'bg-blue-100 text-blue-800',
    [VoucherStatus.REDEEMED]: 'bg-green-100 text-green-800',
    [VoucherStatus.EXPIRED]: 'bg-red-100 text-red-800',
  };

  const getOutletName = (outletId: string) => {
    return outlets.find(o => o.id === outletId)?.name ?? 'Unknown Outlet';
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const vouchersToDisplay = useMemo(() => {
    if (isAdmin && selectedOutletId !== 'all') {
      return vouchers.filter(v => v.outletId === selectedOutletId);
    }
    return vouchers;
  }, [vouchers, selectedOutletId, isAdmin]);

  const packagesToDisplay = useMemo(() => {
    if (isAdmin && selectedOutletId !== 'all') {
      return packages.filter(p => p.outletId === selectedOutletId);
    }
    return packages;
  }, [packages, selectedOutletId, isAdmin]);

  const handleGenerateReport = () => {
    if (vouchersToDisplay.length === 0) {
      alert('No data to generate report.');
      return;
    }

    const headers = [
      'Voucher ID', 'Recipient Name', 'Recipient Mobile', 'Outlet', 'Type', 
      'Status', 'Discount (%)', 'Issue Date', 'Expiry Date', 'Redeemed Date', 
      'Bill No', 'Redemption Bill No'
    ];

    const rows = vouchersToDisplay.map(v => [
      `"${v.id}"`,
      `"${v.recipientName}"`,
      `"${v.recipientMobile}"`,
      `"${getOutletName(v.outletId)}"`,
      `"${v.type}"`,
      `"${v.status}"`,
      v.discountPercentage,
      `"${v.issueDate.toLocaleDateString()}"`,
      `"${v.expiryDate.toLocaleDateString()}"`,
      `"${v.redeemedDate ? v.redeemedDate.toLocaleDateString() : 'N/A'}"`,
      `"${v.billNo}"`,
      `"${v.redemptionBillNo || 'N/A'}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const outletName = selectedOutletId === 'all' ? 'all-outlets' : getOutletName(selectedOutletId).replace(/\s+/g, '-');
    link.setAttribute("download", `vouchers-report-${outletName}-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const newVouchers = vouchersToDisplay.filter(v => 
    new Date(v.issueDate) >= startOfMonth && new Date(v.issueDate) <= endOfMonth
  ).length;

  const redeemedVouchers = vouchersToDisplay.filter(v => 
    v.redeemedDate && new Date(v.redeemedDate) >= startOfMonth && new Date(v.redeemedDate) <= endOfMonth
  ).length;
    
  const expiredVouchers = vouchersToDisplay.filter(
    v => v.status === VoucherStatus.EXPIRED && new Date(v.expiryDate) >= startOfMonth && new Date(v.expiryDate) <= endOfMonth
  ).length;

  const packagesAssignedThisMonth = packagesToDisplay.filter(p => 
    new Date(p.assignedDate) >= startOfMonth && new Date(p.assignedDate) <= endOfMonth
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-text-primary text-center">Admin Dashboard</h1>
        <p className="text-center text-brand-text-secondary mb-2">
          Summary for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>

        {isAdmin && (
          <div className="max-w-lg mx-auto mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <select 
              value={selectedOutletId} 
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="w-full bg-brand-surface text-brand-text-primary p-2 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="all">All Outlets</option>
              {outlets.map(outlet => (
                <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
              ))}
            </select>
            <button
                onClick={handleGenerateReport}
                className="w-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition-colors"
            >
                Generate Report
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-brand-text-primary">Voucher Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="New" value={newVouchers} color="text-brand-primary" />
            <StatCard title="Redeemed" value={redeemedVouchers} color="text-green-500" />
            <StatCard title="Expired" value={expiredVouchers} color="text-red-500" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-brand-text-primary">Package Statistics</h2>
          <div className="grid grid-cols-1">
            <StatCard title="Packages Assigned" value={packagesAssignedThisMonth} color="text-yellow-500" />
          </div>
        </div>
      </div>
     

      <div className="bg-brand-surface rounded-xl shadow-sm border border-brand-border">
        <h2 className="text-xl font-semibold text-brand-text-primary p-4 sm:p-6">Recent Vouchers Overview</h2>
        
        {vouchersToDisplay.length > 0 ? (
          <div className="px-4 pb-4 space-y-3">
            {[...vouchersToDisplay].reverse().slice(0, 15).map(voucher => (
              <div key={voucher.id} className="bg-brand-background p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="mb-3 sm:mb-0">
                  <p className="font-mono text-sm text-brand-text-primary break-all">{voucher.id}</p>
                  <p className="font-semibold text-brand-text-primary">{voucher.recipientName}</p>
                  {isAdmin && <p className="text-xs text-brand-text-secondary">Outlet: {getOutletName(voucher.outletId)}</p>}
                </div>
                <div className="flex flex-col sm:items-end sm:text-right space-y-1">
                  <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[voucher.status]}`}>
                    {voucher.status}
                  </span>
                  <p className="text-sm text-brand-text-secondary">Expires: {voucher.expiryDate.toLocaleDateString()}</p>
                  <p className="text-sm font-bold text-green-600">Discount: {voucher.discountPercentage}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-10 text-brand-text-secondary px-4">
            No voucher data to display for the selected filter.
           </div>
        )}
      </div>
    </div>
  );
};