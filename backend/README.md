# Momentum Autoworks – Backend

Express API for the Momentum Autoworks frontend. Runs on **port 5000**.

## Setup

```bash
cd backend
npm install
npm start
```

## API Base URL

- **Development:** Frontend (port 3000) proxies `/api` to `http://localhost:5000`.
- **Production:** Set `VITE_API_BASE_URL` in the frontend env (e.g. `https://your-api.com/api`).

## Endpoints

| Resource        | GET           | POST          | PATCH         | DELETE        |
|----------------|---------------|---------------|---------------|---------------|
| Invoices       | `/api/invoices`, `/api/invoices/:id` | `/api/invoices` | `/api/invoices/:id` | `/api/invoices/:id` |
| Customers      | `/api/customers`, `/api/customers/:id` | `/api/customers` | `/api/customers/:id` | - |
| Products       | `/api/products` | `/api/products` | `/api/products/:id` | `/api/products/:id` |
| Products       | -             | `/api/products/:id/deduct-stock` (body: `{ quantity }`) | - | - |
| Services       | `/api/services` | `/api/services` | `/api/services/:id` | `/api/services/:id` |
| Vendors        | `/api/vendors`, `/api/vendors/:id` | `/api/vendors` | `/api/vendors/:id` | `/api/vendors/:id` |
| Vendors        | `/api/vendors/:id/stock-ins`, `/api/vendors/:id/payments` | - | - | - |
| Stock In       | `/api/stock-in` | `/api/stock-in` | - | - |
| Vendor Payments| `/api/vendor-payments` | `/api/vendor-payments` | - | - |
| Health         | `/api/health` | - | - | - |

Data is stored in memory (no database yet). Restarting the server resets all data.

## Adding a database

Replace the in-memory store in `data/store.js` with your database client (e.g. PostgreSQL, MongoDB). Keep the same function signatures so the route handlers do not need to change.
