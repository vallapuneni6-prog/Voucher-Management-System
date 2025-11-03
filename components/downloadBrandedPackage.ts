import { CustomerPackage, PackageTemplate, Outlet, ServiceRecord } from '../types';

export const generateBrandedPackageInvoiceImage = async (customerPackage: CustomerPackage, template: PackageTemplate, outlet: Outlet, initialServices: ServiceRecord[]): Promise<string> => {
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
    
    const drawTotalRow = (ctx: CanvasRenderingContext2D, y: number, label: string, value: string, isBold: boolean = false) => {
         drawText(ctx, label, canvasWidth - PADDING - 150, y, `${isBold ? 'bold ' : ''}16px ${FONT_BASE}`, 'right');
         drawText(ctx, value, canvasWidth - PADDING, y, `${isBold ? 'bold ' : ''}16px ${FONT_BASE}`, 'right');
    }

    const baseHeight = 750;
    const servicesHeight = initialServices.length > 0 ? (initialServices.length * 20) + 70 : 0;
    const dynamicHeight = baseHeight + servicesHeight;
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
    drawText(ctx, 'naturals', canvasWidth / 2, y, `bold 36px ${FONT_BASE}`, 'center', '#000000');
    y += 25;
    drawText(ctx, 'SALON | SPA | MAKEUP STUDIO', canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center', '#000000');
    y += 30;

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
    drawText(ctx, 'ITEM', PADDING, y, `bold 14px ${FONT_BASE}`);
    drawText(ctx, 'AMOUNT', canvasWidth - PADDING, y, `bold 14px ${FONT_BASE}`, 'right');
    y += 10;
    drawSeparator(ctx, y);
    y += 25;

    drawText(ctx, template.name.toUpperCase(), PADDING, y, `16px ${FONT_BASE}`);
    drawText(ctx, `₹${template.packageValue.toFixed(2)}`, canvasWidth - PADDING, y, `16px ${FONT_BASE}`, 'right');
    y += 25;
    drawSeparator(ctx, y);
    
    y += 25;
    drawTotalRow(ctx, y, 'AMOUNT PAID:', `₹${template.packageValue.toFixed(2)}`, true);
    y += 20;
    drawSeparator(ctx, y);

    y += 25;
    drawText(ctx, 'PACKAGE BALANCE DETAILS', PADDING, y, `bold 14px ${FONT_BASE}`);
    y += 10;
    drawSeparator(ctx, y);
    y += 25;

    drawTotalRow(ctx, y, 'Total Service Value:', `₹${template.serviceValue.toFixed(2)}`);
    y += 25;
    
    const totalInitialServiceValue = initialServices.reduce((sum, service) => sum + service.serviceValue, 0);

    if (totalInitialServiceValue > 0) {
        drawTotalRow(ctx, y, 'Initial Services Used:', `- ₹${totalInitialServiceValue.toFixed(2)}`);
        y += 15;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(canvasWidth - PADDING - 160, y);
        ctx.lineTo(canvasWidth - PADDING, y);
        ctx.stroke();
        y += 10;
    }

    y += 15;
    drawTotalRow(ctx, y, 'REMAINING BALANCE:', `₹${customerPackage.remainingServiceValue.toFixed(2)}`, true);
    y += 20;
    drawSeparator(ctx, y);

    if (initialServices.length > 0) {
        y += 25;
        drawText(ctx, 'INITIAL SERVICES REDEEMED', PADDING, y, `bold 14px ${FONT_BASE}`);
        y += 10;
        drawSeparator(ctx, y);
        y += 25;

        initialServices.forEach(service => {
            drawText(ctx, service.serviceName.toUpperCase(), PADDING, y, `14px ${FONT_BASE}`);
            drawText(ctx, `₹${service.serviceValue.toFixed(2)}`, canvasWidth - PADDING, y, `14px ${FONT_BASE}`, 'right');
            y += 20;
        });
        y += 10;
        drawSeparator(ctx, y);
    }

    y += 30;
    drawText(ctx, 'THANK YOU VISIT AGAIN!', canvasWidth / 2, y, `bold 14px ${FONT_BASE}`, 'center');
    y += 20;
    drawText(ctx, '- - - * - - -', canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');

    return canvas.toDataURL('image/png');
};