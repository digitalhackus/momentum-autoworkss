import { useState, useEffect } from "react";
import { useData } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AddInvoice } from "./AddInvoice";
import { InvoiceDetail } from "./InvoiceDetail";
import {
  Plus,
  Search,
  Filter,
  Mail,
  Printer,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { formatDisplayDate } from "../utils/dateFormat";
import { DatePicker } from "./ui/date-picker";

interface InvoicesProps {
  startWithCreate?: boolean;
  showCreateInvoice?: boolean;
  setShowCreateInvoice?: (show: boolean) => void;
  filterCustomerId?: string | null;
  onClearCustomerFilter?: () => void;
  onNavigate?: (page: string, options?: { customerId?: string }) => void;
}

export function Invoices({ startWithCreate = false, showCreateInvoice: externalShowCreate, setShowCreateInvoice: externalSetShowCreate, filterCustomerId, onClearCustomerFilter, onNavigate }: InvoicesProps = {}) {
  const { invoices, customers, refetch, updateInvoice } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "Unpaid">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [internalShowCreate, setInternalShowCreate] = useState(startWithCreate);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState<typeof invoices[0] | null>(null);
  const [markPaidInvoice, setMarkPaidInvoice] = useState<typeof invoices[0] | null>(null);

  // Use external state if provided, otherwise use internal state
  const showCreateInvoice = externalShowCreate !== undefined ? externalShowCreate : internalShowCreate;
  const setShowCreateInvoice = externalSetShowCreate || setInternalShowCreate;

  // Whenever we're showing the list (not create form, not detail), refetch so new invoices appear
  useEffect(() => {
    if (!showCreateInvoice && !selectedInvoice) {
      refetch();
    }
  }, [showCreateInvoice, selectedInvoice, refetch]);

  const customerFilteredInvoices = filterCustomerId
    ? invoices.filter((inv) => inv.customerId === filterCustomerId)
    : invoices;

  const filteredInvoices = customerFilteredInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== "all") {
      const isPaid = invoice.status === "Paid";
      if (statusFilter === "Paid" && !isPaid) return false;
      if (statusFilter === "Unpaid" && isPaid) return false;
    }
    const invDate = invoice.date || "";
    if (dateFrom && invDate < dateFrom) return false;
    if (dateTo && invDate > dateTo) return false;
    return true;
  });

  const filterCustomerName = filterCustomerId
    ? customers?.find((c) => c.id === filterCustomerId)?.name ?? null
    : null;

  const handleInvoiceClick = (invoice: typeof invoices[0]) => {
    setSelectedInvoice(invoice);
  };

  /** Display status: only "Paid" or "Unpaid" */
  const displayStatus = (status: string) => (status === "Paid" ? "Paid" : "Unpaid");

  /** Payment method with first letter of each word uppercase (e.g. Card, Cash, Online Transfer) */
  const formatPaymentMethod = (s: string) =>
    (s || "").trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || s;

  const handleCloseInvoiceDetail = () => {
    setSelectedInvoice(null);
  };

  const handleCreateInvoice = () => {
    setShowCreateInvoice(true);
  };

  const handleCloseCreateInvoice = () => {
    setShowCreateInvoice(false);
    setInvoiceToEdit(null);
    refetch(); // Refresh list so new/updated invoices appear
  };

  const handleEditInvoice = (invoice: typeof invoices[0]) => {
    setInvoiceToEdit(invoice);
    setSelectedInvoice(null); // Close detail view
    setShowCreateInvoice(true); // Open create/edit view
  };

  const handleMarkAsPaidConfirm = async () => {
    if (!markPaidInvoice) return;
    await updateInvoice(markPaidInvoice.id, { status: "Paid" });
    setMarkPaidInvoice(null);
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
        onMarkPaid={() => setMarkPaidInvoice(selectedInvoice)}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      {filterCustomerId && filterCustomerName ? (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-theme-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-theme" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1 lg:mb-2">{filterCustomerName}</h1>
              <p className="text-sm lg:text-base text-gray-600">All the Invoices of the user in the system.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl mb-1 lg:mb-2">Invoices</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage and track all invoices</p>
          </div>
          <Button
            type="button"
            className="bg-theme hover:bg-theme-dark w-full lg:w-auto"
            size="sm"
            onClick={handleCreateInvoice}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      )}

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
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-3xl">
                    ₨{
                      customerFilteredInvoices
                        .filter((inv) => inv.status === "Paid")
                        .reduce((sum, inv) => sum + (typeof inv.amount === "number" ? inv.amount : Number(inv.amount) || 0), 0)
                        .toLocaleString()
                    }
                  </p>
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
                  <p className="text-sm text-gray-600 mb-1">Invoices</p>
                  <p className="text-3xl">{customerFilteredInvoices.length}</p>
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
                  <p className="text-sm text-gray-600 mb-1">Unpaid</p>
                  <p className="text-3xl">
                    {customerFilteredInvoices.filter((inv) => inv.status !== "Paid").length}
                  </p>
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
                  <p className="text-sm text-gray-600 mb-1">Paid</p>
                  <p className="text-3xl">
                    {customerFilteredInvoices.filter((inv) => inv.status === "Paid").length}
                  </p>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                    <Calendar className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Filter by Date</span>
                    {(dateFrom || dateTo) && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">1</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 rounded-xl border border-gray-200 bg-white shadow-lg" align="start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <div className="p-1.5 rounded-lg bg-theme/10">
                        <Calendar className="h-4 w-4 text-theme" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">Date range</p>
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">From</label>
                        <DatePicker
                          value={dateFrom}
                          onChange={setDateFrom}
                          placeholder="dd/mm/yy"
                          className="mt-1.5 rounded-lg border-gray-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">To</label>
                        <DatePicker
                          value={dateTo}
                          onChange={setDateTo}
                          placeholder="dd/mm/yy"
                          className="mt-1.5 rounded-lg border-gray-200"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-lg bg-theme hover:bg-theme-dark text-white"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                    >
                      Clear dates
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
                    <Filter className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Filter by Status</span>
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">1</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${statusFilter === "all" ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${statusFilter === "Paid" ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("Paid")}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${statusFilter === "Unpaid" ? "bg-theme/10 text-theme font-medium" : "hover:bg-gray-100"}`}
                    onClick={() => setStatusFilter("Unpaid")}
                  >
                    Unpaid
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
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
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">INV-{invoice.id}</p>
                    {!filterCustomerId && <p className="text-sm text-gray-600">{invoice.customer}</p>}
                  </div>
                  {invoice.status === "Paid" ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMarkPaidInvoice(invoice); }}
                      className="rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-theme-300 hover:text-theme transition-colors"
                    >
                      Unpaid
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    {[invoice.make, invoice.model, invoice.carYear].filter(Boolean).join(" ") || "—"}
                  </p>
                  <p className="text-gray-500">{formatDisplayDate(invoice.date)} • {formatPaymentMethod(invoice.paymentMethod)}</p>
                  <p><Badge variant="outline" className="border-theme-300 text-theme">{invoice.servicesCount} items</Badge></p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium text-lg">₨{invoice.amount.toLocaleString()}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-theme border-theme-300"
                    onClick={(e) => { e.stopPropagation(); handleInvoiceClick(invoice); }}
                  >
                    View Details →
                  </Button>
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
                {!filterCustomerId && <TableHead>Customer</TableHead>}
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice, index) => {
                const vehicleLine1 = [invoice.make, invoice.model].filter(Boolean).join(" ") || "—";
                const vehicleLine2 = invoice.carYear || invoice.plate || null;
                return (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b"
                >
                  <TableCell className="font-medium">INV-{invoice.id}</TableCell>
                  {!filterCustomerId && <TableCell>{invoice.customer}</TableCell>}
                  <TableCell className="align-top">
                    <div className="flex flex-col">
                      <span className="font-medium">{vehicleLine1}</span>
                      {vehicleLine2 && <span className="text-xs text-gray-500">{vehicleLine2}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{formatDisplayDate(invoice.date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-theme-300 text-theme">{invoice.servicesCount} items</Badge>
                  </TableCell>
                  <TableCell>{formatPaymentMethod(invoice.paymentMethod)}</TableCell>
                  <TableCell className="font-medium">₨{invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {invoice.status === "Paid" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMarkPaidInvoice(invoice); }}
                        className="rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:border-theme-300 hover:text-theme transition-colors"
                      >
                        Unpaid
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-theme border-theme-300"
                      onClick={(e) => { e.stopPropagation(); handleInvoiceClick(invoice); }}
                    >
                      View Details →
                    </Button>
                  </TableCell>
                </motion.tr>
              );
              })}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mark as Paid confirmation */}
      <AlertDialog open={!!markPaidInvoice} onOpenChange={(open) => !open && setMarkPaidInvoice(null)}>
        <AlertDialogContent className="rounded-xl border border-gray-200 bg-white shadow-lg sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800">Mark as Paid?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsPaidConfirm}
              className="bg-theme hover:bg-theme-dark text-white"
            >
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
