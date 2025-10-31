import React, { useState, useMemo } from 'react';
import { Voucher, Outlet, VoucherStatus } from '../types';

interface VouchersListProps {
  vouchers: Voucher[];
  outlets: Outlet[];
}

export const VouchersList: React.FC<VouchersListProps> = ({ vouchers, outlets }) => {
  const [selectedOutletId, setSelectedOutletId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getOutletName = (outletId: string) => {
    return outlets.find(o => o.id === outletId)?.name ?? 'Unknown Outlet';
  };

  const statusStyles: { [key in VoucherStatus]: string } = {
    [VoucherStatus.ISSUED]: 'bg-blue-500 text-blue-100',
    [VoucherStatus.REDEEMED]: 'bg-green-500 text-green-100',
    [VoucherStatus.EXPIRED]: 'bg-red-500 text-red-100',
  };

  const filteredVouchers = useMemo(() => {
    return vouchers
      .filter(v => selectedOutletId === 'all' || v.outletId === selectedOutletId)
      .filter(v => statusFilter === 'all' || v.status === statusFilter)
      .filter(v => 
        v.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.recipientMobile.includes(searchTerm) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [vouchers, selectedOutletId, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-text-primary text-center">All Vouchers</h1>
      
      <div className="bg-brand-surface/90 backdrop-blur-sm border border-gray-700 p-4 rounded-xl shadow-lg space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <input 
          type="text" 
          placeholder="Search by ID, name, or mobile..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <div className="flex items-center gap-4">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Statuses</option>
            <option value={VoucherStatus.ISSUED}>{VoucherStatus.ISSUED}</option>
            <option value={VoucherStatus.REDEEMED}>{VoucherStatus.REDEEMED}</option>
            <option value={VoucherStatus.EXPIRED}>{VoucherStatus.EXPIRED}</option>
          </select>
          <select 
            value={selectedOutletId} 
            onChange={(e) => setSelectedOutletId(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="all">All Outlets</option>
            {outlets.map(outlet => (
              <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-brand-surface rounded-xl shadow-lg mt-8">
        <div className="overflow-x-auto p-4">
          {filteredVouchers.length > 0 ? (
            <table className="w-full text-sm text-left text-brand-text-secondary">
              <thead className="text-xs text-brand-text-primary uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3">Voucher ID</th>
                  <th scope="col" className="px-4 py-3">Recipient</th>
                  <th scope="col" className="px-4 py-3">Mobile</th>
                  <th scope="col" className="px-4 py-3">Outlet</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Issue Date</th>
                  <th scope="col" className="px-4 py-3">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredVouchers].reverse().map(voucher => (
                  <tr key={voucher.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-3 font-mono">{voucher.id}</td>
                    <td className="px-4 py-3">{voucher.recipientName}</td>
                    <td className="px-4 py-3">{voucher.recipientMobile}</td>
                    <td className="px-4 py-3">{getOutletName(voucher.outletId)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[voucher.status]}`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{voucher.issueDate.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{voucher.expiryDate.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="text-center py-10 text-brand-text-secondary">
              No vouchers found for the selected filters.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
