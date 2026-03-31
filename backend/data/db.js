/**
 * MongoDB persistence layer. Same API as store.js but async.
 * Call initialize() after mongoose.connect() to seed if collections are empty.
 */

const bcrypt = require("bcrypt");
const {
  Invoice,
  Customer,
  Vehicle,
  Product,
  Service,
  Vendor,
  StockIn,
  VendorPayment,
  DailyClose,
  User,
  Expense,
  UtilityType,
  Utility,
  Employee,
  SalaryRecord,
  Settings,
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

const SEED_TEST_USER = {
  name: "Admin",
  email: "admin@digitalhack.us",
  password: bcrypt.hashSync("Qwerty@12345", 10),
  isVerified: true,
  otp: null,
  otpExpiry: null,
};

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

  const testUserExists = await User.findOne({ email: SEED_TEST_USER.email });
  if (!testUserExists) {
    await User.create(SEED_TEST_USER);
    console.log("👤 Test user created: admin@digitalhack.us");
  }

  const requiredUtilityTypeNames = ["Electricity", "Water", "Rent", "Internet", "Others"];
  const existingByName = await UtilityType.find({ name: { $in: requiredUtilityTypeNames } }).lean();
  const existingNames = new Set(existingByName.map((t) => t.name));
  let inserted = 0;
  for (let i = 0; i < requiredUtilityTypeNames.length; i++) {
    const name = requiredUtilityTypeNames[i];
    if (!existingNames.has(name)) {
      const newId = `UT-${i + 1}`;
      await UtilityType.create({ id: newId, name, created_at: new Date() });
      existingNames.add(name);
      inserted += 1;
    }
  }
  if (inserted > 0) {
    console.log("📦 Utility types ensured (Electricity, Water, Rent, Internet, Others)");
  }
}

// --- Invoices ---
async function getInvoices() {
  const list = await Invoice.find().lean();
  return list
    .map((doc) => ({ ...doc, id: doc.id }))
    .sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0));
}

async function getInvoiceById(id) {
  const doc = await Invoice.findOne({ id }).lean();
  return doc || null;
}

