# MongoDB Collection Blueprint (SRC Simple Record System)

## Collections

### 1) products
```json
{
  "_id": "ObjectId",
  "sku": "AS-123456001",
  "name": "A SERIES 01",
  "model": "A_SERIES",
  "price": 300,
  "is_active": true,
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

`model` enum (fixed master list):
- `A_SERIES`
- `K_SERIES`
- `R_SERIES`
- `UNIQUE_SERIES`

SKU is auto-generated as `<PREFIX>-<6-digit-timestamp><3-digit-random>` if not provided on create.
Product `name` is stored in uppercase.

---

### 2) customers
```json
{
  "_id": "ObjectId",
  "name": "Ali Khan",
  "shop_name": "Royal Electronics",
  "address": "Main Bazar, Gujrat",
  "phone": "03001234567",
  "notes": "Pays on weekends",
  "is_active": true,
  "opening_balance": 0,
  "opening_balance_set": false,
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

- `opening_balance`: integer ≥ 0, default `0`. Represents pre-existing debt carried into the system.
- `opening_balance_set`: boolean, default `false`. Becomes `true` after `PATCH /customers/:id/opening-balance` is called — the endpoint is blocked once set.

---

### 3) invoices (with embedded `items`)
```json
{
  "_id": "ObjectId",
  "invoice_no": "1234",
  "customer_id": "ObjectId",
  "invoice_date": "ISODate",
  "subtotal": 9500,
  "discount": 500,
  "total_amount": 9000,
  "paid_amount": 4000,
  "remaining_amount": 5000,
  "status": "partial",
  "notes": "",
  "items": [
    {
      "_id": "ObjectId",
      "product_id": "ObjectId",
      "product_name_snapshot": "A SERIES 01",
      "sku_snapshot": "AS-123456001",
      "unit_price_snapshot": 300,
      "quantity": 10,
      "line_total": 3000,
      "box_qty": 5
    }
  ],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

- `box_qty` is optional per line item — informational only, does not affect pricing.
- `status` enum: `unpaid | partial | completed`

---

### 4) payments
```json
{
  "_id": "ObjectId",
  "invoice_id": "ObjectId",
  "payment_date": "ISODate",
  "amount": 1000,
  "method": "CASH",
  "reference": "",
  "notes": "",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

- `method` enum: `CASH | BANK | OTHER`

---

### 5) ledger_payments
```json
{
  "_id": "ObjectId",
  "customer_id": "ObjectId",
  "payment_date": "ISODate",
  "amount": 5000,
  "method": "CASH",
  "notes": "",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

- `method` enum: `CASH | BANK | OTHER`
- Customer-level payments not tied to a specific invoice.
- Amount is validated against the customer's remaining balance before creation.

---

## Required Indexes

- `products`: `{ sku: 1 }` unique
- `products`: `{ name: 1, model: 1 }` compound unique
- `customers`: `{ phone: 1 }`
- `invoices`: `{ invoice_no: 1 }` unique
- `invoices`: `{ customer_id: 1, status: 1 }` compound
- `invoices`: `{ invoice_date: -1 }`
- `payments`: `{ invoice_id: 1, payment_date: -1 }` compound
- `ledger_payments`: `{ customer_id: 1, payment_date: -1 }` compound

---

## Business Rules

### Invoice calculations
- `line_total = quantity × unit_price_snapshot`
- `subtotal = sum(items.line_total)`
- `total_amount = subtotal - discount`
- `paid_amount = sum(payments.amount where payments.invoice_id = invoice._id)`
- `remaining_amount = total_amount - paid_amount`

### Invoice status derivation
- `unpaid` if `paid_amount = 0`
- `partial` if `0 < paid_amount < total_amount`
- `completed` if `paid_amount >= total_amount`

### Payment constraints
- Payment amount must be > 0 and must not exceed `remaining_amount`.
- Deleting a payment triggers recalculation of `paid_amount`, `remaining_amount`, and `status`.

### Ledger payment balance validation
- Customer remaining balance = `opening_balance + sum(invoice total_amounts) - sum(existing ledger payments)`
- A new ledger payment is rejected if its amount exceeds this balance.

### Customer delete
- Hard delete — permanently removes the customer plus all their invoices, all associated invoice payments, and all ledger payments.

### Product delete
- Soft delete only — sets `is_active = false`.

### Opening balance
- One-time settable per customer via `PATCH /customers/:id/opening-balance`.
- Once set (`opening_balance_set = true`), further updates are blocked.

---

## Product Validation Rules

- `sku`: optional on create (auto-generated if omitted), unique, uppercase.
- `name`: required, min 2 chars, stored uppercase.
- `model`: required, must be one of `A_SERIES | K_SERIES | R_SERIES | UNIQUE_SERIES`.
- `price`: required, integer ≥ 0.
- `is_active`: defaults to `true`.
