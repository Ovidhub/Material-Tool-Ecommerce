# ToolRack — Laravel API Backend Design

**Date:** 2026-06-06
**Status:** Approved (design), pending spec review

## Context

The repository named `laravel-material-tools-ecommerce` currently contains **no Laravel/PHP**. It is a complete, polished **React 19 + Vite 7 + Tailwind 4** single-page e-commerce app ("ToolRack", power tools). All state is client-side in `localStorage` via [`src/context/StoreContext.tsx`](../../../src/context/StoreContext.tsx), seeded from [`src/data/products.ts`](../../../src/data/products.ts). Auth, payments, and persistence are mocked.

This project adds a **real Laravel 11 API backend** and rewires the React app to consume it.

### Environment (verified)
- PHP 8.3.30, Composer 2.9.5, Node 20.20 present.
- No MySQL CLI installed → use **SQLite**.

### Decisions (locked)
- **Database:** SQLite (switchable to MySQL via `.env` later).
- **Payments:** Real **Stripe in test mode** (PaymentIntents + Stripe Elements).
- **Frontend:** Full rewire — React becomes a true client of the API.
- **Seed/Auth:** Port existing catalog + site content into seeders; real bcrypt password auth with `customer`/`admin`/`super_admin` roles.
- **Auth mechanism:** Laravel Sanctum **token-based** (Bearer), not cookie/SPA mode — origin-independent and simpler.
- **Cart:** stays client-side (localStorage); only **orders** persist server-side.

## Repository layout

```
laravel-material-tools-ecommerce/
├── backend/            # new Laravel 11 app (API only)
│   ├── app/ routes/ database/ tests/ ...
│   └── .env            # SQLite + Stripe test keys
├── src/                # existing React SPA (rewired to call API)
├── docs/superpowers/specs/
├── .env.local          # VITE_API_URL=http://localhost:8000/api
```

- **Dev runtime:** `php artisan serve` (:8000) + `npm run dev` (:5173). CORS allows the Vite origin.
- Backend isolated in `backend/`; React stays at repo root.

## Authentication — Laravel Sanctum (token)

- `POST /api/register`, `POST /api/login` → return Bearer token + user. React stores token in localStorage, sends `Authorization: Bearer <token>`.
- `POST /api/logout` revokes the current token. `GET /api/user` returns the authenticated user.
- bcrypt passwords. `users.role` ∈ {`customer`, `admin`, `super_admin`}.
- Admin routes guarded by a `role` middleware + Eloquent policies.
- Seeded accounts for immediate login:
  - `super@toolrack.com` (super_admin)
  - `admin@toolrack.com` (admin)
  - `customer@toolrack.com` (customer)
  - Seeded password documented in the seeder / README.

## Data model

| Table | Key fields |
|---|---|
| `users` | name, email, password, **role**, avatar |
| `categories` | **id (slug, string PK)**, name, count |
| `products` | name, slug (unique), category, subcategory, price, old_price, rating, reviews, stock, sku, brand, badge, short_desc, description, **features (json)**, **specs (json)**, image |
| `orders` | user_id, total, subtotal, shipping, tax, status, payment_method, stripe_payment_intent_id, shipping address fields |
| `order_items` | order_id, product_id, name, price, image, qty (snapshot) |
| `wishlist_items` | user_id, product_id (unique pair) |
| `payment_methods` | type, name, enabled, mode, public_key, secret_key, client_id, client_secret, wallet_address, network, instructions |
| `site_content` | single row, **content (json)** mirroring the `SiteContent` TS type |

`order.status` ∈ {Pending, Processing, Shipped, Delivered}.
`payment_methods.type` ∈ {stripe, paypal, crypto, bank, custom}.

### Seeders
- `CategorySeeder` + `ProductSeeder` — port the 14 categories and full product catalog from `src/data/products.ts`.
- `SiteContentSeeder` — port `seedSiteContent` from `StoreContext.tsx`.
- `PaymentMethodSeeder` — port `seedPaymentMethods` (Stripe default).
- `UserSeeder` — the three role accounts above.

## API surface (REST, prefix `/api`)

### Public
- `GET /products` — query params: `search`, `category`, `brand`, `badge`, `sort`, `min_price`, `max_price`, `page`. Paginated.
- `GET /products/{slug}`
- `GET /categories`
- `GET /payment-methods` — enabled only, **secret fields stripped**.
- `GET /site-content`

