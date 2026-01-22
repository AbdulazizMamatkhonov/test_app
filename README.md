# Stock Management System (Starter)

This repository is the starting point for a cloud-based stock management system with offline market scalability in mind.

## Getting started

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

## Frontend

Open `frontend/index.html` in your browser and set the API base URL (default: `http://localhost:3000`).
Provide a subscription key to unlock the protected endpoints.

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

## Next steps

- Add suppliers and purchase orders modules.
- Add authentication and multi-tenant support for scaling to multiple shops.
- Implement offline-capable client with sync support.
