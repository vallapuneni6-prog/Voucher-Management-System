import React, { useState } from 'react';
import { Voucher, VoucherStatus } from '../types';

interface RedeemVoucherProps {
  vouchers: Voucher[];
  onRedeemVoucher: (voucherId: string, redemptionBillNo: string) => Promise<boolean>;
}

export const RedeemVoucher: React.FC<RedeemVoucherProps> = ({ vouchers, onRedeemVoucher }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundVoucher, setFoundVoucher] = useState<Voucher | null>(null);
  const [redemptionBillNo, setRedemptionBillNo] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setFoundVoucher(null);

    const voucher = vouchers.find(v => 
      v.id.toLowerCase() === searchTerm.toLowerCase() || v.recipientMobile === searchTerm
    );

    if (voucher) {
      setFoundVoucher(voucher);
      if(voucher.status !== VoucherStatus.ISSUED) {
         setMessage({ text: `Voucher Status: ${voucher.status}`, type: 'info' });
      }
    } else {
      setMessage({ text: 'Voucher not found.', type: 'error' });
    }
  };

  const handleRedeem = async () => {
    if (!foundVoucher) return;
    if (!redemptionBillNo.trim()) {
      setMessage({ text: 'Please enter a redemption bill number.', type: 'error' });
      return;
    }
    
    try {
      const success = await onRedeemVoucher(foundVoucher.id, redemptionBillNo);
      if (success) {
        setMessage({ text: 'Voucher redeemed successfully!', type: 'success' });
        setFoundVoucher(v => v ? { ...v, status: VoucherStatus.REDEEMED } : null);
        setRedemptionBillNo('');
        setTimeout(() => {
          setFoundVoucher(null);
          setSearchTerm('');
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ text: 'Failed to redeem voucher. It might be invalid or already used.', type: 'error' });
      }
    } catch (error) {
      console.error("Redemption error:", error);
      setMessage({ text: `An error occurred: ${error instanceof Error ? error.message : String(error)}`, type: 'error' });
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFoundVoucher(null);
    setMessage(null);
    setRedemptionBillNo('');
  }

  const getStatusColor = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.ISSUED: return 'text-blue-500';
      case VoucherStatus.REDEEMED: return 'text-green-500';
      case VoucherStatus.EXPIRED: return 'text-red-500';
    }
  }

  return (
    <div>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-6 text-center">Redeem Voucher</h1>
        <div className="max-w-md mx-auto bg-brand-surface border border-brand-border p-6 rounded-xl shadow-sm">
            {!foundVoucher ? (
                <form onSubmit={handleCheckStatus} className="space-y-4">
                    <label htmlFor="voucher-search" className="block text-sm font-medium text-brand-text-secondary">Enter Voucher ID or Scan QR</label>
                    <input 
                        id="voucher-search"
                        type="text" 
                        placeholder="Voucher ID or Mobile" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        required 
                        className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <button type="submit" className="w-full bg-brand-primary text-white py-3 font-semibold rounded-lg hover:opacity-90">
                        Check Status
                    </button>
                </form>
            ) : (
                <div>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold mb-2 text-brand-text-primary">Voucher Details</h2>
                        <button onClick={clearSearch} className="text-sm text-gray-400 hover:text-brand-text-primary">Clear</button>
                    </div>
                    <div className="space-y-2 mt-4 text-brand-text-secondary">
                        <p><strong>Name:</strong> <span className="text-brand-text-primary">{foundVoucher.recipientName}</span></p>
                        <p><strong>Type:</strong> <span className="text-brand-text-primary">{foundVoucher.type}</span></p>
                        <p><strong>Issued Date:</strong> <span className="text-brand-text-primary">{new Date(foundVoucher.issueDate).toLocaleDateString()}</span></p>
                        <p><strong>Status:</strong> <span className={`font-bold ${getStatusColor(foundVoucher.status)}`}>{foundVoucher.status}</span></p>
                    </div>

                    {foundVoucher.status === VoucherStatus.ISSUED && (
                        <div className="mt-6 border-t border-brand-border pt-4 space-y-4">
                            <input 
                                type="text" 
                                placeholder="Redemption Bill No." 
                                value={redemptionBillNo}
                                onChange={e => setRedemptionBillNo(e.target.value)}
                                required
                                className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            />
                            <button onClick={handleRedeem} className="w-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to text-white py-3 font-semibold rounded-lg hover:opacity-90">
                                Redeem Now
                            </button>
                        </div>
                    )}
                </div>
            )}
             {message && (
                <p className={`text-sm text-center mt-4 ${message.type === 'success' ? 'text-green-500' : message.type === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {message.text}
                </p>
              )}
        </div>
    </div>
  );
};