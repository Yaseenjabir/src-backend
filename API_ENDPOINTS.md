# API Endpoints (Current Routes)

Base URL:

- Local: `http://localhost:5000/api/v1`
- Production: `https://src-backend-dun.vercel.app/api/v1`

Auth header for protected routes:

- `Authorization: Bearer <token>`

Money format:

- Send integer values only (e.g. `250`, not `250.00`).

---

## Health

### GET `/health`

- Auth: No
- Request body: None
- Expected response:

```json
{ "status": "ok" }
```

---

## Auth

### POST `/auth/login`

- Auth: No
- Request body:

```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

- Expected response:

```json
{
  "token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": "7d",
  "user": {
    "id": "65f...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### GET `/auth/me`

- Auth: Yes
- Request body: None
- Expected response:

```json
{
  "user": {
    "id": "65f...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Product Models

### GET `/product-models`

- Auth: Yes
- Request body: None
- Returns all product models (used to populate model pickers in the app).
- Expected response:

```json
{
  "items": [
    {
      "_id": "65f...",
      "label": "A Series",
      "sku_prefix": "AS"
    }
  ]
}
```

### POST `/product-models`

- Auth: Yes
- Request body:

```json
{
  "label": "A Series"
}
```

- Required: `label` (non-empty string).
- `sku_prefix` is auto-derived from label initials — never sent by the client.
- Expected response (201): created product model object.

### PATCH `/product-models/:id`

- Auth: Yes
- Request body:

```json
{
  "label": "Alpha Series"
}
```

- Updates `label`; `sku_prefix` is automatically recalculated from the new label.
- Expected response: updated product model object.

### DELETE `/product-models/:id`

- Auth: Yes
- Request body: None
- Behavior: hard delete.
- Expected response:

```json
{
  "message": "Product model deleted successfully"
}
```

---

## Products

### GET `/products`

- Auth: Yes
- Query params (all optional):
  - `q` (string — searches product name)
  - `page` (number string, default `1`)
  - `limit` (number string, default `20`, max `100`)
- Example:
  - `/products?q=fan&page=1&limit=20`
- Expected response:

```json
{
  "items": [
    {
      "_id": "65f...",
      "sku": "AS-123456789",
      "name": "FAN",
      "type": "model",
      "model": "A Series",
      "price": 500,
      "is_active": true
    },
    {
      "_id": "65f...",
      "sku": "PR-987654321",
      "name": "SWITCH SOCKET",
      "type": "direct",
      "price": 150,
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

### POST `/products`

Two shapes depending on `type`:

**Direct product** (name + price only):

```json
{
  "type": "direct",
  "name": "Switch Socket",
  "price": 150
}
```

**Model-based product** (name + model + price):

```json
{
  "type": "model",
  "name": "Fan",
  "model": "A Series",
  "price": 500
}
```

- Auth: Yes
- Required fields:
  - Both types: `type`, `name` (min 2 chars), `price` (integer ≥ 0)
  - `"model"` type only: `model` (non-empty string matching a product model label)
- `sku` is optional; backend auto-generates it if omitted.
- Backend stores `name` in uppercase.
- Expected response (201): created product object.

### PATCH `/products/:id`

- Auth: Yes
- Request body (at least one field required):

```json
{
  "name": "Fan Premium",
  "model": "A Series",
  "price": 550
}
```

- Updatable fields: `name`, `model`, `price`. `type` is not updatable.
- Expected response: updated product object.

### DELETE `/products/:id`

- Auth: Yes
- Request body: None
- Behavior: hard delete — permanently removes the product.
- Expected response:

```json
{
  "message": "Product deleted successfully"
}
```

---

## Customers

### GET `/customers`

- Auth: Yes
- Query params (all optional):
  - `q` (searches `name`, `shop_name`, `phone`, `address`)
  - `isActive` (`true|false`)
  - `page` (number string, default `1`)
  - `limit` (number string, default `20`, max `100`)
- Expected response:

```json
{
  "items": [
    {
      "_id": "65f...",
      "name": "Ali Khan",
      "shop_name": "Royal Electronics",
      "address": "Main Bazar, Gujrat",
      "phone": "03001234567",
      "notes": "...",
      "is_active": true,
      "opening_balance": 0,
      "opening_balance_set": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST `/customers`

- Auth: Yes
- Request body:

```json
{
  "name": "Ali Khan",
  "shop_name": "Royal Electronics",
  "address": "Main Bazar, Gujrat",
  "phone": "03001234567",
  "notes": "Optional",
  "is_active": true
}
```

- Required: `name` (min 2 chars). All other fields optional.
- Expected response (201): created customer object.

### GET `/customers/:id`

- Auth: Yes
- Request body: None
- Expected response: single customer object.

### PATCH `/customers/:id`

- Auth: Yes
- Request body (at least one field required):

```json
{
  "name": "Ali Raza",
  "shop_name": "Royal Digital",
  "address": "Updated address",
  "phone": "03111234567",
  "notes": "Updated",
  "is_active": true
}
```

- Expected response: updated customer object.

### PATCH `/customers/:id/opening-balance`

- Auth: Yes
- Request body:

```json
{
  "amount": 15000
}
```

- Sets the customer's `opening_balance` (integer ≥ 0).
- One-time operation — request is rejected if `opening_balance_set` is already `true`.
- Expected response: updated customer object with `opening_balance_set: true`.

### DELETE `/customers/:id`

- Auth: Yes
- Request body: None
- Behavior: **hard delete** — permanently removes the customer along with all their invoices and ledger payments.
- Expected response:

```json
{
  "message": "Customer and all related data deleted successfully"
}
```

---

## Invoices

### GET `/invoices`

- Auth: Yes
- Query params (all optional):
  - `status` (`unpaid|partial|completed`)
  - `customerId` (ObjectId)
  - `fromDate` (date string)
  - `toDate` (date string)
  - `page` (number string, default `1`)
  - `limit` (number string, default `20`)
- Expected response:

```json
{
  "items": [
    {
      "_id": "65f...",
      "invoice_no": "1234",
      "customer_id": {
        "_id": "65c...",
        "name": "Ali Khan",
        "shop_name": "Royal Electronics",
        "phone": "03001234567"
      },
      "invoice_date": "2026-03-07T00:00:00.000Z",
      "total_amount": 3000,
      "paid_amount": 1000,
      "remaining_amount": 2000,
      "status": "partial"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST `/invoices`

- Auth: Yes
- Request body:

```json
{
  "customerId": "65c...",
  "invoiceDate": "2026-03-07",
  "discount": 0,
  "notes": "Optional",
  "items": [
    {
      "productId": "65a...",
      "quantity": 2,
      "unitPriceSnapshot": 250,
      "boxQty": 3
    }
  ]
}
```

- Required: `customerId`, `invoiceDate`, `items` (non-empty array)
- Each item requires `productId` and `quantity` (integer > 0)
- `unitPriceSnapshot` optional — defaults to product's current price if omitted
- `boxQty` optional — stored per line item, does not affect pricing
- `discount` optional (integer ≥ 0, default `0`)
- Expected response (201): created invoice object.

### GET `/invoices/:id`

- Auth: Yes
- Request body: None
- Expected response: full invoice object with populated `customer_id` and embedded `items` array (each item includes `box_qty` if set).

### PATCH `/invoices/:id`

- Auth: Yes
- Request body (at least one field required):

```json
{
  "invoiceDate": "2026-03-10",
  "discount": 500,
  "notes": "Updated note",
  "items": [
    {
      "productId": "65a...",
      "quantity": 3,
      "unitPriceSnapshot": 250,
      "boxQty": 2
    }
  ]
}
```

- All fields optional; send only what changed.
- If `items` is provided it **replaces** the entire items list (min 1 item required).
- Business rule: new `total_amount` cannot be less than the already `paid_amount`.
- Expected response: updated invoice object.

### DELETE `/invoices/:id`

- Auth: Yes
- Request body: None
- Behavior: hard delete — removes the invoice document.
- Expected response:

```json
{
  "message": "Invoice deleted successfully"
}
```

### POST `/invoices/:id/items`

- Auth: Yes
- Request body:

```json
{
  "items": [
    {
      "productId": "65a...",
      "quantity": 5,
      "unitPriceSnapshot": 300,
      "boxQty": 1
    }
  ]
}
```

- Appends new items to the existing invoice — does **not** replace existing items.
- Recalculates `subtotal`, `total_amount`, `remaining_amount`, and `status`.
- Expected response: updated invoice object.

---

## Ledger Payments

Ledger payments are customer-level account payments (not tied to a specific invoice). They represent money collected from a customer against their overall outstanding balance.

### GET `/ledger-payments`

- Auth: Yes
- Query params (all optional):
  - `customerId` (ObjectId)
  - `method` (`CASH|BANK|OTHER`)
  - `page` (number string, default `1`)
  - `limit` (number string, default `20`)
- Expected response:

```json
{
  "items": [
    {
      "_id": "65lp...",
      "customer_id": "65c...",
      "payment_date": "2026-03-07T00:00:00.000Z",
      "amount": 5000,
      "method": "CASH",
      "notes": "Optional"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### DELETE `/ledger-payments/:id`

- Auth: Yes
- Request body: None
- Behavior: hard deletes the ledger payment record.
- Expected response:

```json
{
  "message": "Ledger payment deleted successfully"
}
```

### GET `/customers/:customerId/ledger-payments`

- Auth: Yes
- Request body: None
- Returns all ledger payments for a specific customer, sorted ascending by `payment_date`.
- Expected response:

```json
{
  "items": [
    {
      "_id": "65lp...",
      "customer_id": "65c...",
      "payment_date": "2026-03-07T00:00:00.000Z",
      "amount": 5000,
      "method": "CASH",
      "notes": "Optional"
    }
  ]
}
```

### POST `/customers/:customerId/ledger-payments`

- Auth: Yes
- Request body:

```json
{
  "amount": 5000,
  "method": "CASH",
  "paymentDate": "2026-03-07T00:00:00.000Z",
  "notes": "Optional"
}
```

- Required: `amount` (integer ≥ 1), `method`
- `method` enum: `CASH | BANK | OTHER`
- `paymentDate` optional (ISO datetime string)
- Business rule: rejected if payment amount exceeds the customer's remaining balance (`opening_balance + sum(invoice totals) - sum(existing ledger payments)`).
- Expected response (201): created ledger payment object.

---

## Summary

### GET `/summary/dashboard`

- Auth: Yes
- Query params (optional):
  - `fromDate` (date string)
  - `toDate` (date string)
  - `overdueDays` (integer string, default `7`)
- Expected response:

```json
{
  "period": {
    "from": "2026-03-01T00:00:00.000Z",
    "to": "2026-03-07T23:59:59.999Z"
  },
  "overdue_days": 7,
  "kpis": {
    "receivable": 120000,
    "collected": 45000,
    "partial_count": 8,
    "overdue_amount": 32000,
    "overdue_customers": 3
  },
  "top_overdue_customer": {
    "customer_id": "65c...",
    "customer_name": "Ali Khan",
    "shop_name": "Royal Electronics",
    "overdue_amount": 18000,
    "oldest_invoice_date": "2026-02-20T00:00:00.000Z",
    "invoice_count": 2
  },
  "recent_invoices": []
}
```

---

## Common validation / error notes

- ObjectIds must be valid 24-character hex MongoDB IDs.
- Date fields must be valid date strings parseable by `new Date()`.
- `page` / `limit` are numeric strings in query params.
- Money fields (`price`, `discount`, `unitPriceSnapshot`, `amount`, `opening_balance`) must be integers — decimals are rejected.
- Typical error response format:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Request validation failed",
    "details": {}
  }
}
```

Error codes: `BAD_REQUEST` | `UNAUTHORIZED` | `FORBIDDEN` | `NOT_FOUND` | `CONFLICT` | `UNPROCESSABLE_ENTITY` | `INTERNAL_SERVER_ERROR`
