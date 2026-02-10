import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../api/client';

// Types
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  type: 'service' | 'product';
  customerSupplied?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerId: string;
  customerEmail?: string;
  customerPhone: string;
  make: string;
  model: string;
  plate: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Draft';
  paymentMethod: string;
  servicesCount: number;
  technician?: string;
  supervisor?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountPercentage?: number;
  taxPercentage?: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  vehicles: number;
  lastVisit: string;
  totalSpent: number;
  status: 'Active' | 'VIP' | 'Inactive';
  serviceHistory: number;
  invoiceHistory?: string[]; // Array of invoice IDs
}

// Inventory Types
export interface Product {
  id: string;
  name: string;
  category: string;
  salePrice: number;
  lastCostPrice: number;
  averageCostPrice: number;
  stockQuantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  vendorId?: string;
  vendorName?: string;
}

export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  outstandingBalance: number;
  totalSupplied: number;
  totalPaid: number;
  lastSupplyDate?: string;
  lastPaymentDate?: string;
}

export interface StockInItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

export interface StockInRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string;
  items: StockInItem[];
  totalAmount: number;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface DataContextType {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  services: Service[];
  vendors: Vendor[];
  stockInRecords: StockInRecord[];
  vendorPayments: VendorPayment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  // Invoice Operations
  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'servicesCount'>) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;

  // Customer Operations
  addCustomer: (customer: Omit<Customer, 'id' | 'lastVisit' | 'totalSpent' | 'serviceHistory' | 'vehicles'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;

  // Product/Inventory Operations
  addProduct: (product: Omit<Product, 'id' | 'status'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deductStock: (productId: string, quantity: number) => Promise<void>;

  // Service Operations
  addService: (service: Omit<Service, 'id'>) => Promise<Service>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // Vendor Operations
  addVendor: (vendor: Omit<Vendor, 'id' | 'outstandingBalance' | 'totalSupplied' | 'totalPaid'>) => Promise<Vendor>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  getVendorById: (id: string) => Vendor | undefined;

  // Stock In Operations
  addStockIn: (stockIn: Omit<StockInRecord, 'id' | 'date'>) => Promise<StockInRecord>;
  getVendorStockIns: (vendorId: string) => StockInRecord[];

  // Payment Operations
  addVendorPayment: (payment: Omit<VendorPayment, 'id' | 'date'>) => Promise<VendorPayment>;
  getVendorPayments: (vendorId: string) => VendorPayment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stockInRecords, setStockInRecords] = useState<StockInRecord[]>([]);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const [inv, cust, prod, srv, vend, stock, pay] = await Promise.all([
        api.getInvoices(),
        api.getCustomers(),
        api.getProducts(),
        api.getServices(),
        api.getVendors(),
        api.getStockInRecords(),
        api.getVendorPaymentsList(),
      ]);
      setInvoices((inv as Invoice[]) || []);
      setCustomers((cust as Customer[]) || []);
      setProducts((prod as Product[]) || []);
      setServices((srv as Service[]) || []);
      setVendors((vend as Vendor[]) || []);
      setStockInRecords((stock as StockInRecord[]) || []);
      setVendorPayments((pay as VendorPayment[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'servicesCount'>) => {
    const created = (await api.createInvoice(invoiceData)) as Invoice;
    await refetch();
    return created;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    await api.updateInvoice(id, updates);
    await refetch();
  };

  const deleteInvoice = async (id: string) => {
    await api.deleteInvoice(id);
    await refetch();
  };

  const getInvoiceById = (id: string) => invoices.find((inv) => inv.id === id);

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'lastVisit' | 'totalSpent' | 'serviceHistory' | 'vehicles'>) => {
    const created = (await api.createCustomer(customerData)) as Customer;
    await refetch();
    return created;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    await api.updateCustomer(id, updates);
    await refetch();
  };

  const getCustomerById = (id: string) => customers.find((c) => c.id === id);

  const addProduct = async (productData: Omit<Product, 'id' | 'status'>) => {
    const created = (await api.createProduct(productData)) as Product;
    await refetch();
    return created;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await api.updateProduct(id, updates);
    await refetch();
  };

  const deleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    await refetch();
  };

  const deductStock = async (productId: string, quantity: number) => {
    await api.deductStock(productId, quantity);
    await refetch();
  };

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    const created = (await api.createService(serviceData)) as Service;
    await refetch();
    return created;
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    await api.updateService(id, updates);
    await refetch();
  };

  const deleteService = async (id: string) => {
    await api.deleteService(id);
    await refetch();
  };

  const addVendor = async (vendorData: Omit<Vendor, 'id' | 'outstandingBalance' | 'totalSupplied' | 'totalPaid'>) => {
    const created = (await api.createVendor(vendorData)) as Vendor;
    await refetch();
    return created;
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    await api.updateVendor(id, updates);
    await refetch();
  };

  const deleteVendor = async (id: string) => {
    await api.deleteVendor(id);
    await refetch();
  };

  const getVendorById = (id: string) => vendors.find((v) => v.id === id);

  const addStockIn = async (stockInData: Omit<StockInRecord, 'id' | 'date'>) => {
    const created = (await api.createStockIn(stockInData)) as StockInRecord;
    await refetch();
    return created;
  };

  const getVendorStockIns = (vendorId: string) => stockInRecords.filter((rec) => rec.vendorId === vendorId);

  const addVendorPayment = async (paymentData: Omit<VendorPayment, 'id' | 'date'>) => {
    const created = (await api.createVendorPayment(paymentData)) as VendorPayment;
    await refetch();
    return created;
  };

  const getVendorPayments = (vendorId: string) => vendorPayments.filter((pay) => pay.vendorId === vendorId);

  return (
    <DataContext.Provider
      value={{
        invoices,
        customers,
        products,
        services,
        vendors,
        stockInRecords,
        vendorPayments,
        loading,
        error,
        refetch,
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
