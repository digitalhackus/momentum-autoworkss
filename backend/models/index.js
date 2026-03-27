const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  id: String,
  description: String,
  quantity: Number,
  price: Number,
  type: String,
  customerSupplied: Boolean,
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  invoiceNumber: String,
  customer: String,
  customerId: String,
  customerEmail: String,
  customerPhone: String,
  make: String,
  model: String,
  plate: String,
  carYear: String,
  date: String,
  paymentDate: String,
  amount: Number,
  status: String,
  paymentMethod: String,
  servicesCount: Number,
  technician: String,
  supervisor: String,
  subtotal: Number,
  tax: Number,
  discount: Number,
  items: [invoiceItemSchema],
});

const CustomerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  address: String,
  vehicles: Number,
  lastVisit: String,
  totalSpent: Number,
  status: String,
  serviceHistory: Number,
  invoiceHistory: [String],
});


const VehicleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  customerId: { type: String, required: true },
  carMake: String,
  carModel: String,
  carYear: String,
  vehicleNumber: String,
});

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  brand: String,
  category: String,
  salePrice: Number,
  lastCostPrice: Number,
  averageCostPrice: Number,
  stockQuantity: Number,
  status: String,
  vendorId: String,
  vendorName: String,
  lastStockInDate: String,
});

const ServiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  price: Number,
  category: String,
});

const VendorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  notes: String,
  outstandingBalance: Number,
  totalSupplied: Number,
  totalPaid: Number,
  lastSupplyDate: String,
  lastPaymentDate: String,
});

const stockInItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  quantity: Number,
  costPrice: Number,
  total: Number,
}, { _id: false });

const StockInSchema = new mongoose.Schema({
  id: { type: String, required: true },
  vendorId: String,
  vendorName: String,
  date: String,
  items: [stockInItemSchema],
  totalAmount: Number,
});

const VendorPaymentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  vendorId: String,
  date: String,
  amount: Number,
  method: String,
  notes: String,
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Finance: Expenses (independent of invoices/inventory)
const ExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  payment_method: { type: String, enum: ["cash", "card", "bank", "online"], required: true },
  notes: String,
  recorded_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Finance: Utility types (seed: Electricity, Water, Rent, Internet, Other)
const UtilityTypeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

// Finance: Utilities (independent of invoices/inventory)
const UtilitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  utility_type_id: { type: String, required: true },
  billing_period_start: { type: String, required: true },
  billing_period_end: { type: String, required: true },
  amount: { type: Number, required: true },
  due_date: { type: String, required: true },
  status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  payment_method: { type: String, enum: ["cash", "card", "bank", "online"], default: null },
  paid_at: { type: Date, default: null },
  notes: String,
  recorded_by: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Finance: Salaries - Employees (independent of invoices)
const EmployeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: String,
  role: String,
  monthly_salary: { type: Number, required: true },
  joining_date: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Finance: Salaries - Salary records (snapshot per employee per month)
const SalaryRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employee_id: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  salary_amount: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  total_salary: { type: Number, required: true },
  payment_status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
  payment_method: { type: String, default: null },
  paid_at: { type: Date, default: null },
  notes: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

SalaryRecordSchema.index({ employee_id: 1, month: 1, year: 1 }, { unique: true });

const dailyCloseLineSchema = new mongoose.Schema(
  { description: String, amount: Number },
  { _id: false }
);

const dailyCloseInvoiceSchema = new mongoose.Schema(
  { invoiceId: String, invoiceNumber: String, customer: String, amount: Number, paymentMethod: String },
  { _id: false }
);

const dailyClosePurchaseSchema = new mongoose.Schema(
  { stockInId: String, vendorName: String, totalAmount: Number },
  { _id: false }
);

const dailyCloseVendorPaymentSchema = new mongoose.Schema(
  { paymentId: String, vendorName: String, amount: Number, method: String },
  { _id: false }
);

const DailyCloseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true, unique: true },
  paidInvoices: [dailyCloseInvoiceSchema],
  totalRevenue: { type: Number, default: 0 },
  inventoryPurchases: [dailyClosePurchaseSchema],
  vendorPayments: [dailyCloseVendorPaymentSchema],
  salaries: [dailyCloseLineSchema],
  utilities: [dailyCloseLineSchema],
  otherExpenses: [dailyCloseLineSchema],
  totalPurchases: { type: Number, default: 0 },
  totalVendorPayments: { type: Number, default: 0 },
  totalSalaries: { type: Number, default: 0 },
  totalUtilities: { type: Number, default: 0 },
  totalOtherExpenses: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 },
  closedAt: { type: Date, default: Date.now },
  closedBy: { type: String, default: "Admin" },
});

// Settings (singleton document for workshop config)
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'workshop' },
  workshopName: { type: String, default: 'Momentum AutoWorks' },
  workshopPhone: { type: String, default: '+92 300 1234567' },
  workshopEmail: { type: String, default: 'info@momentumauto.com' },
  workshopAddress: { type: String, default: '123 Workshop Street, Islamabad' },
  logoBase64: { type: String, default: null },
  primaryColor: { type: String, default: '#c2272d' },
  taxRates: {
    cash: { type: Number, default: 0 },
    card: { type: Number, default: 18 },
    online: { type: Number, default: 18 },
  },
  updated_at: { type: Date, default: Date.now },
});

// Index for vehicle lookups
VehicleSchema.index({ customerId: 1, id: 1 });

const Invoice = mongoose.model("Invoice", InvoiceSchema);
const Customer = mongoose.model("Customer", CustomerSchema);
const Vehicle = mongoose.model("Vehicle", VehicleSchema);
const Product = mongoose.model("Product", ProductSchema);
const Service = mongoose.model("Service", ServiceSchema);
const Vendor = mongoose.model("Vendor", VendorSchema);
const StockIn = mongoose.model("StockIn", StockInSchema);
const VendorPayment = mongoose.model("VendorPayment", VendorPaymentSchema);
const User = mongoose.model("User", UserSchema);
const Expense = mongoose.model("Expense", ExpenseSchema);
const UtilityType = mongoose.model("UtilityType", UtilityTypeSchema);
const Utility = mongoose.model("Utility", UtilitySchema);
const Employee = mongoose.model("Employee", EmployeeSchema);
const SalaryRecord = mongoose.model("SalaryRecord", SalaryRecordSchema);
const DailyClose = mongoose.model("DailyClose", DailyCloseSchema);
const Settings = mongoose.model("Settings", SettingsSchema);

module.exports = {
  Invoice,
  Customer,
  Vehicle,
  Product,
  Service,
  Vendor,
  StockIn,
  VendorPayment,
  User,
  Expense,
  UtilityType,
  Utility,
  Employee,
  SalaryRecord,
  DailyClose,
  Settings
};
