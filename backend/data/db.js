/**
 * MongoDB persistence layer. Same API as store.js but async.
 * Call initialize() after mongoose.connect() to seed if collections are empty.
 */

const {
  Invoice,
  Customer,
  Vehicle,
  Product,
  Service,
  Vendor,
  StockIn,
  VendorPayment,
} = require("../models");

function productStatus(stockQuantity) {
  if (stockQuantity > 10) return "In Stock";
  if (stockQuantity > 0) return "Low Stock";
  return "Out of Stock";
}

const seedInvoices = [
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

const seedCustomers = [
  { id: "CUST-001", name: "John Smith", email: "john.smith@email.com", phone: "+92 300 1234567", address: "123 Main St, Islamabad", vehicles: 2, lastVisit: "2026-01-20", totalSpent: 11800, status: "Active", serviceHistory: 8, invoiceHistory: ["001"] },
  { id: "CUST-002", name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+92 321 2345678", address: "456 Oak Ave, Lahore", vehicles: 1, lastVisit: "2026-01-25", totalSpent: 5200, status: "Active", serviceHistory: 12, invoiceHistory: ["002"] },
];

const seedVehicles = [
  { id: "VEH-001", customerId: "CUST-001", carMake: "Toyota", carModel: "Corolla", carYear: "2021", vehicleNumber: "ISB-1234" },
  { id: "VEH-002", customerId: "CUST-001", carMake: "Honda", carModel: "City", carYear: "2022", vehicleNumber: "ISB-5678" },
  { id: "VEH-003", customerId: "CUST-002", carMake: "Honda", carModel: "Civic", carYear: "2020", vehicleNumber: "LHR-5678" },
];

const seedProducts = [
  { id: "PROD-001", name: "Engine Oil 5W-30", category: "Oils & Lubricants", salePrice: 2500, lastCostPrice: 1800, averageCostPrice: 1800, stockQuantity: 45, status: "In Stock" },
  { id: "PROD-002", name: "Oil Filter", category: "Filters", salePrice: 800, lastCostPrice: 500, averageCostPrice: 500, stockQuantity: 60, status: "In Stock" },
  { id: "PROD-004", name: "Air Filter", category: "Filters", salePrice: 650, lastCostPrice: 380, averageCostPrice: 380, stockQuantity: 8, status: "Low Stock" },
];

const seedServices = [
  { id: "S-001", name: "Oil Change + Filter Service", price: 4500, category: "Maintenance" },
  { id: "S-002", name: "Brake Pad Replacement", price: 6800, category: "Brakes" },
  { id: "S-003", name: "General Inspection", price: 500, category: "Diagnostic" },
  { id: "S-004", name: "Tire Rotation", price: 800, category: "Tires" },
  { id: "S-005", name: "Wheel Alignment", price: 1500, category: "Tires" },
  { id: "S-006", name: "AC Service", price: 2500, category: "AC" },
];

const seedVendors = [
  { id: "VEN-001", name: "AutoParts Supply Co.", phone: "+92 300 9876543", notes: "Main supplier for filters and oils", outstandingBalance: 45000, totalSupplied: 250000, totalPaid: 205000, lastSupplyDate: "2026-01-15", lastPaymentDate: "2026-01-10" },
];

async function initialize() {
  const invoiceCount = await Invoice.countDocuments();
  if (invoiceCount === 0) {
    await Invoice.insertMany(seedInvoices);
    await Customer.insertMany(seedCustomers);
    await Vehicle.insertMany(seedVehicles);
    await Product.insertMany(seedProducts);
    await Service.insertMany(seedServices);
    await Vendor.insertMany(seedVendors);
    console.log("📦 MongoDB seeded with initial data");
  }
}

// --- Invoices ---
async function getInvoices() {
  const list = await Invoice.find().sort({ date: -1 }).lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function getInvoiceById(id) {
  const doc = await Invoice.findOne({ id }).lean();
  return doc || null;
}

async function addInvoice(invoiceData) {
  const count = await Invoice.countDocuments();
  const newId = String(count + 1).padStart(3, "0");
  const newInvoiceNumber = `INV-${newId}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newInvoice = {
    ...invoiceData,
    id: newId,
    invoiceNumber: newInvoiceNumber,
    date: currentDate,
    servicesCount: invoiceData.items?.length || 0,
  };
  await Invoice.create(newInvoice);

  const customer = await Customer.findOne({ id: invoiceData.customerId });
  if (customer) {
    customer.invoiceHistory = [...(customer.invoiceHistory || []), newId];
    customer.totalSpent = (customer.totalSpent || 0) + invoiceData.amount;
    customer.lastVisit = currentDate;
    customer.serviceHistory = (customer.serviceHistory || 0) + 1;
    await customer.save();
  }

  for (const item of invoiceData.items || []) {
    if (item.type === "product" && !item.customerSupplied) {
      const product = await Product.findOne({ name: item.description });
      if (product) {
        product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
        product.status = productStatus(product.stockQuantity);
        await product.save();
      }
    }
  }

  return { ...newInvoice };
}

async function updateInvoice(id, updates) {
  const doc = await Invoice.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  ).lean();
  return doc || null;
}

async function deleteInvoice(id) {
  const result = await Invoice.deleteOne({ id });
  return result.deletedCount > 0;
}

// --- Customers ---
async function getCustomersList() {
  const list = await Customer.find().lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function getCustomerById(id) {
  const doc = await Customer.findOne({ id }).lean();
  return doc || null;
}

async function addCustomer(customerData) {
  const count = await Customer.countDocuments();
  const newId = `CUST-${String(count + 1).padStart(3, "0")}`;
  const newCustomer = {
    ...customerData,
    id: newId,
    lastVisit: "N/A",
    totalSpent: 0,
    serviceHistory: 0,
    vehicles: 0,
    status: "Active",
  };
  await Customer.create(newCustomer);
  return { ...newCustomer };
}

async function updateCustomer(id, updates) {
  const doc = await Customer.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  ).lean();
  return doc || null;
}

async function deleteCustomer(id) {
  await Vehicle.deleteMany({ customerId: id });
  const result = await Customer.deleteOne({ id });
  return result.deletedCount > 0;
}
// --- Vehicles ---
async function getVehiclesByCustomerId(customerId) {
  const list = await Vehicle.find({ customerId }).lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function addVehicle(customerId, { carMake, carModel, carYear, vehicleNumber }) {
  const customer = await Customer.findOne({ id: customerId });
  if (!customer) return null;
  const count = await Vehicle.countDocuments();
  const newId = `VEH-${String(count + 1).padStart(3, "0")}`;
  const newVehicle = {
    id: newId,
    customerId,
    carMake: carMake || "",
    carModel: carModel || "",
    carYear: carYear || "",
    vehicleNumber: vehicleNumber || "",
  };
  await Vehicle.create(newVehicle);
  customer.vehicles = (customer.vehicles || 0) + 1;
  await customer.save();
  return { ...newVehicle };
}

async function updateVehicle(customerId, vehicleId, updates) {
  const doc = await Vehicle.findOneAndUpdate(
    { customerId, id: vehicleId },
    { $set: updates },
    { new: true }
  ).lean();
  return doc || null;
}

// --- Products ---
async function getProducts() {
  const list = await Product.find().lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function addProduct(productData) {
  const count = await Product.countDocuments();
  const newId = `PROD-${String(count + 1).padStart(3, "0")}`;
  const newProduct = {
    ...productData,
    id: newId,
    status: productStatus(productData.stockQuantity ?? 0),
  };
  await Product.create(newProduct);
  return { ...newProduct };
}

async function updateProduct(id, updates) {
  const doc = await Product.findOne({ id });
  if (!doc) return null;
  Object.assign(doc, updates);
  if (updates.stockQuantity !== undefined) {
    doc.status = productStatus(doc.stockQuantity);
  }
  await doc.save();
  return doc.toObject();
}

async function deleteProduct(id) {
  const result = await Product.deleteOne({ id });
  return result.deletedCount > 0;
}

async function deductStock(productId, quantity) {
  const doc = await Product.findOne({ id: productId });
  if (!doc) return null;
  const newQuantity = Math.max(0, doc.stockQuantity - quantity);
  doc.stockQuantity = newQuantity;
  doc.status = productStatus(newQuantity);
  await doc.save();
  return doc.toObject();
}

// --- Services ---
async function getServices() {
  const list = await Service.find().lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function addService(serviceData) {
  const count = await Service.countDocuments();
  const newId = `S-${String(count + 1).padStart(3, "0")}`;
  const newService = { ...serviceData, id: newId };
  await Service.create(newService);
  return { ...newService };
}

async function updateService(id, updates) {
  const doc = await Service.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  ).lean();
  return doc || null;
}

async function deleteService(id) {
  const result = await Service.deleteOne({ id });
  return result.deletedCount > 0;
}

// --- Vendors ---
async function getVendors() {
  const list = await Vendor.find().lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function getVendorById(id) {
  const doc = await Vendor.findOne({ id }).lean();
  return doc || null;
}

async function addVendor(vendorData) {
  const count = await Vendor.countDocuments();
  const newId = `VEN-${String(count + 1).padStart(3, "0")}`;
  const newVendor = {
    ...vendorData,
    id: newId,
    outstandingBalance: vendorData.outstandingBalance ?? 0,
    totalSupplied: vendorData.totalSupplied ?? 0,
    totalPaid: vendorData.totalPaid ?? 0,
  };
  await Vendor.create(newVendor);
  return { ...newVendor };
}

async function updateVendor(id, updates) {
  const doc = await Vendor.findOneAndUpdate(
    { id },
    { $set: updates },
    { new: true }
  ).lean();
  return doc || null;
}

async function deleteVendor(id) {
  const result = await Vendor.deleteOne({ id });
  return result.deletedCount > 0;
}

// --- Stock In ---
async function getStockInRecords() {
  const list = await StockIn.find().sort({ date: -1 }).lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function addStockIn(stockInData) {
  const count = await StockIn.countDocuments();
  const newId = `STOCK-${String(count + 1).padStart(3, "0")}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newStockIn = { ...stockInData, id: newId, date: currentDate };
  await StockIn.create(newStockIn);

  for (const item of stockInData.items || []) {
    const product = await Product.findOne({ id: item.productId });
    if (product) {
      product.stockQuantity = (product.stockQuantity || 0) + item.quantity;
      product.lastCostPrice = item.costPrice;
      product.status = productStatus(product.stockQuantity);
      await product.save();
    }
  }

  const vendor = await Vendor.findOne({ id: stockInData.vendorId });
  if (vendor) {
    vendor.totalSupplied = (vendor.totalSupplied || 0) + stockInData.totalAmount;
    vendor.outstandingBalance = (vendor.outstandingBalance || 0) + stockInData.totalAmount;
    vendor.lastSupplyDate = currentDate;
    await vendor.save();
  }

  return { ...newStockIn };
}

async function getVendorStockIns(vendorId) {
  const list = await StockIn.find({ vendorId }).lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

// --- Vendor Payments ---
async function getVendorPaymentsList() {
  const list = await VendorPayment.find().lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function addVendorPayment(paymentData) {
  const count = await VendorPayment.countDocuments();
  const newId = `PAY-${String(count + 1).padStart(3, "0")}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newPayment = { ...paymentData, id: newId, date: currentDate };
  await VendorPayment.create(newPayment);

  const vendor = await Vendor.findOne({ id: paymentData.vendorId });
  if (vendor) {
    vendor.outstandingBalance = Math.max(0, (vendor.outstandingBalance || 0) - paymentData.amount);
    vendor.totalPaid = (vendor.totalPaid || 0) + paymentData.amount;
    vendor.lastPaymentDate = currentDate;
    await vendor.save();
  }

  return { ...newPayment };
}

async function getVendorPayments(vendorId) {
  const list = await VendorPayment.find({ vendorId }).lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

module.exports = {
  initialize,
  // Invoices
  getInvoices,
  getInvoiceById,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  // Customers (use getCustomersList for GET /customers)
  getCustomersList,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getVehiclesByCustomerId,
  addVehicle,
  updateVehicle,
  // Products
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  deductStock,
  // Services
  getServices,
  addService,
  updateService,
  deleteService,
  // Vendors
  getVendors,
  getVendorById,
  addVendor,
  updateVendor,
  deleteVendor,
  // Stock In
  getStockInRecords,
  addStockIn,
  getVendorStockIns,
  // Vendor Payments
  getVendorPaymentsList,
  addVendorPayment,
  getVendorPayments,
};
