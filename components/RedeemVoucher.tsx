import React, { useState } from 'react';
import { Voucher, VoucherStatus, Outlet } from '../types';
// FIX: Changed import to be a named import for VoucherCard.
import { VoucherCard } from './VoucherCard';

interface RedeemVoucherProps {
  vouchers: Voucher[]; // This will be ALL vouchers for lookup
  redeemedVouchersForOutlet: Voucher[]; // This is just for display
  outlets: Outlet[];
  onRedeemVoucher: (voucherId: string) => Promise<boolean>;
}

const RedeemVoucher: React.FC<RedeemVoucherProps> = ({ vouchers, redeemedVouchersForOutlet, outlets, onRedeemVoucher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const getOutletName = (outletId: string) => {
    return outlets.find(o => o.id === outletId)?.name ?? 'Unknown Outlet';
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

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
    
    const success = await onRedeemVoucher(voucherToRedeem.id);
    if (success) {
      setMessage({ text: 'Voucher redeemed successfully!', type: 'success' });
      setSearchTerm('');
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
      }, 2000);
    } else {
      setMessage({ text: 'Failed to redeem voucher. Please try again.', type: 'error' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-primary">Redeemed Vouchers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-500 transition-colors"
        >
          Redeem Voucher
        </button>
      </div>

      <div className="space-y-4">
        {redeemedVouchersForOutlet.length > 0 ? (
          [...redeemedVouchersForOutlet].reverse().map(voucher => (
            <VoucherCard 
              key={voucher.id} 
              voucher={voucher} 
              outletName={getOutletName(voucher.outletId)}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-brand-surface rounded-lg">
            <p className="text-brand-text-secondary">No vouchers redeemed yet for this outlet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">Redeem a Voucher</h2>
            <form onSubmit={handleRedeem} className="space-y-4">
              <input 
                type="text" 
                placeholder="Mobile or Voucher Code" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                required 
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
              />
              {message && (
                <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setMessage(null); }} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-brand-secondary text-white py-2 px-4 rounded-lg hover:bg-green-500">Verify & Redeem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedeemVoucher;
