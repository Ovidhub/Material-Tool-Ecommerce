# Deploy ToolRack to hechimaterial.online (cPanel)

Two parts:
- **Frontend** — one static file → `public_html/index.html` on `hechimaterial.online`
- **API** — Laravel → subdomain `api.hechimaterial.online`
- **Database** — SQLite, **pre-seeded and included** (no migrations to run on the server)

## Artifacts (already built on your machine)
| What | Path | Goes to |
|---|---|---|
| Frontend | `dist/index.html` | `public_html/index.html` |
| Backend | `deploy/hechimaterial-api.tar.gz` | `hechi-api/` (home dir, **not** public_html) |

> The frontend is built to call `https://api.hechimaterial.online/api`. If you use a different API URL, tell me and I'll rebuild.

---

## A. Set PHP version
cPanel → **Select PHP Version** → choose **8.3** (8.2+ works). Make sure these extensions are ON (most are by default):
`pdo_sqlite`, `sqlite3`, `mbstring`, `openssl`, `fileinfo`, `ctype`, `tokenizer`, `curl`, `bcmath`, `json`.

## B. Create the API subdomain
1. In File Manager, create a folder **`hechi-api`** in your home directory (the level **above** `public_html`).
2. cPanel → **Domains** (or **Subdomains**) → Create:
   - Subdomain: `api`  •  Domain: `hechimaterial.online`
   - **Document Root:** `hechi-api/public`  ← change it from the suggested default.

## C. Upload + extract the backend
1. File Manager → open **`hechi-api/`**.
2. **Upload** `deploy/hechimaterial-api.tar.gz`.
3. Select it → **Extract** → into `hechi-api/`.
4. You should now see `hechi-api/public`, `hechi-api/app`, `hechi-api/vendor`, `hechi-api/database/database.sqlite`, etc.

## D. Configure the API `.env`
1. In `hechi-api/`, rename **`.env.production` → `.env`** (enable "show hidden files" / dotfiles in File Manager).
2. Edit `.env` and set your **Stripe test keys**:
   ```
   STRIPE_KEY=pk_test_yourkey
   STRIPE_SECRET=sk_test_yourkey
   ```
   (`APP_KEY` is already filled in.)

## E. Permissions (writable)
Set these writable by the web server (in File Manager → right-click → Change Permissions, or via Terminal):
- `hechi-api/storage` (and all subfolders) → **755** dirs (use **775** if you still get write errors)
- `hechi-api/bootstrap/cache` → **755**
- `hechi-api/database` → **755**, and `hechi-api/database/database.sqlite` → **664**

## F. SSL (HTTPS is required)
cPanel → **SSL/TLS Status** → run **AutoSSL** for both `hechimaterial.online` and `api.hechimaterial.online`. Wait for both to show valid certs.

## G. Upload the frontend
1. File Manager → `public_html/`.
2. Delete any default page (`index.html`, `default.html`).
3. **Upload** `dist/index.html` → `public_html/index.html`.

## H. Test
1. `https://api.hechimaterial.online/api/products` → should return product **JSON**.
2. `https://hechimaterial.online` → storefront loads with products.
3. Log in (person icon, top-right).

### Seeded accounts (password `password123`)
| Role | Email |
|---|---|
| Super Admin | super@toolrack.com |
| Admin | admin@toolrack.com |
| Customer | customer@toolrack.com |

> Change these passwords after first login (set `SEED_PASSWORD` before any re-seed, or update via DB).

## I. Enable Stripe card checkout
Log in as admin → **Admin → Payments** → edit **Credit / Debit Card** → set **Publishable key** = your `pk_test_...` → Save. (The secret key comes from `.env`.) Test card: `4242 4242 4242 4242`, any future date / CVC / ZIP.

---

## Troubleshooting
- **500 on the API** → read `hechi-api/storage/logs/laravel.log`. Usually `storage`/`bootstrap/cache` not writable, or `APP_KEY` missing.
- **CORS error in browser console** → `FRONTEND_URL` in `.env` must be exactly `https://hechimaterial.online`, and both certs must be valid (HTTPS).
- **Storefront loads but no products / calls go to localhost** → an old `index.html` was uploaded. Re-upload the one from this build (it targets `https://api.hechimaterial.online/api`).
- **Subdomain shows cPanel default / "Not Found"** → the subdomain Document Root must be `hechi-api/public` (Laravel's `public/` with its `.htaccess`).
- **Host won't allow a docroot outside `public_html`** → put the app at `public_html/hechi-api` and point the subdomain to `public_html/hechi-api/public` instead.

## Updating later
- **Frontend:** `npm run build` (with `.env.production` present) → re-upload `dist/index.html`.
- **Backend:** re-create the archive (it excludes `.env`, so your server `.env` is preserved) → upload + extract → keep the existing `.env` and `database/database.sqlite`.

> Production runs on SQLite for simplicity. To move to MySQL later: create a DB in cPanel, set `DB_CONNECTION=mysql` + `DB_*` in `.env`, then run migrations/seed (needs cPanel Terminal or a one-off import). Ask me and I'll walk you through it.
