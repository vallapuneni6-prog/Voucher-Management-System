import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PackageTemplate, CustomerPackage, Outlet, ServiceRecord } from '../types';
import { downloadBrandedPackage } from './downloadBrandedPackage';
import { naturalsLogoBase64 } from './logo';

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

export const Packages: React.FC<PackagesProps> = ({ isAdmin, packageTemplates, customerPackages, allCustomerPackages, outlets, onAddTemplate, onDeleteTemplate, onAssignPackage, onRedeemFromPackage, serviceRecords, outlet }) => {

  const getOutletName = (outletId: string) => outlets.find(o => o.id === outletId)?.name ?? 'N/A';
  const getTemplate = (templateId: string) => packageTemplates.find(t => t.id === templateId);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">Manage Packages</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-colors">
                    New Package Template
                </button>
            </div>
            <div className="space-y-3">
                <h2 className="text-xl font-semibold">Available Templates</h2>
                {packageTemplates.length > 0 ? (
                  packageTemplates.map(template => (
                    <div key={template.id} className="bg-brand-surface p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{template.name}</p>
                        <p className="text-sm text-brand-text-secondary">Pay: {template.packageValue}, Services: {template.serviceValue}</p>
                      </div>
                      <button onClick={() => onDeleteTemplate && onDeleteTemplate(template.id)} className="text-red-500 hover:text-red-400">Delete</button>
                    </div>
                  ))
                ) : (
                  <p className="text-brand-text-secondary text-center py-4">No package templates created yet.</p>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
                        <h2 className="text-2xl font-bold mb-4">Create Package Template</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="number" placeholder="Package Value (Pay)" value={packageValue} onChange={e => setPackageValue(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                            <input type="number" placeholder="Service Value (Get)" value={serviceValue} onChange={e => setServiceValue(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                            <div className="text-center p-2 bg-gray-800 rounded-md">
                                <p className="text-brand-text-secondary text-sm">Generated Name</p>
                                <p className="font-bold">{packageName}</p>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                                <button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-500">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const UserView = () => {
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [historyModalPackage, setHistoryModalPackage] = useState<CustomerPackage | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // State for Assign Modal
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [assignServices, setAssignServices] = useState<{ name: string, value: string }[]>([{name: '', value: ''}]);
    const [assignDate, setAssignDate] = useState<string>(new Date().toISOString().slice(0, 10));
    
    // State for Redeem Modal
    const [redeemSearchMobile, setRedeemSearchMobile] = useState('');
    const [foundPackages, setFoundPackages] = useState<CustomerPackage[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [redeemServices, setRedeemServices] = useState<{ name: string, value: string }[]>([{name: '', value: ''}]);
    const [redeemError, setRedeemError] = useState<string | null>(null);
    const [redeemDate, setRedeemDate] = useState<string>(new Date().toISOString().slice(0, 10));
    
    const showToast = (message: string) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
    };

    // --- Assign Modal Logic ---
    const selectedTemplate = useMemo(() => packageTemplates.find(t => t.id === selectedTemplateId), [selectedTemplateId, packageTemplates]);
    const totalAssignServiceValue = useMemo(() => assignServices.reduce((sum, s) => sum + (Number(s.value) || 0), 0), [assignServices]);
    const assignRemainingBalance = useMemo(() => (selectedTemplate?.serviceValue || 0) - totalAssignServiceValue, [selectedTemplate, totalAssignServiceValue]);
    
    const openAssignModal = () => {
        setIsAssignModalOpen(true);
        if (packageTemplates.length > 0) setSelectedTemplateId(packageTemplates[0].id);
    };
    const closeAssignModal = useCallback(() => {
        setIsAssignModalOpen(false);
        setTimeout(() => {
            setCustomerName(''); setCustomerMobile(''); setSelectedTemplateId(''); setAssignServices([{ name: '', value: '' }]); setAssignDate(new Date().toISOString().slice(0, 10));
        }, 300);
    }, []);

    const handleAssignServiceChange = (index: number, field: 'name' | 'value', value: string) => {
        const newServices = [...assignServices];
        newServices[index][field] = value;
        setAssignServices(newServices);
    };
    const addAssignServiceRow = () => setAssignServices([...assignServices, { name: '', value: '' }]);
    const removeAssignServiceRow = (index: number) => setAssignServices(assignServices.filter((_, i) => i !== index));
    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onAssignPackage && selectedTemplateId && customerName && customerMobile) {
            const initialServices = assignServices.filter(s => s.name && s.value).map(s => ({ serviceName: s.name, serviceValue: Number(s.value) }));
            const newPackage = await onAssignPackage({ customerName, customerMobile }, selectedTemplateId, initialServices, assignDate);
            closeAssignModal();
            showToast(`Package assigned to ${newPackage.customerName}.`);
        }
    };
    
    // --- Redeem Modal Logic ---
    const selectedPackageForRedemption = useMemo(() => foundPackages.find(p => p.id === selectedPackageId), [selectedPackageId, foundPackages]);
    const totalRedeemServiceValue = useMemo(() => redeemServices.reduce((sum, s) => sum + (Number(s.value) || 0), 0), [redeemServices]);
    const redeemRemainingBalance = useMemo(() => (selectedPackageForRedemption?.remainingServiceValue || 0) - totalRedeemServiceValue, [selectedPackageForRedemption, totalRedeemServiceValue]);
    const isRedemptionInvalid = useMemo(() => redeemRemainingBalance < 0, [redeemRemainingBalance]);

    const openRedeemModal = () => setIsRedeemModalOpen(true);
    const closeRedeemModal = useCallback(() => {
        setIsRedeemModalOpen(false);
        setTimeout(() => {
            setRedeemSearchMobile(''); setFoundPackages([]); setSelectedPackageId(null); setRedeemServices([{ name: '', value: '' }]); setRedeemError(null); setRedeemDate(new Date().toISOString().slice(0, 10));
        }, 300);
    }, []);
    const handleRedeemSearch = () => {
      setRedeemError(null);
      setSelectedPackageId(null);
      const packages = allCustomerPackages?.filter(p => p.customerMobile === redeemSearchMobile) || [];
      if(packages.length === 0) {
        setRedeemError("No packages found for this mobile number.");
      }
      setFoundPackages(packages);
    };
    const handleRedeemServiceChange = (index: number, field: 'name' | 'value', value: string) => {
        const newServices = [...redeemServices];
        newServices[index][field] = value;
        setRedeemServices(newServices);
    };
    const addRedeemServiceRow = () => setRedeemServices([...redeemServices, { name: '', value: '' }]);
    const removeRedeemServiceRow = (index: number) => setRedeemServices(redeemServices.filter((_, i) => i !== index));
    const handleRedeemSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (onRedeemFromPackage && selectedPackageId && !isRedemptionInvalid) {
        const servicesToRedeem = redeemServices.filter(s => s.name && s.value).map(s => ({ serviceName: s.name, serviceValue: Number(s.value) }));
        if(servicesToRedeem.length > 0) {
            await onRedeemFromPackage(selectedPackageId, servicesToRedeem, redeemDate);
            showToast(`Services redeemed for ${selectedPackageForRedemption?.customerName}.`);
        }
        closeRedeemModal();
      }
    };
    
    // --- History Modal Logic ---
    const openHistoryModal = (pkg: CustomerPackage) => setHistoryModalPackage(pkg);
    const closeHistoryModal = () => setHistoryModalPackage(null);

    const handleDownloadBill = async (transaction: ServiceRecord[]) => {
      if (!historyModalPackage || !outlet) return;

      const canvas = document.createElement('canvas');
      const FONT_BASE = '"Courier New", Courier, monospace';
      const PADDING = 25;
      const canvasWidth = 450;

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
      };
      
      const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, align: 'left' | 'center' | 'right' = 'left', color = '#000000') => {
          ctx.font = font;
          ctx.textAlign = align;
          ctx.fillStyle = color;
          ctx.fillText(text, x, y);
      };

      const drawMultiLineText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, lineHeight: number, align: 'left' | 'center' | 'right' = 'center') => {
          const lines = text.split('\n');
          lines.forEach((line, index) => {
              drawText(ctx, line, x, y + (index * lineHeight), font, align);
          });
          return y + ((lines.length -1) * lineHeight);
      };

      const drawSeparator = (ctx: CanvasRenderingContext2D, y: number) => {
          drawText(ctx, '-'.repeat(42), canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');
      };
      
      const drawItemRow = (ctx: CanvasRenderingContext2D, y: number, name: string, mrp: number) => {
          drawText(ctx, name.toUpperCase(), PADDING, y, `bold 16px ${FONT_BASE}`, 'left');
          drawText(ctx, `1 X 0.00`, PADDING, y + 20, `14px ${FONT_BASE}`, 'left');
          drawText(ctx, `[MRP ${mrp.toFixed(2)}]`, PADDING + 90, y + 20, `14px ${FONT_BASE}`, 'left');
          drawText(ctx, `0 (${mrp.toFixed(2)})`, canvasWidth - PADDING, y + 20, `16px ${FONT_BASE}`, 'right');
          return y + 25;
      };
      
      const drawTotalRow = (ctx: CanvasRenderingContext2D, y: number, label: string, value: string, isBold: boolean = false) => {
           drawText(ctx, label, PADDING + 150, y, `${isBold ? 'bold ' : ''}16px ${FONT_BASE}`, 'right');
           drawText(ctx, value, canvasWidth - PADDING, y, `${isBold ? 'bold ' : ''}16px ${FONT_BASE}`, 'right');
      }

      const subtotal = transaction.reduce((sum, s) => sum + s.serviceValue, 0);
      const dynamicHeight = 700 + (transaction.length * 45);
      canvas.width = canvasWidth;
      canvas.height = dynamicHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let y = 0;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const logoImg = await loadImage(naturalsLogoBase64);
      const logoWidth = 250;
      const logoHeight = logoImg.height * (logoWidth / logoImg.width);
      const logoX = (canvas.width - logoWidth) / 2;
      
      y = 20;
      ctx.drawImage(logoImg, logoX, y, logoWidth, logoHeight);
      y += logoHeight;
      y += 20;

      drawText(ctx, outlet.name, canvasWidth / 2, y, `bold 18px ${FONT_BASE}`, 'center');
      y += 20;
      y = drawMultiLineText(ctx, outlet.address, canvasWidth / 2, y, `14px ${FONT_BASE}`, 18, 'center');
      y += 25;
      drawText(ctx, `GSTIN: ${outlet.gstin}`, canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');
      y += 20;
      drawText(ctx, `PHONE: ${outlet.phone}`, canvasWidth / 2, y, `14px ${FONT_BASE}`, 'center');
      y += 20;
      drawSeparator(ctx, y);

      y += 25;
      drawText(ctx, `NAME: ${historyModalPackage.customerName}`, PADDING, y, `14px ${FONT_BASE}`);
      y += 20;
      drawText(ctx, `PHONE: ${historyModalPackage.customerMobile}`, PADDING, y, `14px ${FONT_BASE}`);
      y += 25;
      const billDate = new Date(transaction[0].redeemedDate);
      drawText(ctx, `BILL NO: ${transaction[0].transactionId.slice(-6).toUpperCase()}`, PADDING, y, `14px ${FONT_BASE}`);
      drawText(ctx, `DATE: ${billDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`, canvasWidth - PADDING, y, `14px ${FONT_BASE}`, 'right');
      y += 20;
      drawText(ctx, `TIME: ${billDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`, canvasWidth - PADDING, y, `14px ${FONT_BASE}`, 'right');
      y += 20;
      drawSeparator(ctx, y);

      y += 25;
      drawText(ctx, 'ITEM NAME', PADDING, y, `bold 14px ${FONT_BASE}`);
      drawText(ctx, 'AMOUNT (SAVINGS)', canvasWidth - PADDING, y, `bold 14px ${FONT_BASE}`, 'right');
      y += 15;
      drawText(ctx, 'QTY X PRICE', PADDING, y, `bold 14px ${FONT_BASE}`);
      y += 10;
      drawSeparator(ctx, y);
      y += 25;
      
      transaction.forEach(service => {
        y = drawItemRow(ctx, y, service.serviceName, service.serviceValue);
      });
      y += 20;
      drawSeparator(ctx, y);

      y += 25;
      drawTotalRow(ctx, y, 'SUBTOTAL:', `₹${subtotal.toFixed(2)}`);
      y += 25;
      drawTotalRow(ctx, y, 'DISCOUNT:', `- ₹${subtotal.toFixed(2)}`);
      y += 15;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(PADDING + 140, y);
      ctx.lineTo(canvasWidth - PADDING, y);
      ctx.stroke();
      y += 10;
      
      y += 15;
      drawTotalRow(ctx, y, 'TOTAL AMOUNT:', `₹0.00`, true);
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


      const link = document.createElement('a');
      link.download = `bill-${historyModalPackage.customerName.replace(/\s+/g, '-')}-${transaction[0].transactionId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    const HistoryModal = () => {
        if (!historyModalPackage || !serviceRecords) return null;

        const packageRecords = serviceRecords.filter(r => r.customerPackageId === historyModalPackage.id);
        
        const groupedRecords = packageRecords.reduce((acc, record) => {
            (acc[record.transactionId] = acc[record.transactionId] || []).push(record);
            return acc;
        }, {} as Record<string, ServiceRecord[]>);

        const sortedTransactions = Object.values(groupedRecords).sort((a, b) => 
            new Date(b[0].redeemedDate).getTime() - new Date(a[0].redeemedDate).getTime()
        );

        return (
             <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="bg-brand-surface rounded-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 flex-shrink-0">Transaction History</h2>
                    <p className="text-brand-text-secondary mb-1 flex-shrink-0">For: {historyModalPackage.customerName}</p>
                    <p className="text-sm text-brand-text-secondary mb-4 flex-shrink-0">Package: {getTemplate(historyModalPackage.packageTemplateId)?.name}</p>
                    
                    <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                        {sortedTransactions.length > 0 ? sortedTransactions.map((transaction, index) => (
                             <div key={index} className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                  <div>
                                    <p className="font-semibold">{new Date(transaction[0].redeemedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-xs text-brand-text-secondary">Bill No: {transaction[0].transactionId.slice(-6).toUpperCase()}</p>
                                  </div>
                                  <button onClick={() => handleDownloadBill(transaction)} className="bg-brand-secondary text-white font-semibold py-1 px-3 text-sm rounded-md hover:bg-green-500">Download Bill</button>
                                </div>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {transaction.map(record => (
                                        <li key={record.id} className="flex justify-between">
                                            <span>{record.serviceName}</span>
                                            <span>₹{record.serviceValue.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                             </div>
                        )) : (
                           <p className="text-brand-text-secondary text-center py-6">No service history for this package yet.</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 mt-4 border-t border-gray-700 flex-shrink-0">
                        <button onClick={closeHistoryModal} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Close</button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">Packages</h1>
                <div className="flex justify-center flex-wrap gap-4 mt-4">
                  <button onClick={openRedeemModal} className="bg-brand-primary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-indigo-500 transition-colors">
                      Redeem Service
                  </button>
                  <button onClick={openAssignModal} className="bg-brand-secondary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-500 transition-colors">
                      Assign Package
                  </button>
                </div>
            </div>

            {toastMessage && (
              <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                {toastMessage}
              </div>
            )}
           
            <div>
                <h2 className="text-2xl font-semibold text-brand-text-primary mt-8">Assigned Packages at Your Outlet</h2>
                <div className="space-y-3 mt-4">
                    {customerPackages.length > 0 ? (
                        [...customerPackages].reverse().map(cp => {
                            const template = getTemplate(cp.packageTemplateId);
                            return (
                                <div key={cp.id} className="bg-brand-surface p-4 rounded-lg flex flex-col sm:flex-row justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold">{template?.name || 'Unknown Package'}</p>
                                        <p className="text-sm text-brand-text-primary">To: {cp.customerName} ({cp.customerMobile})</p>
                                        <p className="text-xs text-brand-text-secondary">Assigned on: {cp.assignedDate.toLocaleDateString()}</p>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:text-right flex-shrink-0 sm:pl-4">
                                        <p className="text-sm text-brand-text-secondary">Remaining Value</p>
                                        <p className="text-lg font-bold text-brand-secondary mb-2">₹{cp.remainingServiceValue.toLocaleString()}</p>
                                        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 items-center">
                                            <button onClick={() => openHistoryModal(cp)} className="text-sm text-brand-primary hover:underline">
                                                View History
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if (template && outlet) {
                                                        await downloadBrandedPackage(cp, template, outlet);
                                                    }
                                                }}
                                                className="text-sm bg-brand-secondary text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-green-500 transition-colors"
                                            >
                                                Download Invoice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-brand-text-secondary text-center py-4">No packages assigned from this outlet yet.</p>
                    )}
                </div>
            </div>

            {/* Assign Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-surface rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Assign New Package</h2>
                        <form onSubmit={handleAssignSubmit} className="space-y-4">
                            <div>
                               <label className="text-sm text-brand-text-secondary mb-1 block">Date</label>
                               <input type="date" value={assignDate} onChange={e => setAssignDate(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600" />
                            </div>
                            <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600" />
                            <input type="tel" placeholder="Customer Mobile" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} required pattern="\d{10}" className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600" />
                            <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600">
                                <option value="" disabled>Select a Package</option>
                                {packageTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {selectedTemplate && <div className="p-3 bg-gray-800 rounded-lg text-center"><span className="text-brand-text-secondary">Total Service Value: </span><span className="font-bold text-brand-text-primary">₹{selectedTemplate.serviceValue.toLocaleString()}</span></div>}
                            <div className="border-t border-gray-700 pt-4"><h3 className="font-semibold mb-2">Add Initial Services (Optional)</h3><div className="space-y-2 max-h-40 overflow-y-auto pr-2">{assignServices.map((service, index) => (<div key={index} className="flex items-center gap-2"><input type="text" placeholder="Service Name" value={service.name} onChange={e => handleAssignServiceChange(index, 'name', e.target.value)} className="w-2/3 bg-gray-700 text-white p-2 rounded-lg border border-gray-600" /><input type="number" placeholder="Value" value={service.value} onChange={e => handleAssignServiceChange(index, 'value', e.target.value)} className="w-1/3 bg-gray-700 text-white p-2 rounded-lg border border-gray-600" /><button type="button" onClick={() => removeAssignServiceRow(index)} className="text-red-500 hover:text-red-400 p-1 flex-shrink-0">&times;</button></div>))}{' '}</div><button type="button" onClick={addAssignServiceRow} className="text-sm mt-2 text-brand-primary hover:underline">+ Add another service</button></div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700"><div className="p-3 bg-gray-800 rounded-lg text-center"><p className="text-brand-text-secondary text-sm">Total Services Added</p><p className="font-bold text-brand-primary">₹{totalAssignServiceValue.toLocaleString()}</p></div><div className="p-3 bg-gray-800 rounded-lg text-center"><p className="text-brand-text-secondary text-sm">Remaining Balance</p><p className="font-bold text-brand-secondary">₹{assignRemainingBalance.toLocaleString()}</p></div></div>
                            <div className="flex justify-end space-x-3 pt-2"><button type="button" onClick={closeAssignModal} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button><button type="submit" className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-500">Assign Package</button></div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Redeem Modal */}
            {isRedeemModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-surface rounded-xl flex flex-col w-full max-w-lg max-h-[90vh]">
                        <div className="p-6 border-b border-gray-700 flex-shrink-0">
                           <h2 className="text-2xl font-bold">Redeem Service from Package</h2>
                        </div>
                        
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Step 1 & 2: Search and Select */}
                            {!selectedPackageForRedemption && (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input type="tel" placeholder="Customer Mobile" value={redeemSearchMobile} onChange={e => setRedeemSearchMobile(e.target.value)} pattern="\d{10}" className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600" />
                                        <button onClick={handleRedeemSearch} className="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500">Find</button>
                                    </div>
                                    
                                    {redeemError && <p className="text-red-400 text-center text-sm">{redeemError}</p>}
                                    
                                    {foundPackages.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Select a package:</h3>
                                            {foundPackages.map(p => {
                                              const template = getTemplate(p.packageTemplateId);
                                              return (<button key={p.id} onClick={() => setSelectedPackageId(p.id)} className="w-full text-left bg-gray-800 hover:bg-gray-700 p-3 rounded-lg flex justify-between items-center"><span>{template?.name}</span><span className="font-bold text-brand-secondary">Bal: ₹{p.remainingServiceValue.toLocaleString()}</span></button>);
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Redeem */}
                            {selectedPackageForRedemption && (
                                <form id="redeem-form" onSubmit={handleRedeemSubmit} className="space-y-4">
                                  <div className="p-3 bg-gray-800 rounded-lg">
                                      <p className="font-bold text-center">{getTemplate(selectedPackageForRedemption.packageTemplateId)?.name}</p>
                                      <div className="flex justify-between items-center mt-2">
                                        <div>
                                            <label className="text-sm text-brand-text-secondary mb-1 block">Date</label>
                                            <input type="date" value={redeemDate} onChange={e => setRedeemDate(e.target.value)} required className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-brand-text-secondary">Current Balance</p>
                                            <p className="font-bold text-brand-text-primary text-lg">₹{selectedPackageForRedemption.remainingServiceValue.toLocaleString()}</p>
                                        </div>
                                      </div>
                                  </div>
                                  <div className="border-t border-gray-700 pt-4">
                                    <h3 className="font-semibold mb-2">Add Services to Redeem</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                      {redeemServices.map((service, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <input type="text" placeholder="Service Name" value={service.name} onChange={e => handleRedeemServiceChange(index, 'name', e.target.value)} className="w-2/3 bg-gray-700 text-white p-2 rounded-lg border border-gray-600" />
                                          <input type="number" placeholder="Value" value={service.value} onChange={e => handleRedeemServiceChange(index, 'value', e.target.value)} className="w-1/3 bg-gray-700 text-white p-2 rounded-lg border border-gray-600" />
                                          <button type="button" onClick={() => removeRedeemServiceRow(index)} className="text-red-500 hover:text-red-400 p-1 flex-shrink-0">&times;</button>
                                        </div>
                                      ))}
                                    </div>
                                    <button type="button" onClick={addRedeemServiceRow} className="text-sm mt-2 text-brand-primary hover:underline">+ Add another service</button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                                      <p className="text-brand-text-secondary text-sm">Total Redeeming</p>
                                      <p className={`font-bold ${isRedemptionInvalid ? 'text-red-500' : 'text-brand-primary'}`}>₹{totalRedeemServiceValue.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-gray-800 rounded-lg text-center">
                                      <p className="text-brand-text-secondary text-sm">New Balance</p>
                                      <p className={`font-bold ${isRedemptionInvalid ? 'text-red-500' : 'text-brand-secondary'}`}>{isRedemptionInvalid ? 'Not Enough Balance' : `₹${redeemRemainingBalance.toLocaleString()}`}</p>
                                    </div>
                                  </div>
                                </form>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-700 flex justify-end space-x-3 flex-shrink-0">
                           <button type="button" onClick={closeRedeemModal} className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500">Cancel</button>
                           {selectedPackageForRedemption && <button type="submit" form="redeem-form" disabled={isRedemptionInvalid} className="bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed">Redeem Services</button>}
                        </div>
                    </div>
                 </div>
            )}

            <HistoryModal />

        </div>
    );
  };
  
  if (isAdmin) {
    return <AdminView />;
  }
  return <UserView />;
};