async function addInvoice(invoiceData) {
  const docs = await Invoice.find().select("id").lean();
  const maxNum = docs.reduce((max, d) => Math.max(max, parseInt(d.id, 10) || 0), 0);
  const newId = String(maxNum + 1).padStart(3, "0");
  const newInvoiceNumber = `INV-${newId}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newInvoice = {
    ...invoiceData,
    id: newId,
    invoiceNumber: newInvoiceNumber,
    date: currentDate,
    servicesCount: invoiceData.items?.length || 0,
  };
  if (invoiceData.status === "Paid") {
    newInvoice.paymentDate = currentDate;
  }
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
  if (updates.status) {
    const existing = await Invoice.findOne({ id }).lean();
    if (existing && existing.status !== updates.status) {
      if (updates.status === "Paid") {
        updates.paymentDate = new Date().toISOString().split("T")[0];
      } else {
        updates.paymentDate = null;
      }
    }
  }

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
  const ids = await Customer.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^CUST-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `CUST-${String(maxNum + 1).padStart(3, "0")}`;
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

async function getVehicles() {
  const list = await Vehicle.find().lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function addVehicle(customerId, { carMake, carModel, carYear, vehicleNumber }) {
  const customer = await Customer.findOne({ id: customerId });
  if (!customer) return null;
  const existingList = await Vehicle.find({ customerId }).lean();
  const normalizedNew = (vehicleNumber || "").replace(/[\s-]/g, "").toUpperCase();
  const existing = existingList.find(
    (v) => (v.vehicleNumber || "").replace(/[\s-]/g, "").toUpperCase() === normalizedNew
  );
  if (existing) {
    return { ...existing, id: existing.id };
  }
  const ids = await Vehicle.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^VEH-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `VEH-${String(maxNum + 1).padStart(3, "0")}`;
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

async function deleteVehicle(customerId, vehicleId) {
  const existing = await Vehicle.findOne({ customerId, id: vehicleId });
  if (!existing) return false;
  await Vehicle.deleteOne({ customerId, id: vehicleId });
  const customer = await Customer.findOne({ id: customerId });
  if (customer) {
    customer.vehicles = Math.max(0, (customer.vehicles || 0) - 1);
    await customer.save();
  }
  return true;
}

// --- Products ---
async function getProducts() {
  const list = await Product.find().lean();
  return list.map((doc) => ({ ...doc, id: doc.id, brand: doc.brand != null ? doc.brand : "" }));
}

async function addProduct(productData) {
  const ids = await Product.find({}, { id: 1, _id: 0 }).lean();
  let maxNum = 0;
  for (const doc of ids) {
    const m = String(doc.id || "").match(/^PROD-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
    }
  }
  const newId = `PROD-${String(maxNum + 1).padStart(3, "0")}`;
  let vendorName = productData.vendorName;
  if (!vendorName && productData.vendorId) {
    const vend = await Vendor.findOne({ id: productData.vendorId });
    vendorName = vend ? vend.name : undefined;
  }
  const newProduct = {
    ...productData,
    brand: productData.brand != null ? productData.brand : "",
    vendorName,
    id: newId,
    status: productStatus(productData.stockQuantity ?? 0),
  };
  await Product.create(newProduct);
  return { ...newProduct };
}

async function updateProduct(id, updates) {
  const doc = await Product.findOne({ id });
  if (!doc) return null;
  if (updates.brand !== undefined) {
    doc.brand = updates.brand;
    doc.markModified("brand");
  }
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
  const ids = await Service.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^S-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `S-${String(maxNum + 1).padStart(3, "0")}`;
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
  const ids = await Vendor.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^VEN-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `VEN-${String(maxNum + 1).padStart(3, "0")}`;
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
  const ids = await StockIn.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^STOCK-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `STOCK-${String(maxNum + 1).padStart(3, "0")}`;
  const currentDate = new Date().toISOString().split("T")[0];
  const newStockIn = { ...stockInData, id: newId, date: currentDate };
  await StockIn.create(newStockIn);

  for (const item of stockInData.items || []) {
    const product = await Product.findOne({ id: item.productId });
    if (product) {
      product.stockQuantity = (product.stockQuantity || 0) + item.quantity;
      product.lastCostPrice = item.costPrice;
      product.status = productStatus(product.stockQuantity);
      product.vendorId = stockInData.vendorId;
      product.vendorName = stockInData.vendorName;
      product.lastStockInDate = currentDate;
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
  const ids = await VendorPayment.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^PAY-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `PAY-${String(maxNum + 1).padStart(3, "0")}`;
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

// --- Daily Close ---
async function getDailyCloses() {
  const list = await DailyClose.find().sort({ date: -1 }).lean();
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function getDailyCloseByDate(date) {
  const doc = await DailyClose.findOne({ date }).lean();
  return doc || null;
}

async function getDailyClosePreview(date) {
  const paidInvoices = await Invoice.find({
    status: "Paid",
    $or: [
      { paymentDate: date },
      { paymentDate: { $exists: false }, date: date },
      { paymentDate: null, date: date }
    ]
  }).lean();
  const stockIns = await StockIn.find({ date }).lean();
  const payments = await VendorPayment.find({ date }).lean();

  const invoiceItems = paidInvoices.map((inv) => ({
    invoiceId: inv.id,
    invoiceNumber: inv.invoiceNumber,
    customer: inv.customer,
    amount: inv.amount,
    paymentMethod: inv.paymentMethod,
  }));
  const totalRevenue = invoiceItems.reduce((sum, i) => sum + (i.amount || 0), 0);

  const purchaseItems = stockIns.map((si) => ({
    stockInId: si.id,
    vendorName: si.vendorName,
    totalAmount: si.totalAmount,
  }));
  const totalPurchases = purchaseItems.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const vendorPaymentItems = [];
  for (const pay of payments) {
    const vendor = await Vendor.findOne({ id: pay.vendorId }).lean();
    vendorPaymentItems.push({
      paymentId: pay.id,
      vendorName: vendor ? vendor.name : pay.vendorId,
      amount: pay.amount,
      method: pay.method,
    });
  }
  const totalVendorPayments = vendorPaymentItems.reduce((sum, p) => sum + (p.amount || 0), 0);

  // --- Salary records paid on this date ---
  const dayStart = new Date(date + "T00:00:00.000Z");
  const dayEnd = new Date(date + "T23:59:59.999Z");

  const paidSalaryRecords = await SalaryRecord.find({
    payment_status: "paid",
    paid_at: { $gte: dayStart, $lte: dayEnd },
  }).lean();

  const salaryItems = [];
  for (const rec of paidSalaryRecords) {
    const emp = await Employee.findOne({ id: rec.employee_id }).lean();
    salaryItems.push({
      description: emp ? `${emp.name} — ${rec.month}/${rec.year}` : `Employee ${rec.employee_id} — ${rec.month}/${rec.year}`,
      amount: rec.total_salary || 0,
    });
  }
  const totalSalaries = salaryItems.reduce((sum, s) => sum + (s.amount || 0), 0);

  // --- Utilities paid on this date ---
  const paidUtilities = await Utility.find({
    status: "paid",
    paid_at: { $gte: dayStart, $lte: dayEnd },
  }).lean();

  const utilityItems = [];
  for (const u of paidUtilities) {
    const uType = await UtilityType.findOne({ id: u.utility_type_id }).lean();
    utilityItems.push({
      description: uType ? `${uType.name} — ${u.billing_period_start} to ${u.billing_period_end}` : `Utility ${u.id}`,
      amount: u.amount || 0,
    });
  }
  const totalUtilities = utilityItems.reduce((sum, u) => sum + (u.amount || 0), 0);

  // --- General expenses recorded on this date ---
  const expenseRecords = await Expense.find({ date }).lean();
  const otherExpenseItems = expenseRecords.map((e) => ({
    description: `${e.category}${e.notes ? " — " + e.notes : ""}`,
    amount: e.amount || 0,
  }));
  const totalOtherExpenses = otherExpenseItems.reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalExpenses = totalPurchases + totalVendorPayments + totalSalaries + totalUtilities + totalOtherExpenses;
  const netProfit = totalRevenue - totalExpenses;

  return {
    date,
    paidInvoices: invoiceItems,
    totalRevenue,
    inventoryPurchases: purchaseItems,
    vendorPayments: vendorPaymentItems,
    salaries: salaryItems,
    utilities: utilityItems,
    otherExpenses: otherExpenseItems,
    totalPurchases,
    totalVendorPayments,
    totalSalaries,
    totalUtilities,
    totalOtherExpenses,
    totalExpenses,
    netProfit,
  };
}

async function closeDailyClose(date) {
  const existing = await DailyClose.findOne({ date }).lean();
  if (existing) return { alreadyClosed: true, record: existing };

  const preview = await getDailyClosePreview(date);
  const dcIds = await DailyClose.find({}, { id: 1, _id: 0 }).lean();
  let dcMax = 0;
  for (const doc of dcIds) {
    const m = String(doc.id || "").match(/^DC-(\d+)$/);
    if (m) { const n = parseInt(m[1], 10); if (!Number.isNaN(n)) dcMax = Math.max(dcMax, n); }
  }
  const newId = `DC-${String(dcMax + 1).padStart(3, "0")}`;
  const record = {
    ...preview,
    id: newId,
    closedAt: new Date().toISOString(),
    closedBy: "Admin",
  };
  await DailyClose.create(record);
  return { alreadyClosed: false, record };
}

async function reopenDailyClose(date) {
  const result = await DailyClose.deleteOne({ date });
  return result.deletedCount > 0;
}

// --- Expenses (Finance, independent of invoices/inventory) ---
async function getExpenses(filters = {}) {
  let q = Expense.find();
  if (filters.dateFrom) q = q.where("date").gte(filters.dateFrom);
  if (filters.dateTo) q = q.where("date").lte(filters.dateTo);
  if (filters.category) q = q.where("category").equals(filters.category);
  const list = await q.lean().sort({ date: -1, created_at: -1 });
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function getExpenseById(id) {
  const doc = await Expense.findOne({ id }).lean();
  return doc || null;
}

async function addExpense(data) {
  const ids = await Expense.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^EXP-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `EXP-${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date();
  const newExpense = {
    ...data,
    id: newId,
    created_at: now,
    updated_at: now,
  };
  await Expense.create(newExpense);
  return { ...newExpense };
}

async function updateExpense(id, updates) {
  const doc = await Expense.findOne({ id });
  if (!doc) return null;
  Object.assign(doc, updates, { updated_at: new Date() });
  await doc.save();
  return doc.toObject();
}

async function deleteExpense(id) {
  const result = await Expense.deleteOne({ id });
  return result.deletedCount > 0;
}

async function getExpenseSummaryDaily(date) {
  const list = await Expense.find({ date }).lean();
  const total = list.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return { date, total, count: list.length };
}

async function getExpenseSummaryMonthly(year, month) {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const list = await Expense.find({ date: new RegExp(`^${prefix}`) }).lean();
  const total = list.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return { year, month, total, count: list.length };
}

// --- Utility types ---
async function getUtilityTypes() {
  const list = await UtilityType.find().lean().sort({ id: 1 });
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function addUtilityType(name) {
  const ids = await UtilityType.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^UT-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `UT-${String(maxNum + 1).padStart(2, "0")}`;
  const newType = { id: newId, name, created_at: new Date() };
  await UtilityType.create(newType);
  return { ...newType };
}

// --- Utilities (Finance, independent of invoices/inventory) ---
async function getUtilities(filters = {}) {
  let q = Utility.find();
  if (filters.status) q = q.where("status").equals(filters.status);
  if (filters.dueDateFrom) q = q.where("due_date").gte(filters.dueDateFrom);
  if (filters.dueDateTo) q = q.where("due_date").lte(filters.dueDateTo);
  const list = await q.lean().sort({ due_date: -1, created_at: -1 });
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function getUtilityById(id) {
  const doc = await Utility.findOne({ id }).lean();
  return doc || null;
}

async function addUtility(data) {
  const ids = await Utility.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^UTL-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `UTL-${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date();
  const newUtility = { ...data, id: newId, created_at: now, updated_at: now };
  await Utility.create(newUtility);
  return { ...newUtility };
}

async function updateUtility(id, updates) {
  const doc = await Utility.findOne({ id });
  if (!doc) return null;
  Object.assign(doc, updates, { updated_at: new Date() });
  await doc.save();
  return doc.toObject();
}

async function markUtilityPaid(id, paymentMethod) {
  const doc = await Utility.findOne({ id });
  if (!doc) return null;
  doc.status = "paid";
  doc.payment_method = paymentMethod || null;
  doc.paid_at = new Date();
  doc.updated_at = new Date();
  await doc.save();
  return doc.toObject();
}

async function getUtilitySummaryMonthly(year, month) {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const list = await Utility.find({
    $or: [{ billing_period_start: new RegExp(`^${prefix}`) }, { billing_period_end: new RegExp(`^${prefix}`) }],
  }).lean();
  const total = list.reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  const paid = list.filter((u) => u.status === "paid").reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  const unpaid = list.filter((u) => u.status === "unpaid").reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  return { year, month, total, paid, unpaid, count: list.length };
}

async function getOutstandingUtilities() {
  const list = await Utility.find({ status: "unpaid" }).lean().sort({ due_date: 1 });
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

// --- Finance: Salaries - Employees ---
async function getEmployees() {
  const list = await Employee.find().lean().sort({ name: 1 });
  return list.map((doc) => ({
    ...doc,
    id: doc.id,
    is_active: doc.is_active !== false,
  }));
}

async function getEmployeeById(id) {
  const doc = await Employee.findOne({ id }).lean();
  if (!doc) return null;
  return { ...doc, id: doc.id, is_active: doc.is_active !== false };
}

async function addEmployee(data) {
  const ids = await Employee.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^EMP-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `EMP-${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date();
  const newEmployee = {
    ...data,
    id: newId,
    is_active: data.is_active !== false,
    created_at: now,
    updated_at: now,
  };
  await Employee.create(newEmployee);
  return { ...newEmployee };
}

async function updateEmployee(id, updates) {
  const doc = await Employee.findOne({ id });
  if (!doc) return null;
  if (updates.is_active !== undefined) {
    doc.is_active = Boolean(updates.is_active);
    doc.markModified("is_active");
  }
  const { is_active: _ia, ...rest } = updates;
  Object.assign(doc, rest, { updated_at: new Date() });
  await doc.save();
  return doc.toObject();
}

// --- Finance: Salaries - Salary records ---
async function getSalaryRecords(filters = {}) {
  let q = SalaryRecord.find();
  if (filters.month != null) q = q.where("month").equals(Number(filters.month));
  if (filters.year != null) q = q.where("year").equals(Number(filters.year));
  if (filters.status) q = q.where("payment_status").equals(filters.status);
  if (filters.employee_id) q = q.where("employee_id").equals(filters.employee_id);
  const list = await q.lean().sort({ year: -1, month: -1, created_at: -1 });
  return list.map((doc) => ({ ...doc, id: doc.id }));
}

async function getSalaryRecordById(id) {
  const doc = await SalaryRecord.findOne({ id }).lean();
  return doc || null;
}

async function addSalaryRecord(data) {
  const existing = await SalaryRecord.findOne({
    employee_id: data.employee_id,
    month: data.month,
    year: data.year,
  });
  if (existing) {
    const err = new Error("Duplicate salary record for this employee and month/year");
    err.code = "DUPLICATE_SALARY";
    throw err;
  }
  const ids = await SalaryRecord.find({}, { id: 1 }).lean();
  let maxNum = 0;
  for (const d of ids) {
    const m = String(d.id || "").match(/^SAL-(\d+)$/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  }
  const newId = `SAL-${String(maxNum + 1).padStart(3, "0")}`;
  const salaryAmount = Number(data.salary_amount) || 0;
  const bonus = Number(data.bonus) || 0;
  const deduction = Number(data.deduction) || 0;
  const totalSalary = salaryAmount + bonus - deduction;
  const now = new Date();
  const newRecord = {
    id: newId,
    employee_id: data.employee_id,
    month: data.month,
    year: data.year,
    salary_amount: salaryAmount,
    bonus,
    deduction,
    total_salary: totalSalary,
    payment_status: "unpaid",
    payment_method: null,
    paid_at: null,
    notes: data.notes || null,
    created_at: now,
    updated_at: now,
  };
  await SalaryRecord.create(newRecord);
  return { ...newRecord };
}

async function markSalaryRecordPaid(id, paymentMethod) {
  const doc = await SalaryRecord.findOne({ id });
  if (!doc) return null;
  if (!paymentMethod || typeof paymentMethod !== "string" || !paymentMethod.trim()) {
    const err = new Error("payment_method is required");
    err.code = "VALIDATION";
    throw err;
  }
  doc.payment_status = "paid";
  doc.payment_method = paymentMethod.trim();
  doc.paid_at = new Date();
  doc.updated_at = new Date();
  await doc.save();
  return doc.toObject();
}

async function getSalariesDashboardStats() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const totalEmployees = await Employee.countDocuments({ is_active: true });
  const allRecordsThisMonth = await SalaryRecord.find({ month: currentMonth, year: currentYear }).lean();
  const totalPayrollThisMonth = allRecordsThisMonth.reduce((sum, r) => sum + (Number(r.total_salary) || 0), 0);
  const unpaidThisMonth = allRecordsThisMonth.filter((r) => r.payment_status === "unpaid");
  const unpaidCount = unpaidThisMonth.length;
  const paidThisMonth = allRecordsThisMonth.filter((r) => r.payment_status === "paid");
  const paidThisMonthTotal = paidThisMonth.reduce((sum, r) => sum + (Number(r.total_salary) || 0), 0);

  return {
    totalEmployees,
    totalPayrollThisMonth,
    unpaidCount,
    paidThisMonthTotal,
  };
}

// --- Dashboard stats ---
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}
function getDateStr(d) {
  return d.toISOString().split("T")[0];
}

async function getDashboardStats() {
  const todayStr = getTodayStr();
  const invoices = await Invoice.find().lean();
  const customerCount = await Customer.countDocuments();
  const vehicleCount = await Vehicle.countDocuments();

  let totalRevenue = 0;
  let revenueToday = 0;
  let jobsToday = 0;
  let completedToday = 0;
  let jobsInProgress = 0;
  let revenueThisWeek = 0;
  let revenueLastWeek = 0;
  let completedYesterday = 0;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  for (const inv of invoices) {
    const amt = Number(inv.amount) || 0;
    totalRevenue += amt;
    if (inv.date === todayStr) {
      revenueToday += amt;
      jobsToday += 1;
      if (inv.status === "Paid") completedToday += 1;
    }
    if (inv.status === "Pending") jobsInProgress += 1;
    const weekAgoStr = getDateStr(weekAgo);
    const twoWeeksAgoStr = getDateStr(twoWeeksAgo);
    if (inv.date && inv.date >= weekAgoStr && inv.date <= todayStr) revenueThisWeek += amt;
    if (inv.date && inv.date >= twoWeeksAgoStr && inv.date < weekAgoStr) revenueLastWeek += amt;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (inv.date === getDateStr(yesterday) && inv.status === "Paid") completedYesterday += 1;
  }

  const revenueChangePercent =
    revenueLastWeek > 0 ? Math.round(((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 1000) / 10 : null;
  const completedChangePercent =
    completedYesterday > 0 ? Math.round(((completedToday - completedYesterday) / completedYesterday) * 1000) / 10 : null;

  return {
    totalRevenue,
    revenueToday,
    jobsToday,
    completedToday,
    jobsInProgress,
    customerCount,
    vehicleCount,
    revenueChangePercent,
    completedChangePercent,
  };
}

// --- Settings (singleton workshop config) ---
async function getSettings() {
  let doc = await Settings.findOne({ key: 'workshop' }).lean();
  if (!doc) {
    doc = await Settings.create({ key: 'workshop' });
    doc = doc.toObject();
  }
  return {
    workshopName: doc.workshopName,
    workshopPhone: doc.workshopPhone,
    workshopEmail: doc.workshopEmail,
    workshopAddress: doc.workshopAddress,
    logoBase64: doc.logoBase64 || null,
    primaryColor: doc.primaryColor,
    taxRates: doc.taxRates || { cash: 0, card: 18, online: 18 },
  };
}

async function updateSettings(updates) {
  const allowed = ['workshopName', 'workshopPhone', 'workshopEmail', 'workshopAddress', 'logoBase64', 'primaryColor', 'taxRates'];
  const setObj = { updated_at: new Date() };
  for (const key of allowed) {
    if (updates[key] !== undefined) setObj[key] = updates[key];
  }
  const doc = await Settings.findOneAndUpdate(
    { key: 'workshop' },
    { $set: setObj },
    { new: true, upsert: true }
  ).lean();
  return {
    workshopName: doc.workshopName,
    workshopPhone: doc.workshopPhone,
    workshopEmail: doc.workshopEmail,
    workshopAddress: doc.workshopAddress,
    logoBase64: doc.logoBase64 || null,
    primaryColor: doc.primaryColor,
    taxRates: doc.taxRates || { cash: 0, card: 18, online: 18 },
  };
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
  getVehicles,
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
  getDashboardStats,
  // Finance: Expenses
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummaryDaily,
  getExpenseSummaryMonthly,
  // Finance: Utility types
  getUtilityTypes,
  addUtilityType,
  // Finance: Utilities
  getUtilities,
  getUtilityById,
  addUtility,
  updateUtility,
  markUtilityPaid,
  getUtilitySummaryMonthly,
  getOutstandingUtilities,
  // Finance: Salaries
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  getSalaryRecords,
  getSalaryRecordById,
  addSalaryRecord,
  markSalaryRecordPaid,
  getSalariesDashboardStats,
  // Finance: Daily Close
  getDailyCloses,
  getDailyCloseByDate,
  getDailyClosePreview,
  closeDailyClose,
  reopenDailyClose,
  deleteVehicle,
  // Settings
  getSettings,
  updateSettings,
};
