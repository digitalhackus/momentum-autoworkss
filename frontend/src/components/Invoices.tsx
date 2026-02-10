import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { AddInvoice } from "./AddInvoice";
import { InvoiceDetail } from "./InvoiceDetail";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Printer,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  Eye
} from "lucide-react";
import { motion } from "motion/react";

interface InvoicesProps {
  startWithCreate?: boolean;
  showCreateInvoice?: boolean;
  setShowCreateInvoice?: (show: boolean) => void;
}

export function Invoices({ startWithCreate = false, showCreateInvoice: externalShowCreate, setShowCreateInvoice: externalSetShowCreate }: InvoicesProps = {}) {
  const { invoices } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [internalShowCreate, setInternalShowCreate] = useState(startWithCreate);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<typeof invoices[0] | null>(null);

  // Use external state if provided, otherwise use internal state
  const showCreateInvoice = externalShowCreate !== undefined ? externalShowCreate : internalShowCreate;
  const setShowCreateInvoice = externalSetShowCreate || setInternalShowCreate;

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvoiceClick = (invoice: typeof invoices[0]) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseInvoiceDetail = () => {
    setSelectedInvoice(null);
  };

  const handleCreateInvoice = () => {
    setShowCreateInvoice(true);
  };

  const handleCloseCreateInvoice = () => {
    setShowCreateInvoice(false);
    setInvoiceToEdit(null); // Clear edit state when closing
  };

  const handleEditInvoice = (invoice: typeof invoices[0]) => {
    setInvoiceToEdit(invoice);
    setSelectedInvoice(null); // Close detail view
    setShowCreateInvoice(true); // Open create/edit view
  };

  // If creating a new invoice or editing, show the AddInvoice view
  if (showCreateInvoice) {
    return (
      <AddInvoice
        onClose={handleCloseCreateInvoice}
        onSubmit={(data) => {
          console.log("Invoice created/updated:", data);
          handleCloseCreateInvoice();
        }}
        editInvoice={invoiceToEdit}
      />
    );
  }

  // If an invoice is selected, show the InvoiceDetail
  if (selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        onClose={handleCloseInvoiceDetail}
        onEdit={() => handleEditInvoice(selectedInvoice)}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Invoices</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage and track all invoices</p>
        </div>
        {/* Create Invoice Button - Show on all screen sizes */}
        <Button 
          className="bg-theme hover:bg-theme-dark w-full lg:w-auto" 
          size="sm"
          onClick={handleCreateInvoice}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Collected</p>
                  <p className="text-3xl">₨375,000</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-theme">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                  <p className="text-3xl">148</p>
                </div>
                <div className="p-3 bg-theme-100 rounded-lg">
                  <FileText className="h-6 w-6 text-theme" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl">12</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overdue</p>
                  <p className="text-3xl">3</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                <Filter className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Filter by Date</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                <Filter className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Filter by Status</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {filteredInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border rounded-lg space-y-3 cursor-pointer hover:border-theme-300 hover:bg-theme-50 transition-all"
                onClick={() => handleInvoiceClick(invoice)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">INV-{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.customer}</p>
                  </div>
                  <Badge
                    className={
                      invoice.status === "Paid" ? "bg-green-100 text-green-700 border-green-200" :
                      invoice.status === "Pending" ? "bg-orange-100 text-orange-700 border-orange-200" :
                      "bg-red-100 text-red-700 border-red-200"
                    }
                  >
                    {invoice.status === "Paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {invoice.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">{invoice.make} {invoice.model}</p>
                  <p className="text-gray-500">{invoice.date} • {invoice.paymentMethod}</p>
                  <p><Badge variant="outline">{invoice.servicesCount} items</Badge></p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium text-lg">₨{invoice.amount.toLocaleString()}</span>
                  <Badge variant="outline" className="text-theme border-theme-300">
                    View Details →
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b cursor-pointer hover:bg-theme-50 transition-colors"
                  onClick={() => handleInvoiceClick(invoice)}
                >
                  <TableCell className="font-medium">INV-{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>{invoice.make}</TableCell>
                  <TableCell>{invoice.model}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.servicesCount} items</Badge>
                  </TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell className="font-medium">₨{invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        invoice.status === "Paid" ? "bg-green-100 text-green-700 border-green-200" :
                        invoice.status === "Pending" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        "bg-red-100 text-red-700 border-red-200"
                      }
                    >
                      {invoice.status === "Paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-theme border-theme-300">
                      View Details →
                    </Badge>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}