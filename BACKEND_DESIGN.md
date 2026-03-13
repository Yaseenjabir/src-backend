# SRC Simple Record System — Backend Design

## 1) Goal
Build a simple, reliable backend to manage:
- Products
- Customers
- Invoices
- Invoice Items
- Payments (per-invoice and global)
- Ledger Payments (customer account-level)
- Receivables summary

This design ignores hosting/deployment and focuses on functionality.

## 2) Recommended Stack
- Runtime: Node.js (LTS)
- Framework: Express.js
- Database: MongoDB (Atlas)
- ODM/Query: Mongoose
- Validation: Zod
- Auth: JWT (single admin role initially)

> For quick local delivery, use local MongoDB or Atlas free tier; move to paid Atlas tier for production reliability.

## 3) API Design (REST)

Base path: `/api/v1`

### Auth
- `POST /auth/login` (admin login, returns JWT token)
- `GET /auth/me` (current admin profile)

> Route protection: all business routes are admin-protected.

### Products
- `GET /products/models` (returns model enum list for frontend dropdown)
- `GET /products` (list + search + pagination)
- `POST /products` (create)
- `PATCH /products/:id` (update)
- `DELETE /products/:id` (soft delete → `is_active=false`)

### Customers
- `GET /customers`
- `POST /customers`
- `GET /customers/:id`
- `PATCH /customers/:id`
- `PATCH /customers/:id/opening-balance` (one-time set of opening balance)
- `DELETE /customers/:id` (hard delete + cascade invoices, payments, ledger payments)

### Invoices
- `GET /invoices` (filter by status/customer/date)
- `POST /invoices`
- `GET /invoices/:id`
- `PATCH /invoices/:id` (edit date/discount/notes/items)
- `DELETE /invoices/:id` (hard delete + cascade payments)
- `POST /invoices/:id/items` (append items without replacing)
- `POST /invoices/:id/payments` (record invoice-scoped payment)
- `GET /invoices/:id/payments`
- `DELETE /invoices/payments/:paymentId` (recompute invoice totals)

### Payments (Global)
- `GET /payments` (global listing with filters)
- `POST /payments` (create payment by invoiceId in body)
- `DELETE /payments/:id` (delete + recompute invoice totals)

### Ledger Payments
- `GET /ledger-payments` (global listing, filterable by customerId/method)
- `DELETE /ledger-payments/:id`
- `GET /customers/:customerId/ledger-payments` (customer-scoped list)
- `POST /customers/:customerId/ledger-payments` (create, validated against balance)

### Summary / Dashboard
- `GET /summary/dashboard`
  - KPIs: total receivable, collected (period), partial count, overdue amount/customers
  - Top overdue customer
  - Last 5 recent invoices

## 4) Request/Response Contract Notes

### Create Invoice Request
```json
{
  "customerId": "ObjectId",
  "invoiceDate": "2026-03-01",
  "discount": 0,
  "notes": "optional",
  "items": [
    { "productId": "ObjectId", "quantity": 2, "unitPriceSnapshot": 1500, "boxQty": 3 }
  ]
}
```

### Create Product Request
```json
{
  "sku": "AS-001",
  "name": "A Series 01",
  "model": "A_SERIES",
  "price": 250
}
```

`model` enum: `A_SERIES | K_SERIES | R_SERIES | UNIQUE_SERIES`

### Admin Login Request
```json
{
  "email": "admin@example.com",
  "password": "change_this_password"
}
```

### Admin Login Response
```json
{
  "token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": "7d",
  "user": {
    "id": "ObjectId",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Add Payment Request (invoice-scoped)
```json
{
  "paymentDate": "2026-03-01",
  "amount": 1000,
  "method": "CASH",
  "reference": "optional",
  "notes": "optional"
}
```

### Create Ledger Payment Request
```json
{
  "amount": 5000,
  "method": "CASH",
  "paymentDate": "2026-03-01T00:00:00.000Z",
  "notes": "optional"
}
```

### Set Opening Balance Request
```json
{
  "amount": 15000
}
```

## 5) Validation + Error Handling
- Standard errors:
  - `400` invalid payload
  - `404` entity not found
  - `409` duplicate SKU or invoice number conflict
  - `422` business rule failure (e.g., payment exceeds remaining balance)
- Use whole integers for monetary values (e.g., `300`, not `300.00`).
- Reject non-integer money values for `price`, `discount`, `unitPriceSnapshot`, and `amount`.
- Reject product create/update if `model` is outside enum.
- Keep enum values uppercase to avoid mismatch.

## 6) Indexing
- `products.sku` unique
- `products` compound unique index: `{ name: 1, model: 1 }`
- `customers.phone`
- `invoices.invoice_no` unique
- `invoices` compound index: `{ customer_id: 1, status: 1 }`
- `invoices.invoice_date: -1`
- `payments` compound index: `{ invoice_id: 1, payment_date: -1 }`
- `ledger_payments` compound index: `{ customer_id: 1, payment_date: -1 }`

## 7) Security (minimal v1)
- Custom JWT auth with single role: `admin`.
- All business APIs require `Authorization: Bearer <token>`.
- Bootstrap admin user is auto-created on startup (if missing) using env values:
  - `ADMIN_NAME`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Required JWT env values:
  - `JWT_SECRET`
  - optional: `JWT_EXPIRES_IN` (default `7d`)
- Audit fields (`created_at`, `updated_at`) mandatory.

## 8) Folder Structure

```text
backend/
  .env.example
  src/
    app.ts
    server.ts
    config/
      db.ts
      bootstrapAdmin.ts
    constants/
      productCategories.ts   ← exports PRODUCT_MODELS, ProductModel, MODEL_LABELS
      invoiceStatus.ts       ← exports INVOICE_STATUS, InvoiceStatus
    controllers/
      auth.controller.ts
      product.controller.ts
      customer.controller.ts
      invoice.controller.ts
      payment.controller.ts
      ledgerPayment.controller.ts
      summary.controller.ts
    middlewares/
      auth.middleware.ts
      errorHandler.ts
      validateRequest.ts
    models/
      User.ts
      Product.ts
      Customer.ts
      Invoice.ts
      Payment.ts
      LedgerPayment.ts
    routes/
      auth.routes.ts
      health.routes.ts
      product.routes.ts
      customer.routes.ts
      invoice.routes.ts
      payment.routes.ts
      ledgerPayment.routes.ts
      summary.routes.ts
    scripts/
      seedDummyData.ts
    validators/
      auth.validator.ts
      product.validator.ts
      customer.validator.ts
      invoice.validator.ts
      payment.validator.ts
      ledgerPayment.validator.ts
    utils/
      AppError.ts
      asyncHandler.ts
```

## 9) Milestone Plan
1. ✅ Core setup: TypeScript + MongoDB + global error handling
2. ✅ Auth: admin login, protected routes, bootstrap admin
3. ✅ Products + Customers CRUD
4. ✅ Invoice create/read/update/delete (with item snapshots, box_qty per item)
5. ✅ Payments: add, list, delete with auto-recalculate (invoice-scoped + global)
6. ✅ Ledger Payments: customer account-level payments with balance validation
7. ✅ Summary/dashboard endpoint
8. ✅ API docs
