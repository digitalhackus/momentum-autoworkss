import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Plus, 
  Search, 
  Wrench, 
  Package, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  PlusCircle,
  MoreVertical,
  Filter
} from "lucide-react";
import { Badge } from "./ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function CatalogueSettings() {
  const { 
    services, 
    products, 
    addService, 
    updateService, 
    deleteService,
    addProduct,
    updateProduct,
    deleteProduct
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("services");

  // State for Service Dialog
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");

  // State for Product Dialog
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productStock, setProductStock] = useState("");

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenServiceDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name);
      setServicePrice(service.price.toString());
      setServiceCategory(service.category || "");
    } else {
      setEditingService(null);
      setServiceName("");
      setServicePrice("");
      setServiceCategory("");
    }
    setIsServiceDialogOpen(true);
  };

  const handleSaveService = () => {
    if (!serviceName || !servicePrice) return;

    if (editingService) {
      updateService(editingService.id, {
        name: serviceName,
        price: parseFloat(servicePrice),
        category: serviceCategory
      });
    } else {
      addService({
        name: serviceName,
        price: parseFloat(servicePrice),
        category: serviceCategory
      });
    }
    setIsServiceDialogOpen(false);
  };

  const handleOpenProductDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductName(product.name);
      setProductPrice(product.salePrice.toString());
      setProductCategory(product.category);
      setProductStock(product.stockQuantity.toString());
    } else {
      setEditingProduct(null);
      setProductName("");
      setProductPrice("");
      setProductCategory("");
      setProductStock("0");
    }
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productName || !productPrice) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productName,
        salePrice: parseFloat(productPrice),
        category: productCategory,
        stockQuantity: parseInt(productStock)
      });
    } else {
      addProduct({
        name: productName,
        category: productCategory,
        salePrice: parseFloat(productPrice),
        lastCostPrice: 0,
        averageCostPrice: 0,
        stockQuantity: parseInt(productStock)
      });
    }
    setIsProductDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Service & Product Catalogue</h3>
          <p className="text-sm text-slate-500">Manage items available for invoices and job cards</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "services" ? (
            <Button onClick={() => handleOpenServiceDialog()} className="bg-theme hover:bg-theme-dark rounded-xl px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          ) : (
            <Button onClick={() => handleOpenProductDialog()} className="bg-theme hover:bg-theme-dark rounded-xl px-6">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder={`Search ${activeTab}...`} 
          className="pl-10 h-11 bg-white border-slate-200 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#eff2f5] p-1.5 rounded-xl mb-6 flex w-full border-none h-auto">
          <TabsTrigger 
            value="services" 
            className="flex-1 py-2.5 rounded-lg transition-all data-[state=active]:bg-theme data-[state=active]:text-white font-bold text-[#1a1a1a] cursor-pointer gap-2"
          >
            <Wrench className="h-4 w-4" /> Services ({services.length})
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="flex-1 py-2.5 rounded-lg transition-all data-[state=active]:bg-theme data-[state=active]:text-white font-bold text-[#1a1a1a] cursor-pointer gap-2"
          >
            <Package className="h-4 w-4" /> Products ({products.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-0 space-y-4">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <Wrench className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No services found</p>
              <Button variant="link" onClick={() => handleOpenServiceDialog()} className="text-theme font-bold">
                Add your first service
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <Card key={service.id} className="border-slate-200 hover:shadow-md transition-all group overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Wrench className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenServiceDialog(service)} className="h-8 w-8 text-slate-600">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)} className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 truncate">{service.name}</h4>
                      {service.category && <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 hover:bg-slate-100 border-none">{service.category}</Badge>}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                        <span className="text-xs text-slate-500 font-medium">Standard Price</span>
                        <span className="text-lg font-black text-theme">₨{service.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-0 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No products found</p>
              <Button variant="link" onClick={() => handleOpenProductDialog()} className="text-theme font-bold">
                Add your first product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-slate-200 hover:shadow-md transition-all group overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-theme-50 rounded-lg">
                        <Package className="h-5 w-5 text-theme" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenProductDialog(product)} className="h-8 w-8 text-slate-600">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)} className="h-8 w-8 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 truncate">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none">{product.category}</Badge>
                        <Badge className={`${
                          product.status === 'In Stock' ? 'bg-green-100 text-green-700' : 
                          product.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        } border-none shadow-none`}>
                          {product.stockQuantity} in stock
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                        <span className="text-xs text-slate-500 font-medium">Selling Price</span>
                        <span className="text-lg font-black text-theme">₨{product.salePrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Service Modal */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              Enter the service details to add it to your catalogue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="s-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Name</Label>
              <Input 
                id="s-name" 
                value={serviceName} 
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Oil Change" 
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-price" className="text-xs font-bold uppercase tracking-wider text-slate-500">Standard Price (₨)</Label>
              <Input 
                id="s-price" 
                type="number"
                value={servicePrice} 
                onChange={(e) => setServicePrice(e.target.value)}
                placeholder="0" 
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-category" className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
              <Input 
                id="s-category" 
                value={serviceCategory} 
                onChange={(e) => setServiceCategory(e.target.value)}
                placeholder="e.g. Maintenance" 
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start gap-2">
            <Button onClick={handleSaveService} className="bg-theme hover:bg-theme-dark flex-1 h-12 rounded-xl font-bold text-white cursor-pointer active:scale-95 transition-all">
              Save Service
            </Button>
            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)} className="flex-1 h-12 rounded-xl border-slate-200 cursor-pointer">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              Enter the product details to add it to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Name</Label>
              <Input 
                id="p-name" 
                value={productName} 
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Engine Oil 5W-30" 
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-price" className="text-xs font-bold uppercase tracking-wider text-slate-500">Selling Price (₨)</Label>
                <Input 
                  id="p-price" 
                  type="number"
                  value={productPrice} 
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0" 
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-stock" className="text-xs font-bold uppercase tracking-wider text-slate-500">Initial Stock</Label>
                <Input 
                  id="p-stock" 
                  type="number"
                  value={productStock} 
                  onChange={(e) => setProductStock(e.target.value)}
                  placeholder="0" 
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-category" className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
              <Input 
                id="p-category" 
                value={productCategory} 
                onChange={(e) => setProductCategory(e.target.value)}
                placeholder="e.g. Oils" 
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start gap-2">
            <Button onClick={handleSaveProduct} className="bg-theme hover:bg-theme-dark flex-1 h-12 rounded-xl font-bold text-white cursor-pointer active:scale-95 transition-all">
              Save Product
            </Button>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)} className="flex-1 h-12 rounded-xl border-slate-200 cursor-pointer">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
