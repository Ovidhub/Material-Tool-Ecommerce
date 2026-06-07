# ToolRack — Dev Setup

Full-stack: **React 19 + Vite** frontend (repo root) + **Laravel 13 API** (this `backend/` folder), SQLite, Sanctum token auth, real Stripe (test mode).

## Prerequisites
- PHP 8.3+, Composer 2+
- Node 20+

## First-time setup

### Backend
```bash
cd backend
composer install
cp .env.example .env        # if .env is missing
php artisan key:generate    # if APP_KEY is empty
# .env should contain:
#   DB_CONNECTION=sqlite
#   FRONTEND_URL=http://localhost:5173
#   STRIPE_KEY=pk_test_xxx        <-- your Stripe TEST publishable key
#   STRIPE_SECRET=sk_test_xxx     <-- your Stripe TEST secret key
#   SEED_PASSWORD=password123
touch database/database.sqlite
php artisan migrate:fresh --seed
```

### Frontend
```bash
# repo root
npm install
# .env.local (gitignored) sets the API base URL:
#   VITE_API_URL=http://localhost:8000/api
```

## Run (two terminals)
```bash
# terminal 1 — API
cd backend && php artisan serve            # http://localhost:8000

# terminal 2 — web
npm run dev                                # http://localhost:5173
```

> **Port conflict:** if `8000` or `5173` is already in use (e.g. another Laravel/Vite app),
> run the API on another port (`php artisan serve --port=8001`), set
> `VITE_API_URL=http://localhost:8001/api` in `.env.local`, and set
> `FRONTEND_URL` in `backend/.env` to whatever port Vite picks so CORS allows it.

## Seeded accounts (password = `SEED_PASSWORD`, default `password123`)
| Email | Role |
|---|---|
| super@toolrack.com | super_admin |
| admin@toolrack.com | admin |
| customer@toolrack.com | customer |

Admin panel: log in as an admin → redirected to `/#/admin`.

## Tests
```bash
cd backend && php artisan test     # backend feature tests (auth, catalog, orders+Stripe mocked, admin, wishlist)
# frontend:
npx tsc --noEmit && npm run build  # typecheck + production build
```

## Stripe checkout (test mode)
1. Put real **test** keys in `backend/.env` (`STRIPE_KEY`, `STRIPE_SECRET`).
2. Make sure the seeded Stripe payment method's publishable key matches (Admin → Payments, or it picks up `STRIPE_KEY` on seed).
3. At checkout choose the card method; Stripe Elements mounts using a server-created PaymentIntent.
4. Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.

The order total is always computed **server-side** from DB prices — the client cannot set the amount.

## Architecture notes
- Auth: Sanctum **bearer tokens** (stored in `localStorage` as `toolrack-token`). No cookie/session auth.
- The API Resources emit the exact camelCase keys the React types use (`oldPrice`, `shortDesc`; order items use `emoji` for the image URL), so no client-side remapping.
- Cart is client-side (`localStorage` key `toolrack-cart`); everything else (catalog, orders, wishlist, payment-method config, site content/CMS) comes from the API.
- Switch to MySQL by changing `DB_*` in `backend/.env` and re-running migrations.
