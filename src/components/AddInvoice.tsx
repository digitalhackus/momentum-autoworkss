import { CustomAlert } from "./CustomAlert";
import { AddVehicleModal, VehicleSelectionModal } from "./VehicleModals";
import { InvoiceTemplate } from "./InvoiceTemplate";
import { InvoicePreview } from "./InvoicePreview";
import { useState, useEffect, useMemo } from "react";
import { useData, type CustomerVehicle } from "../contexts/DataContext";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { 
  X, 
  Plus, 
  Trash2,
  User,
  Car,
  FileText,
  Search,
  Wrench,
  Package,
  DollarSign,
  ChevronLeft,
  Save,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Printer,
  Share2,
  Lock,
  Unlock,
  Edit2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

// Customer with vehicles for search + vehicle selection (built from API customers + getCustomerVehicles)
export interface CustomerWithVehicles {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicles: CustomerVehicle[];
}

// Services and products come from DataContext (Settings → Catalogue); fallback to empty if not loaded yet
const getServiceList = (ctx: { id: string; name: string; price: number; category?: string }[]) =>
  ctx?.length ? ctx : [];
const getProductList = (ctx: { id: string; name: string; salePrice: number; stockQuantity: number }[]) =>
  (ctx || []).map((p) => ({ id: p.id, name: p.name, price: p.salePrice, stock: p.stockQuantity, unit: "Piece" as const }));

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  isEditing?: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customerSupplied: boolean;
  stock?: number;
  unit?: string;
  isEditing?: boolean;
}

interface AddInvoiceProps {
  onClose?: () => void;
  onSubmit?: (data: any) => void;
  userRole?: "Admin" | "Supervisor" | "Technician";
  editInvoice?: any; // Invoice data to edit
}

