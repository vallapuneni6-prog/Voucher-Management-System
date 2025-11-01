import { CustomerPackage, PackageTemplate, Outlet } from '../types';

export const generateBrandedPackageInvoiceImage = async (customerPackage: CustomerPackage, template: PackageTemplate, outlet: Outlet): Promise<string> => {
    const canvas = document.createElement('canvas');
    if (!canvas.getContext) {
        throw new Error('Canvas not supported or context could not be created.');
    }
    const FONT_BASE = '"Courier New", Courier, monospace';
    const PADDING = 25;
    const canvasWidth = 450;
    
    const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, align: 'left' | 'center' | 'right' = 'left', color = '#000000') => {
        ctx.font = font;
        ctx.textAlign = align;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    };

    const drawMultiLineText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, lineHeight: number, align: 'left' | 'center' | 'right' = 'center') => {
        const lines = (text || '').split('\n');
        lines.forEach((line, index) => {
            drawText(ctx, line, x, y + (index * lineHeight), font, align);
        });
        return y + ((lines.length -1) * lineHeight);
    };

    const drawSeparator = (ctx: CanvasRenderingContext2D, y: number) => {
        drawText(ctx, '-'.repeat(42), canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');
    };

    const drawItemRow = (ctx: CanvasRenderingContext2D, y: number, name: string, price: string, amount: string) => {
        drawText(ctx, name, PADDING, y, `bold 16px ${FONT_BASE}`, 'left');
        drawText(ctx, `1 X ${price}`, PADDING, y + 20, `14px ${FONT_BASE}`, 'left');
        drawText(ctx, amount, canvasWidth - PADDING, y + 20, `16px ${FONT_BASE}`, 'right');
    };
    
    const drawTotalRow = (ctx: CanvasRenderingContext2D, y: number, label: string, value: string, isBold: boolean = false) => {
         drawText(ctx, label, PADDING + 150, y, `${isBold ? 'bold ' : ''}16px ${FONT_BASE}`, 'right');
         drawText(ctx, value, canvasWidth - PADDING, y, `${isBold ? 'bold ' : ''}16px ${FONT_BASE}`, 'right');
    }

    const dynamicHeight = 700;
    canvas.width = canvasWidth;
    canvas.height = dynamicHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to create canvas context for invoice generation.');
    }
    
    let y = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    y = 50;
    drawText(ctx, 'Naturals', canvasWidth / 2, y, `bold 40px sans-serif`, 'center', '#000000');
    y += 30;
    drawText(ctx, "India's No.1 hair and beauty salon", canvasWidth / 2, y, `16px sans-serif`, 'center', '#000000');
    y += 35;

    drawText(ctx, outlet.name || '', canvasWidth / 2, y, `bold 18px ${FONT_BASE}`, 'center');
    y += 20;
    y = drawMultiLineText(ctx, outlet.address, canvasWidth / 2, y, `14px ${FONT_BASE}`, 18, 'center');
    y += 25;
    drawText(ctx, `GSTIN: ${outlet.gstin || ''}`, canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');
    y += 20;
    drawText(ctx, `PHONE: ${outlet.phone || ''}`, canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');
    y += 20;
    drawSeparator(ctx, y);

    y += 25;
    drawText(ctx, `NAME: ${customerPackage.customerName}`, PADDING, y, `14px ${FONT_BASE}`);
    y += 20;
    drawText(ctx, `PHONE: ${customerPackage.customerMobile}`, PADDING, y, `14px ${FONT_BASE}`);
    y += 25;
    const billDate = new Date(customerPackage.assignedDate);
    drawText(ctx, `BILL NO: ${customerPackage.id.slice(-6).toUpperCase()}`, PADDING, y, `14px ${FONT_BASE}`);
    drawText(ctx, `DATE: ${billDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`, canvasWidth - PADDING, y, `14px ${FONT_BASE}`, 'right');
    y += 20;
    drawText(ctx, `TIME: ${billDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`, canvasWidth - PADDING, y, `14px ${FONT_BASE}`, 'right');
    y += 20;
    drawSeparator(ctx, y);

    y += 25;
    drawText(ctx, 'ITEM NAME', PADDING, y, `bold 14px ${FONT_BASE}`);
    drawText(ctx, 'AMOUNT', canvasWidth - PADDING, y, `bold 14px ${FONT_BASE}`, 'right');
    y += 15;
    drawText(ctx, 'QTY X PRICE', PADDING, y, `bold 14px ${FONT_BASE}`);
    y += 10;
    drawSeparator(ctx, y);
    y += 25;
    
    const subtotal = template.serviceValue;
    const discount = template.serviceValue - template.packageValue;
    const total = template.packageValue;

    drawItemRow(ctx, y, template.name.toUpperCase(), `₹${total.toFixed(2)}`, `₹${total.toFixed(2)}`);
    y += 45;
    drawSeparator(ctx, y);
    
    y += 25;
    drawTotalRow(ctx, y, 'SUBTOTAL:', `₹${subtotal.toFixed(2)}`);
    y += 25;
    drawTotalRow(ctx, y, 'DISCOUNT:', `- ₹${discount.toFixed(2)}`);
    y += 15;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PADDING + 140, y);
    ctx.lineTo(canvasWidth - PADDING, y);
    ctx.stroke();
    y += 10;
    
    y += 15;
    drawTotalRow(ctx, y, 'TOTAL AMOUNT:', `₹${total.toFixed(2)}`, true);
    y += 10;
    ctx.beginPath();
    ctx.moveTo(PADDING + 140, y);
    ctx.lineTo(canvasWidth - PADDING, y);
    ctx.stroke();
    
    y += 40;
    drawText(ctx, '0', canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');
    y += 25;
    drawText(ctx, 'THANK YOU VISIT AGAIN!', canvasWidth / 2, y, `bold 14px ${FONT_BASE}`, 'center');
    y += 20;
    drawText(ctx, '- - - * - - -', canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');

    return canvas.toDataURL('image/png');
};