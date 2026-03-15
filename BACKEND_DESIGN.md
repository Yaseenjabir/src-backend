# SRC Simple Record System — Backend Design

## 1) Goal
Build a simple, reliable backend to manage:
- Products (direct price or model-based)
- Product Models (dynamic label + auto-derived SKU prefix)
- Customers
- Invoices
- Invoice Items
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

### Product Models
- `GET /product-models` (list all models)
- `POST /product-models` (create; `sku_prefix` is auto-derived from label)
- `PATCH /product-models/:id` (update label; `sku_prefix` auto-recalculated)
- `DELETE /product-models/:id` (hard delete)

### Products
- `GET /products` (list + search + pagination)
- `POST /products` (create; supports `type: "direct"` or `type: "model"`)
- `PATCH /products/:id` (update name, model, price)
- `DELETE /products/:id` (hard delete)

### Customers
- `GET /customers`
- `POST /customers`
- `GET /customers/:id`
- `PATCH /customers/:id`
- `PATCH /customers/:id/opening-balance` (one-time set of opening balance)
- `DELETE /customers/:id` (hard delete + cascade invoices and ledger payments)

### Invoices
- `GET /invoices` (filter by status/customer/date)
- `POST /invoices`
- `GET /invoices/:id`
- `PATCH /invoices/:id` (edit date/discount/notes/items)
- `DELETE /invoices/:id` (hard delete)
- `POST /invoices/:id/items` (append items without replacing)

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

### Create Product Request (direct type)
```json
{
  "type": "direct",
  "name": "SWITCH SOCKET",
  "price": 150
}
```

### Create Product Request (model type)
```json
{
  "type": "model",
  "name": "FAN",
  "model": "A Series",
  "price": 500
}
```

- `sku` is optional in both cases; backend auto-generates it if omitted.
- For `type: "model"`, the SKU prefix is looked up from the `product_models` collection by matching `label`.
- For `type: "direct"`, the SKU prefix defaults to `"PR"`.

### Create Product Model Request
```json
{
  "label": "A Series"
}
```

- `sku_prefix` is auto-derived from `label` initials (e.g. `"A Series"` → `"AS"`, `"Unique Series"` → `"US"`).

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
  - `422` business rule failure (e.g., ledger payment exceeds remaining balance)
- Use whole integers for monetary values (e.g., `300`, not `300.00`).
- Reject non-integer money values for `price`, `discount`, `unitPriceSnapshot`, and `amount`.
- Product `type` must be `"direct"` or `"model"` — enforced via Zod discriminated union.
- `type: "model"` products require `model` field; `type: "direct"` products must not include it.
- `type` is not updatable after creation.

## 6) Indexing
- `products`: `{ sku: 1 }` unique
- `products`: `{ name: 1, model: 1 }` compound unique
- `customers`: `{ phone: 1 }`
- `invoices`: `{ invoice_no: 1 }` unique
- `invoices`: `{ customer_id: 1, status: 1 }` compound
- `invoices`: `{ invoice_date: -1 }`
- `ledger_payments`: `{ customer_id: 1, payment_date: -1 }` compound

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
    controllers/
      auth.controller.ts
      product.controller.ts
      productModel.controller.ts
      customer.controller.ts
      invoice.controller.ts
      ledgerPayment.controller.ts
      summary.controller.ts
    middlewares/
      auth.middleware.ts
      errorHandler.ts
      validateRequest.ts
    models/
      User.ts
      Product.ts
      ProductModel.ts
      Customer.ts
      Invoice.ts
      LedgerPayment.ts
    routes/
      auth.routes.ts
      health.routes.ts
      product.routes.ts
      productModel.routes.ts
      customer.routes.ts
      invoice.routes.ts
      ledgerPayment.routes.ts
      summary.routes.ts
    scripts/
      seedDummyData.ts
    validators/
      auth.validator.ts
      product.validator.ts
      productModel.validator.ts
      customer.validator.ts
      invoice.validator.ts
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
5. ✅ Ledger Payments: customer account-level payments with balance validation
6. ✅ Summary/dashboard endpoint
7. ✅ Product Models: dynamic CRUD with auto-derived SKU prefix
8. ✅ Two product types: direct (name + price) and model-based (name + model + price)
9. ✅ API docs
