import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PackageTemplate, CustomerPackage, Outlet, ServiceRecord } from '../types';
import { generateBrandedPackageInvoiceImage } from './downloadBrandedPackage';

interface PackagesProps {
  isAdmin: boolean;
  packageTemplates: PackageTemplate[];
  customerPackages: CustomerPackage[];
  allCustomerPackages?: CustomerPackage[]; // For user search
  outlets: Outlet[];
  onAddTemplate?: (template: Omit<PackageTemplate, 'id'>) => Promise<void>;
  onDeleteTemplate?: (id: string) => Promise<void>;
  onAssignPackage?: (
    assignment: Omit<CustomerPackage, 'id' | 'assignedDate' | 'outletId' | 'remainingServiceValue' | 'packageTemplateId'>,
    templateId: string,
    initialServices: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[],
    date: string
  ) => Promise<CustomerPackage>;
  onRedeemFromPackage?: (
    customerPackageId: string,
    servicesToRedeem: Omit<ServiceRecord, 'id' | 'customerPackageId' | 'redeemedDate' | 'transactionId'>[],
    date: string
  ) => Promise<void>;
  serviceRecords?: ServiceRecord[];
  outlet?: Outlet | null;
}

// Helper function to convert a data URI to a Blob, which is more reliable for downloads
const dataURItoBlob = (dataURI: string): Blob | null => {
    try {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    } catch (error) {
        console.error("Failed to convert data URI to Blob", error);
        return null;
    }
};

