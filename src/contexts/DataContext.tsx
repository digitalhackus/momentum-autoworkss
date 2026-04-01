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
  carYear?: string;
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
  brand?: string;
  category: string;
  salePrice: number;
  lastCostPrice: number;
  averageCostPrice: number;
  stockQuantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  vendorId?: string;
  vendorName?: string;
  lastStockInDate?: string;
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
  salePrice?: number;
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

export interface CustomerVehicle {
  id: string;
  customerId: string;
  carMake: string;
  carModel: string;
  carYear?: string;
  vehicleNumber: string;
}

// Finance: Expenses (independent of invoices/inventory)
export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  payment_method: 'cash' | 'card' | 'bank' | 'online';
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Finance: Utility types
export interface UtilityType {
  id: string;
  name: string;
  created_at: string;
}

// Finance: Utilities (independent of invoices/inventory)
export interface Utility {
  id: string;
  utility_type_id: string;
  billing_period_start: string;
  billing_period_end: string;
  amount: number;
  due_date: string;
  status: 'unpaid' | 'paid';
  payment_method?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Finance: Salaries - Employees (independent of invoices)
export interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  role?: string | null;
  monthly_salary: number;
  joining_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Finance: Salaries - Salary records
export interface SalaryRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  salary_amount: number;
  bonus: number;
  deduction: number;
  total_salary: number;
  payment_status: 'unpaid' | 'paid';
  payment_method?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Daily Close types
export interface DailyClosePaidInvoice {
  invoiceId: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  paymentMethod: string;
}

export interface DailyClosePurchase {
  stockInId: string;
  vendorName: string;
  totalAmount: number;
}

export interface DailyCloseVendorPayment {
  paymentId: string;
  vendorName: string;
  amount: number;
  method: string;
}

export interface DailyCloseLineItem {
  description: string;
  amount: number;
}

export interface DailyCloseRecord {
  id?: string;
  date: string;
  paidInvoices: DailyClosePaidInvoice[];
  totalRevenue: number;
  inventoryPurchases: DailyClosePurchase[];
  vendorPayments: DailyCloseVendorPayment[];
  salaries: DailyCloseLineItem[];
  utilities: DailyCloseLineItem[];
  otherExpenses: DailyCloseLineItem[];
  totalPurchases: number;
  totalVendorPayments: number;
  totalSalaries: number;
  totalUtilities: number;
  totalOtherExpenses: number;
  totalExpenses: number;
  netProfit: number;
  closedAt?: string;
  closedBy?: string;
}

interface DataContextType {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  services: Service[];
  vendors: Vendor[];
  stockInRecords: StockInRecord[];
  vendorPayments: VendorPayment[];
  expenses: Expense[];
  utilityTypes: UtilityType[];
  utilities: Utility[];
  employees: Employee[];
  salaryRecords: SalaryRecord[];
  dailyCloses: DailyCloseRecord[];
  allVehicles: CustomerVehicle[];
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
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerVehicles: (customerId: string) => Promise<CustomerVehicle[]>;
  addVehicle: (customerId: string, data: { carMake: string; carModel: string; carYear?: string; vehicleNumber: string }) => Promise<CustomerVehicle>;
  updateVehicle: (customerId: string, vehicleId: string, data: Partial<Pick<CustomerVehicle, 'carMake' | 'carModel' | 'carYear' | 'vehicleNumber'>>) => Promise<void>;
  deleteVehicle: (customerId: string, vehicleId: string) => Promise<void>;

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

