/**
 * In-memory store matching frontend DataContext.
 * Replace with database later.
 */

const initialInvoices = [
  {
    id: "001",
    invoiceNumber: "INV-001",
    customer: "John Smith",
    customerId: "CUST-001",
    customerEmail: "john.smith@email.com",
    customerPhone: "+92 300 1234567",
    make: "Toyota",
    model: "Corolla",
    plate: "ISB-1234",
    date: "2026-01-20",
    amount: 11800,
    status: "Paid",
    paymentMethod: "Card/POS",
    servicesCount: 3,
    technician: "Ahmad Ali",
    supervisor: "Hassan Khan",
    subtotal: 10000,
    tax: 1800,
    discount: 0,
    items: [
      { id: "1", description: "Oil Change + Filter", quantity: 1, price: 4500, type: "service" },
      { id: "2", description: "Brake Pad Replacement", quantity: 1, price: 6800, type: "service" },
      { id: "3", description: "General Inspection", quantity: 1, price: 500, type: "service" },
    ],
  },
  {
    id: "002",
    invoiceNumber: "INV-002",
    customer: "Sarah Johnson",
    customerId: "CUST-002",
    customerEmail: "sarah.j@email.com",
    customerPhone: "+92 321 2345678",
    make: "Honda",
    model: "Civic",
    plate: "ISB-5678",
    date: "2026-01-25",
    amount: 5200,
    status: "Pending",
    paymentMethod: "Cash",
    servicesCount: 2,
    technician: "Usman Shah",
    supervisor: "Hassan Khan",
    subtotal: 5200,
    tax: 0,
    discount: 0,
    items: [
      { id: "1", description: "Tire Rotation", quantity: 1, price: 800, type: "service" },
      { id: "2", description: "Wheel Alignment", quantity: 1, price: 1500, type: "service" },
      { id: "3", description: "Air Filter Replacement", quantity: 1, price: 380, type: "service" },
    ],
  },
];

const initialCustomers = [
  {
    id: "CUST-001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+92 300 1234567",
    address: "123 Main St, Islamabad",
    vehicles: 2,
    lastVisit: "2026-01-20",
    totalSpent: 11800,
    status: "Active",
    serviceHistory: 8,
    invoiceHistory: ["001"],
  },
  {
    id: "CUST-002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+92 321 2345678",
    address: "456 Oak Ave, Lahore",
    vehicles: 1,
    lastVisit: "2026-01-25",
    totalSpent: 5200,
    status: "Active",
    serviceHistory: 12,
    invoiceHistory: ["002"],
  },
];

// Vehicles per customer (for invoice flow: select customer → choose vehicle)
const initialVehicles = [
  { id: "VEH-001", customerId: "CUST-001", carMake: "Toyota", carModel: "Corolla", carYear: "2021", vehicleNumber: "ISB-1234" },
  { id: "VEH-002", customerId: "CUST-001", carMake: "Honda", carModel: "City", carYear: "2022", vehicleNumber: "ISB-5678" },
  { id: "VEH-003", customerId: "CUST-002", carMake: "Honda", carModel: "Civic", carYear: "2020", vehicleNumber: "LHR-5678" },
];

const initialProducts = [
  {
    id: "PROD-001",
    name: "Engine Oil 5W-30",
    category: "Oils & Lubricants",
    salePrice: 2500,
    lastCostPrice: 1800,
    averageCostPrice: 1800,
    stockQuantity: 45,
    status: "In Stock",
  },
  {
    id: "PROD-002",
    name: "Oil Filter",
    category: "Filters",
    salePrice: 800,
    lastCostPrice: 500,
    averageCostPrice: 500,
    stockQuantity: 60,
    status: "In Stock",
  },
  {
    id: "PROD-004",
    name: "Air Filter",
    category: "Filters",
    salePrice: 650,
    lastCostPrice: 380,
    averageCostPrice: 380,
    stockQuantity: 8,
    status: "Low Stock",
  },
];

const initialVendors = [
  {
    id: "VEN-001",
    name: "AutoParts Supply Co.",
    phone: "+92 300 9876543",
    notes: "Main supplier for filters and oils",
    outstandingBalance: 45000,
    totalSupplied: 250000,
    totalPaid: 205000,
    lastSupplyDate: "2026-01-15",
    lastPaymentDate: "2026-01-10",
  },
];

const initialServices = [
  { id: "S-001", name: "Oil Change + Filter Service", price: 4500, category: "Maintenance" },
  { id: "S-002", name: "Brake Pad Replacement", price: 6800, category: "Brakes" },
  { id: "S-003", name: "General Inspection", price: 500, category: "Diagnostic" },
  { id: "S-004", name: "Tire Rotation", price: 800, category: "Tires" },
  { id: "S-005", name: "Wheel Alignment", price: 1500, category: "Tires" },
  { id: "S-006", name: "AC Service", price: 2500, category: "AC" },
];

