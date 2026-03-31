import React from 'react';

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  type: 'service' | 'product';
  customerSupplied?: boolean;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTime: string;
  customerName: string;
  customerContact: string;
  vehicleName: string;
  licensePlate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  discountPercentage?: number;
  totalTax: number;
  taxPercentage?: number;
  grandTotal: number;
  paymentStatus: 'Paid' | 'Unpaid';
  paymentMethod?: string;
  // Company details from settings
  companyName?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyLogo?: string | null;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoiceNumber,
  invoiceDate,
  invoiceTime,
  customerName,
  customerContact,
  vehicleName,
  licensePlate,
  items,
  subtotal,
  discount,
  discountPercentage,
  totalTax,
  taxPercentage,
  grandTotal,
  paymentStatus,
  paymentMethod,
  companyName,
  companyEmail,
  companyAddress,
  companyPhone,
  companyLogo,
}) => {
  const services = items.filter(item => item.type === 'service');
  const products = items.filter(item => item.type === 'product');
  
  const displayName = companyName || 'MOMENTUM AUTOWORKS';
  const displayEmail = companyEmail || 'info@momentumauto.pk';
  const displayAddress = companyAddress || 'Soan Gardens, Islamabad';
  const displayPhone = companyPhone || '+92 300 1234567';
  
  return (
    <div className="bg-white p-12 max-w-4xl mx-auto print:max-w-full print:mx-0 print:px-8 print:py-6 invoice-print">
      {/* Header with Logo and Company Info */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-8 pb-6 border-b border-slate-200 print-keep-together">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-x-8 text-sm">
            <div className="break-words">
              <p className="text-slate-500 font-medium mb-1">Email</p>
              <p className="text-slate-700">{displayEmail}</p>
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
      <div className="mb-8 print-keep-together">
        <h2 className="text-4xl font-bold text-theme">INVOICE</h2>
      </div>

      {/* Customer & Invoice Details - Responsive Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-10 print-keep-together">
        {/* Left Column - Customer Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
            <span className="text-sm font-semibold text-slate-700">Customer Name:</span>
            <span className="text-sm text-slate-900">{customerName}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
            <span className="text-sm font-semibold text-slate-700">Phone Number:</span>
            <span className="text-sm text-slate-900">{customerContact}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
            <span className="text-sm font-semibold text-slate-700">Model:</span>
            <span className="text-sm text-slate-900">{vehicleName}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
            <span className="text-sm font-semibold text-slate-700">Registration Number:</span>
            <span className="text-sm text-slate-900">{licensePlate}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_1fr] gap-2">
            <span className="text-sm font-semibold text-slate-700">Payment Method:</span>
            <span className="text-sm text-slate-900">{paymentMethod?.trim().toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Card'}</span>
          </div>
        </div>

        {/* Right Column - Invoice Details */}
        <div className="space-y-3 text-left md:text-right">
          <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] gap-2">
            <span className="text-sm font-semibold text-slate-700">Invoice No:</span>
            <span className="text-sm text-slate-900">{invoiceNumber}</span>
          </div>
          <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] gap-2">
            <span className="text-sm font-semibold text-slate-700">Invoice Date:</span>
            <span className="text-sm text-slate-900">{invoiceDate}</span>
          </div>
          <div className="grid grid-cols-[1fr_110px] sm:grid-cols-[1fr_140px] gap-2">
            <span className="text-sm font-semibold text-slate-700">Time:</span>
            <span className="text-sm text-slate-900">{invoiceTime}</span>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {services.length > 0 && (
        <div className="mb-8">
          <div className="bg-slate-50 px-4 py-3 mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase">Services</h3>
          </div>
          <table className="w-full invoice-table">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 pb-3 pl-3 pr-2 sm:px-4">Description</th>
                <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-2 sm:px-4 w-24 sm:w-32">Price</th>
                <th className="text-right text-sm font-semibold text-slate-600 pb-3 pl-2 pr-2 sm:px-4 w-24 sm:w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {services.map((item, index) => (
                <tr key={item.id} className={index !== services.length - 1 ? "border-b border-slate-100" : ""}>
                  <td className="text-sm text-slate-700 py-3 pl-3 pr-2 sm:px-4 break-words">{item.name}</td>
                  <td className="text-sm text-slate-700 py-3 px-2 sm:px-4 text-right">₨{item.unitPrice.toLocaleString()}</td>
                  <td className="text-sm font-medium text-slate-900 py-3 pl-2 pr-2 sm:px-4 text-right">
                    ₨{(item.unitPrice * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Section */}
      {products.length > 0 && (
        <div className="mb-8">
          <div className="bg-slate-50 px-4 py-3 mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase">Products</h3>
          </div>
          <table className="w-full invoice-table">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 pb-3 pl-3 pr-2 sm:px-4">Description</th>
                <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-2 sm:px-4 w-20 sm:w-24">Qty</th>
                <th className="text-right text-sm font-semibold text-slate-600 pb-3 px-2 sm:px-4 w-24 sm:w-32">Price</th>
                <th className="text-right text-sm font-semibold text-slate-600 pb-3 pl-2 pr-2 sm:px-4 w-24 sm:w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => (
                <tr key={item.id} className={index !== products.length - 1 ? "border-b border-slate-100" : ""}>
                  <td className="text-sm text-slate-700 py-3 pl-3 pr-2 sm:px-4 break-words">
                    {item.name}
                    {item.customerSupplied && (
                      <span className="ml-2 text-xs text-slate-500 italic">(Customer Supplied)</span>
                    )}
                  </td>
                  <td className="text-sm text-slate-700 py-3 px-2 sm:px-4 text-right">
                    {item.customerSupplied ? '-' : item.quantity}
                  </td>
                  <td className="text-sm text-slate-700 py-3 px-2 sm:px-4 text-right">
                    {item.customerSupplied ? '-' : `₨${item.unitPrice.toLocaleString()}`}
                  </td>
                  <td className="text-sm font-medium text-slate-900 py-3 pl-2 pr-2 sm:px-4 text-right">
                    {item.customerSupplied ? '₨0' : `₨${(item.unitPrice * item.quantity).toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals Section */}
      <div className="flex justify-end mt-8 print-keep-together">
        <div className="w-full md:w-96">
          <div className="space-y-3 mb-4 pb-4 border-b-2 border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-base text-slate-700">Subtotal</span>
              <span className="text-base font-semibold text-slate-900">₨{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base text-slate-700">Tax</span>
              <span className="text-base font-semibold text-slate-900">₨{totalTax.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-xl font-bold text-slate-900">Total</span>
            <span className="text-3xl font-bold text-slate-900">
              ₨{grandTotal.toLocaleString()}
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
  );
};
