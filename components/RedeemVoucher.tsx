import React, { useState, useCallback, useEffect } from 'react';
import { Voucher, VoucherStatus } from '../types';
import { downloadVoucherAsImage } from './downloadVoucher';

interface RedeemVoucherProps {
  vouchers: Voucher[];
  redeemedVouchersForOutlet: Voucher[];
  onRedeemVoucher: (voucherId: string, redemptionBillNo: string) => Promise<boolean>;
}

export const RedeemVoucher: React.FC<RedeemVoucherProps> = ({ vouchers, redeemedVouchersForOutlet, onRedeemVoucher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [redemptionBillNo, setRedemptionBillNo] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setMessage(null);
  }, []);

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

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!redemptionBillNo.trim()) {
      setMessage({ text: 'Please enter a redemption bill number.', type: 'error' });
      return;
    }

    const voucherToRedeem = vouchers.find(v => 
      v.id.toLowerCase() === searchTerm.toLowerCase() || v.partnerMobile === searchTerm
    );

    if (!voucherToRedeem) {
      setMessage({ text: 'Voucher not found.', type: 'error' });
      return;
    }

    if (voucherToRedeem.status === VoucherStatus.REDEEMED) {
      setMessage({ text: 'This voucher has already been redeemed.', type: 'error' });
      return;
    }

    if (voucherToRedeem.status === VoucherStatus.EXPIRED) {
      setMessage({ text: 'This voucher has expired.', type: 'error' });
      return;
    }

    const success = await onRedeemVoucher(voucherToRedeem.id, redemptionBillNo);
    if (success) {
      setMessage({ text: 'Voucher redeemed successfully!', type: 'success' });
      setSearchTerm('');
      setRedemptionBillNo('');
      setTimeout(() => {
        closeModal();
      }, 2000);
    } else {
      setMessage({ text: 'Failed to redeem voucher. Please try again.', type: 'error' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-primary">Redeemed Vouchers</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-500 transition-colors">
          Redeem Voucher
        </button>
      </div>

      <div className="bg-brand-surface rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {redeemedVouchersForOutlet.length > 0 ? (
            <table className="w-full text-sm text-left text-brand-text-secondary">
              <thead className="text-xs text-brand-text-primary uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3">Partner</th>
                  <th scope="col" className="px-4 py-3">Voucher Code</th>
                  <th scope="col" className="px-4 py-3">Bill No</th>
                  <th scope="col" className="px-4 py-3">Redeemed Bill</th>
                  <th scope="col" className="px-4 py-3">Redeemed On</th>
                  <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...redeemedVouchersForOutlet].reverse().map(voucher => (
                  <tr key={voucher.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-3 font-medium text-brand-text-primary whitespace-nowrap">{voucher.partnerName}</td>
                    <td className="px-4 py-3 font-mono">{voucher.id}</td>
                    <td className="px-4 py-3 font-mono">{voucher.billNo}</td>
                    <td className="px-4 py-3 font-mono">{voucher.redemptionBillNo}</td>
                    <td className="px-4 py-3">{voucher.redeemedDate ? voucher.redeemedDate.toLocaleDateString() : ''}</td>
                    <td className="px-4 py-3">
                        <button onClick={() => downloadVoucherAsImage(voucher)} className="bg-brand-secondary text-white text-xs font-semibold py-1 px-3 rounded-md hover:bg-green-500 transition-colors">
                          Download
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="text-brand-text-secondary">No vouchers redeemed yet for this outlet.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="redeem-dialog-title"
        >
          <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
            <h2 id="redeem-dialog-title" className="text-2xl font-bold mb-4 text-brand-text-primary">Redeem a Voucher</h2>
            <form onSubmit={handleRedeem} className="space-y-4">
              <input type="text" placeholder="Mobile or Voucher Code" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
              <input type="text" placeholder="Redemption Bill No" value={redemptionBillNo} onChange={e => setRedemptionBillNo(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
              {message && (
                <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={closeModal} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-lg hover:bg-green-500">Verify & Redeem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
