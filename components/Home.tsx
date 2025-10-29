import React, { useMemo, useState } from 'react';
import { Voucher, Outlet, VoucherStatus } from '../types';
import { StatCard } from './StatCard';

interface HomeProps {
  vouchers: Voucher[];
  outlets: Outlet[];
  isAdmin: boolean;
}

export const Home: React.FC<HomeProps> = ({ vouchers, outlets, isAdmin }) => {
  const [selectedOutletId, setSelectedOutletId] = useState('all');

  const statusStyles: { [key in VoucherStatus]: string } = {
    [VoucherStatus.ISSUED]: 'bg-blue-500 text-blue-100',
    [VoucherStatus.REDEEMED]: 'bg-green-500 text-green-100',
    [VoucherStatus.EXPIRED]: 'bg-red-500 text-red-100',
  };

  const getOutletName = (outletId: string) => {
    return outlets.find(o => o.id === outletId)?.name ?? 'Unknown Outlet';
  };

  const vouchersToDisplay = useMemo(() => {
    if (isAdmin && selectedOutletId !== 'all') {
      return vouchers.filter(v => v.outletId === selectedOutletId);
    }
    return vouchers;
  }, [vouchers, selectedOutletId, isAdmin]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const newVouchers = vouchersToDisplay.filter(v => 
    new Date(v.issueDate) >= startOfMonth && new Date(v.issueDate) <= endOfMonth
  ).length;

  const redeemedVouchers = vouchersToDisplay.filter(v => 
    v.redeemedDate && new Date(v.redeemedDate) >= startOfMonth && new Date(v.redeemedDate) <= endOfMonth
  ).length;
    
  const expiredVouchers = vouchersToDisplay.filter(
    v => v.status === VoucherStatus.EXPIRED && new Date(v.expiryDate) >= startOfMonth && new Date(v.expiryDate) <= endOfMonth
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-text-primary text-center">Voucher Statistics</h1>
      <p className="text-center text-brand-text-secondary mb-2">
        Summary for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>

      {isAdmin && (
        <div className="max-w-xs mx-auto">
          <select 
            value={selectedOutletId} 
            onChange={(e) => setSelectedOutletId(e.target.value)}
            className="w-full bg-brand-surface text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Outlets</option>
            {outlets.map(outlet => (
              <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="New Vouchers" value={newVouchers} color="text-brand-primary" />
        <StatCard title="Redeemed Vouchers" value={redeemedVouchers} color="text-brand-secondary" />
        <StatCard title="Expired Vouchers" value={expiredVouchers} color="text-red-500" />
      </div>

      <div className="bg-brand-surface rounded-xl p-4 shadow-lg mt-8">
        <h2 className="text-xl font-semibold mb-4 text-brand-text-primary">Monthly Overview</h2>
        <div className="overflow-x-auto">
          {vouchersToDisplay.length > 0 ? (
            <table className="w-full text-sm text-left text-brand-text-secondary">
              <thead className="text-xs text-brand-text-primary uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3">Voucher Code</th>
                  <th scope="col" className="px-4 py-3">Partner</th>
                  <th scope="col" className="px-4 py-3">Discount</th>
                  {isAdmin && <th scope="col" className="px-4 py-3">Outlet</th>}
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {vouchersToDisplay.map(voucher => (
                  <tr key={voucher.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-3 font-mono">{voucher.id}</td>
                    <td className="px-4 py-3">{voucher.partnerName}</td>
                    <td className="px-4 py-3 font-bold text-brand-secondary">{voucher.discountPercentage}%</td>
                    {isAdmin && <td className="px-4 py-3">{getOutletName(voucher.outletId)}</td>}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[voucher.status]}`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{voucher.expiryDate.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="text-center py-10 text-brand-text-secondary">
              No voucher data to display for the selected filter.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
