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
4. Run the API
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

## Endpoints

- `GET /` - basic status payload
- `GET /health` - health check endpoint
- `POST /subscriptions/activate` - activate a subscription
- `GET /subscriptions/status` - check subscription status
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
- `POST /purchase-orders/:id/receive` - receive a purchase order into stock

## Next steps

- Add partial receiving for purchase orders and receiving history.
- Add authentication and multi-tenant support for scaling to multiple shops.
- Implement offline-capable client with sync support.