  // Finance: Expenses
  getExpenses: (filters?: { dateFrom?: string; dateTo?: string; category?: string }) => Promise<void>;
  addExpense: (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseSummaryDaily: (date: string) => Promise<{ date: string; total: number; count: number }>;
  getExpenseSummaryMonthly: (year: number, month: number) => Promise<{ year: number; month: number; total: number; count: number }>;

  // Finance: Utilities
  addUtilityType: (name: string) => Promise<UtilityType>;
  getUtilities: (filters?: { status?: string; dueDateFrom?: string; dueDateTo?: string }) => Promise<void>;
  getOutstandingUtilities: () => Promise<Utility[]>;
  addUtility: (data: Omit<Utility, 'id' | 'created_at' | 'updated_at'>) => Promise<Utility>;
  updateUtility: (id: string, updates: Partial<Omit<Utility, 'id'>>) => Promise<void>;
  markUtilityPaid: (id: string, paymentMethod?: string) => Promise<void>;
  getUtilitySummaryMonthly: (year: number, month: number) => Promise<{ year: number; month: number; total: number; paid: number; unpaid: number; count: number }>;

  // Finance: Salaries
  getSalaryRecords: (filters?: { month?: number; year?: number; status?: string; employee_id?: string }) => Promise<void>;
  getSalariesDashboard: () => Promise<{ totalEmployees: number; totalPayrollThisMonth: number; unpaidCount: number; paidThisMonthTotal: number }>;
  addEmployee: (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<Employee>;
  updateEmployee: (id: string, updates: Partial<Omit<Employee, 'id'>>) => Promise<void>;
  createSalaryRecord: (data: { employee_id: string; month: number; year: number; bonus?: number; deduction?: number; notes?: string }) => Promise<SalaryRecord>;
  markSalaryPaid: (id: string, paymentMethod: string) => Promise<void>;

  // Finance: Daily Close
  fetchDailyClosePreview: (date: string) => Promise<DailyCloseRecord>;
  closeDay: (date: string) => Promise<void>;
  reopenDay: (date: string) => Promise<void>;
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [utilityTypes, setUtilityTypes] = useState<UtilityType[]>([]);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [dailyCloses, setDailyCloses] = useState<DailyCloseRecord[]>([]);
  const [allVehicles, setAllVehicles] = useState<CustomerVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const [inv, cust, prod, srv, vend, stock, pay, exp, uTypes, utils, emps, dcList, vehs] = await Promise.all([
        api.getInvoices(),
        api.getCustomers(),
        api.getProducts(),
        api.getServices(),
        api.getVendors(),
        api.getStockInRecords(),
        api.getVendorPaymentsList(),
        api.getExpenses(),
        api.getUtilityTypes(),
        api.getUtilities(),
        api.getEmployees(),
        api.getDailyCloses(),
        api.getVehicles(),
      ]);
      setInvoices((inv as Invoice[]) || []);
      setCustomers((cust as Customer[]) || []);
      setProducts((prod as Product[]) || []);
      setServices((srv as Service[]) || []);
      setVendors((vend as Vendor[]) || []);
      setStockInRecords((stock as StockInRecord[]) || []);
      setVendorPayments((pay as VendorPayment[]) || []);
      setExpenses((exp as Expense[]) || []);
      setUtilityTypes((uTypes as UtilityType[]) || []);
      setUtilities((utils as Utility[]) || []);
      setEmployees((emps as Employee[]) || []);
      setDailyCloses((dcList as DailyCloseRecord[]) || []);
      setAllVehicles((vehs as CustomerVehicle[]) || []);
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
    setInvoices((prev) => {
      const next = [created, ...prev];
      next.sort((a, b) => (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0));
      return next;
    });
    try {
      await refetch();
    } catch {
      // Keep optimistic list if refetch fails
    }
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
  
  const deleteCustomer = async (id: string) => {
    await api.deleteCustomer(id);
    await refetch();
  };

  const getCustomerById = (id: string) => customers.find((c) => c.id === id);

  const getCustomerVehicles = useCallback(async (customerId: string) => {
    const list = (await api.getCustomerVehicles(customerId)) as CustomerVehicle[];
    return list || [];
  }, []);

  const addVehicle = async (
    customerId: string,
    data: { carMake: string; carModel: string; carYear?: string; vehicleNumber: string }
  ) => {
    const created = (await api.addCustomerVehicle(customerId, data)) as CustomerVehicle;
    await refetch();
    return created;
  };

  const updateVehicle = async (
    customerId: string,
    vehicleId: string,
    data: Partial<Pick<CustomerVehicle, 'carMake' | 'carModel' | 'carYear' | 'vehicleNumber'>>
  ) => {
    await api.updateCustomerVehicle(customerId, vehicleId, data);
    await refetch();
  };
  
  const deleteVehicle = async (customerId: string, vehicleId: string) => {
    await api.deleteCustomerVehicle(customerId, vehicleId);
    await refetch();
  };

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

  const getExpenses = useCallback(async (filters?: { dateFrom?: string; dateTo?: string; category?: string }) => {
    const list = (await api.getExpenses(filters)) as Expense[];
    setExpenses(list || []);
  }, []);

  const addExpense = async (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    const created = (await api.createExpense(data)) as Expense;
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const updateExpenseById = async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    await api.updateExpense(id, updates);
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    );
  };

  const deleteExpenseById = async (id: string) => {
    await api.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const getExpenseSummaryDaily = (date: string) => api.getExpenseSummaryDaily(date);
  const getExpenseSummaryMonthly = (year: number, month: number) => api.getExpenseSummaryMonthly(year, month);

  const addUtilityTypeByName = async (name: string) => {
    const created = (await api.addUtilityType(name)) as UtilityType;
    setUtilityTypes((prev) => [...prev, created].sort((a, b) => a.id.localeCompare(b.id)));
    return created;
  };

  const getUtilitiesWithFilters = useCallback(
    async (filters?: { status?: string; dueDateFrom?: string; dueDateTo?: string }) => {
      const list = (await api.getUtilities(filters)) as Utility[];
      setUtilities(list || []);
    },
    []
  );

  const getOutstandingUtilities = async () => {
    const list = (await api.getOutstandingUtilities()) as Utility[];
    return list;
  };

  const addUtility = async (data: Omit<Utility, 'id' | 'created_at' | 'updated_at'>) => {
    const created = (await api.createUtility(data)) as Utility;
    setUtilities((prev) => [created, ...prev]);
    return created;
  };

  const updateUtilityById = async (id: string, updates: Partial<Omit<Utility, 'id'>>) => {
    await api.updateUtility(id, updates);
    setUtilities((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates, updated_at: new Date().toISOString() } : u))
    );
  };

