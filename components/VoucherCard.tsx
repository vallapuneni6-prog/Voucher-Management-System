
import React from 'react';
import { Voucher, VoucherStatus } from '../types';

interface VoucherCardProps {
  voucher: Voucher;
  outletName: string;
}

const statusStyles: { [key in VoucherStatus]: string } = {
  [VoucherStatus.ISSUED]: 'bg-blue-500 text-blue-100',
  [VoucherStatus.REDEEMED]: 'bg-green-500 text-green-100',
  [VoucherStatus.EXPIRED]: 'bg-red-500 text-red-100',
};

export const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, outletName }) => {

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 562;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert('Failed to create canvas context for download.');
      return;
    }

    // 1. Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, '#F8F8F8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Brand Logo/Name
    ctx.fillStyle = '#4F46E5'; // brand-primary color
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Naturals', canvas.width / 2, 100);
    ctx.font = '30px sans-serif';
    ctx.fillText("India's No.1 hair and beauty salon", canvas.width / 2, 140);
    
    // 2a. Outlet Name
    ctx.fillStyle = '#1F2937'; // brand-surface text color
    ctx.font = 'italic 24px sans-serif';
    ctx.fillText(`Issued from: ${outletName}`, canvas.width / 2, 180);

    // 3. Discount
    ctx.fillStyle = '#10B981'; // brand-secondary color
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`${voucher.discountPercentage}% OFF`, canvas.width / 2, 300);

    // 4. Voucher Details
    ctx.fillStyle = '#1F2937'; // brand-surface text color
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Partner: ${voucher.partnerName}`, 50, 400);
    ctx.fillText(`Mobile: ${voucher.partnerMobile}`, 50, 440);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Code: ${voucher.id}`, canvas.width - 50, 400);
    ctx.fillText(`Expires: ${voucher.expiryDate.toLocaleDateString()}`, canvas.width - 50, 440);

    // 5. Footer Text
    ctx.fillStyle = '#9CA3AF'; // text-secondary
    ctx.font = 'italic 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARTNERS PRIVILEGE VOUCHER', canvas.width / 2, 520);


    // 6. Redeemed Stamp (if applicable)
    if (voucher.status === VoucherStatus.REDEEMED) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-0.25); // Rotate by ~15 degrees
        ctx.font = 'bold 100px sans-serif';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(180, 0, 0, 0.7)';
        ctx.lineWidth = 5;
        ctx.strokeText('REDEEMED', 0, 0);
        ctx.fillText('REDEEMED', 0, 0);
        ctx.restore();
    }

    // 7. Trigger Download
    const link = document.createElement('a');
    link.download = `voucher-${voucher.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-brand-surface rounded-xl shadow-lg p-5 border border-gray-700 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-brand-text-secondary">Partner</p>
          <p className="font-bold text-lg text-brand-text-primary">{voucher.partnerName}</p>
          <p className="text-sm text-brand-text-secondary">{voucher.partnerMobile}</p>
        </div>
        <div className="text-right">
          <p className="font-extrabold text-4xl text-brand-secondary">{voucher.discountPercentage}%</p>
          <p className="text-sm text-brand-text-secondary -mt-1">OFF</p>
        </div>
      </div>
      
      <div className="border-t border-gray-700 my-3"></div>

      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-brand-text-secondary">Voucher Code:</span>
          <span className="font-mono text-brand-text-primary">{voucher.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-text-secondary">Outlet:</span>
          <span className="text-brand-text-primary">{outletName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-text-secondary">Expires on:</span>
          <span className="text-brand-text-primary">{voucher.expiryDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-brand-text-secondary">Status:</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[voucher.status]}`}>
                {voucher.status}
            </span>
        </div>
      </div>

      <div className="border-t border-gray-700 my-3"></div>

      <button
        onClick={handleDownload}
        className="w-full bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary"
      >
        Download Voucher
      </button>
    </div>
  );
};
