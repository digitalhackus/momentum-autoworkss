import React, { useState } from "react";
import { Wrench, Package, Search, Plus, CheckCircle2, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../contexts/DataContext";

export function InvoiceItemPicker() {
  const { services, products, getVendorById } = useData();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SERVICES CARD */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-none">Services</h2>
                <p className="text-sm text-slate-500 mt-1">Select services to include</p>
              </div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-4 rounded-lg">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </header>

          <div className="border border-blue-100 rounded-xl p-4 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Select Services</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search services..." 
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredServices.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleService(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedServices.includes(item.id) 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectedServices.includes(item.id) ? "bg-blue-600 border-blue-600" : "border-slate-300"
                  }`}>
                    {selectedServices.includes(item.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">₨{item.price.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" className="flex-1 border-slate-200 font-bold text-slate-700 h-11 rounded-xl">
                Cancel
              </Button>
              <Button 
                disabled={selectedServices.length === 0}
                className={`flex-1 font-bold h-11 rounded-xl transition-all ${
                  selectedServices.length > 0 
                  ? "bg-theme hover:bg-theme-dark text-white shadow-md shadow-theme/20" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Done ({selectedServices.length})
              </Button>
            </div>
          </div>
        </section>

        {/* PRODUCTS CARD */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-none">Products (Inventory)</h2>
                <p className="text-sm text-slate-500 mt-1">Add used or sold products</p>
              </div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-4 rounded-lg">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </header>

          <div className="border border-blue-100 rounded-xl p-4 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Select Products</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search products..." 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors h-10 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleProduct(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedProducts.includes(item.id) 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    selectedProducts.includes(item.id) ? "bg-blue-600 border-blue-600" : "border-slate-300"
                  }`}>
                    {selectedProducts.includes(item.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">₨{item.salePrice.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Stock: {item.stockQuantity}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Vendor: {item.vendorId ? (getVendorById(item.vendorId)?.name || "-") : "-"}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" className="flex-1 border-slate-200 font-bold text-slate-700 h-11 rounded-xl">
                Cancel
              </Button>
              <Button 
                disabled={selectedProducts.length === 0}
                className={`flex-1 font-bold h-11 rounded-xl transition-all ${
                  selectedProducts.length > 0 
                  ? "bg-theme hover:bg-theme-dark text-white shadow-md shadow-theme/20" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Done ({selectedProducts.length})
              </Button>
            </div>
          </div>
        </section>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