### Customer (auth: Sanctum)
- `GET /user`
- `GET /wishlist`, `POST /wishlist` `{product_id}`, `DELETE /wishlist/{product_id}`
- `POST /orders` — checkout (see Payments)
- `GET /orders` — current user's orders

### Admin (auth + role)
- `POST/PUT/DELETE /products`, `/products/{id}`
- `POST/PUT/DELETE /categories`, `/categories/{id}`
- `POST/PUT/DELETE /payment-methods`, `/payment-methods/{id}` (full fields)
- `GET /orders/all`, `PUT /orders/{id}/status`
- `GET /customers`
- `PUT /site-content`

### Payments
- `POST /payments/intent` (auth) — server computes total from cart payload + server-side product prices, creates Stripe PaymentIntent, returns `client_secret` + `amount`.
- `POST /stripe/webhook` — (optional, phase 4) confirm intent status out-of-band.

## Payments — Stripe test mode

1. React requests `POST /payments/intent` with cart line item ids+qty.
2. Backend **recomputes** prices/total from DB (never trusts client amounts), creates a PaymentIntent via `stripe/stripe-php`, returns `client_secret`.
3. React mounts **Stripe Elements** (`@stripe/react-stripe-js`, `@stripe/stripe-js`) with the publishable key from payment-method config, confirms the card.
4. React calls `POST /orders` with the PaymentIntent id; backend **verifies intent succeeded** before persisting the order and decrementing stock.
5. Non-Stripe methods (crypto/bank/custom) keep the manual-instructions flow already in the UI — order saved as `Pending`.

Stripe secret key lives only in backend `.env` / `payment_methods.secret_key`; publishable key is the only key sent to the client.

## React rewire

- New `src/api/` layer: a `client.ts` fetch wrapper (base URL from `VITE_API_URL`, attaches Bearer token, normalizes errors) + per-resource modules (`auth`, `products`, `categories`, `orders`, `wishlist`, `paymentMethods`, `siteContent`, `payments`).
- `StoreContext` reworked:
  - Server-sourced state (products, categories, orders, wishlist, payment methods, site content) loaded via API with loading/error states.
  - Cart + toast remain client-side; cart stays in localStorage.
  - Auth token persisted; on load, `GET /user` restores session.
  - Admin mutations and checkout call the API instead of local reducer-only actions.
- Pages updated for async data (loading skeletons / error fallbacks where lists/detail are fetched).
- `Login`/`Account` use real auth responses; role from server, not email string.

## Testing

- Backend: **Pest/PHPUnit feature tests** per group:
  - auth (register/login/logout/role gating)
  - products (list filters/sort/pagination, show, admin CRUD authorization)
  - categories CRUD + authorization
  - orders + Stripe (Stripe client **mocked/faked**; verify total computed server-side, stock decrement, status update)
  - site-content + payment-methods admin
- Tests run against an in-memory/seeded SQLite test DB via `php artisan test`.
- Frontend: smoke-level — ensure build + typecheck pass after rewire (`tsc --noEmit`, `vite build`). Component tests out of scope for v1.

## Phased implementation

1. **Scaffold** — Laravel 11 in `backend/`, SQLite, CORS, Sanctum install, base config.
2. **Data + seeders** — migrations, models, seeders porting existing data.
3. **Auth** — register/login/logout, role middleware, seeded accounts.
4. **Catalog** — products + categories: public read (filters/sort/pagination) + admin CRUD + tests.
5. **Orders + Stripe** — PaymentIntent, order placement with server-side total + stock, status updates + tests.
6. **CMS + config + customers** — site-content, payment-methods, customers endpoints + tests.
7. **React rewire** — api layer, StoreContext, pages, Stripe Elements; verify typecheck + build.

Each phase is independently runnable and testable.

## Out of scope (YAGNI for v1)

- Real email sending (order confirmation, contact form) — kept client-side/no-op.
- PayPal/crypto live processing — config + manual instructions only.
- Server-side cart, coupons/promo-code enforcement, inventory reservations.
- Image upload to object storage — image URLs/base64 as today.
- Frontend component test suite, production deployment/Docker.
