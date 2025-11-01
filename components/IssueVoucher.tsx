import React, { useState, useCallback, useEffect } from 'react';
import { Voucher, VoucherType } from '../types';
import { generateBrandedVoucherImage } from './downloadBrandedVoucher';

interface IssueVoucherProps {
  onIssueVoucher: (newVoucherData: Omit<Voucher, 'id' | 'issueDate' | 'status' | 'outletId'>) => Promise<Voucher>;
}

export const IssueVoucher: React.FC<IssueVoucherProps> = ({ onIssueVoucher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<VoucherType | null>(null);
  
  const [recipientName, setRecipientName] = useState('');
  const [recipientMobile, setRecipientMobile] = useState('');
  const [billNo, setBillNo] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [discountPercentage, setDiscountPercentage] = useState(35);
  
  const [lastVoucher, setLastVoucher] = useState<Voucher | null>(null);

  const [isVoucherPreviewOpen, setIsVoucherPreviewOpen] = useState(false);
  const [voucherImage, setVoucherImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleShowVoucher = async (voucher: Voucher) => {
    setIsGenerating(true);
    try {
      const imageDataUrl = await generateBrandedVoucherImage(voucher);
      setVoucherImage(imageDataUrl);
      setIsVoucherPreviewOpen(true);
    } catch (error) {
      console.error("Failed to generate voucher image:", error);
      alert(error instanceof Error ? error.message : "Could not generate voucher image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const closeVoucherPreview = () => {
    setIsVoucherPreviewOpen(false);
    setVoucherImage(null);
  };
  
  useEffect(() => {
     const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isVoucherPreviewOpen) {
          closeVoucherPreview();
        } else {
          closeModal();
        }
      }
    };
    if (isModalOpen || isVoucherPreviewOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, isVoucherPreviewOpen, closeModal]);


  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text-primary mb-6 text-center">Issue New Voucher</h1>
      
      {/* Success message card */}
      {lastVoucher && !isModalOpen && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg relative mb-6 max-w-lg mx-auto text-center" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">Voucher {lastVoucher.id} issued for {lastVoucher.recipientName}.</span>
           <button 
                onClick={() => handleShowVoucher(lastVoucher)}
                disabled={isGenerating}
                className="mt-3 w-full bg-green-600 text-white py-2 font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-wait"
            >
                {isGenerating ? 'Generating...' : 'View & Download Voucher'}
            </button>
        </div>
      )}

      <div className="max-w-md mx-auto flex flex-col gap-6">
        <button 
          onClick={() => openModal(VoucherType.PARTNER)} 
          className="w-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to hover:opacity-90 transition-colors text-white font-bold py-3 text-base rounded-xl shadow-md flex flex-col items-center justify-center"
        >
          <span>Partners Voucher</span>
          <span className="text-sm font-normal mt-1">(30 Days Validity, 35% Discount)</span>
        </button>
        <button 
          onClick={() => openModal(VoucherType.FAMILY_FRIENDS)} 
          className="w-full bg-brand-primary hover:opacity-90 transition-colors text-white font-bold py-3 text-base rounded-xl shadow-md flex flex-col items-center justify-center"
        >
          <span>Family & Friends Voucher</span>
          <span className="text-sm font-normal mt-1">(30 Days Validity, 25% Discount)</span>
        </button>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 w-full max-w-md shadow-2xl">
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
                      className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                    />
                    <input 
                      type="tel" 
                      placeholder={voucherType === VoucherType.PARTNER ? 'Partner Mobile No' : 'Friends Mobile No'} 
                      value={recipientMobile} 
                      onChange={e => setRecipientMobile(e.target.value)} 
                      required 
                      pattern="\d{10}" 
                      className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                    />
                    <input 
                      type="text" 
                      placeholder="Bill No" 
                      value={billNo} 
                      onChange={e => setBillNo(e.target.value)} 
                      required 
                      className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                    />
                    
                    <div className="flex justify-end space-x-3 pt-2">
                      <button type="button" onClick={closeModal} className="bg-gray-100 text-brand-text-primary py-2 px-4 rounded-lg hover:bg-gray-200">Cancel</button>
                      <button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:opacity-90">Issue Voucher</button>
                    </div>
                  </form>
                </>
             ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-green-600">Voucher Issued!</h2>
                    <p className="text-brand-text-secondary mb-4">Voucher ID: <span className="font-mono text-brand-text-primary">{lastVoucher.id}</span></p>
                    <p className="text-brand-text-secondary">Recipient: <span className="font-bold text-brand-text-primary">{lastVoucher.recipientName}</span></p>
                    <div className="mt-6 space-y-3">
                        <button 
                            onClick={() => handleShowVoucher(lastVoucher)}
                            disabled={isGenerating}
                            className="w-full bg-green-600 text-white py-3 font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-wait"
                        >
                            {isGenerating ? 'Generating...' : 'View & Download Voucher'}
                        </button>
                         <button 
                            type="button" 
                            onClick={closeModal} 
                            className="w-full bg-gray-100 text-brand-text-primary py-2 px-4 rounded-lg hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
             )}
          </div>
        </div>
      )}

      {isVoucherPreviewOpen && voucherImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4"
          role="dialog"
          aria-modal="true"
        >
            <div className="bg-brand-surface rounded-xl p-4 w-full max-w-lg max-h-[90vh] flex flex-col border border-brand-border shadow-2xl">
                <h2 className="text-xl font-bold mb-4 flex-shrink-0 text-brand-text-primary">Voucher Preview</h2>
                <div className="overflow-y-auto flex-1 bg-gray-100 p-2 rounded-lg border border-brand-border">
                    <img src={voucherImage} alt="Generated Voucher" className="w-full h-auto" />
                </div>
                <p className="text-xs text-brand-text-secondary text-center mt-2">On mobile, you can long-press the image to save it.</p>
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-brand-border flex-shrink-0">
                    <button onClick={closeVoucherPreview} className="bg-gray-100 text-brand-text-primary py-2 px-4 rounded-lg hover:bg-gray-200">
                        Close
                    </button>
                    <a 
                        href={voucherImage} 
                        download={`voucher-${lastVoucher?.id}.png`}
                        className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:opacity-90 inline-block"
                    >
                        Download
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