  const markUtilityPaidById = async (id: string, paymentMethod?: string) => {
    const updated = (await api.markUtilityPaid(id, paymentMethod)) as Utility;
    setUtilities((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
  };

  const getUtilitySummaryMonthly = (year: number, month: number) => api.getUtilitySummaryMonthly(year, month);

  const getSalaryRecordsWithFilters = useCallback(
    async (filters?: { month?: number; year?: number; status?: string; employee_id?: string }) => {
      const list = (await api.getSalaryRecords(filters)) as SalaryRecord[];
      setSalaryRecords(list || []);
    },
    []
  );

  const getSalariesDashboardStats = useCallback(() => api.getSalariesDashboard(), []);

  const addEmployeeAsync = async (data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    const created = (await api.createEmployee(data)) as Employee;
    await refetch();
    return created;
  };

  const updateEmployeeById = async (id: string, updates: Partial<Omit<Employee, 'id'>>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
    );
    try {
      await api.updateEmployee(id, updates);
      await refetch();
    } catch {
      await refetch();
    }
  };

  const createSalaryRecordAsync = async (data: {
    employee_id: string;
    month: number;
    year: number;
    bonus?: number;
    deduction?: number;
    notes?: string;
  }) => {
    const created = (await api.createSalaryRecord(data)) as SalaryRecord;
    setSalaryRecords((prev) => [created, ...prev]);
    return created;
  };

  const markSalaryPaidById = async (id: string, paymentMethod: string) => {
    const updated = (await api.markSalaryPaid(id, paymentMethod)) as SalaryRecord;
    setSalaryRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  // --- Daily Close ---
  const fetchDailyClosePreview = async (date: string): Promise<DailyCloseRecord> => {
    const result = (await api.getDailyClosePreview(date)) as DailyCloseRecord;
    return result;
  };

  const closeDay = async (date: string) => {
    await api.closeDailyClose(date);
    await refetch();
  };

  const reopenDay = async (date: string) => {
    await api.reopenDailyClose(date);
    await refetch();
  };

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
        expenses,
        utilityTypes,
        utilities,
        employees,
        salaryRecords,
        dailyCloses,
        allVehicles,
        loading,
        error,
        refetch,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        getCustomerVehicles,
        addVehicle,
        updateVehicle,
  deleteVehicle,
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
        getExpenses,
        addExpense,
        updateExpense: updateExpenseById,
        deleteExpense: deleteExpenseById,
        getExpenseSummaryDaily,
        getExpenseSummaryMonthly,
        addUtilityType: addUtilityTypeByName,
        getUtilities: getUtilitiesWithFilters,
        getOutstandingUtilities,
        addUtility,
        updateUtility: updateUtilityById,
        markUtilityPaid: markUtilityPaidById,
        getUtilitySummaryMonthly,
        getSalaryRecords: getSalaryRecordsWithFilters,
        getSalariesDashboard: getSalariesDashboardStats,
        addEmployee: addEmployeeAsync,
        updateEmployee: updateEmployeeById,
        createSalaryRecord: createSalaryRecordAsync,
        markSalaryPaid: markSalaryPaidById,
        fetchDailyClosePreview,
        closeDay,
        reopenDay,
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
