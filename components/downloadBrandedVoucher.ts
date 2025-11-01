import { Voucher } from '../types';

// The flower image from the design is omitted as it's a complex illustration not easily reproducible with code.
// The core layout, colors, and text from the design are replicated.

export const generateBrandedVoucherImage = async (voucher: Voucher): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return reject(new Error('Failed to create canvas context for voucher generation.'));
        }

        // Backgrounds
        // Left side (light pink)
        ctx.fillStyle = '#FEF6F6'; // A light pinkish color
        ctx.fillRect(0, 0, 700, 600);

        // Right side (golden gradient)
        const gradient = ctx.createLinearGradient(700, 0, 1200, 0);
        gradient.addColorStop(0, '#EACD81');
        gradient.addColorStop(1, '#D4B368');
        ctx.fillStyle = gradient;
        ctx.fillRect(700, 0, 500, 600);

        // Header
        // Logo
        ctx.fillStyle = '#4A2A7B'; // Naturals Purple
        ctx.font = 'bold 50px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('naturals', 60, 80);
        ctx.font = '20px sans-serif';
        ctx.fillText("India's No.1 hair and beauty salon", 60, 110);
        
        // Voucher Title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('PARTNER PRIVILEGE VOUCHER', 1140, 80);
        
        // Reset alignment
        ctx.textAlign = 'left';

        // Left Content Area
        ctx.fillStyle = '#000000';
        ctx.font = '24px sans-serif';
        ctx.fillText('SPECIAL DISCOUNT', 60, 220);

        ctx.fillStyle = '#E59333'; // Golden Orange
        ctx.font = 'bold 180px sans-serif';
        ctx.fillText(`${voucher.discountPercentage}%`, 60, 380);
        
        ctx.fillStyle = '#000000';
        ctx.font = '60px sans-serif';
        ctx.fillText('OFF', 150, 460);
        
        // Right Content Area
        // Quote
        ctx.fillStyle = '#D9534F'; // Reddish Pink
        ctx.font = 'italic 20px sans-serif';
        const quoteLine1 = 'This exclusive treat awaits you —';
        const quoteLine2 = 'courtesy of someone who cares.';
        ctx.fillText(quoteLine1, 720, 220);
        ctx.fillText(quoteLine2, 720, 250);
        
        // Details
        const detailYStart = 350;
        const detailYStep = 50;
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('PARTNER NAME:', 720, detailYStart);
        ctx.fillText('VOUCHER ID:', 720, detailYStart + detailYStep);
        ctx.fillText('VALIDITY:', 720, detailYStart + (detailYStep * 2));

        ctx.font = '22px sans-serif';
        ctx.fillText(voucher.recipientName, 920, detailYStart);
        ctx.fillText(voucher.id, 920, detailYStart + detailYStep);
        ctx.fillText(new Date(voucher.expiryDate).toLocaleDateString(), 920, detailYStart + (detailYStep * 2));
        
        // Footer
        ctx.fillStyle = '#333333';
        ctx.font = '16px sans-serif';
        const footerText = '• Voucher not applicable on Hair Treatments & Bridal makeup. Voucher Valid only at Store issued, please take prior appointment for service';
        ctx.fillText(footerText, 60, 570);
        
        resolve(canvas.toDataURL('image/png'));
    });
};
