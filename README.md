# SRC Simple Record Backend (MongoDB + TypeScript)

## Quick start

1. Copy `.env.example` to `.env` and update `MONGODB_URI`.
2. Install dependencies:
   - `npm install`
3. Run development server:
   - `npm run dev`
4. Type-check build:
   - `npm run build`

Server runs on `http://localhost:5000` by default.

Production backend URL:
- `https://src-backend-dun.vercel.app`

## Authentication

- The backend uses custom JWT auth.
- A bootstrap admin user is auto-created on startup if these env vars are set:
   - `ADMIN_NAME`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
- Login endpoint:
   - `POST /api/v1/auth/login`
- Use returned bearer token for admin-protected routes.

## Current endpoints

### Health
- `GET /api/v1/health`

### Auth
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Product Models
- `GET /api/v1/product-models`
- `POST /api/v1/product-models`
- `PATCH /api/v1/product-models/:id`
- `DELETE /api/v1/product-models/:id`

### Products
- `GET /api/v1/products`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

### Customers
- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `GET /api/v1/customers/:id`
- `PATCH /api/v1/customers/:id`
- `PATCH /api/v1/customers/:id/opening-balance`
- `DELETE /api/v1/customers/:id`

### Invoices
- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/invoices/:id`
- `PATCH /api/v1/invoices/:id`
- `DELETE /api/v1/invoices/:id`
- `POST /api/v1/invoices/:id/items`

### Ledger Payments
- `GET /api/v1/ledger-payments`
- `DELETE /api/v1/ledger-payments/:id`
- `GET /api/v1/customers/:customerId/ledger-payments`
- `POST /api/v1/customers/:customerId/ledger-payments`

### Summary
- `GET /api/v1/summary/dashboard`

Detailed request/response guide:
- See `API_ENDPOINTS.md`

## Notes

- Money fields are integer-only (for example: `300`, not `300.00`).
- Products have two types: `"direct"` (name + price only) and `"model"` (name + model label + price).
- Product models are stored dynamically in the `product_models` collection — no static enum.
- All business routes are admin-protected via `Authorization: Bearer <token>`.
- Product delete is a hard delete; customer delete is a hard cascade delete.
