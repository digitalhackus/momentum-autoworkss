import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Store,
  Plus,
  Search,
  Eye,
  DollarSign,
  TrendingUp,
  Clock,
  Trash2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function Vendors() {
  const {
    vendors,
    addVendor,
    deleteVendor,
    getVendorStockIns,
    getVendorPayments,
    addVendorPayment,
  } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  // Form state
  const [vendorForm, setVendorForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Bank Transfer",
    notes: "",
  });

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVendor = () => {
    if (!vendorForm.name) {
      alert("Please enter vendor name");
      return;
    }

    addVendor({
      name: vendorForm.name,
      phone: vendorForm.phone || undefined,
      notes: vendorForm.notes || undefined,
    });

    setVendorForm({ name: "", phone: "", notes: "" });
    setShowAddModal(false);
  };

  const handleRecordPayment = () => {
    if (!paymentForm.amount || !selectedVendor) {
      alert("Please enter payment amount");
      return;
    }

    addVendorPayment({
      vendorId: selectedVendor,
      amount: parseFloat(paymentForm.amount),
      method: paymentForm.method,
      notes: paymentForm.notes || undefined,
    });

    setPaymentForm({ amount: "", method: "Bank Transfer", notes: "" });
    setShowPaymentModal(false);
  };

  const VendorProfile = ({ vendorId }: { vendorId: string }) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    const stockIns = getVendorStockIns(vendorId);
    const payments = getVendorPayments(vendorId);

    if (!vendor) return null;

    return (
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{vendor.name}</DialogTitle>
          </DialogHeader>
          
          {/* Record Payment Button - Moved outside header */}
          <div className="flex justify-end -mt-2">
            <Button
              size="sm"
              onClick={() => {
                setShowPaymentModal(true);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>

          <div className="space-y-6">
            {/* Vendor Info */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Vendor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Phone:</span>
                  <p className="font-medium">{vendor.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-600">Notes:</span>
                  <p className="font-medium">{vendor.notes || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Ledger Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border-theme-200 bg-theme-50">
                <div>
                  <p className="text-sm text-theme">Total Supplied</p>
                  <p className="text-2xl font-bold text-theme">
                    ₨{vendor.totalSupplied.toLocaleString()}
                  </p>
                </div>
              </Card>
              <Card className="p-4 border-green-200 bg-green-50">
                <div>
                  <p className="text-sm text-green-800">Total Paid</p>
                  <p className="text-2xl font-bold text-green-900">
                    ₨{vendor.totalPaid.toLocaleString()}
                  </p>
                </div>
              </Card>
              <Card className="p-4 border-red-200 bg-red-50">
                <div>
                  <p className="text-sm text-red-800">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-red-900">
                    ₨{vendor.outstandingBalance.toLocaleString()}
                  </p>
                </div>
              </Card>
            </div>

            {/* Tabs for Supplies and Payments */}
            <Tabs defaultValue="supplies">
              <TabsList className="w-full">
                <TabsTrigger value="supplies" className="flex-1">
                  Supplies
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex-1">
                  Payments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="supplies" className="mt-4">
                <div className="space-y-3">
                  {stockIns.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      No supply records yet
                    </p>
                  ) : (
                    stockIns.map((record) => (
                      <Card key={record.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {record.id}
                            </p>
                            <p className="text-sm text-slate-600">{record.date}</p>
                          </div>
                          <p className="font-bold text-blue-600">
                            ₨{record.totalAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {record.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-sm flex justify-between text-slate-700"
                            >
                              <span>
                                {item.productName} × {item.quantity} @ ₨{(item.total / item.quantity).toLocaleString()}
                              </span>
                              <span>₨{item.total.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      No payment records yet
                    </p>
                  ) : (
                    payments.map((payment) => (
                      <Card key={payment.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {payment.id}
                            </p>
                            <p className="text-sm text-slate-600">{payment.date}</p>
                            <p className="text-sm text-slate-600">
                              {payment.method}
                            </p>
                            {payment.notes && (
                              <p className="text-sm text-slate-500 mt-1">
                                {payment.notes}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-green-600">
                            ₨{payment.amount.toLocaleString()}
                          </p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Vendors / Suppliers
          </h1>
          <p className="text-slate-600 mt-1">Manage your inventory suppliers</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-theme hover:bg-theme-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Vendor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Vendors</p>
              <p className="text-2xl font-bold text-slate-900">{vendors.length}</p>
            </div>
            <Store className="h-8 w-8 text-theme" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Supplied</p>
              <p className="text-2xl font-bold text-theme">
                ₨
                {vendors
                  .reduce((sum, v) => sum + v.totalSupplied, 0)
                  .toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-theme" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                ₨
                {vendors
                  .reduce((sum, v) => sum + v.outstandingBalance, 0)
                  .toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vendors Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Outstanding
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Last Supply
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Last Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-slate-900">{vendor.name}</div>
                  {vendor.phone && (
                    <div className="text-sm text-slate-600">{vendor.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`font-semibold ${
                      vendor.outstandingBalance > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    ₨{vendor.outstandingBalance.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                  {vendor.lastSupplyDate || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                  {vendor.lastPaymentDate || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVendor(vendor.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedVendor(vendor.id);
                        setShowPaymentModal(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Pay
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setVendorToDelete(vendor.id);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendors Cards - Mobile */}
      <div className="lg:hidden space-y-3">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{vendor.name}</h3>
                {vendor.phone && (
                  <p className="text-sm text-slate-600">{vendor.phone}</p>
                )}
              </div>
              <Badge
                className={
                  vendor.outstandingBalance > 0 ? "bg-red-500" : "bg-green-500"
                }
              >
                ₨{vendor.outstandingBalance.toLocaleString()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-slate-600">Last Supply:</span>
                <p className="font-medium text-slate-900">
                  {vendor.lastSupplyDate || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-slate-600">Last Payment:</span>
                <p className="font-medium text-slate-900">
                  {vendor.lastPaymentDate || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedVendor(vendor.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setSelectedVendor(vendor.id);
                  setShowPaymentModal(true);
                }}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                Pay
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setVendorToDelete(vendor.id);
                  setShowDeleteConfirm(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Vendor Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Add New Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="vendorName" className="text-sm font-medium text-slate-700">
                Vendor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vendorName"
                value={vendorForm.name}
                onChange={(e) =>
                  setVendorForm({ ...vendorForm, name: e.target.value })
                }
                placeholder="e.g., Oil Supply Co."
                className="h-10 border-slate-300 focus:border-theme focus:ring-theme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorPhone" className="text-sm font-medium text-slate-700">
                Phone <span className="text-slate-400 text-xs">(Optional)</span>
              </Label>
              <Input
                id="vendorPhone"
                value={vendorForm.phone}
                onChange={(e) =>
                  setVendorForm({ ...vendorForm, phone: e.target.value })
                }
                placeholder="+92 300 1234567"
                className="h-10 border-slate-300 focus:border-theme focus:ring-theme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendorNotes" className="text-sm font-medium text-slate-700">
                Notes <span className="text-slate-400 text-xs">(Optional)</span>
              </Label>
              <Textarea
                id="vendorNotes"
                value={vendorForm.notes}
                onChange={(e) =>
                  setVendorForm({ ...vendorForm, notes: e.target.value })
                }
                placeholder="Any additional notes..."
                rows={3}
                className="border-slate-300 focus:border-theme focus:ring-theme resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddVendor}
              className="bg-theme hover:bg-theme-dark text-white"
            >
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={(open) => {
        setShowPaymentModal(open);
        if (!open) {
          // Clear selected vendor when closing payment modal
          setSelectedVendor(null);
          setPaymentForm({ amount: "", method: "Bank Transfer", notes: "" });
        }
      }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount" className="text-sm font-medium">
                Amount (₨) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                placeholder="0"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">
                Payment Method
              </Label>
              <select
                id="paymentMethod"
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, method: e.target.value })
                }
                className="w-full h-11 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-theme focus:border-theme"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNotes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="paymentNotes"
                value={paymentForm.notes}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, notes: e.target.value })
                }
                placeholder="Any additional notes..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedVendor(null);
                setPaymentForm({ amount: "", method: "Bank Transfer", notes: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              className="bg-theme hover:bg-theme-dark"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Vendor Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Delete Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              Are you sure you want to delete this vendor? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (vendorToDelete) {
                  deleteVendor(vendorToDelete);
                }
                setShowDeleteConfirm(false);
                setVendorToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Profile Dialog */}
      {selectedVendor && !showPaymentModal && (
        <VendorProfile vendorId={selectedVendor} />
      )}
    </div>
  );
}