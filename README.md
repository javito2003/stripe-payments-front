# NestJS + Stripe Demo Frontend (Next.js)

Includes:
- Auth (login/register) using **httpOnly cookies** (access + refresh)
- Axios client with `withCredentials` and a **401 refresh interceptor**
- Guard:
  - If authenticated, you **can't browse /auth** pages (GuestOnly)
  - If not authenticated, you **can't browse app pages** (Protected)
- Products page
- Cart (localStorage)
- Stripe checkout (Elements + confirmCardPayment)

## Setup

```bash
pnpm i
cp .env.example .env.local
pnpm dev
```

Set:
- `NEXT_PUBLIC_API_URL` -> your NestJS backend (e.g. http://localhost:3001)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` -> pk_test_...

## Backend endpoints expected

You can adapt paths, but this project assumes:

### Auth
- `POST /auth/register` -> sets cookies
- `POST /auth/login` -> sets cookies
- `POST /auth/logout` -> clears cookies
- `POST /auth/refresh` -> reads refresh cookie, sets a new access cookie
- `GET /auth/me` -> returns user without password

### Products
- `GET /products` -> returns `ProductEntity[]`

### Checkout / Orders
- `POST /orders/checkout` -> body:
```json
{
  "items": [{ "productId": "...", "productName": "...", "quantity": 1, "unitPrice": 9.99 }],
  "currency": "usd"
}
```

Response:
```json
{ "orderId": "....", "clientSecret": "pi_..._secret_..." }
```

> Important: cookies must be configured correctly (SameSite, Secure, domain). Locally, `SameSite=Lax` usually works.
