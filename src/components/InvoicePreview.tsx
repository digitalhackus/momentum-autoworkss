import { Button } from "./ui/button";
import { X, Printer, Share2, Download } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

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

export function InvoicePreview({ isOpen, onClose, invoiceData }: InvoicePreviewProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShare = () => {
    alert("Share functionality - Integration pending");
  };

  // Calculate subtotal without tax
  const subtotalWithoutTax = invoiceData.subtotal;

  // Get current time
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col invoice-printable-wrapper print:shadow-none print:rounded-none print:max-h-none print:overflow-visible" onClick={e => e.stopPropagation()}>
        {/* Header - not sticky, same look as InvoiceDetail */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white print:hidden shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPDF}
              className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        {/* Invoice Content - scrollable body */}
        <div className="flex-1 overflow-y-auto print:overflow-visible">
        <div className="bg-white p-12 print:pt-0">
          {/* Header with Logo and Company Info */}
          <div className="flex items-start gap-4 mb-8 pb-6 border-b border-slate-200 print-keep-together">
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
              <h1 className="text-2xl font-bold text-slate-900 mb-3">{displayName.toUpperCase()}</h1>
              <div className="grid grid-cols-3 gap-x-8 text-sm">
                <div>
                  <p className="text-slate-500 font-medium mb-1">Email</p>
                  <p className="text-slate-700">{displayEmail}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium mb-1">Address</p>
                  <p className="text-slate-700 whitespace-nowrap">{displayAddress}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium mb-1">Phone</p>
                  <p className="text-slate-700">{displayPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Title */}
          <div className="mb-8 print-keep-together">
            <h2 className="text-4xl font-bold text-theme">INVOICE</h2>
          </div>

          {/* Customer & Invoice Details - Two Columns */}
          <div className="grid grid-cols-2 gap-12 mb-10 print-keep-together">
            {/* Left Column - Customer Details */}
            <div className="space-y-3">
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-sm font-semibold text-slate-700">Customer Name:</span>
                <span className="text-sm text-slate-900">{invoiceData.customerName}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-sm font-semibold text-slate-700">Phone Number:</span>
                <span className="text-sm text-slate-900">{invoiceData.customerPhone}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-sm font-semibold text-slate-700">Model:</span>
                <span className="text-sm text-slate-900">
                  {invoiceData.vehicleMake} {invoiceData.vehicleModel} {invoiceData.vehicleYear || ''}
                </span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-sm font-semibold text-slate-700">Registration Number:</span>
                <span className="text-sm text-slate-900">{invoiceData.vehicleNumber}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-sm font-semibold text-slate-700">Payment Method:</span>
                <span className="text-sm text-slate-900">{(invoiceData.paymentMethod || 'Card').trim().toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
              </div>
            </div>

            {/* Right Column - Invoice Details */}
            <div className="space-y-3 text-right">
              <div className="grid grid-cols-[1fr_140px] gap-2">
                <span className="text-sm font-semibold text-slate-700">Invoice No:</span>
                <span className="text-sm text-slate-900">{invoiceData.invoiceNumber}</span>
              </div>
              <div className="grid grid-cols-[1fr_140px] gap-2">
                <span className="text-sm font-semibold text-slate-700">Invoice Date:</span>
                <span className="text-sm text-slate-900">{invoiceData.invoiceDate}</span>
              </div>
              <div className="grid grid-cols-[1fr_140px] gap-2">
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
              <table className="w-full invoice-table">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-sm font-semibold text-slate-600 pb-3 px-4">Description</th>
                    <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-4 w-32">Price</th>
                    <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-4 w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.services.map((service, index) => (
                    <tr key={service.id} className={index !== invoiceData.services.length - 1 ? "border-b border-slate-100" : ""}>
                      <td className="text-sm text-slate-700 py-3 px-4">{service.name}</td>
                      <td className="text-sm text-slate-700 py-3 px-4 text-right">₨{service.price.toLocaleString()}</td>
                      <td className="text-sm font-medium text-slate-900 py-3 px-4 text-right">
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
              <table className="w-full invoice-table">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left text-sm font-semibold text-slate-600 pb-3 px-4">Description</th>
                    <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-4 w-24">Quantity</th>
                    <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-4 w-32">Price</th>
                    <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-4 w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.products.map((product, index) => (
                    <tr key={product.id} className={index !== invoiceData.products.length - 1 ? "border-b border-slate-100" : ""}>
                      <td className="text-sm text-slate-700 py-3 px-4">
                        {product.name}
                        {product.customerSupplied && (
                          <span className="ml-2 text-xs text-slate-500 italic">(Customer Supplied)</span>
                        )}
                      </td>
                      <td className="text-sm text-slate-700 py-3 px-4 text-right">
                        {product.customerSupplied ? '-' : product.quantity}
                      </td>
                      <td className="text-sm text-slate-700 py-3 px-4 text-right">
                        {product.customerSupplied ? '-' : `₨${product.price.toLocaleString()}`}
                      </td>
                      <td className="text-sm font-medium text-slate-900 py-3 px-4 text-right">
                        {product.customerSupplied ? '₨0' : `₨${product.amount.toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Section */}
          <div className="flex justify-end mt-8 print-keep-together">
            <div className="w-96">
              <div className="space-y-3 mb-4 pb-4 border-b-2 border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-base text-slate-700">Subtotal</span>
                  <span className="text-base font-semibold text-slate-900">₨{invoiceData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-slate-700">Subtotal without Tax</span>
                  <span className="text-base font-semibold text-slate-900">₨{subtotalWithoutTax.toLocaleString()}</span>
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
          <div className="mt-16 pt-6 border-t border-slate-200 text-center print-keep-together">
            <p className="text-sm text-slate-600">Thank you for your business!</p>
            <p className="text-xs text-slate-400 mt-2">
              This is a computer-generated invoice and does not require a signature.
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Print Styles - inline only for this component; globals handle multi-page flow */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .fixed {
            position: static !important;
          }
          .bg-black\\/50 {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
