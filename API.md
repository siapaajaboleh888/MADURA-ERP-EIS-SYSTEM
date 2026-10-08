# REST API Documentation — MADURA ERP / EIS

## Response Envelope Standard

### Success Response (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response (HTTP 400 / 401 / 403 / 422 / 500)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["Specific error detail"]
  }
}
```

---

## Key Endpoints Reference

### 1. Health Check
- `GET /api/health`
  - Public endpoint returning database connection status and server health.

### 2. Authentication
- `POST /api/auth/login`
  - Body: `{"email": "...", "password": "..."}`
  - Returns Sanctum Bearer token and role metadata.
- `GET /api/auth/profile`
  - Headers: `Authorization: Bearer <token>`
- `POST /api/auth/logout`

### 3. Master Data
- `GET /api/products` (Filters: `search`, `category_id`, `type`, `per_page`)
- `POST /api/products`
- `GET /api/products/{id}`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/customers`
- `GET /api/suppliers`

### 4. Inventory
- `GET /api/inventory`
- `GET /api/inventory/movements`
- `POST /api/inventory/adjust`
- `POST /api/inventory/transfer`

### 5. Sales Orders (State Machine)
- `GET /api/sales-orders`
- `POST /api/sales-orders` (Creates in DRAFT state)
- `POST /api/sales-orders/{id}/submit`
- `POST /api/sales-orders/{id}/approve`
- `POST /api/sales-orders/{id}/reserve-stock`
- `POST /api/sales-orders/{id}/deliver`
- `POST /api/sales-orders/{id}/invoice`

### 6. Finance
- `GET /api/invoices`
- `POST /api/invoices/{id}/payments`

### 7. Executive Information System (EIS)
- `GET /api/eis/dashboard`

### 8. QA & Academic Control Center
- `GET /api/qa/course-config`
- `POST /api/qa/course-config`
- `GET /api/qa/traceability`
- `GET /api/qa/test-cases`
- `GET /api/qa/defects`
- `POST /api/qa/defects`