// Mutable in-memory state (clone so we don't mutate initial arrays)
const state = {
  invoices: JSON.parse(JSON.stringify(initialInvoices)),
  customers: JSON.parse(JSON.stringify(initialCustomers)),
  products: JSON.parse(JSON.stringify(initialProducts)),
  services: JSON.parse(JSON.stringify(initialServices)),
  vendors: JSON.parse(JSON.stringify(initialVendors)),
  stockInRecords: [],
  vendorPayments: [],
  vehicles: JSON.parse(JSON.stringify(initialVehicles)),
};

function productStatus(stockQuantity) {
  if (stockQuantity > 10) return "In Stock";
  if (stockQuantity > 0) return "Low Stock";
  return "Out of Stock";
}

// --- Invoice ---
function addInvoice(invoiceData) {
  const newId = String(state.invoices.length + 1).padStart(3, "0");
  const newInvoiceNumber = `INV-${newId}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newInvoice = {
    ...invoiceData,
    id: newId,
    invoiceNumber: newInvoiceNumber,
    date: currentDate,
    servicesCount: invoiceData.items.length,
  };
  state.invoices.unshift(newInvoice);

  const customer = state.customers.find((c) => c.id === invoiceData.customerId);
  if (customer) {
    customer.invoiceHistory = [...(customer.invoiceHistory || []), newId];
    customer.totalSpent = (customer.totalSpent || 0) + invoiceData.amount;
    customer.lastVisit = currentDate;
    customer.serviceHistory = (customer.serviceHistory || 0) + 1;
  }

  invoiceData.items.forEach((item) => {
    if (item.type === "product" && !item.customerSupplied) {
      const product = state.products.find((p) => p.name === item.description);
      if (product) {
        product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
        product.status = productStatus(product.stockQuantity);
      }
    }
  });

  return newInvoice;
}

function updateInvoice(id, updates) {
  const idx = state.invoices.findIndex((inv) => inv.id === id);
  if (idx === -1) return null;
  state.invoices[idx] = { ...state.invoices[idx], ...updates };
  return state.invoices[idx];
}

function deleteInvoice(id) {
  const idx = state.invoices.findIndex((inv) => inv.id === id);
  if (idx === -1) return false;
  state.invoices.splice(idx, 1);
  return true;
}

function getInvoiceById(id) {
  return state.invoices.find((inv) => inv.id === id);
}

// --- Customer ---
function addCustomer(customerData) {
  const newId = `CUST-${String(state.customers.length + 1).padStart(3, "0")}`;
  const newCustomer = {
    ...customerData,
    id: newId,
    lastVisit: "N/A",
    totalSpent: 0,
    serviceHistory: 0,
    // Vehicles are stored separately in state.vehicles; start at 0 and increment when a vehicle is added.
    vehicles: 0,
    status: "Active",
  };
  state.customers.push(newCustomer);
  return newCustomer;
}

function updateCustomer(id, updates) {
  const idx = state.customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  state.customers[idx] = { ...state.customers[idx], ...updates };
  return state.customers[idx];
}

function getCustomerById(id) {
  return state.customers.find((c) => c.id === id);
}

// --- Product ---
function addProduct(productData) {
  const newId = `PROD-${String(state.products.length + 1).padStart(3, "0")}`;
  const newProduct = {
    ...productData,
    id: newId,
    status: productStatus(productData.stockQuantity ?? 0),
  };
  state.products.push(newProduct);
  return newProduct;
}

function updateProduct(id, updates) {
  const idx = state.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = { ...state.products[idx], ...updates };
  if (updates.stockQuantity !== undefined) {
    updated.status = productStatus(updated.stockQuantity);
  }
  state.products[idx] = updated;
  return updated;
}

function deleteProduct(id) {
  const idx = state.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  state.products.splice(idx, 1);
  return true;
}

function deductStock(productId, quantity) {
  const idx = state.products.findIndex((p) => p.id === productId);
  if (idx === -1) return null;
  const p = state.products[idx];
  const newQuantity = Math.max(0, p.stockQuantity - quantity);
  state.products[idx] = { ...p, stockQuantity: newQuantity, status: productStatus(newQuantity) };
  return state.products[idx];
}

// --- Service ---
function addService(serviceData) {
  const newId = `S-${String(state.services.length + 1).padStart(3, "0")}`;
  const newService = { ...serviceData, id: newId };
  state.services.push(newService);
  return newService;
}

function updateService(id, updates) {
  const idx = state.services.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  state.services[idx] = { ...state.services[idx], ...updates };
  return state.services[idx];
}

function deleteService(id) {
  const idx = state.services.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  state.services.splice(idx, 1);
  return true;
}

// --- Vendor ---
function addVendor(vendorData) {
  const newId = `VEN-${String(state.vendors.length + 1).padStart(3, "0")}`;
  const newVendor = {
    ...vendorData,
    id: newId,
    outstandingBalance: 0,
    totalSupplied: 0,
    totalPaid: 0,
  };
  state.vendors.push(newVendor);
  return newVendor;
}

function updateVendor(id, updates) {
  const idx = state.vendors.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  state.vendors[idx] = { ...state.vendors[idx], ...updates };
  return state.vendors[idx];
}

function deleteVendor(id) {
  const idx = state.vendors.findIndex((v) => v.id === id);
  if (idx === -1) return false;
  state.vendors.splice(idx, 1);
  return true;
}

function getVendorById(id) {
  return state.vendors.find((v) => v.id === id);
}

// --- Stock In ---
function addStockIn(stockInData) {
  const newId = `STOCK-${String(state.stockInRecords.length + 1).padStart(3, "0")}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newStockIn = { ...stockInData, id: newId, date: currentDate };
  state.stockInRecords.unshift(newStockIn);

  stockInData.items.forEach((item) => {
    const product = state.products.find((p) => p.id === item.productId);
    if (product) {
      product.stockQuantity = (product.stockQuantity || 0) + item.quantity;
      product.lastCostPrice = item.costPrice;
      product.status = productStatus(product.stockQuantity);
    }
  });

  const vendor = state.vendors.find((v) => v.id === stockInData.vendorId);
  if (vendor) {
    vendor.totalSupplied = (vendor.totalSupplied || 0) + stockInData.totalAmount;
    vendor.outstandingBalance = (vendor.outstandingBalance || 0) + stockInData.totalAmount;
    vendor.lastSupplyDate = currentDate;
  }

  return newStockIn;
}

