import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, Printer, Share2, Download, Menu } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string;
  vehicleNumber: string;
  paymentMethod?: string;
  services: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    amount: number;
  }>;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    amount: number;
    customerSupplied?: boolean;
  }>;
  subtotal: number;
  gst: number;
  discount: number;
  tax: number;
  total: number;
}

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

function getInvoiceHTML(container: HTMLElement): string {
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#2563eb';
  const clone = container.cloneNode(true) as HTMLElement;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${container.querySelector('h2')?.textContent || ''}</title>
<style>
  :root { --primary-color: ${themeColor}; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background: white; padding: 18px; }
  @page { margin: 1cm; size: A4 portrait; }
  table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
  .bg-theme { background-color: var(--primary-color); }
  .text-theme { color: var(--primary-color); }
  .bg-slate-50 { background-color: #f8fafc; }
  .border-b { border-bottom: 1px solid #e2e8f0; }
  .border-b-2 { border-bottom: 2px solid #e2e8f0; }
  .border-t { border-top: 1px solid #e2e8f0; }
  .border-slate-200 { border-color: #e2e8f0; }
  .border-slate-100 { border-color: #f1f5f9; }
  .text-slate-900 { color: #0f172a; }
  .text-slate-700 { color: #334155; }
  .text-slate-600 { color: #475569; }
  .text-slate-500 { color: #64748b; }
  .text-slate-400 { color: #94a3b8; }
  .text-white { color: white; }
  .text-xs { font-size: 0.75rem; }
  .text-sm { font-size: 0.875rem; }
  .text-base { font-size: 1rem; }
  .text-lg { font-size: 1.125rem; }
  .text-xl { font-size: 1.25rem; }
  .text-2xl { font-size: 1.5rem; }
  .text-3xl { font-size: 1.875rem; }
  .text-4xl { font-size: 2.25rem; }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }
  .text-center { text-align: center; }
  .uppercase { text-transform: uppercase; }
  .italic { font-style: italic; }
  .flex { display: flex; }
  .grid { display: grid; }
  .items-start { align-items: flex-start; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .flex-1 { flex: 1; }
  .flex-shrink-0 { flex-shrink: 0; }
  .gap-2 { gap: 0.5rem; }
  .gap-4 { gap: 1rem; }
  .gap-8 { gap: 2rem; }
  .gap-12 { gap: 1.5rem; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .grid-cols-\\[140px_1fr\\] { grid-template-columns: 140px 1fr; }
  .grid-cols-\\[1fr_140px\\] { grid-template-columns: 1fr 140px; }
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:gap-12 { gap: 1.5rem; }
  .md\\:text-right { text-align: right; }
  .invoice-details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
  .invoice-details-grid > div:last-child { text-align: right; }
  .space-y-3 > * + * { margin-top: 0.75rem; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-8 { margin-bottom: 2rem; }
  .mb-10 { margin-bottom: 2.5rem; }
  .ml-2 { margin-left: 0.5rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-8 { margin-top: 2rem; }
  .mt-16 { margin-top: 4rem; }
  .pb-3 { padding-bottom: 0.75rem; }
  .pb-4 { padding-bottom: 1rem; }
  .pb-6 { padding-bottom: 1.5rem; }
  .pt-2 { padding-top: 0.5rem; }
  .pt-6 { padding-top: 1.5rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .p-12 { padding: 1.5rem; }
  .w-16 { width: 4rem; }
  .w-24 { width: 6rem; }
  .w-32 { width: 8rem; }
  .w-96 { width: 24rem; }
  .h-16 { height: 4rem; }
  .w-10 { width: 2.5rem; }
  .h-10 { height: 2.5rem; }
  .w-full { width: 100%; }
  .rounded-xl { border-radius: 0.75rem; }
  .break-words { overflow-wrap: anywhere; word-break: break-word; }
  .whitespace-nowrap { white-space: nowrap; }
  .invoice-company-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem 2rem; }
  .invoice-company-grid > div { min-width: 0; }
  .invoice-header-row { display: flex; flex-direction: row; align-items: flex-start; }
  .invoice-company-email,
  .invoice-company-address { overflow-wrap: anywhere; word-break: break-word; }
  .invoice-company-phone,
  .invoice-customer-phone { white-space: nowrap; word-break: keep-all; }
  @media print {
    body { padding: 0; }
    * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
  }
</style>
</head>
<body>${clone.innerHTML}</body>
</html>`;
}

function openPrintWindow(container: HTMLElement) {
  const html = getInvoiceHTML(container);
  const printWin = window.open('', '_blank', 'width=900,height=700');
  if (!printWin) {
    alert('Please allow popups for this site to print invoices.');
    return;
  }
  printWin.document.write(html);
  printWin.document.close();
  printWin.onload = () => {
    printWin.focus();
    printWin.print();
  };
}

function downloadPDF(container: HTMLElement, filename: string) {
  const invoiceHTML = getInvoiceHTML(container);

  const pdfScript = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js"><\/script>
    <script>
      window.onload = function() {
        setTimeout(function() {
          html2pdf().set({
            margin: [10, 10, 10, 10],
            filename: '${filename.replace(/'/g, "\\'")}',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, windowWidth: 900, useCORS: true, logging: false, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          }).from(document.body).save().then(function() {
            window.parent.postMessage({ type: 'pdf-done' }, '*');
          }).catch(function(err) {
            console.error('PDF error inside iframe:', err);
            window.parent.postMessage({ type: 'pdf-error', message: err.message }, '*');
          });
        }, 300);
      };
    <\/script>`;

  const fullHTML = invoiceHTML.replace('</head>', pdfScript + '\n</head>');

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:900px;height:3000px;border:none;';
  document.body.appendChild(iframe);

  const cleanup = () => {
    try { document.body.removeChild(iframe); } catch { /* already removed */ }
  };

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'pdf-done' || event.data?.type === 'pdf-error') {
      window.removeEventListener('message', handler);
      if (event.data.type === 'pdf-error') {
        console.error('PDF error:', event.data.message);
      }
      setTimeout(cleanup, 1000);
    }
  };
  window.addEventListener('message', handler);

  const timeoutId = setTimeout(() => {
    window.removeEventListener('message', handler);
    cleanup();
  }, 30000);

  const origHandler = handler;
  const wrappedHandler = (event: MessageEvent) => {
    origHandler(event);
    if (event.data?.type === 'pdf-done' || event.data?.type === 'pdf-error') {
      clearTimeout(timeoutId);
    }
  };
  window.removeEventListener('message', handler);
  window.addEventListener('message', wrappedHandler);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    cleanup();
    window.removeEventListener('message', wrappedHandler);
    clearTimeout(timeoutId);
    alert('Could not generate PDF. Please use the Print button instead.');
    return;
  }

  iframeDoc.open();
  iframeDoc.write(fullHTML);
  iframeDoc.close();
}

export function InvoicePreview({ isOpen, onClose, invoiceData }: InvoicePreviewProps) {
  const { theme } = useTheme();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    openPrintWindow(invoiceRef.current);
  };

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;
    downloadPDF(invoiceRef.current, `Invoice-${invoiceData.invoiceNumber}.pdf`);
  };

  const handleShare = () => {
    alert("Share functionality - Integration pending");
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const displayName = theme.workshopName || 'MOMENTUM AUTOWORKS';
  const displayEmail = theme.workshopEmail || 'info@momentumauto.pk';
  const displayAddress = theme.workshopAddress || 'Soan Gardens, Islamabad';
  const displayPhone = theme.workshopPhone || '+92 300 1234567';
  const companyLogo = theme.logoPreview;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto pt-4 pb-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        {/* Action Bar */}
        <div className="bg-white rounded-t-lg px-4 sm:px-6 py-3.5 border-b border-slate-200 sticky top-4 z-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Invoice Details</h2>
            {/* Mobile: hamburger menu */}
            <div className="flex items-center justify-end sm:hidden">
              <DropdownMenu open={actionsOpen} onOpenChange={setActionsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0 text-theme border-theme-200 hover:bg-theme-50"
                    aria-label="Invoice actions"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onSelect={() => {
                      setActionsOpen(false);
                      handlePrint();
                    }}
                    className="cursor-pointer"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setActionsOpen(false);
                      handleDownloadPDF();
                    }}
                    className="cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setActionsOpen(false);
                      handleShare();
                    }}
                    className="cursor-pointer"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setActionsOpen(false);
                      onClose();
                    }}
                    className="cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop/tablet: full actions row */}
            <div className="hidden sm:flex flex-wrap items-center justify-end gap-2">
              <Button
                size="sm"
                className="h-9 text-xs sm:text-sm w-full xs:w-auto text-theme border-theme-200 hover:bg-theme-50 transition-colors"
                variant="outline"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPDF}
                className="h-9 text-xs sm:text-sm w-full xs:w-auto text-theme border-theme-200 hover:bg-theme-50 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShare}
                className="h-9 text-xs sm:text-sm w-full xs:w-auto text-theme border-theme-200 hover:bg-theme-50 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="h-9 text-xs sm:text-sm w-full xs:w-auto text-theme border-theme-200 hover:bg-theme-50 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="p-4 sm:p-8 md:p-12 bg-white rounded-b-lg">
          <div ref={invoiceRef}>
            {/* Header with Logo and Company Info */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8 pb-6 border-b border-slate-200">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={companyLogo ? {} : { backgroundColor: 'var(--primary-color, #c2272d)' }}>
                {companyLogo ? (
                  <img src={companyLogo} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 break-words">{displayName.toUpperCase()}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 text-sm">
                  <div className="break-words">
                    <p className="text-slate-500 font-medium mb-1">Email</p>
                    <p className="text-slate-700 break-words">{displayEmail}</p>
                  </div>
                  <div className="break-words">
                    <p className="text-slate-500 font-medium mb-1">Address</p>
                    <p className="text-slate-700 break-words">{displayAddress}</p>
                  </div>
                  <div className="break-words">
                    <p className="text-slate-500 font-medium mb-1">Phone</p>
                    <p className="text-slate-700 whitespace-nowrap sm:whitespace-normal break-words">{displayPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-theme">INVOICE</h2>
            </div>

            {/* Customer & Invoice Details - Responsive Columns */}
            <div className="invoice-details-grid grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-10">
              {/* Left Column - Customer Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Customer Name:</span>
                  <span className="text-sm text-slate-900">{invoiceData.customerName}</span>
                </div>
                <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Phone Number:</span>
                  <span className="text-sm text-slate-900">{invoiceData.customerPhone}</span>
                </div>
                <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Model:</span>
                  <span className="text-sm text-slate-900">
                    {invoiceData.vehicleMake} {invoiceData.vehicleModel} {invoiceData.vehicleYear || ''}
                  </span>
                </div>
                <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Registration Number:</span>
                  <span className="text-sm text-slate-900">{invoiceData.vehicleNumber}</span>
                </div>
                <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Payment Method:</span>
                  <span className="text-sm text-slate-900">{invoiceData.paymentMethod || 'CARD/POS'}</span>
                </div>
              </div>

              {/* Right Column - Invoice Details */}
              <div className="space-y-3 text-left md:text-right">
                <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Invoice No:</span>
                  <span className="text-sm text-slate-900">{invoiceData.invoiceNumber}</span>
                </div>
                <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Invoice Date:</span>
                  <span className="text-sm text-slate-900">{invoiceData.invoiceDate}</span>
                </div>
                <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] gap-2">
                  <span className="text-sm font-semibold text-slate-700">Time:</span>
                  <span className="text-sm text-slate-900">{currentTime}</span>
                </div>
              </div>
            </div>

            {/* Services Section */}
            {invoiceData.services.length > 0 && (
              <div className="mb-8">
                <div className="bg-slate-50 px-4 py-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase">Services</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-sm font-semibold text-slate-600 pb-3 pl-3 pr-2 sm:px-4">Description</th>
                      <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-2 sm:px-4 w-20 sm:w-24">Qty</th>
                      <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-2 sm:px-4 w-24 sm:w-32">Price</th>
                      <th className="text-right text-sm font-semibold text-slate-600 pb-3 pl-2 pr-2 sm:px-4 w-24 sm:w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.services.map((service, index) => (
                      <tr key={service.id} className={index !== invoiceData.services.length - 1 ? "border-b border-slate-100" : ""}>
                        <td className="text-sm text-slate-700 py-3 pl-3 pr-2 sm:px-4 break-words">{service.name}</td>
                        <td className="text-sm text-slate-700 py-3 px-2 sm:px-4 text-right">{service.quantity}</td>
                        <td className="text-sm text-slate-700 py-3 px-2 sm:px-4 text-right">₨{service.price.toLocaleString()}</td>
                        <td className="text-sm font-medium text-slate-900 py-3 pl-2 pr-2 sm:px-4 text-right">
                          ₨{service.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Products Section */}
            {invoiceData.products.length > 0 && (
              <div className="mb-8">
                <div className="bg-slate-50 px-4 py-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase">Products</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-sm font-semibold text-slate-600 pb-3 pl-3 pr-2 sm:px-4">Description</th>
                      <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-2 sm:px-4 w-20 sm:w-24">Qty</th>
                      <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-2 sm:px-4 w-24 sm:w-32">Price</th>
                      <th className="text-right text-sm font-semibold text-slate-600 pb-3 pl-2 pr-2 sm:px-4 w-24 sm:w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.products.map((product, index) => (
                      <tr key={product.id} className={index !== invoiceData.products.length - 1 ? "border-b border-slate-100" : ""}>
                        <td className="text-sm text-slate-700 py-3 pl-3 pr-2 sm:px-4 break-words">
                          {product.name}
                          {product.customerSupplied && (
                            <span className="ml-2 text-xs text-slate-500 italic">(Customer Supplied)</span>
                          )}
                        </td>
                        <td className="text-sm text-slate-700 py-3 px-2 sm:px-4 text-right">
                          {product.customerSupplied ? '-' : product.quantity}
                        </td>
                        <td className="text-sm text-slate-700 py-3 px-2 sm:px-4 text-right">
                          {product.customerSupplied ? '-' : `₨${product.price.toLocaleString()}`}
                        </td>
                        <td className="text-sm font-medium text-slate-900 py-3 pl-2 pr-2 sm:px-4 text-right">
                          {product.customerSupplied ? '₨0' : `₨${product.amount.toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals Section */}
            <div className="flex justify-end mt-8">
              <div className="w-full md:w-96">
                <div className="space-y-3 mb-4 pb-4 border-b-2 border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-slate-700">Subtotal</span>
                    <span className="text-base font-semibold text-slate-900">₨{invoiceData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-slate-700">Tax</span>
                    <span className="text-base font-semibold text-slate-900">₨{invoiceData.tax.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-bold text-slate-900">
                    ₨{invoiceData.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">Thank you for your business!</p>
              <p className="text-xs text-slate-400 mt-2">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
