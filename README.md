# Stock Management System (Starter)

This repository is the starting point for a cloud-based stock management system with offline market scalability in mind.

## Getting started

### Backend

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy the environment template
   ```bash
   cp .env.example .env
   ```
3. Update `MONGODB_URI` in `.env` to point at your MongoDB instance.
4. (Optional) Set `CORS_ORIGIN` to the frontend origin (defaults to `http://localhost:5173`).
5. (Optional) Set `SUBSCRIPTION_REQUIRED=false` to bypass subscription enforcement in local dev.
6. (Optional) Set `AUTH_REQUIRED=true` and provide `JWT_SECRET` to require user logins.
7. Run the API
   ```bash
   npm run dev
   ```

The API will start on `http://localhost:3000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The React app runs on `http://localhost:5173`.

## Subscription flow

- `POST /subscriptions/activate` with `{ "key": "YOUR_KEY", "plan": "starter", "expiresAt": "2026-01-01" }` to activate.
- `GET /subscriptions/status` with header `x-subscription-key: YOUR_KEY` to verify status.
- All business endpoints require the `x-subscription-key` header.

## Auth flow

- `POST /auth/register` with `{ "tenantId": "...", "name": "...", "email": "...", "password": "..." }` to create a user.
- `POST /auth/login` with `{ "tenantId": "...", "email": "...", "password": "..." }` to get a JWT.
- Set `Authorization: Bearer <token>` on business endpoints when `AUTH_REQUIRED=true`.

## Tenant flow

- `POST /tenants` to create a tenant (shop) and capture the returned ID.
- Set `x-tenant-id: TENANT_ID` on all business endpoints.
- When `AUTH_REQUIRED=true`, tenant routes require an admin token.

## Endpoints

- `GET /` - basic status payload
- `GET /health` - health check endpoint
- `POST /subscriptions/activate` - activate a subscription
- `GET /subscriptions/status` - check subscription status
- `POST /auth/register` - register a user
- `POST /auth/login` - login and receive a JWT
- `GET /tenants` - list tenants
- `POST /tenants` - create a tenant
- `GET /tenants/:id` - fetch a tenant
- `PUT /tenants/:id` - update a tenant
- `DELETE /tenants/:id` - remove a tenant
- `GET /products` - list products
- `POST /products` - create a product
- `GET /products/:id` - fetch a product
- `PUT /products/:id` - update a product
- `DELETE /products/:id` - remove a product
- `GET /stock` - list stock entries
- `POST /stock/entries` - create a stock entry (in/out/adjustment)
- `GET /stock/:productId` - summarize stock on hand
- `GET /customers` - list customers
- `POST /customers` - create a customer
- `GET /customers/:id` - fetch a customer
- `PUT /customers/:id` - update a customer
- `DELETE /customers/:id` - remove a customer
- `GET /sales` - list sales
- `POST /sales` - create a sale (creates stock "out" entries and optional payment)
- `GET /sales/:id` - fetch a sale
- `GET /payments` - list payments
- `POST /payments` - record a payment
- `GET /debts/customers/:customerId` - summarize outstanding debt for a customer
- `GET /suppliers` - list suppliers
- `POST /suppliers` - create a supplier
- `GET /suppliers/:id` - fetch a supplier
- `PUT /suppliers/:id` - update a supplier
- `DELETE /suppliers/:id` - remove a supplier
- `GET /purchase-orders` - list purchase orders
- `POST /purchase-orders` - create a purchase order
- `GET /purchase-orders/:id` - fetch a purchase order
- `POST /purchase-orders/:id/receive` - receive a purchase order into stock (supports partial receipts)

## Next steps

- Implement offline-capable client with sync support.
- Add inventory reporting dashboards and analytics.
- Expand purchase order receiving UI to support partial receipts per line item.
