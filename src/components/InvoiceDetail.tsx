import { useState, useRef } from "react";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { InvoiceTemplate } from "./InvoiceTemplate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { 
  ArrowLeft,
  Printer, 
  Download, 
  Mail,
  X,
  Edit,
  Share2,
  CheckCircle2,
  Loader2,
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
}

function getInvoiceHTML(container: HTMLElement): string {
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#2563eb';
  const clone = container.cloneNode(true) as HTMLElement;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice</title>
<style>
  :root { --primary-color: ${themeColor}; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background: white; padding: 40px; }
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
  .gap-12 { gap: 3rem; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .grid-cols-\\[140px_1fr\\] { grid-template-columns: 140px 1fr; }
  .grid-cols-\\[1fr_140px\\] { grid-template-columns: 1fr 140px; }
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
  .px-8 { padding-left: 2rem; padding-right: 2rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
  .p-12 { padding: 3rem; }
  .w-16 { width: 4rem; }
  .w-24 { width: 6rem; }
  .w-32 { width: 8rem; }
  .w-96 { width: 24rem; }
  .h-16 { height: 4rem; }
  .w-10 { width: 2.5rem; }
  .h-10 { height: 2.5rem; }
  .w-full { width: 100%; }
  .max-w-4xl { max-width: 56rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .rounded-xl { border-radius: 0.75rem; }
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
            html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
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

  const timeoutId = setTimeout(() => {
    cleanup();
  }, 30000);

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'pdf-done' || event.data?.type === 'pdf-error') {
      window.removeEventListener('message', handler);
      clearTimeout(timeoutId);
      if (event.data.type === 'pdf-error') {
        console.error('PDF error:', event.data.message);
      }
      setTimeout(cleanup, 1000);
    }
  };
  window.addEventListener('message', handler);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    cleanup();
    window.removeEventListener('message', handler);
    clearTimeout(timeoutId);
    alert('Could not generate PDF. Please use the Print button instead.');
    return;
  }

  iframeDoc.open();
  iframeDoc.write(fullHTML);
  iframeDoc.close();
}

export function InvoiceDetail({ invoice, onClose, onEdit }: InvoiceDetailProps) {
  const { updateInvoice } = useData();
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const isEditable = invoice.status !== 'Paid';

  const handleMarkAsPaid = async () => {
    setMarkingPaid(true);
    try {
      await updateInvoice(invoice.id, { status: "Paid" });
      setShowPayConfirm(false);
      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    } finally {
      setMarkingPaid(false);
    }
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    openPrintWindow(invoiceRef.current);
  };

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;
    const invNum = invoice.invoiceNumber || `INV-${invoice.id.padStart(3, '0')}`;
    downloadPDF(invoiceRef.current, `Invoice-${invNum}.pdf`);
  };

  const handleEmail = () => {
    alert(`Email functionality would send invoice to ${invoice.customerEmail || 'customer email'}`);
  };

  const handleShare = () => {
    alert("Share options will be displayed here");
  };

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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && onClose) {
              onClose();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
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
                {isEditable && (
                  <Button
                    onClick={() => setShowPayConfirm(true)}
                    size="sm"
                    className="h-9 text-sm bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
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
            <div className="flex-1 overflow-y-auto p-6">
              <div ref={invoiceRef} id="invoice-printable">
                <InvoiceTemplate
                  invoiceNumber={invoice.invoiceNumber || `INV-${invoice.id.padStart(3, '0')}`}
                  invoiceDate={new Date(invoice.date).toLocaleDateString('en-GB')}
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

      <Dialog open={showPayConfirm} onOpenChange={setShowPayConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <p className="text-sm text-gray-600">
              Mark invoice <span className="font-semibold">{invoice.invoiceNumber || `INV-${invoice.id.padStart(3, '0')}`}</span> as paid?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{invoice.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-green-600">Rs. {invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium">{invoice.paymentMethod}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Once marked as paid, the invoice can no longer be edited.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPayConfirm(false)} disabled={markingPaid}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={markingPaid}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {markingPaid ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {markingPaid ? "Processing..." : "Confirm Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
