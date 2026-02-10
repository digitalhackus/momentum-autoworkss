/**
 * API client for Momentum Autoworks backend (port 5000).
 * Set VITE_API_BASE_URL in .env to override (e.g. for production).
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || `API error ${res.status}`);
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
  createCustomer: (body: unknown) => request<unknown>(`/customers`, { method: 'POST', body: JSON.stringify(body) }),
  updateCustomer: (id: string, body: unknown) => request<unknown>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

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
};
