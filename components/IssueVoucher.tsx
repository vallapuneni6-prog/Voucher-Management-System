import React, { useState } from 'react';
import { Voucher, VoucherStatus, Outlet } from '../types';
// FIX: Changed import to be a named import for VoucherCard.
import { VoucherCard } from './VoucherCard';

interface IssueVoucherProps {
  vouchers: Voucher[];
  outlets: Outlet[];
  onIssueVoucher: (newVoucher: Omit<Voucher, 'id' | 'issueDate' | 'status'>) => Promise<void>;
}

const IssueVoucher: React.FC<IssueVoucherProps> = ({ vouchers, outlets, onIssueVoucher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerMobile, setPartnerMobile] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [discountPercentage, setDiscountPercentage] = useState(10);

  const getOutletName = (outletId: string) => {
    return outlets.find(o => o.id === outletId)?.name ?? 'Unknown Outlet';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // The outletId is now handled by the parent App component based on logged in user
    // We pass a placeholder and it will be overwritten.
    await onIssueVoucher({ partnerName, partnerMobile, expiryDate, outletId: '', discountPercentage });
    
    // Reset form and close modal
    setPartnerName('');
    setPartnerMobile('');
    setExpiryDays(30);
    setDiscountPercentage(10);
    setIsModalOpen(false);
  };

  const issuedVouchers = vouchers.filter(v => v.status === VoucherStatus.ISSUED);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-primary">Issued Vouchers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-colors"
        >
          New Voucher
        </button>
      </div>
      
      <div className="space-y-4">
        {issuedVouchers.length > 0 ? (
          [...issuedVouchers].reverse().map(voucher => (
            <VoucherCard 
              key={voucher.id} 
              voucher={voucher} 
              outletName={getOutletName(voucher.outletId)} 
            />
          ))
        ) : (
          <div className="text-center py-10 bg-brand-surface rounded-lg">
            <p className="text-brand-text-secondary">No vouchers issued yet for this outlet.</p>
            <p className="text-sm text-gray-500">Click 'New Voucher' to get started.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">Issue New Voucher</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Partner Name" value={partnerName} onChange={e => setPartnerName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <input type="tel" placeholder="Partner Mobile" value={partnerMobile} onChange={e => setPartnerMobile(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Expiry (in days)</label>
                <input type="number" value={expiryDays} onChange={e => setExpiryDays(parseInt(e.target.value))} min="1" required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Discount (%)</label>
                <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(parseInt(e.target.value))} min="1" max="100" required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-500">Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueVoucher;
