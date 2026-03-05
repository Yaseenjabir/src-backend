# API Endpoints (Frontend Quick Guide)

Base URL:
- Local: `http://localhost:5000/api/v1`
- Production: `https://src-backend-dun.vercel.app/api/v1`

Auth:
- Send token on protected routes:
  - `Authorization: Bearer <token>`
- Protected groups: `products`, `customers`, `invoices`, `summary`, `auth/me`

Money fields:
- Always integer values (example `250`, not `250.00`).

---

## Health

### GET `/health`
- Auth: No
- Body: None
- Response:
```json
{ "status": "ok" }
```

---

## Auth

### POST `/auth/login`
- Auth: No
- Body:
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```
- Response:
```json
{
  "token": "...",
  "token_type": "Bearer",
  "expires_in": "7d",
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### GET `/auth/me`
- Auth: Yes
- Body: None
- Response:
```json
{
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Products

### GET `/products/categories`
- Auth: Yes
- Body: None
- Response:
```json
{
  "categories": [
    "BULB",
    "TUBE_LIGHT",
    "SWITCH",
    "SOCKET",
    "PLUG",
    "WIRE",
    "CABLE",
    "MCB",
    "BREAKER",
    "DB_BOX",
    "FAN",
    "HOLDER",
    "ADAPTER",
    "EXTENSION_BOARD",
    "DIMMER",
    "SENSOR",
    "CHARGER",
    "INVERTER",
    "BATTERY",
    "OTHER"
  ]
}
```

Hardcoded categories array (same as backend constant):

```ts
[
  "BULB",
  "TUBE_LIGHT",
  "SWITCH",
  "SOCKET",
  "PLUG",
  "WIRE",
  "CABLE",
  "MCB",
  "BREAKER",
  "DB_BOX",
  "FAN",
  "HOLDER",
  "ADAPTER",
  "EXTENSION_BOARD",
  "DIMMER",
  "SENSOR",
  "CHARGER",
  "INVERTER",
  "BATTERY",
  "OTHER"
]
```

### GET `/products`
- Auth: Yes
- Query (all optional):
  - `q` (string)
  - `category` (enum category)
  - `isActive` (`true|false`)
  - `page` (number string)
  - `limit` (number string)
- Example:
  - `/products?q=switch&category=SWITCH&page=1&limit=20&isActive=true`

### POST `/products`
- Auth: Yes
- Body (SKU auto-generated if omitted):
```json
{
  "name": "6A Switch",
  "category": "SWITCH",
  "price": 250
}
```
- Optional field:
  - `is_active` (boolean)

### PATCH `/products/:id`
- Auth: Yes
- Body (send only fields to change):
```json
{
  "name": "6A Switch Premium",
  "category": "SWITCH",
  "price": 275,
  "is_active": true
}
```
- Note: `sku` is not editable from update API.

### DELETE `/products/:id`
- Auth: Yes
- Body: None
- Behavior: soft delete (`is_active=false`)

---

## Customers

### GET `/customers`
- Auth: Yes
- Query (all optional):
  - `q` (string; matches `name`, `shop_name`, `phone`, `address`)
  - `isActive` (`true|false`)
  - `page` (number string)
  - `limit` (number string)

### POST `/customers`
- Auth: Yes
- Body:
```json
{
  "name": "Ahmad Electronics",
  "shop_name": "Ahmad Electronics",
  "address": "Main Bazaar",
  "phone": "03001234567",
  "notes": "Optional",
  "is_active": true
}
```
- Required: `name`

### GET `/customers/:id`
- Auth: Yes
- Body: None

### PATCH `/customers/:id`
- Auth: Yes
- Body (at least one field):
```json
{
  "name": "Updated Name",
  "shop_name": "Updated Shop",
  "address": "Updated Address",
  "phone": "03111234567",
  "notes": "Updated",
  "is_active": true
}
```

### DELETE `/customers/:id`
- Auth: Yes
- Body: None
- Behavior: soft delete (`is_active=false`)

---

## Invoices

### GET `/invoices`
- Auth: Yes
- Query (all optional):
  - `status` (`unpaid|partial|completed`)
  - `customerId` (ObjectId)
  - `fromDate` (date string)
  - `toDate` (date string)
  - `page` (number string)
  - `limit` (number string)

### POST `/invoices`
- Auth: Yes
- Body:
```json
{
  "invoiceNo": "INV-123",
  "customerId": "65f0...",
  "invoiceDate": "2026-03-05",
  "discount": 0,
  "notes": "Optional",
  "items": [
    {
      "productId": "65f1...",
      "quantity": 2,
      "unitPriceSnapshot": 250
    }
  ]
}
```
- Required:
  - `customerId`, `invoiceDate`, non-empty `items`
  - each item requires `productId`, `quantity > 0`

### GET `/invoices/:id`
- Auth: Yes
- Body: None

### PATCH `/invoices/:id`
- Auth: Yes
- Body (at least one field):
```json
{
  "invoiceDate": "2026-03-06",
  "discount": 100,
  "notes": "Updated note",
  "items": [
    {
      "productId": "65f1...",
      "quantity": 3,
      "unitPriceSnapshot": 250
    }
  ]
}
```

### POST `/invoices/:id/payments`
- Auth: Yes
- Body:
```json
{
  "paymentDate": "2026-03-05",
  "amount": 1000,
  "method": "CASH",
  "reference": "Optional",
  "notes": "Optional"
}
```
- `method` enum: `CASH | BANK | OTHER`

### GET `/invoices/:id/payments`
- Auth: Yes
- Body: None

### DELETE `/invoices/payments/:paymentId`
- Auth: Yes
- Body: None

---

## Summary

### GET `/summary/receivables`
- Auth: Yes
- Body: None
- Response includes:
  - `totals`
  - `customer_wise_outstanding`
  - `outstanding_invoices`

---

## Common Validation Notes

- ObjectId fields must be valid MongoDB IDs.
- Date fields must be valid date strings.
- Pagination values are number strings (`"1"`, `"20"`).
- For update endpoints, send only changed fields.
