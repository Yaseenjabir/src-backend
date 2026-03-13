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

### Products
- `GET /api/v1/products/models`
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
- `POST /api/v1/invoices/:id/payments`
- `GET /api/v1/invoices/:id/payments`
- `DELETE /api/v1/invoices/payments/:paymentId`

### Payments (Global)
- `GET /api/v1/payments`
- `POST /api/v1/payments`
- `DELETE /api/v1/payments/:id`

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
- Product `model` uses enum values from `src/constants/productCategories.ts`: `A_SERIES | K_SERIES | R_SERIES | UNIQUE_SERIES`.
- All business routes are admin-protected via `Authorization: Bearer <token>`.
- Product delete is a soft delete (`is_active = false`); customer delete is a hard cascade delete.