export const Packages: React.FC<PackagesProps> = ({ isAdmin, packageTemplates, customerPackages, allCustomerPackages, outlets, onAddTemplate, onDeleteTemplate, onAssignPackage, onRedeemFromPackage, serviceRecords, outlet }) => {

  const getOutletName = (outletId: string) => outlets.find(o => o.id === outletId)?.name ?? 'N/A';
  const getTemplate = (templateId: string) => packageTemplates.find(t => t.id === templateId);
  
  const [historyModalPackage, setHistoryModalPackage] = useState<CustomerPackage | null>(null);
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);
  const [invoiceFilename, setInvoiceFilename] = useState<string>('');

  const generateAndShowRedemptionBill = async (transaction: ServiceRecord[], packageInfo: CustomerPackage) => {
    try {
        const packageOutlet = outlets.find(o => o.id === packageInfo.outletId);
        if (!packageOutlet) {
            throw new Error("Could not find outlet information for this package.");
        }

        const canvas = document.createElement('canvas');
        const FONT_BASE = '"Courier New", Courier, monospace';
        const PADDING = 25;
        const CANVAS_WIDTH = 450;
        
        const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, align: CanvasTextAlign = 'left', color = '#000000') => {
            ctx.font = font;
            ctx.textAlign = align;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
        };

        const drawMultiLineText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, lineHeight: number, align: CanvasTextAlign = 'center') => {
            const lines = (text || '').split('\n');
            lines.forEach((line, index) => {
                drawText(ctx, line, x, y + (index * lineHeight), font, align);
            });
            return y + ((lines.length -1) * lineHeight);
        };

        const drawSeparator = (ctx: CanvasRenderingContext2D, y: number) => {
            drawText(ctx, '-'.repeat(42), CANVAS_WIDTH / 2, y, `14px ${FONT_BASE}`, 'center');
        };
        
        const services = transaction;
        const dynamicHeight = 650 + (services.length * 25);
        canvas.width = CANVAS_WIDTH;
        canvas.height = dynamicHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { throw new Error('Failed to create canvas context for bill generation.'); }
        
        let y = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        y = 50;
        drawText(ctx, 'Naturals', CANVAS_WIDTH / 2, y, `bold 40px sans-serif`, 'center');
        y += 30;
        drawText(ctx, "India's No.1 hair and beauty salon", CANVAS_WIDTH / 2, y, `16px sans-serif`, 'center');
        y += 35;
        drawText(ctx, packageOutlet.name, CANVAS_WIDTH / 2, y, `bold 18px ${FONT_BASE}`, 'center');
        y += 20;
        y = drawMultiLineText(ctx, packageOutlet.address, CANVAS_WIDTH / 2, y, `14px ${FONT_BASE}`, 18, 'center');
        y += 25;
        drawText(ctx, `GSTIN: ${packageOutlet.gstin}`, CANVAS_WIDTH / 2, y, `14px ${FONT_BASE}`, 'center');
        y += 20;
        drawText(ctx, `PHONE: ${packageOutlet.phone}`, CANVAS_WIDTH / 2, y, `14px ${FONT_BASE}`, 'center');
        y += 20;
        drawSeparator(ctx, y);

        y += 25;
        drawText(ctx, `NAME: ${packageInfo.customerName}`, PADDING, y, `14px ${FONT_BASE}`);
        y += 20;
        drawText(ctx, `PHONE: ${packageInfo.customerMobile}`, PADDING, y, `14px ${FONT_BASE}`);
        y += 25;
        const billDate = new Date(services[0].redeemedDate);
        drawText(ctx, `BILL NO: ${services[0].transactionId.slice(-6).toUpperCase()}`, PADDING, y, `14px ${FONT_BASE}`);
        drawText(ctx, `DATE: ${billDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`, CANVAS_WIDTH - PADDING, y, `14px ${FONT_BASE}`, 'right');
        y += 20;
        drawText(ctx, `TIME: ${billDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`, CANVAS_WIDTH - PADDING, y, `14px ${FONT_BASE}`, 'right');
        y += 20;
        drawSeparator(ctx, y);

        y += 25;
        drawText(ctx, 'SERVICE', PADDING, y, `bold 14px ${FONT_BASE}`);
        drawText(ctx, 'VALUE', CANVAS_WIDTH - PADDING, y, `bold 14px ${FONT_BASE}`, 'right');
        y += 10;
        drawSeparator(ctx, y);
        y += 25;
        
        services.forEach(service => {
            drawText(ctx, service.serviceName.toUpperCase(), PADDING, y, `16px ${FONT_BASE}`);
            drawText(ctx, `₹${service.serviceValue.toFixed(2)}`, CANVAS_WIDTH - PADDING, y, `16px ${FONT_BASE}`, 'right');
            y += 25;
        });
        y += 10;
        drawSeparator(ctx, y);

        const totalRedeemedValue = services.reduce((sum, s) => sum + s.serviceValue, 0);
        y += 25;
        drawText(ctx, 'Total Redeemed Value:', CANVAS_WIDTH - PADDING - 100, y, `bold 16px ${FONT_BASE}`, 'right');
        drawText(ctx, `₹${totalRedeemedValue.toFixed(2)}`, CANVAS_WIDTH - PADDING, y, `bold 16px ${FONT_BASE}`, 'right');
        y += 25;
        drawText(ctx, 'Amount Paid:', CANVAS_WIDTH - PADDING - 100, y, `16px ${FONT_BASE}`, 'right');
        drawText(ctx, `₹0.00`, CANVAS_WIDTH - PADDING, y, `16px ${FONT_BASE}`, 'right');
        y += 20;
  
        drawSeparator(ctx, y);
        y += 25;
        drawText(ctx, 'PACKAGE BALANCE', PADDING, y, `bold 16px ${FONT_BASE}`);
        y += 25;

        const balanceBefore = packageInfo.remainingServiceValue + totalRedeemedValue;
        drawText(ctx, 'Balance Before:', CANVAS_WIDTH - PADDING - 100, y, `16px ${FONT_BASE}`, 'right');
        drawText(ctx, `₹${balanceBefore.toFixed(2)}`, CANVAS_WIDTH - PADDING, y, `16px ${FONT_BASE}`, 'right');
        y += 25;
        drawText(ctx, 'This Redemption:', CANVAS_WIDTH - PADDING - 100, y, `16px ${FONT_BASE}`, 'right');
        drawText(ctx, `- ₹${totalRedeemedValue.toFixed(2)}`, CANVAS_WIDTH - PADDING, y, `16px ${FONT_BASE}`, 'right');
        y += 15;
        
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH - PADDING - 150, y);
        ctx.lineTo(CANVAS_WIDTH - PADDING, y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        y += 10;

        drawText(ctx, 'Remaining Balance:', CANVAS_WIDTH - PADDING - 100, y, `bold 16px ${FONT_BASE}`, 'right');
        drawText(ctx, `₹${packageInfo.remainingServiceValue.toFixed(2)}`, CANVAS_WIDTH - PADDING, y, `bold 16px ${FONT_BASE}`, 'right');
        y += 25;
        drawSeparator(ctx, y);

        y += 30;
        drawText(ctx, 'THANK YOU VISIT AGAIN!', CANVAS_WIDTH / 2, y, `bold 14px ${FONT_BASE}`, 'center');

        setInvoiceImage(canvas.toDataURL('image/png'));
        setInvoiceFilename(`redemption-bill-${packageInfo.customerName.replace(/\s+/g, '-')}-${services[0].transactionId.slice(-6)}.png`);

    } catch (error) {
        console.error("Failed to generate and show redemption bill:", error);
        alert(`Failed to generate bill: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDownloadInvoice = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (!invoiceImage || !invoiceFilename) return;

      const blob = dataURItoBlob(invoiceImage);
      if (!blob) {
          alert("Sorry, there was an error preparing the download.");
          return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', invoiceFilename);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  const AdminView = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [packageValue, setPackageValue] = useState('');
    const [serviceValue, setServiceValue] = useState('');
    const [packageName, setPackageName] = useState('Pay 0 Get 0');

    useEffect(() => {
        const pv = Number(packageValue) || 0;
        const sv = Number(serviceValue) || 0;
        setPackageName(`Pay ${pv} Get ${sv}`);
    }, [packageValue, serviceValue]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onAddTemplate && packageValue && serviceValue) {
            await onAddTemplate({
                name: packageName,
                packageValue: Number(packageValue),
                serviceValue: Number(serviceValue),
            });
            setIsModalOpen(false);
            setPackageValue('');
            setServiceValue('');
        }
    };
    
    const handleViewInvoice = async (pkg: CustomerPackage) => {
      const template = getTemplate(pkg.packageTemplateId);
      const pkgOutlet = outlets.find(o => o.id === pkg.outletId);
      const initialServicesForPackage = serviceRecords?.filter(sr => sr.customerPackageId === pkg.id && new Date(sr.redeemedDate).getTime() === new Date(pkg.assignedDate).getTime()) || [];

      if (!template || !pkgOutlet) {
        alert("Could not find package template or outlet info.");
        return;
      }
      try {
        const image = await generateBrandedPackageInvoiceImage(pkg, template, pkgOutlet, initialServicesForPackage);
        setInvoiceImage(image);
        setInvoiceFilename(`invoice-${pkg.customerName.replace(/\s+/g, '-')}-${pkg.id.slice(-4)}.png`);
      } catch (error) {
        console.error("Failed to generate invoice:", error);
        alert(`Error generating invoice: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">Manage Packages</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition-colors">
                    New Package Template
                </button>
            </div>
            <div className="space-y-3">
                <h2 className="text-xl font-semibold">Available Templates</h2>
                {packageTemplates.length > 0 ? (
                  packageTemplates.map(template => (
                    <div key={template.id} className="bg-brand-surface border border-brand-border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{template.name}</p>
                        <p className="text-sm text-brand-text-secondary">Pay: {template.packageValue}, Services: {template.serviceValue}</p>
                      </div>
                      <button onClick={() => onDeleteTemplate && onDeleteTemplate(template.id)} className="text-red-500 hover:text-red-600">Delete</button>
                    </div>
                  ))
                ) : (
                  <p className="text-brand-text-secondary text-center py-4">No package templates created yet.</p>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm border border-brand-border">
                        <h2 className="text-2xl font-bold mb-4">Create Package Template</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="number" placeholder="Package Value (Pay)" value={packageValue} onChange={e => setPackageValue(e.target.value)} required className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border" />
                            <input type="number" placeholder="Service Value (Get)" value={serviceValue} onChange={e => setServiceValue(e.target.value)} required className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border" />
                            <div className="text-center p-2 bg-brand-background rounded-md">
                                <span className="font-semibold">{packageName}</span>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-100 text-brand-text-primary py-2 px-4 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:opacity-90">Save Template</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <h2 className="text-xl font-semibold">All Customer Packages</h2>
                {customerPackages.length > 0 ? (
                  customerPackages.map(pkg => {
                    const template = getTemplate(pkg.packageTemplateId);
                    return (
                      <div key={pkg.id} className="bg-brand-surface border border-brand-border p-4 rounded-lg">
                          <p className="font-bold">{pkg.customerName} - {pkg.customerMobile}</p>
                          <p className="text-sm text-brand-text-secondary">{template?.name} at {getOutletName(pkg.outletId)}</p>
                          <p className="text-sm">Remaining Value: <span className="font-bold text-green-600">₹{pkg.remainingServiceValue}</span></p>
                          <div className="mt-2 space-x-2">
                            <button onClick={() => setHistoryModalPackage(pkg)} className="text-sm text-blue-500 hover:underline">History</button>
                            <button onClick={() => handleViewInvoice(pkg)} className="text-sm text-purple-500 hover:underline">View Invoice</button>
                          </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-brand-text-secondary text-center py-4">No customer packages have been assigned yet.</p>
                )}
            </div>
        </div>
    );
  };

  const UserView = () => {
    const [activeView, setActiveView] = useState<'assign' | 'redeem'>('assign');
    
    // Assign State
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [initialServices, setInitialServices] = useState<{ name: string; value: string; }[]>([]);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    // Redeem State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<CustomerPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<CustomerPackage | null>(null);
    const [servicesToRedeem, setServicesToRedeem] = useState<{ name: string; value: string; }[]>([]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            const results = (allCustomerPackages || []).filter(p => 
                p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.customerMobile.includes(searchTerm)
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, allCustomerPackages]);
    
    const handleAddInitialService = () => setInitialServices([...initialServices, { name: '', value: '' }]);
    const handleRemoveInitialService = (index: number) => setInitialServices(initialServices.filter((_, i) => i !== index));
    const handleInitialServiceChange = (index: number, field: 'name' | 'value', val: string) => {
        const updated = [...initialServices];
        updated[index][field] = val;
        setInitialServices(updated);
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onAssignPackage || !selectedTemplateId) {
            alert("Please select a package template.");
            return;
        }

        const template = getTemplate(selectedTemplateId);
        if(!template) return;

        const initialServicesParsed = initialServices
            .filter(s => s.name && s.value)
            .map(s => ({ serviceName: s.name, serviceValue: parseFloat(s.value) }));
        
        const totalInitialValue = initialServicesParsed.reduce((sum, s) => sum + s.serviceValue, 0);
        if (totalInitialValue > template.serviceValue) {
            alert(`Initial services value (₹${totalInitialValue}) cannot exceed total service value of the package (₹${template.serviceValue}).`);
            return;
        }
        
        try {
            const newPackage = await onAssignPackage(
                { customerName, customerMobile },
                selectedTemplateId,
                initialServicesParsed,
                date
            );
            
            if (outlet) {
               const image = await generateBrandedPackageInvoiceImage(newPackage, template, outlet, initialServicesParsed.map(s => ({...s, id: '', customerPackageId: newPackage.id, redeemedDate: new Date(date), transactionId: '' })));
               setInvoiceImage(image);
               setInvoiceFilename(`invoice-${newPackage.customerName.replace(/\s+/g, '-')}-${newPackage.id.slice(-4)}.png`);
            }

            setCustomerName('');
            setCustomerMobile('');
            setSelectedTemplateId('');
            setInitialServices([]);
            setDate(new Date().toISOString().slice(0, 10));

        } catch(error) {
            console.error("Failed to assign package:", error);
            alert(`Error assigning package: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    
    const handleAddServiceToRedeem = () => setServicesToRedeem([...servicesToRedeem, { name: '', value: '' }]);
    const handleRemoveServiceToRedeem = (index: number) => setServicesToRedeem(servicesToRedeem.filter((_, i) => i !== index));
    const handleServiceToRedeemChange = (index: number, field: 'name' | 'value', val: string) => {
        const updated = [...servicesToRedeem];
        updated[index][field] = val;
        setServicesToRedeem(updated);
    };
    
    const handleRedeemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onRedeemFromPackage || !selectedPackage) {
            alert("Please select a customer package.");
            return;
        }
        const servicesParsed = servicesToRedeem
            .filter(s => s.name && s.value)
            .map(s => ({ serviceName: s.name, serviceValue: parseFloat(s.value) }));
        
        if (servicesParsed.length === 0) {
            alert("Please add at least one service to redeem.");
            return;
        }
        
        try {
            await onRedeemFromPackage(selectedPackage.id, servicesParsed, date);

            const tempTransactionId = `temp-id-${Date.now()}`;
            const transactionForBill: ServiceRecord[] = servicesParsed.map(s => ({
                id: `temp-${Math.random()}`,
                customerPackageId: selectedPackage.id,
                serviceName: s.serviceName,
                serviceValue: s.serviceValue,
                redeemedDate: new Date(date),
                transactionId: tempTransactionId,
            }));

            const totalRedeemed = servicesParsed.reduce((sum, s) => sum + s.serviceValue, 0);
            const updatedPackageInfo: CustomerPackage = {
                ...selectedPackage,
                remainingServiceValue: selectedPackage.remainingServiceValue - totalRedeemed
            };

            await generateAndShowRedemptionBill(transactionForBill, updatedPackageInfo);

            setSelectedPackage(null);
            setSearchTerm('');
            setServicesToRedeem([]);
            setDate(new Date().toISOString().slice(0, 10));
            
        } catch(error) {
            console.error("Failed to redeem from package:", error);
            alert(`Error redeeming services: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    
    const handleSelectPackage = (pkg: CustomerPackage) => {
        setSelectedPackage(pkg);
        setSearchTerm('');
        setSearchResults([]);
    };
    
    const handleViewInvoice = async (pkg: CustomerPackage) => {
      const template = getTemplate(pkg.packageTemplateId);
      if (!template || !outlet) {
        alert("Could not find package template or outlet info.");
        return;
      }
      try {
        const initialServicesForPackage = serviceRecords?.filter(sr => sr.customerPackageId === pkg.id && new Date(sr.redeemedDate).getTime() === new Date(pkg.assignedDate).getTime()) || [];
        const image = await generateBrandedPackageInvoiceImage(pkg, template, outlet, initialServicesForPackage);
        setInvoiceImage(image);
        setInvoiceFilename(`invoice-${pkg.customerName.replace(/\s+/g, '-')}-${pkg.id.slice(-4)}.png`);
      } catch (error) {
        console.error("Failed to generate invoice:", error);
        alert(`Error generating invoice: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    const HistoryModal = ({ packageInfo, packageRecords, onClose, onDownloadBill }: {
      packageInfo: CustomerPackage,
      packageRecords: ServiceRecord[],
      onClose: () => void,
      onDownloadBill: (transaction: ServiceRecord[], packageInfo: CustomerPackage) => void
    }) => {

        const groupedTransactions = useMemo(() => {
            if (!packageRecords || packageRecords.length === 0) return {};
    
            const transactionsById = packageRecords.reduce((acc, record) => {
                acc[record.transactionId] = acc[record.transactionId] || [];
                acc[record.transactionId].push(record);
                return acc;
            }, {} as Record<string, ServiceRecord[]>);
    
            const transactionsByDate = Object.values(transactionsById).reduce((acc, transaction) => {
                const date = new Date(transaction[0].redeemedDate);
                const dateKey = date.toISOString().slice(0, 10);
                
                acc[dateKey] = acc[dateKey] || [];
                acc[dateKey].push(transaction);
                return acc;
            }, {} as Record<string, ServiceRecord[][]>);
            
            return transactionsByDate;
    
        }, [packageRecords]);
    
        const sortedDates = useMemo(() => {
            return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
        }, [groupedTransactions]);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-brand-surface rounded-xl p-6 w-full max-w-lg border border-brand-border max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold">Transaction History</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    <div className="overflow-y-auto flex-1 pr-2">
                        <div className="space-y-6">
                            {sortedDates.length > 0 ? (
                                sortedDates.map(dateStr => {
                                    const date = new Date(dateStr);
                                    const displayDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
                                    const transactionsOnDate = groupedTransactions[dateStr];
                                    
                                    return (
                                        <div key={dateStr}>
                                            <h3 className="text-lg font-bold text-brand-text-primary mb-2 border-b border-brand-border pb-1">
                                                {displayDate.toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </h3>
                                            <div className="space-y-4">
                                                {transactionsOnDate.map(transaction => (
                                                    <div key={transaction[0].transactionId} className="bg-brand-background p-3 rounded-lg">
                                                        <div className="flex justify-between items-start">
                                                            <ul className="space-y-1 w-full">
                                                                {transaction.map(service => (
                                                                    <li key={service.id} className="flex justify-between w-full">
                                                                        <span className="truncate pr-2">{service.serviceName}</span>
                                                                        <span className="ml-4 font-mono flex-shrink-0">₹{service.serviceValue.toFixed(2)}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <button 
                                                                onClick={() => onDownloadBill(transaction, packageInfo)}
                                                                className="ml-4 flex-shrink-0 text-xs bg-brand-primary text-white font-semibold py-1 px-2 rounded-md hover:opacity-90"
                                                            >
                                                                Bill
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-brand-text-secondary text-center py-8">No transaction history found for this package.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-center border-b border-brand-border">
                <button onClick={() => setActiveView('assign')} className={`px-6 py-3 font-semibold ${activeView === 'assign' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-secondary'}`}>Assign Package</button>
                <button onClick={() => setActiveView('redeem')} className={`px-6 py-3 font-semibold ${activeView === 'redeem' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-text-secondary'}`}>Redeem Services</button>
            </div>

            {activeView === 'assign' ? (
                <div className="max-w-xl mx-auto space-y-4">
                    <h1 className="text-2xl font-bold text-center">Assign New Package</h1>
                    <form onSubmit={handleAssignSubmit} className="bg-brand-surface p-6 rounded-lg border border-brand-border space-y-4">
                       <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border" />
                       <input type="tel" pattern="\d{10}" placeholder="Customer Mobile (10 digits)" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} required className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border" />
                       <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border" />
                       <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} required className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border">
                           <option value="">Select a Package</option>
                           {packageTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                       
                       <div className="pt-2">
                         <h3 className="font-semibold text-brand-text-secondary">Initial Services (Optional)</h3>
                         {initialServices.map((s, i) => (
                             <div key={i} className="flex gap-2 my-2">
                                 <input type="text" placeholder="Service Name" value={s.name} onChange={e => handleInitialServiceChange(i, 'name', e.target.value)} className="w-2/3 bg-brand-surface text-brand-text-primary p-2 rounded-lg border border-brand-border" />
                                 <input type="number" placeholder="Value" value={s.value} onChange={e => handleInitialServiceChange(i, 'value', e.target.value)} className="w-1/3 bg-brand-surface text-brand-text-primary p-2 rounded-lg border border-brand-border" />
                                 <button type="button" onClick={() => handleRemoveInitialService(i)} className="text-red-500 p-1 rounded-full hover:bg-red-100">&times;</button>
                             </div>
                         ))}
                         <button type="button" onClick={handleAddInitialService} className="text-sm text-brand-primary hover:underline">+ Add Service</button>
                       </div>

                       <button type="submit" className="w-full bg-brand-primary text-white py-3 font-semibold rounded-lg hover:opacity-90">Assign Package</button>
                    </form>
                </div>
            ) : (
                <div className="max-w-xl mx-auto space-y-4">
                     <h1 className="text-2xl font-bold text-center">Redeem from Package</h1>
                     <div className="bg-brand-surface p-6 rounded-lg border border-brand-border space-y-4">
                        {!selectedPackage ? (
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Search by name or mobile..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border"
                                />
                                {searchResults.length > 0 && (
                                    <ul className="absolute top-full left-0 right-0 bg-brand-surface border border-brand-border mt-1 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {searchResults.map(p => (
                                            <li key={p.id} onClick={() => handleSelectPackage(p)} className="p-3 hover:bg-brand-primary-light cursor-pointer">
                                                {p.customerName} - {p.customerMobile}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                             <form onSubmit={handleRedeemSubmit} className="space-y-4">
                                <div className="p-3 bg-brand-background rounded-lg border border-brand-border">
                                    <div className="flex justify-between items-center">
                                       <h3 className="font-bold">{selectedPackage.customerName}</h3>
                                       <button type="button" onClick={() => setSelectedPackage(null)} className="text-xs text-gray-500">Change</button>
                                    </div>
                                    <p className="text-sm">Balance: <span className="font-bold text-green-600">₹{selectedPackage.remainingServiceValue}</span></p>
                                </div>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-brand-surface text-brand-text-primary p-3 rounded-lg border border-brand-border" />
                                
                                <div className="pt-2">
                                    <h3 className="font-semibold text-brand-text-secondary">Services to Redeem</h3>
                                    {servicesToRedeem.map((s, i) => (
                                        <div key={i} className="flex gap-2 my-2">
                                            <input type="text" placeholder="Service Name" value={s.name} onChange={e => handleServiceToRedeemChange(i, 'name', e.target.value)} className="w-2/3 bg-brand-surface text-brand-text-primary p-2 rounded-lg border border-brand-border" />
                                            <input type="number" placeholder="Value" value={s.value} onChange={e => handleServiceToRedeemChange(i, 'value', e.target.value)} className="w-1/3 bg-brand-surface text-brand-text-primary p-2 rounded-lg border border-brand-border" />
                                            <button type="button" onClick={() => handleRemoveServiceToRedeem(i)} className="text-red-500 p-1 rounded-full hover:bg-red-100">&times;</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddServiceToRedeem} className="text-sm text-brand-primary hover:underline">+ Add Service</button>
                                </div>
                                
                                <button type="submit" className="w-full bg-brand-primary text-white py-3 font-semibold rounded-lg hover:opacity-90">Redeem & Generate Bill</button>
                             </form>
                        )}
                     </div>
                </div>
            )}
            
            <div className="max-w-xl mx-auto space-y-3">
              <h2 className="text-xl font-semibold">My Outlet's Customer Packages</h2>
                {customerPackages.length > 0 ? (
                  customerPackages.map(pkg => {
                    const template = getTemplate(pkg.packageTemplateId);
                    return (
                      <div key={pkg.id} className="bg-brand-surface border border-brand-border p-4 rounded-lg">
                          <p className="font-bold">{pkg.customerName} - {pkg.customerMobile}</p>
                          <p className="text-sm text-brand-text-secondary">{template?.name}</p>
                          <p className="text-sm">Remaining Value: <span className="font-bold text-green-600">₹{pkg.remainingServiceValue}</span></p>
                          <div className="mt-2 space-x-2">
                            <button onClick={() => setHistoryModalPackage(pkg)} className="text-sm text-blue-500 hover:underline">History</button>
                            <button onClick={() => handleViewInvoice(pkg)} className="text-sm text-purple-500 hover:underline">View Invoice</button>
                          </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-brand-text-secondary text-center py-4">No customer packages assigned in this outlet yet.</p>
                )}
            </div>

            {historyModalPackage && serviceRecords && (
                <HistoryModal
                    packageInfo={historyModalPackage}
                    packageRecords={serviceRecords.filter(r => r.customerPackageId === historyModalPackage.id)}
                    onClose={() => setHistoryModalPackage(null)}
                    onDownloadBill={generateAndShowRedemptionBill}
                />
            )}
        </div>
    );
  };
  
  return (
    <>
      {isAdmin ? <AdminView /> : <UserView />}

      {invoiceImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4"
          role="dialog"
          aria-modal="true"
        >
            <div className="bg-brand-surface rounded-xl p-4 w-full max-w-lg max-h-[90vh] flex flex-col border border-brand-border shadow-2xl">
                <h2 className="text-xl font-bold mb-4 flex-shrink-0 text-brand-text-primary">Invoice Preview</h2>
                <div className="overflow-y-auto flex-1 bg-gray-100 p-2 rounded-lg border border-brand-border">
                    <img src={invoiceImage} alt="Generated Invoice/Bill" className="w-full h-auto" />
                </div>
                <p className="text-xs text-brand-text-secondary text-center mt-2">On mobile, you can long-press the image to save it.</p>
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-brand-border flex-shrink-0">
                    <button onClick={() => setInvoiceImage(null)} className="bg-gray-100 text-brand-text-primary py-2 px-4 rounded-lg hover:bg-gray-200">
                        Close
                    </button>
                    <a 
                        href={invoiceImage} 
                        download={invoiceFilename}
                        onClick={handleDownloadInvoice}
                        className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:opacity-90 inline-block"
                    >
                        Download
                    </a>
                </div>
            </div>
        </div>
      )}
    </>
  );
};