export function AddInvoice({ onClose, onSubmit, userRole = "Admin", editInvoice }: AddInvoiceProps) {
  const { addInvoice, updateInvoice, customers, getCustomerById, getCustomerVehicles, addVehicle, addCustomer, services: contextServices, products: contextProducts } = useData();
  const { theme } = useTheme();

  // Services and products from catalogue (Settings) – so new items added there show here
  const serviceList = getServiceList(contextServices || []);
  const productList = getProductList(contextProducts || []);

  // Auto-save status
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [quickSearchQuery, setQuickSearchQuery] = useState("");
  const [showQuickSearchResults, setShowQuickSearchResults] = useState(false);
  
  // Locked fields state
  const [isCustomerLocked, setIsCustomerLocked] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Vehicle management: cache vehicles per customer (from API) so selection popup and search use saved vehicles
  const [vehiclesByCustomerId, setVehiclesByCustomerId] = useState<Record<string, CustomerVehicle[]>>({});
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showVehicleSelectionModal, setShowVehicleSelectionModal] = useState(false);
  const [customerForVehicleSelection, setCustomerForVehicleSelection] = useState<CustomerWithVehicles | null>(null);
  const [loadingVehiclesFor, setLoadingVehiclesFor] = useState<string | null>(null);
  
  // New vehicle form
  const [newVehicleMake, setNewVehicleMake] = useState("");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newVehicleYear, setNewVehicleYear] = useState("");
  const [newVehicleNumber, setNewVehicleNumber] = useState("");

  // Services
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [showServicePicker, setShowServicePicker] = useState(true);
  const [recentlyUsedServices, setRecentlyUsedServices] = useState<string[]>([]);
  const [tempSelectedServiceIds, setTempSelectedServiceIds] = useState<string[]>([]);

  // Products
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(true);
  const [recentlyUsedProducts, setRecentlyUsedProducts] = useState<string[]>([]);
  const [tempSelectedProductIds, setTempSelectedProductIds] = useState<string[]>([]);

  // Payment & Discount
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  
  // Custom Alert
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [stockAlertMessage, setStockAlertMessage] = useState("");
  
  // Invoice Preview Modal
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  
  // Track if invoice has been generated/saved
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);

  // Scroll modal to top when invoice preview opens
  useEffect(() => {
    if (showInvoicePreview) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const modalContent = document.querySelector('.invoice-printable-wrapper');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 10);
    }
  }, [showInvoicePreview]);

  // Pre-populate data when editing an invoice
  useEffect(() => {
    if (editInvoice) {
      // Set customer info
      setCustomerName(editInvoice.customer || "");
      setCustomerPhone(editInvoice.customerPhone || "");
      setCarMake(editInvoice.make || "");
      setCarModel(editInvoice.model || "");
      setVehicleNumber(editInvoice.plate || "");
      setSelectedCustomerId(editInvoice.customerId || null);
      setIsCustomerLocked(true);
      
      // Set payment method
      if (editInvoice.paymentMethod) {
        setPaymentMethod(editInvoice.paymentMethod.toLowerCase());
      }
      
      // Set discount
      if (editInvoice.discountPercentage) {
        setDiscountPercentage(editInvoice.discountPercentage);
      }
      
      // Set services and products from items
      if (editInvoice.items && editInvoice.items.length > 0) {
        const services: ServiceItem[] = [];
        const products: ProductItem[] = [];
        
        editInvoice.items.forEach((item: any) => {
          if (item.type === 'service') {
            // Try to find the service in serviceList by name to get the correct ID
            const matchingService = serviceList.find(s => s.name === item.description);
            services.push({
              id: matchingService?.id || item.id || `SRV-${Date.now()}-${Math.random()}`,
              name: item.description,
              price: item.price || item.unitPrice || 0,
              quantity: item.quantity || 1,
              customerSupplied: false,
            });
          } else if (item.type === 'product') {
            // Try to find the product in productList by name to get the correct ID
            const matchingProduct = productList.find(p => p.name === item.description);
            products.push({
              id: matchingProduct?.id || item.id || `PRD-${Date.now()}-${Math.random()}`,
              name: item.description,
              price: item.price || item.unitPrice || 0,
              quantity: item.quantity || 1,
              customerSupplied: item.customerSupplied || false,
            });
          }
        });
        
        setSelectedServices(services);
        setSelectedProducts(products);
      }
      
      // Mark as having unsaved changes since we're editing
      setHasUnsavedChanges(true);
    }
  }, [editInvoice]);

  const canEditPricing = userRole === "Admin";

  // Payment methods with tax rates - using theme settings (reactive to theme changes)
  const paymentMethods = useMemo(() => [
    { id: "cash", label: "Cash", icon: Banknote, taxRate: (theme.taxRates?.cash ?? 0) / 100 },
    { id: "card", label: "Card/POS", icon: CreditCard, taxRate: (theme.taxRates?.card ?? theme.taxRate) / 100 },
    { id: "online", label: "Online Transfer", icon: Smartphone, taxRate: (theme.taxRates?.online ?? theme.taxRate) / 100 },
  ], [theme.taxRates, theme.taxRate]);

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === paymentMethod);

  // Calculations
  const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const productsTotal = selectedProducts.reduce((sum, product) => 
    product.customerSupplied ? sum : sum + (product.price * product.quantity), 
    0
  );
  const subtotal = servicesTotal + productsTotal;
  const discountAmount = subtotal * (discountPercentage / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxRate = selectedPaymentMethod?.taxRate || 0;
  const tax = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + tax;

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (customerName || customerPhone || selectedServices.length > 0 || selectedProducts.length > 0) {
        setIsSaving(true);
        // Simulate auto-save
        setTimeout(() => {
          setLastSaved(new Date());
          setIsSaving(false);
          // Don't clear unsaved changes - only manual save does that
        }, 500);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [customerName, customerPhone, carMake, carModel, vehicleNumber, selectedServices, selectedProducts, paymentMethod, discountPercentage]);

  // Track unsaved changes
  useEffect(() => {
    if (customerName || customerPhone || carMake || carModel || vehicleNumber || 
        selectedServices.length > 0 || selectedProducts.length > 0 || 
        discountPercentage > 0 || paymentMethod !== "cash") {
      setHasUnsavedChanges(true);
    }
  }, [customerName, customerPhone, carMake, carModel, vehicleNumber, selectedServices, selectedProducts, paymentMethod, discountPercentage]);

  // Service handlers
  const toggleServiceSelection = (serviceId: string) => {
    setTempSelectedServiceIds(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const addSelectedServices = () => {
    const servicesToAdd = serviceList.filter(s => 
      tempSelectedServiceIds.includes(s.id) && !selectedServices.find(ss => ss.id === s.id)
    );
    
    setSelectedServices([
      ...selectedServices, 
      ...servicesToAdd.map(s => ({ ...s, isEditing: false }))
    ]);
    
    // Update recently used
    const newRecentIds = tempSelectedServiceIds.filter(id => !recentlyUsedServices.includes(id));
    setRecentlyUsedServices([...newRecentIds, ...recentlyUsedServices].slice(0, 4));
    
    // Clear temp selection and close picker
    setTempSelectedServiceIds([]);
    setShowServicePicker(false);
    setServiceSearch("");
  };

  const addService = (service: typeof serviceList[0]) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, { ...service, isEditing: false }]);
      setRecentlyUsedServices([service.id, ...recentlyUsedServices.filter(id => id !== service.id).slice(0, 4)]);
    }
  };

  const removeService = (id: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== id));
  };

  const updateServicePrice = (id: string, newPrice: number) => {
    setSelectedServices(selectedServices.map(s => 
      s.id === id ? { ...s, price: newPrice } : s
    ));
  };

  const toggleServiceEditing = (id: string) => {
    setSelectedServices(selectedServices.map(s => 
      s.id === id ? { ...s, isEditing: !s.isEditing } : s
    ));
  };

  // Product handlers
  const toggleProductSelection = (productId: string) => {
    setTempSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addSelectedProducts = () => {
    const productsToAdd = productList.filter(p => 
      tempSelectedProductIds.includes(p.id) && !selectedProducts.find(sp => sp.id === p.id)
    );
    
    setSelectedProducts([
      ...selectedProducts, 
      ...productsToAdd.map(p => ({ ...p, quantity: 1, customerSupplied: false, isEditing: false }))
    ]);
    
    // Update recently used
    const newRecentIds = tempSelectedProductIds.filter(id => !recentlyUsedProducts.includes(id));
    setRecentlyUsedProducts([...newRecentIds, ...recentlyUsedProducts].slice(0, 4));
    
    // Clear temp selection and close picker
    setTempSelectedProductIds([]);
    setShowProductPicker(false);
    setProductSearch("");
  };

  const addProduct = (product: typeof productList[0]) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      updateProductQuantity(product.id, existing.quantity + 1);
    } else {
      setSelectedProducts([...selectedProducts, {
        ...product,
        quantity: 1,
        customerSupplied: false,
      }]);
      setRecentlyUsedProducts([product.id, ...recentlyUsedProducts.filter(id => id !== product.id).slice(0, 4)]);
    }
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
  };

  const updateProductQuantity = (id: string, quantity: number) => {
    const product = selectedProducts.find(p => p.id === id);
    
    // Allow any value during typing (including 0 for empty state)
    if (quantity === 0 || isNaN(quantity)) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === id ? { ...p, quantity: 0 } : p
      ));
      return;
    }
    
    if (product && product.stock && quantity > product.stock && !product.customerSupplied) {
      setStockAlertMessage(`Cannot add more than ${product.stock} ${product.unit}. Only ${product.stock} available in stock!`);
      setShowStockAlert(true);
      return;
    }
    setSelectedProducts(selectedProducts.map(p => 
      p.id === id ? { ...p, quantity: Math.max(1, Math.min(quantity, p.stock || 9999)) } : p
    ));
  };

  const updateProductPrice = (id: string, price: number) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === id ? { ...p, price } : p
    ));
  };

  const toggleCustomerSupplied = (id: string) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === id ? { ...p, customerSupplied: !p.customerSupplied } : p
    ));
  };

  const toggleProductEditing = (id: string) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === id ? { ...p, isEditing: !p.isEditing } : p
    ));
  };

  // Quick fill customer from search (customer must include vehicles from API)
  const fillCustomerData = (customer: CustomerWithVehicles) => {
    if (customer.vehicles.length > 1) {
      setCustomerForVehicleSelection(customer);
      setShowVehicleSelectionModal(true);
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      setIsCustomerLocked(true);
      setSelectedCustomerId(customer.id);
    } else if (customer.vehicles.length === 1) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      setCarMake(customer.vehicles[0].carMake);
      setCarModel(customer.vehicles[0].carModel);
      setCarYear(customer.vehicles[0].carYear || "");
      setVehicleNumber(customer.vehicles[0].vehicleNumber);
      setIsCustomerLocked(true);
      setSelectedCustomerId(customer.id);
    } else {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      setCarMake("");
      setCarModel("");
      setCarYear("");
      setVehicleNumber("");
      setIsCustomerLocked(true);
      setSelectedCustomerId(customer.id);
    }
  };

  // When user clicks a customer in search: fetch vehicles (or use cache) then fill
  const handleSelectCustomerFromSearch = async (customer: { id: string; name: string; phone: string; email?: string }) => {
    let list = vehiclesByCustomerId[customer.id];
    if (list === undefined) {
      setLoadingVehiclesFor(customer.id);
      try {
        list = await getCustomerVehicles(customer.id);
        setVehiclesByCustomerId((prev) => ({ ...prev, [customer.id]: list }));
      } finally {
        setLoadingVehiclesFor(null);
      }
    }
    fillCustomerData({ ...customer, vehicles: list || [] });
  };

  // Handle vehicle selection from modal
  const handleSelectVehicle = (vehicle: CustomerVehicle) => {
    setCarMake(vehicle.carMake);
    setCarModel(vehicle.carModel);
    setCarYear(vehicle.carYear || "");
    setVehicleNumber(vehicle.vehicleNumber);
  };

  // Handle adding new vehicle
  const handleAddNewVehicle = () => {
    if (!isCustomerLocked || !customerName || !customerPhone) {
      alert("Please select a customer first from Quick Fill");
      return;
    }
    setShowAddVehicleModal(true);
  };

  // Save new vehicle to backend and add to customer's list so it appears in vehicle selection popup
  const handleSaveNewVehicle = async () => {
    if (!selectedCustomerId) return;
    try {
      const newVehicle = await addVehicle(selectedCustomerId, {
        carMake: newVehicleMake,
        carModel: newVehicleModel,
        carYear: newVehicleYear || undefined,
        vehicleNumber: newVehicleNumber,
      });
      setVehiclesByCustomerId((prev) => ({
        ...prev,
        [selectedCustomerId]: [...(prev[selectedCustomerId] || []), newVehicle],
      }));
      if (customerForVehicleSelection?.id === selectedCustomerId) {
        setCustomerForVehicleSelection((prev) =>
          prev ? { ...prev, vehicles: [...prev.vehicles, newVehicle] } : null
        );
      }
      setCarMake(newVehicleMake);
      setCarModel(newVehicleModel);
      setCarYear(newVehicleYear);
      setVehicleNumber(newVehicleNumber);
      setNewVehicleMake("");
      setNewVehicleModel("");
      setNewVehicleYear("");
      setNewVehicleNumber("");
      setShowAddVehicleModal(false);
    } catch (e) {
      alert("Failed to save vehicle. Please try again.");
    }
  };

  const filteredServices = serviceList.filter(s =>
    s.name.toLowerCase().startsWith(serviceSearch.toLowerCase())
  );

  const filteredProducts = productList.filter(p =>
    p.name.toLowerCase().startsWith(productSearch.toLowerCase())
  );

  // Sort filtered services by recently used first
  const sortedFilteredServices = [...filteredServices].sort((a, b) => {
    const aIndex = recentlyUsedServices.indexOf(a.id);
    const bIndex = recentlyUsedServices.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  // Sort filtered products by recently used first
  const sortedFilteredProducts = [...filteredProducts].sort((a, b) => {
    const aIndex = recentlyUsedProducts.indexOf(a.id);
    const bIndex = recentlyUsedProducts.indexOf(b.id);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  // Filtered customers based on quick search (uses real customers from API)
  const filteredQuickSearchCustomers = customers.filter((c) => {
    if (!quickSearchQuery) return false;
    const query = quickSearchQuery.toLowerCase();
    const name = c.name.toLowerCase();
    const nameMatch = name.startsWith(query);
    const cleanPhone = (c.phone || "").replace(/[\s-]/g, "");
    const phoneDigits = cleanPhone.replace(/^\+?\d{0,2}/, "");
    const phoneMatch = phoneDigits.includes(quickSearchQuery.replace(/\D/g, ""));
    return nameMatch || phoneMatch;
  });

  // Only phone number is mandatory - must start with +92 3 and have exactly 10 digits
  const phoneDigits = customerPhone.replace(/[^\d]/g, '').slice(2); // Remove +92 and get remaining digits
  const isFormValid = customerPhone && phoneDigits.length === 10 && phoneDigits.startsWith('3');

  // Handler functions
  const handlePrintInvoice = () => {
    if (!isFormValid) {
      alert("Please fill in all required fields before printing the invoice.");
      return;
    }
    setShowInvoicePreview(true);
  };

  const handleShareInvoice = () => {
    console.log("Sharing invoice...");
    // Share functionality - could open a modal with share options (WhatsApp, Email, etc.)
    alert("Share options will be displayed here");
  };

  // Clear entire invoice - refresh everything
  const clearEntireInvoice = () => {
    // Customer info
    setCustomerName("");
    setCustomerPhone("");
    setCarMake("");
    setCarModel("");
    setCarYear("");
    setVehicleNumber("");
    setQuickSearchQuery("");
    setShowQuickSearchResults(false);
    
    // Locked fields
    setIsCustomerLocked(false);
    setSelectedCustomerId(null);
    
    // Vehicle modals
    setShowAddVehicleModal(false);
    setShowVehicleSelectionModal(false);
    setCustomerForVehicleSelection(null);
    
    // New vehicle form
    setNewVehicleMake("");
    setNewVehicleModel("");
    setNewVehicleYear("");
    setNewVehicleNumber("");
    
    // Services
    setSelectedServices([]);
    setServiceSearch("");
    setShowServicePicker(true);
    setTempSelectedServiceIds([]);
    
    // Products
    setSelectedProducts([]);
    setProductSearch("");
    setShowProductPicker(true);
    setTempSelectedProductIds([]);
    
    // Payment & Discount
    setPaymentMethod("cash");
    setDiscountPercentage(0);
    
    // Auto-save states
    setLastSaved(null);
    setIsSaving(false);
    setHasUnsavedChanges(false);
    setShowSaveSuccess(false);
    
    // Invoice generation state
    setIsInvoiceGenerated(false);
    
    // Alerts
    setShowStockAlert(false);
    setStockAlertMessage("");
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 space-y-4">
          
          {/* Customer & Vehicle Section - Side by Side */}
          <div className="space-y-3">
            {/* Quick Customer Search - Above Both Cards */}
            <Card className="p-3 border-theme-200 bg-gradient-to-r from-theme-50 to-indigo-50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-theme rounded-lg flex items-center justify-center">
                  <Search className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Quick Fill from Existing Customer</h4>
                  <p className="text-xs text-slate-700">Search to auto-fill customer and vehicle details</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, or vehicle number..."
                  className="pl-10 bg-white border-theme-200 focus:border-theme-300 h-9"
                  value={quickSearchQuery}
                  onChange={(e) => {
                    setQuickSearchQuery(e.target.value);
                    setShowQuickSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowQuickSearchResults(quickSearchQuery.length > 0)}
                />
                
                {/* Search Results Dropdown */}
                {showQuickSearchResults && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredQuickSearchCustomers.length > 0 ? (
                      <div className="p-1">
                        {filteredQuickSearchCustomers.map((customer) => {
                          const cachedVehicles = vehiclesByCustomerId[customer.id];
                          const isLoading = loadingVehiclesFor === customer.id;
                          return (
                            <button
                              key={customer.id}
                              onClick={() => {
                                handleSelectCustomerFromSearch(customer);
                                setQuickSearchQuery("");
                                setShowQuickSearchResults(false);
                              }}
                              disabled={isLoading}
                              className="w-full p-3 text-left rounded-lg hover:bg-theme-50 transition-colors disabled:opacity-70"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{customer.name}</p>
                                  <p className="text-xs text-slate-500">{customer.phone}</p>
                                </div>
                                <div className="text-right">
                                  {isLoading ? (
                                    <p className="text-xs text-slate-400">Loading...</p>
                                  ) : cachedVehicles && cachedVehicles.length > 0 ? (
                                    <>
                                      {cachedVehicles.slice(0, 2).map((vehicle) => (
                                        <div key={vehicle.id}>
                                          <p className="text-xs text-slate-600">{vehicle.carMake} {vehicle.carModel}</p>
                                          <p className="text-xs text-slate-500 font-medium">{vehicle.vehicleNumber}</p>
                                        </div>
                                      ))}
                                      {cachedVehicles.length > 2 && (
                                        <p className="text-xs text-slate-400 mt-1">+{cachedVehicles.length - 2} more</p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-xs text-slate-400">Select to choose vehicle</p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-500 mb-2">No matching customers found</p>
                        <button
                          onClick={() => {
                            setQuickSearchQuery("");
                            setShowQuickSearchResults(false);
                          }}
                          className="text-sm text-theme hover:text-theme-dark"
                        >
                          Clear and enter manually
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Customer and Vehicle Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Customer Information */}
              <Card className="p-4 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-theme-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-theme" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Customer Information</h3>
                      <p className="text-xs text-slate-500">Enter customer details</p>
                    </div>
                  </div>
                  {(customerName || customerPhone || carMake || carModel || vehicleNumber) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearEntireInvoice}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-1.5">
                      Customer Name
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`h-9 ${isCustomerLocked ? 'bg-theme-50 border-theme-200' : ''}`}
                        disabled={isCustomerLocked}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter phone number"
                        value={customerPhone}
                        onChange={(e) => {
                          const value = e.target.value;
                          
                          // If field is empty and user starts typing, add +92
                          if (!customerPhone && value && !value.startsWith('+92')) {
                            setCustomerPhone('+92 3' + value.replace(/\D/g, ''));
                            return;
                          }
                          
                          // Only allow numbers after +92
                          if (value.startsWith('+92')) {
                            // Extract only digits after +92
                            const digits = value.slice(3).replace(/\D/g, '');
                            
                            // First digit after +92 must be 3
                            if (digits.length > 0 && digits[0] !== '3') {
                              return; // Don't update if first digit is not 3
                            }
                            
                            // Limit to 10 digits after +92
                            if (digits.length <= 10) {
                              setCustomerPhone('+92 ' + digits);
                            }
                          } else if (value === '') {
                            setCustomerPhone('');
                          }
                        }}
                        onFocus={(e) => {
                          // Auto-add +92 when field is focused and empty
                          if (!customerPhone) {
                            setCustomerPhone('+92 ');
                          }
                        }}
                        onBlur={(e) => {
                          // Clear field if only +92 is present (no actual phone number)
                          if (customerPhone === '+92 ' || customerPhone === '+92') {
                            setCustomerPhone('');
                          }
                        }}
                        className={`h-9 ${isCustomerLocked ? 'bg-theme-50 border-theme-200' : ''}`}
                        disabled={isCustomerLocked}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Vehicle Information */}
              <Card className="p-4 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-theme-100 rounded-lg flex items-center justify-center">
                      <Car className="h-4 w-4 text-theme" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">Vehicle Information</h3>
                      <p className="text-xs text-slate-500">Enter vehicle details</p>
                    </div>
                  </div>
                  {isCustomerLocked && (
                    <Button
                      size="sm"
                      onClick={handleAddNewVehicle}
                      className="bg-theme hover:bg-theme-dark h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs mb-1.5">
                        Make
                      </Label>
                      <Input
                        placeholder="e.g., Toyota"
                        value={carMake}
                        onChange={(e) => setCarMake(e.target.value)}
                        className={`h-9 ${isCustomerLocked ? 'bg-theme-50 border-theme-200' : ''}`}
                        disabled={isCustomerLocked}
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5">
                        Model
                      </Label>
                      <Input
                        placeholder="e.g., Corolla"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        className={`h-9 ${isCustomerLocked ? 'bg-theme-50 border-theme-200' : ''}`}
                        disabled={isCustomerLocked}
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1.5">
                        Year
                      </Label>
                      <Input
                        placeholder="e.g., 2021"
                        value={carYear}
                        onChange={(e) => setCarYear(e.target.value)}
                        className={`h-9 ${isCustomerLocked ? 'bg-theme-50 border-theme-200' : ''}`}
                        disabled={isCustomerLocked}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5">
                      Vehicle Registration Number
                    </Label>
                    <Input
                      placeholder="e.g., ISB-1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className={`h-9 ${isCustomerLocked ? 'bg-theme-50 border-theme-200' : ''}`}
                      disabled={isCustomerLocked}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Services & Products Section - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Services Section */}
            <Card className="p-4 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-theme-100 rounded-lg flex items-center justify-center">
                    <Wrench className="h-4 w-4 text-theme" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Services</h3>
                    <p className="text-xs text-slate-500">Select services to include</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowServicePicker(true)}
                  className="bg-theme hover:bg-theme-dark h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add
                </Button>
              </div>

              {/* Service Picker */}
              {showServicePicker && (
                <div className="mb-3 p-3 bg-gradient-to-br from-theme-50 to-theme-100 rounded-lg border-2 border-theme-200 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">Select Services</h4>
                    {tempSelectedServiceIds.length > 0 && (
                      <Badge className="bg-theme text-white text-xs">
                        {tempSelectedServiceIds.length} selected
                      </Badge>
                    )}
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search services..."
                      className="pl-9 h-8 text-sm bg-white"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto mb-3">
                    {sortedFilteredServices.map((service) => {
                      const isAlreadyAdded = !!selectedServices.find(s => s.id === service.id);
                      const isSelected = tempSelectedServiceIds.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => !isAlreadyAdded && toggleServiceSelection(service.id)}
                          className={`p-2 border-2 rounded-lg transition-all cursor-pointer ${
                            isAlreadyAdded
                              ? 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-white border-theme shadow-sm'
                              : 'bg-white border-slate-200 hover:border-theme-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={isSelected}
                              disabled={isAlreadyAdded}
                              onCheckedChange={(checked) => {
                                if (!isAlreadyAdded) {
                                  toggleServiceSelection(service.id);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs truncate">{service.name}</p>
                              <p className="text-xs font-semibold text-theme">₨{service.price.toLocaleString()}</p>
                              {isAlreadyAdded && (
                                <p className="text-xs text-slate-500 italic">Already added</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowServicePicker(false);
                        setTempSelectedServiceIds([]);
                        setServiceSearch("");
                      }}
                      variant="outline"
                      className="flex-1 h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={addSelectedServices}
                      disabled={tempSelectedServiceIds.length === 0}
                      className="flex-1 h-9 bg-theme hover:bg-theme-dark"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Done ({tempSelectedServiceIds.length})
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected Services */}
              {selectedServices.length === 0 && !showServicePicker ? (
                <div className="text-center py-6 text-slate-400">
                  <Wrench className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No services selected yet</p>
                </div>
              ) : selectedServices.length > 0 ? (
                <div className="space-y-2">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{service.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.isEditing && canEditPricing ? (
                          <div className="w-24">
                            <Input
                              type="number"
                              value={service.price}
                              onChange={(e) => updateServicePrice(service.id, parseFloat(e.target.value) || 0)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  toggleServiceEditing(service.id);
                                }
                              }}
                              className="text-right h-8 text-sm no-spinner"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-medium w-24 text-right">
                            ₨{service.price.toLocaleString()}
                          </span>
                        )}
                        {canEditPricing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleServiceEditing(service.id)}
                            className="text-theme hover:text-theme-dark hover:bg-theme-50 h-8 w-8"
                          >
                            {service.isEditing ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Edit2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeService(service.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!canEditPricing && (
                    <div className="flex items-center gap-2 text-orange-600 text-xs p-2 bg-orange-50 rounded">
                      <AlertCircle className="h-3 w-3" />
                      <span>Only Admins can edit service prices</span>
                    </div>
                  )}
                </div>
              ) : null}
            </Card>

            {/* Products Section */}
            <Card className="p-4 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-theme-100 rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-theme" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Products (Inventory)</h3>
                    <p className="text-xs text-slate-500">Add used or sold products</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowProductPicker(true)}
                  className="bg-theme hover:bg-theme-dark h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add
                </Button>
              </div>

              {/* Product Picker */}
              {showProductPicker && (
                <div className="mb-3 p-3 bg-gradient-to-br from-theme-50 to-theme-100 rounded-lg border-2 border-theme-200 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">Select Products</h4>
                    {tempSelectedProductIds.length > 0 && (
                      <Badge className="bg-theme text-white text-xs">
                        {tempSelectedProductIds.length} selected
                      </Badge>
                    )}
                  </div>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      className="pl-9 h-8 text-sm bg-white"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto mb-3">
                    {sortedFilteredProducts.map((product) => {
                      const isAlreadyAdded = !!selectedProducts.find(p => p.id === product.id);
                      const isSelected = tempSelectedProductIds.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => !isAlreadyAdded && toggleProductSelection(product.id)}
                          className={`p-2 border-2 rounded-lg transition-all cursor-pointer ${
                            isAlreadyAdded
                              ? 'bg-slate-100 border-slate-300 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-white border-theme shadow-sm'
                              : 'bg-white border-slate-200 hover:border-theme-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={isSelected}
                              disabled={isAlreadyAdded}
                              onCheckedChange={(checked) => {
                                if (!isAlreadyAdded) {
                                  toggleProductSelection(product.id);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs truncate">{product.name}</p>
                              <p className="text-xs font-semibold text-theme">₨{product.price.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">Stock: {product.stock}</p>
                              {isAlreadyAdded && (
                                <p className="text-xs text-slate-500 italic">Already added</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowProductPicker(false);
                        setTempSelectedProductIds([]);
                        setProductSearch("");
                      }}
                      variant="outline"
                      className="flex-1 h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={addSelectedProducts}
                      disabled={tempSelectedProductIds.length === 0}
                      className="flex-1 h-9 bg-theme hover:bg-theme-dark"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Done ({tempSelectedProductIds.length})
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected Products */}
              {selectedProducts.length === 0 && !showProductPicker ? (
                <div className="text-center py-6 text-slate-400">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No products added yet</p>
                </div>
              ) : selectedProducts.length > 0 ? (
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Checkbox
                            id={`customer-supplied-${product.id}`}
                            checked={product.customerSupplied}
                            onCheckedChange={() => toggleCustomerSupplied(product.id)}
                            className="h-3 w-3"
                          />
                          <Label
                            htmlFor={`customer-supplied-${product.id}`}
                            className="text-xs text-slate-500 cursor-pointer"
                          >
                            Customer Supplied
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center ml-auto">
                        {!product.customerSupplied && (
                          <>
                            <div className="w-14">
                              <Input
                                type="number"
                                min="1"
                                value={product.quantity || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow clearing the field
                                  if (value === '') {
                                    updateProductQuantity(product.id, 0);
                                    return;
                                  }
                                  const numValue = parseInt(value);
                                  if (!isNaN(numValue)) {
                                    updateProductQuantity(product.id, numValue);
                                  }
                                }}
                                onBlur={(e) => {
                                  // Ensure valid value on blur
                                  const value = e.target.value;
                                  if (value === '' || parseInt(value) < 1) {
                                    updateProductQuantity(product.id, 1);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const value = (e.target as HTMLInputElement).value;
                                    if (value === '' || parseInt(value) < 1) {
                                      updateProductQuantity(product.id, 1);
                                    }
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="text-center h-8 text-sm"
                              />
                            </div>
                            {product.isEditing && canEditPricing ? (
                              <div className="w-24">
                                <Input
                                  type="number"
                                  value={product.price}
                                  onChange={(e) => updateProductPrice(product.id, parseFloat(e.target.value) || 0)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      toggleProductEditing(product.id);
                                    }
                                  }}
                                  className="text-right no-spinner h-8 text-sm"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span className="text-sm font-medium w-24 text-right">
                                ₨{(product.price * product.quantity).toLocaleString()}
                              </span>
                            )}
                            {canEditPricing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleProductEditing(product.id)}
                                className="text-theme hover:text-theme-dark hover:bg-theme-50 h-8 w-8"
                              >
                                {product.isEditing ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <Edit2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            )}
                          </>
                        )}
                        {product.customerSupplied && (
                          <Badge variant="outline" className="text-xs">
                            Customer Supplied
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProduct(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!canEditPricing && (
                    <div className="flex items-center gap-2 text-orange-600 text-xs p-2 bg-orange-50 rounded">
                      <AlertCircle className="h-3 w-3" />
                      <span>Only Admins can edit product prices</span>
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          </div>

          {/* Payment & Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Method */}
            <Card className="p-4 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-theme-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-theme" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Payment Method</h3>
                  <p className="text-xs text-slate-500">Tax varies by payment type</p>
                </div>
              </div>

              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-theme bg-theme-50"
                          : "border-slate-200 hover:border-theme-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isSelected ? "text-theme" : "text-slate-600"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-slate-500">
                            Tax: {method.taxRate === 0 ? "0%" : `${(method.taxRate * 100).toFixed(0)}%`}
                          </p>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-theme" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Invoice Summary */}
            <Card className="p-4 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-theme-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-theme" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Invoice Summary</h3>
                  <p className="text-xs text-slate-500">Clear cost breakdown</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Services ({selectedServices.length})</span>
                  <span className="font-medium">₨{servicesTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Products ({selectedProducts.filter(p => !p.customerSupplied).length})
                  </span>
                  <span className="font-medium">₨{productsTotal.toLocaleString()}</span>
                </div>
                {selectedProducts.some(p => p.customerSupplied) && (
                  <div className="flex items-center justify-between text-xs text-slate-500 italic">
                    <span>Customer Supplied Items</span>
                    <span>Not included</span>
                  </div>
                )}
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">₨{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-slate-600">Discount</span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={discountPercentage === 0 ? "" : discountPercentage}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                        setDiscountPercentage(Math.max(0, Math.min(100, value || 0)));
                      }}
                      min="0"
                      max="100"
                      placeholder="0"
                      className="w-14 h-7 text-right text-xs no-spinner"
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <span className="text-xs font-medium w-20 text-right">-₨{discountAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Subtotal After Discount</span>
                  <span className="font-medium">₨{subtotalAfterDiscount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Tax ({(taxRate * 100).toFixed(0)}% - {selectedPaymentMethod?.label})
                  </span>
                  <span className="font-medium">₨{tax.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-base font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-slate-900">₨{total.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t bg-white shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Save Status Indicators */}
            {hasUnsavedChanges && !isSaving && !showSaveSuccess && (
              <span className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </span>
            )}
            {isSaving && (
              <span className="flex items-center gap-2 text-theme text-sm">
                <div className="h-4 w-4 border-2 border-theme border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            )}
            {showSaveSuccess && (
              <span className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Changes saved
              </span>
            )}
            
            {/* Form Validation Status */}
            <div className="text-sm text-slate-500">
              {isFormValid ? (
                <span className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Ready to save
                </span>
              ) : (
                <span className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  Phone number is required
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                if (hasUnsavedChanges) {
                  const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to leave?");
                  if (confirmClose && onClose) {
                    onClose();
                  }
                } else if (onClose) {
                  onClose();
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-theme hover:bg-theme-dark"
              disabled={!isFormValid}
              onClick={async () => {
                // Prepare invoice items
                const invoiceItems = [
                  ...selectedServices.map((service) => ({
                    id: service.id,
                    description: service.name,
                    quantity: 1,
                    price: service.price,
                    type: 'service' as const,
                  })),
                  ...selectedProducts.map((product) => ({
                    id: product.id,
                    description: product.name,
                    quantity: product.quantity,
                    price: product.price,
                    type: 'product' as const,
                    customerSupplied: product.customerSupplied,
                  })),
                ];
                
                // Resolve customer: use quick-fill selection, existing by phone, or create new + vehicle
                let customerId = selectedCustomerId;
                if (!customerId) {
                  const existingCustomer = customers.find(c => c.phone === customerPhone);
                  if (existingCustomer) {
                    customerId = existingCustomer.id;
                  } else {
                    // Customer not in DB: create customer (and vehicle if details entered), then use new id
                    try {
                      const newCustomer = await addCustomer({
                        name: customerName?.trim() || "Walk-in Customer",
                        phone: customerPhone.trim(),
                        status: "Active",
                      });
                      customerId = newCustomer.id;
                      // Persist the vehicle entered in the invoice form under this same customer.
                      if (carMake?.trim() || carModel?.trim() || vehicleNumber?.trim() || carYear?.trim()) {
                        if (!carMake?.trim() || !carModel?.trim() || !vehicleNumber?.trim()) {
                          toast.error("Please enter vehicle Make, Model, and Registration Number.");
                          return;
                        }
                        const createdVehicle = await addVehicle(customerId, {
                          carMake: carMake.trim(),
                          carModel: carModel.trim(),
                          carYear: carYear?.trim() || undefined,
                          vehicleNumber: vehicleNumber.trim(),
                        });
                        // Lock to the newly created customer/vehicle so subsequent UI uses the saved records.
                        setSelectedCustomerId(customerId);
                        setIsCustomerLocked(true);
                        setVehiclesByCustomerId((prev) => ({
                          ...prev,
                          [customerId]: [...(prev[customerId] || []), createdVehicle],
                        }));
                        setCustomerForVehicleSelection((prev) => ({
                          id: customerId,
                          name: newCustomer.name,
                          phone: newCustomer.phone,
                          email: newCustomer.email,
                          vehicles: [createdVehicle],
                        }));
                      } else {
                        // No vehicle details provided; still lock to created customer.
                        setSelectedCustomerId(customerId);
                        setIsCustomerLocked(true);
                      }
                    } catch (err) {
                      console.error("Create customer/vehicle failed:", err);
                      toast.error("Could not create customer. Please try again.");
                      return;
                    }
                  }
                }

                // Check if we're editing an existing invoice or creating a new one
                if (editInvoice) {
                  // Update existing invoice
                  const updatedInvoiceData = {
                    customer: customerName || 'Walk-in Customer',
                    customerId: customerId,
                    customerPhone: customerPhone,
                    make: carMake || 'N/A',
                    model: carModel || 'N/A',
                    plate: vehicleNumber || 'N/A',
                    amount: total,
                    status: "Draft",
                    paymentMethod: paymentMethod,
                    services: selectedServices.length + selectedProducts.length,
                    items: invoiceItems,
                    subtotal: subtotal,
                    tax: tax,
                    discount: discountAmount,
                    discountPercentage: discountPercentage,
                    taxPercentage: selectedPaymentMethod?.taxRate ? Math.round(selectedPaymentMethod.taxRate * 100) : 0,
                  };
                  
                  await updateInvoice(editInvoice.id, updatedInvoiceData);
                  console.log("Invoice updated:", editInvoice.id);
                  
                  // Enable print and share buttons
                  setIsInvoiceGenerated(true);
                  
                  // Show success message
                  setShowSaveSuccess(true);
                  setHasUnsavedChanges(false);
                  setTimeout(() => {
                    setShowSaveSuccess(false);
                    if (onSubmit) onSubmit({ ...editInvoice, ...updatedInvoiceData });
                  }, 1500);
                } else {
                  // Create new invoice
                  const newInvoice = await addInvoice({
                    customer: customerName || 'Walk-in Customer',
                    customerId: customerId,
                    customerPhone: customerPhone,
                    make: carMake || 'N/A',
                    model: carModel || 'N/A',
                    plate: vehicleNumber || 'N/A',
                    amount: total,
                    status: "Draft",
                    paymentMethod: paymentMethod,
                    items: invoiceItems,
                    subtotal: subtotal,
                    tax: tax,
                    discount: discountAmount,
                    discountPercentage: discountPercentage,
                    taxPercentage: selectedPaymentMethod?.taxRate ? Math.round(selectedPaymentMethod.taxRate * 100) : 0,
                  });
                  
                  console.log("Invoice saved and flow completed:", newInvoice);
                  
                  // Enable print and share buttons
                  setIsInvoiceGenerated(true);
                  
                  // Show invoice preview
                  setShowInvoicePreview(true);
                  
                  // Show success message
                  setShowSaveSuccess(true);
                  setHasUnsavedChanges(false);
                }
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              {editInvoice ? "Update Invoice" : (isCustomerLocked ? "Save Invoice" : "Generate Invoice")}
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Stock Alert */}
      {showStockAlert && (
        <CustomAlert
          message={stockAlertMessage}
          onClose={() => setShowStockAlert(false)}
        />
      )}

      {/* Vehicle Modals */}
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        customerName={customerName}
        customerPhone={customerPhone}
        newVehicleMake={newVehicleMake}
        setNewVehicleMake={setNewVehicleMake}
        newVehicleModel={newVehicleModel}
        setNewVehicleModel={setNewVehicleModel}
        newVehicleYear={newVehicleYear}
        setNewVehicleYear={setNewVehicleYear}
        newVehicleNumber={newVehicleNumber}
        setNewVehicleNumber={setNewVehicleNumber}
        onSave={handleSaveNewVehicle}
      />

      <VehicleSelectionModal
        isOpen={showVehicleSelectionModal}
        onClose={() => setShowVehicleSelectionModal(false)}
        customer={customerForVehicleSelection}
        onSelectVehicle={handleSelectVehicle}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreview
        isOpen={showInvoicePreview}
        onClose={() => setShowInvoicePreview(false)}
        invoiceData={{
          invoiceNumber: editInvoice?.invoiceNumber || editInvoice?.id || `INV-${String(Date.now()).slice(-6)}`,
          invoiceDate: new Date().toLocaleDateString('en-GB'),
          customerName: customerName || 'N/A',
          customerPhone: customerPhone || 'N/A',
          customerEmail: selectedCustomerId || '',
          vehicleMake: carMake || 'N/A',
          vehicleModel: carModel || 'N/A',
          vehicleYear: carYear,
          vehicleNumber: vehicleNumber || 'N/A',
          services: selectedServices.map((service) => ({
            id: service.id,
            name: service.name,
            quantity: 1,
            price: service.price,
            amount: service.price,
          })),
          products: selectedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            amount: product.customerSupplied ? 0 : product.price * product.quantity,
            customerSupplied: product.customerSupplied,
          })),
          subtotal: subtotal,
          gst: tax,
          discount: discountAmount,
          tax: tax,
          total: total,
        }}
      />
    </div>
  );
}