import React, { useState, useCallback, useEffect } from 'react';
import { Voucher, VoucherStatus } from '../types';
import { downloadBrandedVoucher } from './downloadBrandedVoucher';

interface IssueVoucherProps {
  vouchers: Voucher[];
  onIssueVoucher: (newVoucherData: { partnerName: string; partnerMobile: string; billNo: string; expiryDate: Date; discountPercentage: number; }) => void;
  outletName: string;
}

export const IssueVoucher: React.FC<IssueVoucherProps> = ({ vouchers, onIssueVoucher, outletName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerMobile, setPartnerMobile] = useState('');
  const [billNo, setBillNo] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [discountPercentage, setDiscountPercentage] = useState(10);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    await onIssueVoucher({ partnerName, partnerMobile, billNo, expiryDate, discountPercentage });
    setPartnerName('');
    setPartnerMobile('');
    setBillNo('');
    setExpiryDays(30);
    setDiscountPercentage(10);
    closeModal();
  };

  const issuedVouchers = vouchers.filter(v => v.status === VoucherStatus.ISSUED);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-primary">Issued Vouchers</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-colors">
          New Voucher
        </button>
      </div>

      <div className="bg-brand-surface rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {issuedVouchers.length > 0 ? (
            <table className="w-full text-sm text-left text-brand-text-secondary">
              <thead className="text-xs text-brand-text-primary uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3">Partner</th>
                  <th scope="col" className="px-4 py-3">Voucher Code</th>
                  <th scope="col" className="px-4 py-3">Bill No</th>
                  <th scope="col" className="px-4 py-3">Expires On</th>
                  <th scope="col" className="px-4 py-3">Discount</th>
                  <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...issuedVouchers].reverse().map(voucher => (
                  <tr key={voucher.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-3 font-medium text-brand-text-primary whitespace-nowrap">{voucher.partnerName}</td>
                    <td className="px-4 py-3 font-mono">{voucher.id}</td>
                    <td className="px-4 py-3 font-mono">{voucher.billNo}</td>
                    <td className="px-4 py-3">{voucher.expiryDate.toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold text-brand-secondary">{voucher.discountPercentage}%</td>
                    <td className="px-4 py-3">
                      <button onClick={() => downloadBrandedVoucher(voucher, outletName)} className="bg-brand-primary text-white text-xs font-semibold py-1 px-3 rounded-md hover:bg-indigo-500 transition-colors">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="text-brand-text-secondary">No vouchers issued yet for this outlet.</p>
              <p className="text-sm text-gray-500">Click 'New Voucher' to get started.</p>
            </div>
          )}
        </div>
      </div>
      
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="issue-voucher-dialog-title"
        >
          <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
            <h2 id="issue-voucher-dialog-title" className="text-2xl font-bold mb-4 text-brand-text-primary">Issue New Voucher</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Partner Name" value={partnerName} onChange={e => setPartnerName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <input type="tel" placeholder="Partner Mobile" value={partnerMobile} onChange={e => setPartnerMobile(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <input type="text" placeholder="Bill No" value={billNo} onChange={e => setBillNo(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Expiry (in days)</label>
                <input type="number" value={expiryDays} onChange={e => setExpiryDays(parseInt(e.target.value))} min="1" required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Discount (%)</label>
                <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(parseInt(e.target.value))} min="1" max="100" required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeModal} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-500">Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