function getVendorStockIns(vendorId) {
  return state.stockInRecords.filter((r) => r.vendorId === vendorId);
}

// --- Vendor Payment ---
function addVendorPayment(paymentData) {
  const newId = `PAY-${String(state.vendorPayments.length + 1).padStart(3, "0")}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newPayment = { ...paymentData, id: newId, date: currentDate };
  state.vendorPayments.unshift(newPayment);

  const vendor = state.vendors.find((v) => v.id === paymentData.vendorId);
  if (vendor) {
    vendor.outstandingBalance = Math.max(0, (vendor.outstandingBalance || 0) - paymentData.amount);
    vendor.totalPaid = (vendor.totalPaid || 0) + paymentData.amount;
    vendor.lastPaymentDate = currentDate;
  }

  return newPayment;
}

function getVendorPayments(vendorId) {
  return state.vendorPayments.filter((p) => p.vendorId === vendorId);
}

// --- Customer Vehicles ---
function getVehiclesByCustomerId(customerId) {
  return state.vehicles.filter((v) => v.customerId === customerId);
}

function addVehicle(customerId, { carMake, carModel, carYear, vehicleNumber }) {
  const customer = state.customers.find((c) => c.id === customerId);
  if (!customer) return null;
  const newId = `VEH-${String(state.vehicles.length + 1).padStart(3, "0")}`;
  const newVehicle = {
    id: newId,
    customerId,
    carMake: carMake || "",
    carModel: carModel || "",
    carYear: carYear || "",
    vehicleNumber: vehicleNumber || "",
  };
  state.vehicles.push(newVehicle);
  customer.vehicles = (customer.vehicles || 0) + 1;
  return newVehicle;
}

function updateVehicle(customerId, vehicleId, updates) {
  const v = state.vehicles.find((x) => x.customerId === customerId && x.id === vehicleId);
  if (!v) return null;
  const idx = state.vehicles.findIndex((x) => x.id === vehicleId);
  state.vehicles[idx] = { ...state.vehicles[idx], ...updates };
  return state.vehicles[idx];
}

module.exports = {
  state,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceById,
  addCustomer,
  updateCustomer,
  getCustomerById,
  addProduct,
  updateProduct,
  deleteProduct,
  deductStock,
  addService,
  updateService,
  deleteService,
  addVendor,
  updateVendor,
  deleteVendor,
  getVendorById,
  addStockIn,
  getVendorStockIns,
  addVendorPayment,
  getVendorPayments,
  getVehiclesByCustomerId,
  addVehicle,
  updateVehicle,
};
