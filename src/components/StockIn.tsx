import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  ArrowDownToLine,
  Plus,
  X,
  Package,
  Store,
  CheckCircle,
} from "lucide-react";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";

interface StockInItemForm {
  productId: string;
  productName: string;
  quantity: string;
  costPrice: string;
}

export function StockIn() {
  const {
    vendors,
    products,
    addVendor,
    addProduct,
    addStockIn,
    updateProduct,
    updateVendor,
  } = useData();

  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [items, setItems] = useState<StockInItemForm[]>([]);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductSalePrice, setNewProductSalePrice] = useState("");

  const addItem = () => {
    setItems([
      ...items,
      { productId: "", productName: "", quantity: "", costPrice: "" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof StockInItemForm, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If product is selected, auto-fill product name
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
      }
    }

    setItems(newItems);
  };

  const handleAddVendor = async () => {
    if (!vendorForm.name) {
      alert("Please enter vendor name");
      return;
    }

    const newVendor = await addVendor({
      name: vendorForm.name,
      phone: vendorForm.phone,
      notes: vendorForm.notes,
    });
    setSelectedVendorId(newVendor.id);
    setVendorForm({ name: "", phone: "", notes: "" });
    setShowAddVendorModal(false);
  };

  const handleAddProduct = () => {
    if (!newProductName || !newProductCategory || !newProductSalePrice) {
      alert("Please fill all fields");
      return;
    }

    addProduct({
      name: newProductName,
      category: newProductCategory,
      salePrice: parseFloat(newProductSalePrice),
      lastCostPrice: 0,
      averageCostPrice: 0,
      stockQuantity: 0,
      status: "Out of Stock",
    });

    setNewProductName("");
    setNewProductCategory("");
    setNewProductSalePrice("");
    setShowAddProductModal(false);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.costPrice) || 0;
      return sum + qty * cost;
    }, 0);
  };

  const handleSave = () => {
    // Validation
    if (!selectedVendorId) {
      alert("Please select a vendor");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    const invalidItems = items.filter(
      (item) =>
        !item.productId ||
        !item.quantity ||
        !item.costPrice ||
        parseFloat(item.quantity) <= 0 ||
        parseFloat(item.costPrice) <= 0
    );

    if (invalidItems.length > 0) {
      alert("Please complete all product details with valid values");
      return;
    }

    const vendor = vendors.find((v) => v.id === selectedVendorId);
    if (!vendor) return;

    // Prepare stock in record
    const stockInItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || item.productName,
        quantity: parseFloat(item.quantity),
        costPrice: parseFloat(item.costPrice),
        total: parseFloat(item.quantity) * parseFloat(item.costPrice),
      };
    });

    const totalAmount = calculateTotal();

    // Add stock in record
    addStockIn({
      vendorId: selectedVendorId,
      vendorName: vendor.name,
      items: stockInItems,
      totalAmount,
    });

    // Update products' stock and cost
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const newQuantity = product.stockQuantity + parseFloat(item.quantity);
        const newCostPrice = parseFloat(item.costPrice);

        // Calculate new average cost
        const totalCost =
          product.averageCostPrice * product.stockQuantity +
          newCostPrice * parseFloat(item.quantity);
        const newAvgCost = totalCost / newQuantity;

        // Determine status
        let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
        if (newQuantity === 0) status = "Out of Stock";
        else if (newQuantity < 10) status = "Low Stock";

        updateProduct(item.productId, {
          stockQuantity: newQuantity,
          lastCostPrice: newCostPrice,
          averageCostPrice: newAvgCost,
          status,
          vendorId: selectedVendorId,
        });
      }
    });

    // Update vendor balance
    updateVendor(selectedVendorId, {
      outstandingBalance: vendor.outstandingBalance + totalAmount,
    });

    // Show success and reset
    setShowSuccessModal(true);
    setSelectedVendorId("");
    setItems([]);
  };

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Stock In</h1>
        <p className="text-slate-600 mt-1">
          Record inventory supply from vendors
        </p>
      </div>

      {/* Compact Info Alert */}
      <Alert className="bg-theme-50 border-theme-200 py-2">
        <AlertDescription className="text-sm text-theme-dark">
          <strong>How it works:</strong> Select a vendor, add products with cost price
          and quantity. Stock will be automatically updated and vendor balance will
          increase.
        </AlertDescription>
      </Alert>

      {/* Main Form Card */}
      <Card className="p-6">
        <div className="space-y-5">
          {/* Step 1: Select Vendor */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              1. Select Vendor
            </Label>
            <div className="flex gap-3">
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-theme focus:border-theme"
              >
                <option value="">-- Select Vendor --</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => setShowAddVendorModal(true)}
                className="bg-theme hover:bg-theme-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Vendor
              </Button>
            </div>

            {selectedVendor && (
              <p className="text-sm text-slate-700 mt-2">
                <strong>Current Balance:</strong> ₨
                {selectedVendor.outstandingBalance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Step 2: Add Products - Always visible with table layout */}
          <div>
            <Label className="text-base font-semibold mb-3 block">2. Add Products</Label>

            {/* Table Header */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-3 bg-slate-50 px-4 py-3 border-b border-slate-200 font-medium text-sm text-slate-700 items-center">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Cost Price (₨)</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2 text-right">
                  <Button onClick={addItem} size="sm" className="bg-theme hover:bg-theme-dark h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Product Rows */}
              <div className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    No products added yet. Click "Add Product" to begin.
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 px-4 py-3 items-center">
                      <div className="col-span-4">
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updateItem(index, "productId", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          placeholder="0"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.costPrice}
                          onChange={(e) =>
                            updateItem(index, "costPrice", e.target.value)
                          }
                          placeholder="0"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm font-semibold">
                          ₨
                          {(
                            (parseFloat(item.quantity) || 0) *
                            (parseFloat(item.costPrice) || 0)
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <Button
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer with Add New Product Link */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="text-sm text-theme hover:text-theme-dark flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Don't see your product? Add New Product
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Review & Save - Always visible */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              3. Review & Save
            </Label>
            <div className="bg-theme-50 border border-theme-200 rounded-lg p-4 space-y-3">
              {/* Products List */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Products:</span>
                <div className="text-right">
                  {items.length === 0 ? (
                    <span className="text-slate-500">No products added</span>
                  ) : (
                    items.map((item, index) => {
                      const product = products.find((p) => p.id === item.productId);
                      const qty = parseFloat(item.quantity) || 0;
                      const price = parseFloat(item.costPrice) || 0;
                      return (
                        <div key={index} className="text-blue-900 font-medium">
                          {qty} units × ₨{price.toLocaleString()}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-theme-300"></div>

              {/* Total Quantity */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Total Quantity:</span>
                <span className="font-semibold">
                  {items.reduce(
                    (sum, item) => sum + (parseFloat(item.quantity) || 0),
                    0
                  )}{" "}
                  units
                </span>
              </div>

              {/* Total Cost */}
              <div className="flex justify-between">
                <span className="text-slate-700">Total Cost:</span>
                <span className="font-bold text-lg text-blue-900">
                  ₨{calculateTotal().toLocaleString()}
                </span>
              </div>

              {/* New Vendor Balance */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">New Vendor Balance:</span>
                <span className="font-semibold text-red-600">
                  ₨
                  {(
                    (selectedVendor?.outstandingBalance || 0) +
                    calculateTotal()
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => {
                  setSelectedVendorId("");
                  setItems([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!selectedVendorId || items.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Stock In
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Vendor Modal */}
      <Dialog open={showAddVendorModal} onOpenChange={setShowAddVendorModal}>
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
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
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
                className="min-h-[80px] resize-none border-slate-300 focus:border-theme focus:ring-theme"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAddVendorModal(false)}
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

      {/* Add Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-sm font-medium">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="e.g., Oil Filter"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCategory" className="text-sm font-medium">
                Category <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productCategory"
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
                placeholder="e.g., Filters"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productSalePrice" className="text-sm font-medium">
                Sale Price (₨) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productSalePrice"
                type="number"
                value={newProductSalePrice}
                onChange={(e) => setNewProductSalePrice(e.target.value)}
                placeholder="0"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddProductModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProduct}
              className="bg-theme hover:bg-theme-dark"
            >
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent aria-describedby={undefined}>
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Stock In Recorded Successfully!
            </h3>
            <p className="text-slate-600">
              Inventory has been updated and vendor balance increased.
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 bg-green-600 hover:bg-green-700"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}