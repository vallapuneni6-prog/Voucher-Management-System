import { Voucher } from '../types';

export const downloadVoucherAsImage = (voucher: Voucher) => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    alert('Failed to create canvas context for download.');
    return;
  }

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#4F46E5';
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Voucher Details', canvas.width / 2, 60);

  // Details
  ctx.fillStyle = '#1F2937';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'left';
  const details = [
    `Partner Name: ${voucher.partnerName}`,
    `Voucher Code: ${voucher.id}`,
    `Bill No: ${voucher.billNo}`,
    `Redeemed On: ${voucher.redeemedDate ? new Date(voucher.redeemedDate).toLocaleDateString() : 'Not Redeemed'}`,
  ];

  let yPos = 120;
  details.forEach(line => {
    ctx.fillText(line, 50, yPos);
    yPos += 40;
  });

  const link = document.createElement('a');
  link.download = `voucher-details-${voucher.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
