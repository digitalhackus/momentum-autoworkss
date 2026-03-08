/**
 * API client for Momentum Autoworks backend (port 5000).
 * In dev we use relative /api so Vite proxy can forward to the backend.
 * Set VITE_API_BASE_URL in .env to override (e.g. for production).
 */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

const AUTH_TOKEN_KEY = 'momentumAuthToken';

function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let err: { message?: string; error?: string } = { message: res.statusText };
    try {
      if (text) err = JSON.parse(text) as { message?: string; error?: string };
    } catch {
      if (res.status === 404) err.message = "Could not reach the server. Is the backend running on port 5000?";
    }
    const msg = err.message ?? err.error;
    throw new Error(msg || `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Invoices
  getInvoices: () => request<unknown[]>(`/invoices`),
  getInvoice: (id: string) => request<unknown>(`/invoices/${id}`),
  createInvoice: (body: unknown) => request<unknown>(`/invoices`, { method: 'POST', body: JSON.stringify(body) }),
  updateInvoice: (id: string, body: unknown) => request<unknown>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteInvoice: (id: string) => request<void>(`/invoices/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => request<unknown[]>(`/customers`),
  getCustomer: (id: string) => request<unknown>(`/customers/${id}`),
  getCustomerVehicles: (customerId: string) => request<unknown[]>(`/customers/${customerId}/vehicles`),
  addCustomerVehicle: (customerId: string, body: { carMake: string; carModel: string; carYear?: string; vehicleNumber: string }) =>
    request<unknown>(`/customers/${customerId}/vehicles`, { method: 'POST', body: JSON.stringify(body) }),
  updateCustomerVehicle: (customerId: string, vehicleId: string, body: { carMake?: string; carModel?: string; carYear?: string; vehicleNumber?: string }) =>
    request<unknown>(`/customers/${customerId}/vehicles/${vehicleId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCustomerVehicle: (customerId: string, vehicleId: string) =>
    request<void>(`/customers/${customerId}/vehicles/${vehicleId}`, { method: 'DELETE' }),
  createCustomer: (body: unknown) => request<unknown>(`/customers`, { method: 'POST', body: JSON.stringify(body) }),
  updateCustomer: (id: string, body: unknown) => request<unknown>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteCustomer: (id: string) => request<void>(`/customers/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => request<unknown[]>(`/products`),
  createProduct: (body: unknown) => request<unknown>(`/products`, { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: unknown) => request<unknown>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' }),
  deductStock: (id: string, quantity: number) => request<unknown>(`/products/${id}/deduct-stock`, { method: 'POST', body: JSON.stringify({ quantity }) }),

  // Services
  getServices: () => request<unknown[]>(`/services`),
  createService: (body: unknown) => request<unknown>(`/services`, { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id: string, body: unknown) => request<unknown>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteService: (id: string) => request<void>(`/services/${id}`, { method: 'DELETE' }),

  // Vendors
  getVendors: () => request<unknown[]>(`/vendors`),
  getVendor: (id: string) => request<unknown>(`/vendors/${id}`),
  getVendorStockIns: (id: string) => request<unknown[]>(`/vendors/${id}/stock-ins`),
  getVendorPayments: (id: string) => request<unknown[]>(`/vendors/${id}/payments`),
  createVendor: (body: unknown) => request<unknown>(`/vendors`, { method: 'POST', body: JSON.stringify(body) }),
  updateVendor: (id: string, body: unknown) => request<unknown>(`/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteVendor: (id: string) => request<void>(`/vendors/${id}`, { method: 'DELETE' }),

  // Stock In
  getStockInRecords: () => request<unknown[]>(`/stock-in`),
  createStockIn: (body: unknown) => request<unknown>(`/stock-in`, { method: 'POST', body: JSON.stringify(body) }),

  // Vendor Payments
  getVendorPaymentsList: () => request<unknown[]>(`/vendor-payments`),
  createVendorPayment: (body: unknown) => request<unknown>(`/vendor-payments`, { method: 'POST', body: JSON.stringify(body) }),

  health: () => request<{ ok: boolean }>(`/health`),

  // Expenses (Finance)
  getExpenses: (params?: { dateFrom?: string; dateTo?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
    if (params?.dateTo) q.set('dateTo', params.dateTo);
    if (params?.category) q.set('category', params.category);
    const query = q.toString();
    return request<unknown[]>(`/expenses${query ? `?${query}` : ''}`);
  },
  getExpense: (id: string) => request<unknown>(`/expenses/${id}`),
  createExpense: (body: unknown) => request<unknown>(`/expenses`, { method: 'POST', body: JSON.stringify(body) }),
  updateExpense: (id: string, body: unknown) => request<unknown>(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteExpense: (id: string) => request<void>(`/expenses/${id}`, { method: 'DELETE' }),
  getExpenseSummaryDaily: (date: string) => request<{ date: string; total: number; count: number }>(`/expenses/summary/daily?date=${encodeURIComponent(date)}`),
  getExpenseSummaryMonthly: (year: number, month: number) =>
    request<{ year: number; month: number; total: number; count: number }>(`/expenses/summary/monthly?year=${year}&month=${month}`),

  // Utilities (Finance)
  getUtilityTypes: () => request<unknown[]>(`/utilities/types`),
  addUtilityType: (name: string) => request<unknown>(`/utilities/types`, { method: 'POST', body: JSON.stringify({ name }) }),
  getUtilities: (params?: { status?: string; dueDateFrom?: string; dueDateTo?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.dueDateFrom) q.set('dueDateFrom', params.dueDateFrom);
    if (params?.dueDateTo) q.set('dueDateTo', params.dueDateTo);
    const query = q.toString();
    return request<unknown[]>(`/utilities${query ? `?${query}` : ''}`);
  },
  getUtility: (id: string) => request<unknown>(`/utilities/${id}`),
  getOutstandingUtilities: () => request<unknown[]>(`/utilities/outstanding`),
  getUtilitySummaryMonthly: (year: number, month: number) =>
    request<{ year: number; month: number; total: number; paid: number; unpaid: number; count: number }>(
      `/utilities/summary/monthly?year=${year}&month=${month}`
    ),
  createUtility: (body: unknown) => request<unknown>(`/utilities`, { method: 'POST', body: JSON.stringify(body) }),
  updateUtility: (id: string, body: unknown) => request<unknown>(`/utilities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  markUtilityPaid: (id: string, paymentMethod?: string) =>
    request<unknown>(`/utilities/${id}/mark-paid`, { method: 'POST', body: JSON.stringify({ payment_method: paymentMethod }) }),

  // Finance: Salaries - Employees
  getEmployees: () => request<unknown[]>(`/employees`),
  getEmployee: (id: string) => request<unknown>(`/employees/${id}`),
  createEmployee: (body: unknown) => request<unknown>(`/employees`, { method: 'POST', body: JSON.stringify(body) }),
  updateEmployee: (id: string, body: unknown) => request<unknown>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Finance: Salaries - Records & dashboard
  getSalariesDashboard: () => request<{ totalEmployees: number; totalPayrollThisMonth: number; unpaidCount: number; paidThisMonthTotal: number }>(`/salaries/dashboard`),
  getSalaryRecords: (params?: { month?: number; year?: number; status?: string; employee_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.month != null) q.set('month', String(params.month));
    if (params?.year != null) q.set('year', String(params.year));
    if (params?.status) q.set('status', params.status);
    if (params?.employee_id) q.set('employee_id', params.employee_id);
    const query = q.toString();
    return request<unknown[]>(`/salaries/records${query ? `?${query}` : ''}`);
  },
  getSalaryRecord: (id: string) => request<unknown>(`/salaries/records/${id}`),
  createSalaryRecord: (body: { employee_id: string; month: number; year: number; bonus?: number; deduction?: number; notes?: string }) =>
    request<unknown>(`/salaries/records`, { method: 'POST', body: JSON.stringify(body) }),
  markSalaryPaid: (id: string, paymentMethod: string) =>
    request<unknown>(`/salaries/records/${id}/mark-paid`, { method: 'POST', body: JSON.stringify({ payment_method: paymentMethod }) }),



  // Finance: Daily Close
  getDailyCloses: () => request<unknown[]>(`/daily-close`),
  getDailyClosePreview: (date: string) => request<unknown>(`/daily-close/preview/${date}`),
  getDailyCloseByDate: (date: string) => request<unknown>(`/daily-close/${date}`),
  closeDailyClose: (date: string) => request<unknown>(`/daily-close`, { method: 'POST', body: JSON.stringify({ date }) }),
  reopenDailyClose: (date: string) => request<void>(`/daily-close/${date}`, { method: 'DELETE' }),
  // Dashboard
  getDashboardStats: () =>
    request<{
      totalRevenue: number;
      revenueToday: number;
      jobsToday: number;
      completedToday: number;
      jobsInProgress: number;
      customerCount: number;
      vehicleCount: number;
      revenueChangePercent: number | null;
      completedChangePercent: number | null;
    }>(`/dashboard/stats`),
  getRecentInvoices: () => request<unknown[]>(`/dashboard/recent-invoices`),

  // Auth
  register: (body: { name: string; email: string; password: string }) =>
    request<{ success: boolean; message: string; email: string }>(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  verifyOtp: (body: { email: string; otp: string }) =>
    request<{ success: boolean; message: string }>(`/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  resendOtp: (body: { email: string }) =>
    request<{ success: boolean; message: string; email: string }>(`/auth/resend-otp`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: { id: string; name: string; email: string } }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  changePassword: async (body: { currentPassword: string; newPassword: string }) => {
    const token = getAuthToken();
    if (!token) throw new Error('You must be logged in to change your password.');
    return request<{ success: boolean; message: string }>(`/auth/change-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  },
};
