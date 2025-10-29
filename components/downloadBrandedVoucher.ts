import { Voucher, VoucherStatus } from '../types';

export const downloadBrandedVoucher = (voucher: Voucher, outletName: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 562;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert('Failed to create canvas context for download.');
      return;
    }

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, '#F8F8F8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Naturals', canvas.width / 2, 100);
    ctx.font = '30px sans-serif';
    ctx.fillText("India's No.1 hair and beauty salon", canvas.width / 2, 140);
    ctx.fillStyle = '#1F2937';
    ctx.font = 'italic 24px sans-serif';
    ctx.fillText(`Issued from: ${outletName}`, canvas.width / 2, 180);

    // Discount
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`${voucher.discountPercentage}% OFF`, canvas.width / 2, 300);

    // Details
    ctx.fillStyle = '#1F2937';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Partner: ${voucher.partnerName}`, 50, 400);
    ctx.fillText(`Mobile: ${voucher.partnerMobile}`, 50, 440);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Code: ${voucher.id}`, canvas.width - 50, 400);
    ctx.fillText(`Expires: ${new Date(voucher.expiryDate).toLocaleDateString()}`, canvas.width - 50, 440);
    
    // Footer
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'italic 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARTNERS PRIVILEGE VOUCHER', canvas.width / 2, 520);
    
    // Redeemed Watermark
    if (voucher.status === VoucherStatus.REDEEMED) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-0.25);
        ctx.font = 'bold 100px sans-serif';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(180, 0, 0, 0.7)';
        ctx.lineWidth = 5;
        ctx.strokeText('REDEEMED', 0, 0);
        ctx.fillText('REDEEMED', 0, 0);
        ctx.restore();
    }
    
    const link = document.createElement('a');
    link.download = `voucher-${voucher.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
};
