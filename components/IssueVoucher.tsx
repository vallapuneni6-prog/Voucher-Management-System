import React, { useState, useCallback, useEffect } from 'react';
import { Voucher, VoucherType } from '../types';
import { downloadBrandedVoucher } from './downloadBrandedVoucher';

interface IssueVoucherProps {
  onIssueVoucher: (newVoucherData: Omit<Voucher, 'id' | 'issueDate' | 'status' | 'outletId'>) => Promise<Voucher>;
  outletName: string;
}

export const IssueVoucher: React.FC<IssueVoucherProps> = ({ onIssueVoucher, outletName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<VoucherType | null>(null);
  
  const [recipientName, setRecipientName] = useState('');
  const [recipientMobile, setRecipientMobile] = useState('');
  const [billNo, setBillNo] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [discountPercentage, setDiscountPercentage] = useState(35);
  
  const [lastVoucher, setLastVoucher] = useState<Voucher | null>(null);
  
  const openModal = (type: VoucherType) => {
    setVoucherType(type);
    if (type === VoucherType.PARTNER) {
        setExpiryDays(30);
        setDiscountPercentage(35);
    } else {
        setExpiryDays(30);
        setDiscountPercentage(25);
    }
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay resetting form to allow animation
    setTimeout(() => {
        setVoucherType(null);
        setRecipientName('');
        setRecipientMobile('');
        setBillNo('');
        setLastVoucher(null);
    }, 300);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherType) return;
    
    const newVoucherData = {
      recipientName,
      recipientMobile,
      billNo,
      expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      discountPercentage,
      type: voucherType,
    };
    
    try {
      const createdVoucher = await onIssueVoucher(newVoucherData);
      setLastVoucher(createdVoucher);
      // Don't close modal, show success inside
    } catch (error) {
      console.error("Failed to issue voucher:", error);
      // You could add error handling state here
    }
  };
  
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


  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text-primary mb-6 text-center">Issue New Voucher</h1>
      
      {/* Success message card */}
      {lastVoucher && !isModalOpen && (
        <div className="bg-green-900/50 border border-green-600 text-green-200 px-4 py-3 rounded-lg relative mb-6 max-w-lg mx-auto text-center" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">Voucher {lastVoucher.id} issued for {lastVoucher.recipientName}.</span>
           <button 
                onClick={() => downloadBrandedVoucher(lastVoucher, outletName)}
                className="mt-3 w-full bg-brand-secondary text-white py-2 font-semibold rounded-lg hover:bg-green-500"
            >
                Download Voucher
            </button>
        </div>
      )}

      <div className="max-w-md mx-auto flex flex-col gap-6">
        <button 
          onClick={() => openModal(VoucherType.PARTNER)} 
          className="w-full bg-brand-primary/80 backdrop-blur-sm hover:bg-brand-primary transition-colors text-white font-bold py-3 text-base rounded-xl shadow-lg flex flex-col items-center justify-center"
        >
          <span>Partners Voucher</span>
          <span className="text-sm font-normal mt-1">(30 Days Validity, 35% Discount)</span>
        </button>
        <button 
          onClick={() => openModal(VoucherType.FAMILY_FRIENDS)} 
          className="w-full bg-brand-secondary/80 backdrop-blur-sm hover:bg-brand-secondary transition-colors text-white font-bold py-3 text-base rounded-xl shadow-lg flex flex-col items-center justify-center"
        >
          <span>Family & Friends Voucher</span>
          <span className="text-sm font-normal mt-1">(30 Days Validity, 25% Discount)</span>
        </button>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-brand-surface/90 backdrop-blur-sm border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
             {!lastVoucher ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-brand-text-primary">
                    {voucherType === VoucherType.PARTNER ? 'Enter Partner Details' : 'Enter Friends Details'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder={voucherType === VoucherType.PARTNER ? 'Partner Name' : 'Friends Name'} 
                      value={recipientName} 
                      onChange={e => setRecipientName(e.target.value)} 
                      required 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                    />
                    <input 
                      type="tel" 
                      placeholder={voucherType === VoucherType.PARTNER ? 'Partner Mobile No' : 'Friends Mobile No'} 
                      value={recipientMobile} 
                      onChange={e => setRecipientMobile(e.target.value)} 
                      required 
                      pattern="\d{10}" 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                    />
                    <input 
                      type="text" 
                      placeholder="Bill No" 
                      value={billNo} 
                      onChange={e => setBillNo(e.target.value)} 
                      required 
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                    />
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button type="button" onClick={closeModal} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                      <button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-500">Issue Voucher</button>
                    </div>
                  </form>
                </>
             ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-brand-secondary">Voucher Issued!</h2>
                    <p className="text-brand-text-secondary mb-4">Voucher ID: <span className="font-mono text-brand-text-primary">{lastVoucher.id}</span></p>
                    <p className="text-brand-text-secondary">Recipient: <span className="font-bold text-brand-text-primary">{lastVoucher.recipientName}</span></p>
                    <div className="mt-6 space-y-3">
                        <button 
                            onClick={() => downloadBrandedVoucher(lastVoucher, outletName)}
                            className="w-full bg-brand-secondary text-white py-3 font-semibold rounded-lg hover:bg-green-500"
                        >
                            Download Voucher
                        </button>
                         <button 
                            type="button" 
                            onClick={closeModal} 
                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};