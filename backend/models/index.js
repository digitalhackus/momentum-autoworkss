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
  date: String,
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
  category: String,
  salePrice: Number,
  lastCostPrice: Number,
  averageCostPrice: Number,
  stockQuantity: Number,
  status: String,
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

module.exports = {
  Invoice,
  Customer,
  Vehicle,
  Product,
  Service,
  Vendor,
  StockIn,
  VendorPayment,
};
