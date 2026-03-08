/**
 * Opens a new window containing only the invoice content and triggers print.
 * This avoids the main page layout/scroll constraining the printed output,
 * so the full invoice can flow to multiple pages when saving as PDF.
 */
export function printInvoice(): void {
  const wrapper = document.querySelector(".invoice-printable-wrapper");
  if (!wrapper) {
    window.print();
    return;
  }

  const clone = wrapper.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".print\\:hidden, [class*='print:hidden'], button").forEach((el) => el.remove());

  const styleLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .map((link) => {
      const href = link.href || link.getAttribute("href") || "";
      return href ? `<link rel="stylesheet" href="${href}">` : "";
    })
    .filter(Boolean)
    .join("\n");

  const printPageStyles = `
    <style>
      @media print {
        @page { size: A4 portrait; margin: 12mm; }
        body { margin: 0; padding: 0; background: white; }
        .invoice-printable-wrapper, .invoice-print, #invoice-printable {
          max-height: none !important; height: auto !important; overflow: visible !important;
        }
      }
      body { margin: 0; padding: 0; background: white; min-height: 100%; }
    </style>`;

  const doc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
  ${styleLinks}
  ${printPageStyles}
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(doc);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 300);
  };
}
