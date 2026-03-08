import { useState } from "react";
import { Button } from "./ui/button";
import { InvoiceTemplate } from "./InvoiceTemplate";
import { formatDisplayDate } from "../utils/dateFormat";
import { 
  ArrowLeft,
  Printer, 
  Download, 
  Mail,
  X,
  Edit,
  Share2,
  CheckCircle2,
} from "lucide-react";

interface InvoiceDetailProps {
  invoice: {
    id: string;
    invoiceNumber?: string;
    customer: string;
    customerId?: string;
    customerEmail?: string;
    customerPhone?: string;
    make: string;
    model: string;
    plate?: string;
    date: string;
    amount: number;
    status: string;
    paymentMethod: string;
    services: number;
    items?: Array<{
      id?: string;
      description: string;
      quantity: number;
      price?: number;
      type?: 'service' | 'product';
      customerSupplied?: boolean;
    }>;
    subtotal?: number;
    tax?: number;
    discount?: number;
    discountPercentage?: number;
    taxPercentage?: number;
  };
  onClose?: () => void;
  onEdit?: () => void;
  onMarkPaid?: () => void;
}

export function InvoiceDetail({ invoice, onClose, onEdit, onMarkPaid }: InvoiceDetailProps) {
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);
  
  // Check if invoice is editable (only unpaid invoices can be edited)
  const isEditable = invoice.status !== 'Paid';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleEmail = () => {
    alert(`Email functionality would send invoice to ${invoice.customerEmail || 'customer email'}`);
  };

  const handleShare = () => {
    console.log("Sharing invoice...");
    // Share functionality - could open a modal with share options (WhatsApp, Email, etc.)
    alert("Share options will be displayed here");
  };

  // Prepare items for InvoiceTemplate
  const invoiceItems = (invoice.items || []).map((item) => ({
    id: item.id || '',
    name: item.description,
    quantity: item.quantity,
    unitPrice: item.price || 0,
    tax: 0,
    total: (item.price || 0) * item.quantity,
    type: item.type || ('service' as const),
    customerSupplied: item.customerSupplied,
  }));

  return (
    <>
      {showInvoicePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white"
          onClick={(e) => {
            // Only close if the backdrop itself was clicked
            if (e.target === e.currentTarget && onClose) {
              onClose();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col print:max-w-full print:max-h-none print:shadow-none print:rounded-none print:overflow-visible">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white print:hidden">
              <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  size="sm"
                  className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  size="sm"
                  className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {isEditable && onEdit && (
                  <Button
                    variant="outline"
                    onClick={onEdit}
                    size="sm"
                    className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {isEditable && onMarkPaid && (
                  <Button
                    onClick={onMarkPaid}
                    size="sm"
                    className="h-9 text-sm bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
                {onClose && (
                  <Button
                    variant="outline"
                    onClick={onClose}
                    size="sm"
                    className="h-9 text-sm text-theme border-theme-200 hover:bg-theme-50 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                )}
              </div>
            </div>

            {/* Invoice Content */}
            <div className="invoice-printable-wrapper flex-1 overflow-y-auto p-6 print:overflow-visible print:p-6 print:pt-0">
              <div id="invoice-printable">
                <InvoiceTemplate
                  invoiceNumber={invoice.invoiceNumber || `INV-${invoice.id.padStart(3, '0')}`}
                  invoiceDate={formatDisplayDate(invoice.date)}
                  invoiceTime={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  customerName={invoice.customer || 'N/A'}
                  customerContact={invoice.customerPhone || 'N/A'}
                  vehicleName={`${invoice.make} ${invoice.model}`.trim() || 'N/A'}
                  licensePlate={invoice.plate || 'N/A'}
                  items={invoiceItems}
                  paymentMethod={invoice.paymentMethod}
                  subtotal={invoice.subtotal || 0}
                  discount={invoice.discount}
                  discountPercentage={invoice.discountPercentage}
                  totalTax={invoice.tax || 0}
                  taxPercentage={invoice.taxPercentage}
                  grandTotal={invoice.amount}
                  paymentStatus={invoice.status === 'Paid' ? 'Paid' : 'Unpaid'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
