import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Package,
  Plus,
  Search,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function Products() {
  const { products, addProduct, updateProduct, vendors } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    salePrice: "",
    stockQuantity: "",
    vendorId: "",
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || !formData.salePrice) {
      alert("Please fill all required fields");
      return;
    }

    const stockQty = parseInt(formData.stockQuantity) || 0;
    
    // Determine status based on stock quantity
    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (stockQty === 0) status = "Out of Stock";
    else if (stockQty < 10) status = "Low Stock";

    addProduct({
      name: formData.name,
      category: formData.category,
      salePrice: parseFloat(formData.salePrice),
      lastCostPrice: 0,
      averageCostPrice: 0,
      stockQuantity: stockQty,
      status,
      vendorId: formData.vendorId,
    });

    setFormData({ name: "", category: "", salePrice: "", stockQuantity: "", vendorId: "" });
    setShowAddModal(false);
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        salePrice: product.salePrice.toString(),
        stockQuantity: product.stockQuantity.toString(),
        vendorId: product.vendorId || "",
      });
      setEditingProduct(productId);
      setShowAddModal(true);
    }
  };

  const handleUpdateProduct = () => {
    if (!formData.name || !formData.category || !formData.salePrice) {
      alert("Please fill all required fields");
      return;
    }

    if (editingProduct) {
      const stockQty = parseInt(formData.stockQuantity) || 0;
      
      // Determine status based on stock quantity
      let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
      if (stockQty === 0) status = "Out of Stock";
      else if (stockQty < 10) status = "Low Stock";

      updateProduct(editingProduct, {
        name: formData.name,
        category: formData.category,
        salePrice: parseFloat(formData.salePrice),
        stockQuantity: stockQty,
        status,
        vendorId: formData.vendorId,
      });
    }

    setFormData({ name: "", category: "", salePrice: "", stockQuantity: "", vendorId: "" });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock":
        return <Badge className="bg-theme text-white hover:bg-theme">In Stock</Badge>;
      case "Low Stock":
        return <Badge className="bg-amber-500 text-white hover:bg-amber-500">Low Stock</Badge>;
      case "Out of Stock":
        return <Badge className="bg-slate-600 text-white hover:bg-slate-600">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Theme Gradient Background */}
      <div 
        className="rounded-xl p-6 shadow-lg"
        style={{
          background: `linear-gradient(to right, var(--primary-color), var(--primary-color-dark))`
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold">Products</h1>
            </div>
            <p className="text-white/80">Manage your inventory products</p>
          </div>
          <Button
            onClick={() => {
              setFormData({ name: "", category: "", salePrice: "", stockQuantity: "", vendorId: "" });
              setEditingProduct(null);
              setShowAddModal(true);
            }}
            className="bg-white text-theme hover:bg-theme-50 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-theme-100 bg-gradient-to-br from-white to-theme-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Products</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{products.length}</p>
            </div>
            <div className="bg-theme-100 p-3 rounded-xl">
              <Package className="h-7 w-7 text-theme" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-green-100 bg-gradient-to-br from-white to-green-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">In Stock</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {products.filter((p) => p.status === "In Stock").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-red-100 bg-gradient-to-br from-white to-red-50/30 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {products.filter((p) => p.status === "Out of Stock").length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search with Blue Accent */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-300" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-theme-200 focus:border-theme-300 focus:ring-theme-300"
        />
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full table-fixed">
          <thead className="bg-gradient-to-r from-slate-50 to-theme-50 border-b border-theme-100">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-[18%]">
                Product Name
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-[12%]">
                Category
              </th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-[12%]">
                Vendor
              </th>
              <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider w-[13%]">
                Sale Price
              </th>
              <th className="px-3 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider w-[13%]">
                Cost Price
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider w-[10%]">
                Stock Qty
              </th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider w-[12%]">
                Status
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider w-[10%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-theme-50/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-900 truncate">{product.name}</div>
                </td>
                <td className="px-3 py-4">
                  <span className="text-slate-600 text-sm truncate block">{product.category}</span>
                </td>
                <td className="px-3 py-4">
                  <span className="text-slate-600 text-sm truncate block">{product.vendorName || '-'}</span>
                </td>
                <td className="px-3 py-4 text-right">
                  <span className="font-medium text-theme text-sm">₨{product.salePrice.toLocaleString()}</span>
                </td>
                <td className="px-3 py-4 text-right text-slate-700 text-sm">
                  ₨{product.lastCostPrice.toLocaleString()}
                </td>
                <td className="px-3 py-4 text-center">
                  <span className="font-medium text-slate-900 text-sm">{product.stockQuantity}</span>
                </td>
                <td className="px-3 py-4">
                  <div className="flex justify-center">
                    {getStatusBadge(product.status)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProduct(product.id)}
                      className="text-theme hover:text-theme-dark hover:bg-theme-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Products Cards - Mobile */}
      <div className="lg:hidden space-y-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 border-slate-200 hover:border-theme-200 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-600">{product.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(product.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditProduct(product.id)}
                  className="text-theme hover:bg-theme-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-600">Sale Price:</span>
                <p className="font-semibold text-theme">
                  ₨{product.salePrice.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-600">Cost Price:</span>
                <p className="font-semibold text-slate-900">
                  ₨{product.lastCostPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-600">Stock:</span>
                <p className="font-semibold text-slate-900">{product.stockQuantity}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[450px]" aria-describedby={undefined}>
          <DialogHeader className="space-y-1 pb-2 border-b">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <p className="text-xs text-slate-600">
              {editingProduct
                ? "Update product details below"
                : "Fill in the details to add a new product to your inventory"}
            </p>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Oil Filter"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="category"
                className="text-xs font-semibold text-slate-700"
              >
                Category <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Filters"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label
                  htmlFor="salePrice"
                  className="text-xs font-semibold text-slate-700"
                >
                  Sale Price (₨) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, salePrice: e.target.value })
                  }
                  placeholder="0"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="stockQuantity"
                  className="text-xs font-semibold text-slate-700"
                >
                  Stock Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: e.target.value })
                  }
                  placeholder="0"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="vendorId"
                className="text-xs font-semibold text-slate-700"
              >
                Vendor
              </Label>
              <Select
                value={formData.vendorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, vendorId: value })
                }
              >
                <SelectTrigger className="h-9 text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400">
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-gradient-to-r from-theme-50 to-theme-100 border-l-4 border-theme rounded-lg p-2.5">
              <div className="flex items-start gap-1.5">
                <div className="bg-theme rounded-full p-0.5 mt-0.5">
                  <AlertCircle className="h-2.5 w-2.5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-theme-dark">
                    Note
                  </p>
                  <p className="text-xs text-theme-darker mt-0.5 leading-tight">
                    Cost price is automatically updated when you add stock through "Stock In".
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2 border-t gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="px-5 h-9 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
              className="bg-theme hover:bg-theme-dark px-5 h-9 text-sm"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}