# ToolRack Laravel API Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real Laravel 11 API backend (SQLite, Sanctum auth, real Stripe test-mode payments) and rewire the existing React SPA to consume it.

**Architecture:** Laravel API lives in `backend/`; React SPA stays at repo root and talks to it via `VITE_API_URL`. Sanctum issues Bearer tokens. SQLite for storage. Seeders port the current hard-coded catalog and site content. React's `StoreContext` is reworked so server data comes from the API while cart/toast stay client-side.

**Tech Stack:** Laravel 11, PHP 8.3, SQLite, Laravel Sanctum, stripe/stripe-php, Pest, React 19, Vite 7, `@stripe/react-stripe-js`.

---

## Conventions for the implementing engineer

- All backend commands run from `backend/` unless stated. On Windows use the Bash tool; `php`, `composer`, `npm` are on PATH.
- Commit after each task with the message shown. This repo is **not yet a git repo** — Task 0 initializes it.
- Run a single test with: `php artisan test --filter=TestClassName` (from `backend/`).
- Laravel conventions: migrations in `database/migrations`, models in `app/Models`, controllers in `app/Http/Controllers/Api`, form requests in `app/Http/Requests`, routes in `routes/api.php`.
- "Expected: PASS/FAIL" lines tell you what success looks like before moving on.

---

## File structure (created by this plan)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── ProductController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── OrderController.php
│   │   │   ├── WishlistController.php
│   │   │   ├── PaymentMethodController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── SiteContentController.php
│   │   │   └── CustomerController.php
│   │   ├── Middleware/EnsureRole.php
│   │   ├── Requests/  (ProductRequest, CategoryRequest, PaymentMethodRequest, OrderRequest)
│   │   └── Resources/ (ProductResource, OrderResource, PaymentMethodResource, PaymentMethodPublicResource)
│   ├── Models/ (User, Product, Category, Order, OrderItem, WishlistItem, PaymentMethod, SiteContent)
│   └── Services/StripeService.php
├── database/
│   ├── migrations/ (one per table)
│   ├── seeders/ (UserSeeder, CategorySeeder, ProductSeeder, PaymentMethodSeeder, SiteContentSeeder, DatabaseSeeder)
│   └── data/products_seed.php   (ported catalog)
├── routes/api.php
├── tests/Feature/ (AuthTest, ProductTest, CategoryTest, OrderTest, AdminTest, SiteContentTest)
└── .env

src/
├── api/
│   ├── client.ts
│   ├── auth.ts  products.ts  categories.ts  orders.ts  wishlist.ts
│   ├── paymentMethods.ts  siteContent.ts  payments.ts
│   └── types.ts
├── context/StoreContext.tsx   (reworked)
└── pages/*  (updated for async + Stripe Elements)

.env.local   (VITE_API_URL)
```

---

# PHASE 1 — Scaffold

### Task 0: Initialize git

**Files:** repo root.

- [ ] **Step 1: Init repo and ignore artifacts**

```bash
cd "c:/Users/DELL/laravel-material-tools-ecommerce (3)"
git init
printf "node_modules/\ndist/\nbackend/vendor/\nbackend/.env\nbackend/database/*.sqlite\n.env.local\n" > .gitignore
```

- [ ] **Step 2: Commit current state**

```bash
git add -A
git commit -m "chore: initial commit of existing React SPA + design docs"
```

Expected: commit succeeds.

---

### Task 1: Create Laravel app in `backend/`

**Files:** Create: `backend/` (full Laravel skeleton).

- [ ] **Step 1: Scaffold Laravel 11**

```bash
cd "c:/Users/DELL/laravel-material-tools-ecommerce (3)"
composer create-project laravel/laravel backend
```

Expected: `backend/artisan` exists.

- [ ] **Step 2: Configure SQLite**

Edit `backend/.env`: set these lines (remove the MySQL `DB_*` lines):

```
DB_CONNECTION=sqlite
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
STRIPE_KEY=pk_test_changeme
STRIPE_SECRET=sk_test_changeme
SEED_PASSWORD=password123
```

Create the SQLite file:

```bash
cd backend
# Windows:
type nul > database/database.sqlite
```

(If `type nul` is unavailable in Bash, use: `touch database/database.sqlite`.)

- [ ] **Step 3: Verify the app boots**

```bash
cd backend
php artisan migrate
php artisan test
```

Expected: migrations run on SQLite; default tests PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Laravel 11 backend with SQLite"
```

---

### Task 2: Install Sanctum, Stripe, Pest, CORS

**Files:** Modify: `backend/composer.json`, `backend/config/cors.php`, `backend/bootstrap/app.php`, `backend/config/sanctum.php`.

- [ ] **Step 1: Require packages**

```bash
cd backend
composer require laravel/sanctum stripe/stripe-php
composer require pestphp/pest pestphp/pest-plugin-laravel --dev --with-all-dependencies
php artisan install:api
./vendor/bin/pest --init
```

`install:api` publishes Sanctum config + migration and adds the `api` routes file.

- [ ] **Step 2: Enable CORS for the SPA**

Edit `backend/config/cors.php` (publish first if missing: `php artisan config:publish cors`). Set:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

- [ ] **Step 3: Register the role middleware alias (placeholder wired in Task 8)**

In `backend/bootstrap/app.php`, inside `->withMiddleware(function (Middleware $middleware) { ... })` add:

```php
$middleware->alias([
    'role' => \App\Http\Middleware\EnsureRole::class,
]);
```

- [ ] **Step 4: Verify still boots**

```bash
php artisan test
```

Expected: PASS (default tests still green).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sanctum, stripe-php, pest, CORS config"
```

---

# PHASE 2 — Data model & seeders

### Task 3: Migrations

**Files:** Create migration files under `backend/database/migrations/`.

- [ ] **Step 1: Add `role` + `avatar` to users**

Create `backend/database/migrations/2026_06_06_000001_add_role_to_users.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer')->after('password');
            $table->string('avatar')->nullable()->after('role');
        });
    }
    public function down(): void {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['role', 'avatar']));
    }
};
```

- [ ] **Step 2: categories**

Create `backend/database/migrations/2026_06_06_000002_create_categories_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary();   // slug
            $table->string('name');
            $table->integer('count')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('categories'); }
};
```

- [ ] **Step 3: products**

Create `backend/database/migrations/2026_06_06_000003_create_products_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category');
            $table->string('subcategory')->default('');
            $table->decimal('price', 10, 2);
            $table->decimal('old_price', 10, 2)->nullable();
            $table->float('rating')->default(5);
            $table->integer('reviews')->default(0);
            $table->integer('stock')->default(0);
            $table->string('sku')->default('');
            $table->string('brand')->default('');
            $table->string('badge')->nullable();
            $table->text('short_desc')->default('');
            $table->text('description')->default('');
            $table->json('features');
            $table->json('specs');
            $table->text('image')->default('');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('products'); }
};
```

- [ ] **Step 4: orders + order_items**

Create `backend/database/migrations/2026_06_06_000004_create_orders_table.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary(); // TF-xxxxxx
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->string('status')->default('Pending');
            $table->string('payment_method')->default('Manual Payment');
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->timestamps();
        });
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->unsignedBigInteger('product_id');
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->string('image')->default('');
            $table->integer('qty');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
```

- [ ] **Step 5: wishlist_items, payment_methods, site_content**

Create `backend/database/migrations/2026_06_06_000005_create_remaining_tables.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('product_id');
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('type');   // stripe|paypal|crypto|bank|custom
            $table->string('name');
            $table->boolean('enabled')->default(true);
            $table->string('mode')->default('test');
            $table->string('public_key')->nullable();
            $table->string('secret_key')->nullable();
            $table->string('client_id')->nullable();
            $table->string('client_secret')->nullable();
            $table->string('wallet_address')->nullable();
            $table->string('network')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamps();
        });
        Schema::create('site_content', function (Blueprint $table) {
            $table->id();
            $table->json('content');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('site_content');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('wishlist_items');
    }
};
```

- [ ] **Step 6: Run migrations**

```bash
cd backend
php artisan migrate
```

Expected: all tables created, no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add migrations for catalog, orders, wishlist, payments, content"
```

---

### Task 4: Eloquent models

**Files:** Create model files under `backend/app/Models/`. `User.php` already exists — modify it.

- [ ] **Step 1: Update User model**

Edit `backend/app/Models/User.php` — add `role`, `avatar` to `$fillable` and the relationships:

```php
protected $fillable = ['name', 'email', 'password', 'role', 'avatar'];

public function orders() { return $this->hasMany(Order::class); }
public function wishlistItems() { return $this->hasMany(WishlistItem::class); }
public function isAdmin(): bool { return in_array($this->role, ['admin', 'super_admin']); }
```

- [ ] **Step 2: Product model**

Create `backend/app/Models/Product.php`:

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Product extends Model {
    protected $fillable = [
        'name','slug','category','subcategory','price','old_price','rating',
        'reviews','stock','sku','brand','badge','short_desc','description',
        'features','specs','image',
    ];
    protected $casts = [
        'features' => 'array', 'specs' => 'array',
        'price' => 'float', 'old_price' => 'float', 'rating' => 'float',
    ];
}
```

- [ ] **Step 3: Category model**

Create `backend/app/Models/Category.php`:

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Category extends Model {
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = ['id', 'name', 'count'];
}
```

- [ ] **Step 4: Order + OrderItem models**

Create `backend/app/Models/Order.php`:

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'id','user_id','subtotal','shipping','tax','total','status','payment_method',
        'stripe_payment_intent_id','email','phone','first_name','last_name',
        'address','city','state','zip',
    ];
    protected $casts = ['subtotal'=>'float','shipping'=>'float','tax'=>'float','total'=>'float'];
    public function items() { return $this->hasMany(OrderItem::class); }
    public function user() { return $this->belongsTo(User::class); }
}
```

Create `backend/app/Models/OrderItem.php`:

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model {
    protected $fillable = ['order_id','product_id','name','price','image','qty'];
    protected $casts = ['price' => 'float', 'qty' => 'int', 'product_id' => 'int'];
}
```

- [ ] **Step 5: WishlistItem, PaymentMethod, SiteContent models**

Create `backend/app/Models/WishlistItem.php`:

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model {
    protected $fillable = ['user_id', 'product_id'];
    protected $casts = ['product_id' => 'int'];
}
```

Create `backend/app/Models/PaymentMethod.php`:

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model {
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'id','type','name','enabled','mode','public_key','secret_key',
        'client_id','client_secret','wallet_address','network','instructions',
    ];
    protected $casts = ['enabled' => 'boolean'];
}
```

Create `backend/app/Models/SiteContent.php`:

```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model {
    protected $table = 'site_content';
    protected $fillable = ['content'];
    protected $casts = ['content' => 'array'];
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add eloquent models"
```

---

### Task 5: Port seed data files

**Files:** Create: `backend/database/data/products_seed.php`, `backend/database/data/site_content_seed.php`.

- [ ] **Step 1: Generate the product seed array from `src/data/products.ts`**

Create `backend/database/data/products_seed.php` returning an array of product rows. Each row maps the TS `Product` fields to snake_case DB columns (`oldPrice`→`old_price`, `shortDesc`→`short_desc`, `features` array, `specs` assoc array). Port **all** products and the 14 categories from [`src/data/products.ts`](../../../src/data/products.ts).

Structure (fill every product — this shows the shape for product id 1; repeat for all):

```php
<?php
return [
    'categories' => [
        ['id' => 'drills', 'name' => 'Drills', 'count' => 48],
        ['id' => 'cutting-tools', 'name' => 'Cutting Tools', 'count' => 36],
        ['id' => 'wrenches', 'name' => 'Wrench Tools', 'count' => 52],
        ['id' => 'power-saws', 'name' => 'Power Saws', 'count' => 28],
        ['id' => 'abrasives', 'name' => 'Abrasives', 'count' => 22],
        ['id' => 'hand-drills', 'name' => 'Hand Drill Tools', 'count' => 34],
        ['id' => 'staple-guns', 'name' => 'Staple Guns', 'count' => 18],
        ['id' => 'power-tools', 'name' => 'Power Tools', 'count' => 64],
        ['id' => 'hammer-tools', 'name' => 'Hammer Tools', 'count' => 42],
        ['id' => 'circular-saws', 'name' => 'Circular Saws', 'count' => 19],
        ['id' => 'air-toolsets', 'name' => 'Air Tool Sets', 'count' => 15],
        ['id' => 'blade-sets', 'name' => 'Blade Sets', 'count' => 26],
        ['id' => 'grinder-tools', 'name' => 'Grinder Tools', 'count' => 31],
        ['id' => 'safety', 'name' => 'Safety Equipment', 'count' => 44],
    ],
    'products' => [
        [
            'id' => 1,
            'name' => 'Porter Cable PCE605K Impact Driver 1/4" Hex',
            'slug' => 'porter-cable-pce605k-impact-driver',
            'category' => 'drills',
            'subcategory' => 'Impact Drivers',
            'price' => 89.00,
            'old_price' => 124.00,
            'rating' => 4,
            'reviews' => 247,
            'stock' => 34,
            'sku' => 'PWR-PC-605',
            'brand' => 'Porter Cable',
            // 'badge' => 'Sale',           // include when present in source
            'short_desc' => '...from source...',
            'description' => '...from source...',
            'features' => ['...', '...'],
            'specs' => ['Power' => '...', 'Warranty' => '...'],
            'image' => '...from source...',
        ],
        // ... repeat for EVERY product object in src/data/products.ts ...
    ],
];
```

> Implementation note: open `src/data/products.ts`, transcribe each product. Do not invent products — port exactly what's there.

- [ ] **Step 2: Port site content**

Create `backend/database/data/site_content_seed.php` returning the `seedSiteContent` object from [`src/context/StoreContext.tsx`](../../../src/context/StoreContext.tsx) as a PHP associative array, **keeping the exact camelCase keys** (`brandName`, `heroSlides`, `homePromoBanners`, `trustItems`, `aboutValues`, etc.) so the JSON column round-trips to the TS `SiteContent` type unchanged.

```php
<?php
return [
    'brandName' => 'TOOL',
    'brandAccent' => 'RACK',
    'tagline' => 'Professional Material Tools & Equipment Store',
    // ... transcribe ALL fields and nested arrays from seedSiteContent ...
];
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: port catalog and site content seed data to PHP"
```

---

### Task 6: Seeders

**Files:** Create seeders in `backend/database/seeders/`, modify `DatabaseSeeder.php`.

- [ ] **Step 1: UserSeeder**

Create `backend/database/seeders/UserSeeder.php`:

```php
<?php
namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder {
    public function run(): void {
        $password = Hash::make(env('SEED_PASSWORD', 'password123'));
        $users = [
            ['name' => 'Super Admin', 'email' => 'super@toolrack.com', 'role' => 'super_admin'],
            ['name' => 'Store Admin', 'email' => 'admin@toolrack.com', 'role' => 'admin'],
            ['name' => 'Demo Customer', 'email' => 'customer@toolrack.com', 'role' => 'customer'],
        ];
        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], [
                'name' => $u['name'],
                'password' => $password,
                'role' => $u['role'],
                'avatar' => strtoupper($u['name'][0]),
            ]);
        }
    }
}
```

- [ ] **Step 2: CategorySeeder + ProductSeeder**

Create `backend/database/seeders/CategorySeeder.php`:

```php
<?php
namespace Database\Seeders;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder {
    public function run(): void {
        $data = require database_path('data/products_seed.php');
        foreach ($data['categories'] as $c) {
            Category::updateOrCreate(['id' => $c['id']], $c);
        }
    }
}
```

Create `backend/database/seeders/ProductSeeder.php`:

```php
<?php
namespace Database\Seeders;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder {
    public function run(): void {
        $data = require database_path('data/products_seed.php');
        foreach ($data['products'] as $p) {
            Product::updateOrCreate(['id' => $p['id']], $p);
        }
    }
}
```

- [ ] **Step 3: PaymentMethodSeeder + SiteContentSeeder**

Create `backend/database/seeders/PaymentMethodSeeder.php`:

```php
<?php
namespace Database\Seeders;
use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder {
    public function run(): void {
        PaymentMethod::updateOrCreate(['id' => 'stripe-default'], [
            'type' => 'stripe',
            'name' => 'Credit / Debit Card',
            'enabled' => true,
            'mode' => 'test',
            'public_key' => env('STRIPE_KEY', 'pk_test_demo'),
            'secret_key' => env('STRIPE_SECRET'),
            'instructions' => 'Cards are processed securely through Stripe.',
        ]);
    }
}
```

Create `backend/database/seeders/SiteContentSeeder.php`:

```php
<?php
namespace Database\Seeders;
use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder {
    public function run(): void {
        $content = require database_path('data/site_content_seed.php');
        $row = SiteContent::first();
        if ($row) { $row->update(['content' => $content]); }
        else { SiteContent::create(['content' => $content]); }
    }
}
```

- [ ] **Step 4: Wire DatabaseSeeder**

Replace `backend/database/seeders/DatabaseSeeder.php` `run()` body:

```php
public function run(): void {
    $this->call([
        UserSeeder::class,
        CategorySeeder::class,
        ProductSeeder::class,
        PaymentMethodSeeder::class,
        SiteContentSeeder::class,
    ]);
}
```

- [ ] **Step 5: Seed and verify**

```bash
cd backend
php artisan migrate:fresh --seed
php artisan tinker --execute="echo App\Models\Product::count().' products, '.App\Models\Category::count().' categories, '.App\Models\User::count().' users';"
```

Expected: product count matches the number in `products.ts`, 14 categories, 3 users.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: seeders for users, catalog, payment methods, site content"
```

---

# PHASE 3 — Auth

### Task 7: Auth endpoints (TDD)

**Files:** Create: `backend/app/Http/Controllers/Api/AuthController.php`, `backend/tests/Feature/AuthTest.php`. Modify: `backend/routes/api.php`.

- [ ] **Step 1: Write failing auth tests**

Create `backend/tests/Feature/AuthTest.php`:

```php
<?php
use App\Models\User;
use function Pest\Laravel\postJson;
use function Pest\Laravel\getJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('registers a user and returns a token', function () {
    $res = postJson('/api/register', [
        'name' => 'Jane', 'email' => 'jane@example.com',
        'password' => 'secret123', 'password_confirmation' => 'secret123',
    ]);
    $res->assertCreated()->assertJsonStructure(['token', 'user' => ['id','name','email','role']]);
    expect($res->json('user.role'))->toBe('customer');
});

it('logs in an existing user', function () {
    User::factory()->create(['email' => 'bob@example.com', 'password' => bcrypt('secret123')]);
    postJson('/api/login', ['email' => 'bob@example.com', 'password' => 'secret123'])
        ->assertOk()->assertJsonStructure(['token', 'user']);
});

it('rejects bad credentials', function () {
    User::factory()->create(['email' => 'bob@example.com', 'password' => bcrypt('secret123')]);
    postJson('/api/login', ['email' => 'bob@example.com', 'password' => 'wrong'])
        ->assertStatus(422);
});

it('returns the authenticated user', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;
    getJson('/api/user', ['Authorization' => "Bearer $token"])->assertOk()
        ->assertJson(['email' => $user->email]);
});
```

- [ ] **Step 2: Run — verify fails**

```bash
cd backend
php artisan test --filter=AuthTest
```

Expected: FAIL (routes/controller missing).

- [ ] **Step 3: Implement AuthController**

Create `backend/app/Http/Controllers/Api/AuthController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller {
    public function register(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'customer',
            'avatar' => strtoupper($data['name'][0] ?? 'U'),
        ]);
        return response()->json([
            'token' => $user->createToken('spa')->plainTextToken,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request) {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }
        return response()->json([
            'token' => $user->createToken('spa')->plainTextToken,
            'user' => $user,
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request) {
        return response()->json($request->user());
    }
}
```

- [ ] **Step 4: Add routes**

Edit `backend/routes/api.php` — add at top (after `use` lines):

```php
use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
```

- [ ] **Step 5: Run — verify passes**

```bash
php artisan test --filter=AuthTest
```

Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: sanctum auth endpoints (register/login/logout/me)"
```

---

### Task 8: Role middleware

**Files:** Create: `backend/app/Http/Middleware/EnsureRole.php`. (Alias was registered in Task 2 Step 3.)

- [ ] **Step 1: Implement middleware**

Create `backend/app/Http/Middleware/EnsureRole.php`:

```php
<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole {
    public function handle(Request $request, Closure $next, string ...$roles): Response {
        $user = $request->user();
        if (! $user || ! in_array($user->role, $roles)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
```

Usage will be `->middleware('role:admin,super_admin')` on admin route groups (applied in Tasks 9–13).

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: role-based access middleware"
```

---

# PHASE 4 — Catalog (products + categories)

### Task 9: Product API (TDD)

**Files:** Create: `backend/app/Http/Resources/ProductResource.php`, `backend/app/Http/Requests/ProductRequest.php`, `backend/app/Http/Controllers/Api/ProductController.php`, `backend/tests/Feature/ProductTest.php`. Modify: `routes/api.php`.

- [ ] **Step 1: Write failing product tests**

Create `backend/tests/Feature/ProductTest.php`:

```php
<?php
use App\Models\Product;
use App\Models\User;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\deleteJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function makeProduct(array $o = []): Product {
    return Product::create(array_merge([
        'name' => 'Test Drill', 'slug' => 'test-drill-'.uniqid(),
        'category' => 'drills', 'subcategory' => '', 'price' => 100,
        'rating' => 5, 'reviews' => 0, 'stock' => 10, 'sku' => 'X', 'brand' => 'DeWalt',
        'short_desc' => '', 'description' => '', 'features' => ['a'], 'specs' => ['k'=>'v'], 'image' => '',
    ], $o));
}

it('lists products paginated', function () {
    makeProduct(); makeProduct();
    getJson('/api/products')->assertOk()
        ->assertJsonStructure(['data' => [['id','name','slug','price','features','specs']], 'meta' => ['current_page','last_page','total']]);
});

it('filters products by category', function () {
    makeProduct(['category' => 'drills']);
    makeProduct(['category' => 'safety']);
    $res = getJson('/api/products?category=safety')->assertOk();
    expect($res->json('meta.total'))->toBe(1);
});

it('searches products by name', function () {
    makeProduct(['name' => 'Bosch Saw']);
    makeProduct(['name' => 'DeWalt Drill']);
    $res = getJson('/api/products?search=bosch')->assertOk();
    expect($res->json('meta.total'))->toBe(1);
});

it('shows a product by slug', function () {
    $p = makeProduct(['slug' => 'find-me']);
    getJson('/api/products/find-me')->assertOk()->assertJson(['data' => ['id' => $p->id]]);
});

it('forbids product creation for customers', function () {
    $user = User::factory()->create(['role' => 'customer']);
    postJson('/api/products', ['name' => 'Nope'], ['Authorization' => 'Bearer '.$user->createToken('t')->plainTextToken])
        ->assertStatus(403);
});

it('allows admins to create a product', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $payload = [
        'name' => 'New Hammer', 'category' => 'hammer-tools', 'price' => 49.99,
        'stock' => 5, 'brand' => 'Stanley', 'rating' => 5,
        'short_desc' => 'x', 'description' => 'y', 'features' => ['f1'], 'specs' => ['Power'=>'High'], 'image' => 'http://img',
    ];
    $res = postJson('/api/products', $payload, ['Authorization' => 'Bearer '.$admin->createToken('t')->plainTextToken]);
    $res->assertCreated()->assertJsonPath('data.name', 'New Hammer');
    expect($res->json('data.slug'))->not->toBeEmpty();
});

it('allows admins to delete a product', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $p = makeProduct();
    deleteJson("/api/products/{$p->id}", [], ['Authorization' => 'Bearer '.$admin->createToken('t')->plainTextToken])
        ->assertOk();
    expect(Product::find($p->id))->toBeNull();
});
```

- [ ] **Step 2: Run — verify fails**

```bash
php artisan test --filter=ProductTest
```

Expected: FAIL.

- [ ] **Step 3: ProductResource**

Create `backend/app/Http/Resources/ProductResource.php`:

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'price' => (float) $this->price,
            'oldPrice' => $this->old_price !== null ? (float) $this->old_price : null,
            'rating' => (float) $this->rating,
            'reviews' => (int) $this->reviews,
            'stock' => (int) $this->stock,
            'sku' => $this->sku,
            'brand' => $this->brand,
            'badge' => $this->badge,
            'shortDesc' => $this->short_desc,
            'description' => $this->description,
            'features' => $this->features ?? [],
            'specs' => $this->specs ?? [],
            'image' => $this->image,
        ];
    }
}
```

> Note: the resource emits camelCase keys (`oldPrice`, `shortDesc`) to match the React `Product` type exactly, so no frontend remapping is needed.

- [ ] **Step 4: ProductRequest**

Create `backend/app/Http/Requests/ProductRequest.php`:

```php
<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest {
    public function authorize(): bool { return true; } // route middleware enforces role
    public function rules(): array {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';
        return [
            'name' => "$required|string|max:255",
            'category' => "$required|string",
            'price' => "$required|numeric|min:0",
            'subcategory' => 'nullable|string',
            'oldPrice' => 'nullable|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews' => 'nullable|integer|min:0',
            'stock' => 'nullable|integer|min:0',
            'sku' => 'nullable|string',
            'brand' => 'nullable|string',
            'badge' => 'nullable|in:New,Sale,Hot,Top',
            'shortDesc' => 'nullable|string',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'specs' => 'nullable|array',
            'image' => 'nullable|string',
        ];
    }
    public function dbData(): array {
        $v = $this->validated();
        $map = [
            'oldPrice' => 'old_price', 'shortDesc' => 'short_desc',
        ];
        $out = [];
        foreach ($v as $k => $val) { $out[$map[$k] ?? $k] = $val; }
        return $out;
    }
}
```

- [ ] **Step 5: ProductController**

Create `backend/app/Http/Controllers/Api/ProductController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller {
    public function index(Request $request) {
        $q = Product::query();
        if ($s = $request->query('search')) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$s%")
                ->orWhere('brand', 'like', "%$s%")->orWhere('sku', 'like', "%$s%"));
        }
        if ($c = $request->query('category')) $q->where('category', $c);
        if ($b = $request->query('brand')) $q->where('brand', $b);
        if ($badge = $request->query('badge')) $q->where('badge', $badge);
        if ($min = $request->query('min_price')) $q->where('price', '>=', $min);
        if ($max = $request->query('max_price')) $q->where('price', '<=', $max);
        match ($request->query('sort')) {
            'price_asc' => $q->orderBy('price'),
            'price_desc' => $q->orderByDesc('price'),
            'rating' => $q->orderByDesc('rating'),
            'newest' => $q->orderByDesc('id'),
            default => $q->orderByDesc('id'),
        };
        return ProductResource::collection($q->paginate((int) $request->query('per_page', 24)));
    }

    public function show(string $slug) {
        $product = Product::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        return new ProductResource($product);
    }

    public function store(ProductRequest $request) {
        $data = $request->dbData();
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['features'] = $data['features'] ?? [];
        $data['specs'] = $data['specs'] ?? [];
        $product = Product::create($data);
        return (new ProductResource($product))->response()->setStatusCode(201);
    }

    public function update(ProductRequest $request, Product $product) {
        $product->update($request->dbData());
        return new ProductResource($product->fresh());
    }

    public function destroy(Product $product) {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    private function uniqueSlug(string $name): string {
        $base = Str::slug($name);
        $slug = $base; $i = 1;
        while (Product::where('slug', $slug)->exists()) { $slug = "$base-".(++$i); }
        return $slug;
    }
}
```

- [ ] **Step 6: Routes**

Edit `backend/routes/api.php` — add:

```php
use App\Http\Controllers\Api\ProductController;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
});
```

- [ ] **Step 7: Run — verify passes**

```bash
php artisan test --filter=ProductTest
```

Expected: PASS (7 tests).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: product API (list/filter/search/show + admin CRUD)"
```

---

### Task 10: Category API (TDD)

**Files:** Create: `backend/app/Http/Controllers/Api/CategoryController.php`, `backend/tests/Feature/CategoryTest.php`. Modify: `routes/api.php`.

- [ ] **Step 1: Write failing category tests**

Create `backend/tests/Feature/CategoryTest.php`:

```php
<?php
use App\Models\Category;
use App\Models\User;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\deleteJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('lists categories', function () {
    Category::create(['id' => 'drills', 'name' => 'Drills', 'count' => 5]);
    getJson('/api/categories')->assertOk()->assertJsonStructure(['data' => [['id','name','count']]]);
});

it('lets admin create a category with a slug id', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $res = postJson('/api/categories', ['name' => 'Welding Tools'],
        ['Authorization' => 'Bearer '.$admin->createToken('t')->plainTextToken]);
    $res->assertCreated()->assertJsonPath('data.id', 'welding-tools');
});

it('forbids customers from creating categories', function () {
    $user = User::factory()->create(['role' => 'customer']);
    postJson('/api/categories', ['name' => 'X'],
        ['Authorization' => 'Bearer '.$user->createToken('t')->plainTextToken])->assertStatus(403);
});

it('lets admin delete a category', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Category::create(['id' => 'drills', 'name' => 'Drills', 'count' => 0]);
    deleteJson('/api/categories/drills', [], ['Authorization' => 'Bearer '.$admin->createToken('t')->plainTextToken])
        ->assertOk();
    expect(Category::find('drills'))->toBeNull();
});
```

- [ ] **Step 2: Run — verify fails**

```bash
php artisan test --filter=CategoryTest
```

Expected: FAIL.

- [ ] **Step 3: CategoryController**

Create `backend/app/Http/Controllers/Api/CategoryController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller {
    public function index() {
        return response()->json(['data' => Category::orderBy('name')->get()]);
    }

    public function store(Request $request) {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $base = Str::slug($data['name']) ?: 'category-'.time();
        $id = $base; $i = 1;
        while (Category::find($id)) { $id = "$base-".(++$i); }
        $category = Category::create(['id' => $id, 'name' => $data['name'], 'count' => 0]);
        return response()->json(['data' => $category], 201);
    }

    public function update(Request $request, Category $category) {
        $data = $request->validate(['name' => 'sometimes|string|max:255', 'count' => 'sometimes|integer']);
        $category->update($data);
        return response()->json(['data' => $category]);
    }

    public function destroy(Category $category) {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
```

- [ ] **Step 4: Routes**

Edit `backend/routes/api.php` — add:

```php
use App\Http\Controllers\Api\CategoryController;

Route::get('/categories', [CategoryController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});
```

- [ ] **Step 5: Run — verify passes**

```bash
php artisan test --filter=CategoryTest
```

Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: category API with admin CRUD"
```

---

# PHASE 5 — Orders + Stripe

### Task 11: Stripe service + payment intent (TDD)

**Files:** Create: `backend/app/Services/StripeService.php`, `backend/app/Http/Controllers/Api/PaymentController.php`. Modify: `routes/api.php`.

- [ ] **Step 1: StripeService (wraps SDK so tests can fake it)**

Create `backend/app/Services/StripeService.php`:

```php
<?php
namespace App\Services;
use Stripe\StripeClient;

class StripeService {
    public function __construct(private ?StripeClient $client = null) {
        $this->client = $client ?: new StripeClient(config('services.stripe.secret'));
    }

    /** @return array{id:string, client_secret:string} */
    public function createIntent(int $amountCents, string $currency = 'usd'): array {
        $intent = $this->client->paymentIntents->create([
            'amount' => $amountCents,
            'currency' => $currency,
            'automatic_payment_methods' => ['enabled' => true],
        ]);
        return ['id' => $intent->id, 'client_secret' => $intent->client_secret];
    }

    public function intentSucceeded(string $intentId): bool {
        $intent = $this->client->paymentIntents->retrieve($intentId);
        return $intent->status === 'succeeded';
    }
}
```

Add to `backend/config/services.php` in the returned array:

```php
'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
],
```

- [ ] **Step 2: Write failing payment-intent test**

Create `backend/tests/Feature/OrderTest.php` (intent portion first):

```php
<?php
use App\Models\Product;
use App\Models\User;
use App\Services\StripeService;
use function Pest\Laravel\postJson;
use function Pest\Laravel\getJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function seedProduct(array $o = []): Product {
    return Product::create(array_merge([
        'name' => 'Drill', 'slug' => 'drill-'.uniqid(), 'category' => 'drills', 'subcategory' => '',
        'price' => 100, 'rating' => 5, 'reviews' => 0, 'stock' => 10, 'sku' => 'X', 'brand' => 'DeWalt',
        'short_desc' => '', 'description' => '', 'features' => [], 'specs' => [], 'image' => '',
    ], $o));
}

function authHeader(User $u): array {
    return ['Authorization' => 'Bearer '.$u->createToken('t')->plainTextToken];
}

it('creates a payment intent with a server-computed amount', function () {
    $this->mock(StripeService::class, function ($m) {
        $m->shouldReceive('createIntent')->once()
          ->withArgs(fn ($cents) => $cents === 23492) // 2x100 subtotal=200, ship 14.99? see below
          ->andReturn(['id' => 'pi_test', 'client_secret' => 'cs_test']);
    });
    $user = User::factory()->create();
    $p = seedProduct(['price' => 100]);
    // subtotal 200 -> shipping 14.99 (under 199? no, >=199 free) => shipping 0; tax 16; total 216 => 21600
    // adjust expected in withArgs to 21600
})->skip('amount math finalized in next step');
```

> Note: replace the `withArgs` expectation with the correct cents once you confirm the shipping/tax rule below. The real test is written in Step 4.

- [ ] **Step 3: PaymentController**

Create `backend/app/Http/Controllers/Api/PaymentController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\StripeService;
use Illuminate\Http\Request;

class PaymentController extends Controller {
    public function __construct(private StripeService $stripe) {}

    public function intent(Request $request) {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
        ]);
        $total = $this->computeTotal($data['items']);
        $intent = $this->stripe->createIntent((int) round($total * 100));
        return response()->json(['clientSecret' => $intent['client_secret'], 'intentId' => $intent['id'], 'amount' => $total]);
    }

    /** Shared total computation: subtotal from DB prices, shipping, 8% tax. */
    public static function totalsFor(array $items): array {
        $subtotal = 0;
        foreach ($items as $item) {
            $product = Product::find($item['productId']);
            if (! $product) continue;
            $subtotal += $product->price * $item['qty'];
        }
        $shipping = $subtotal >= 199 ? 0 : 14.99;
        $tax = round($subtotal * 0.08, 2);
        $total = round($subtotal + $shipping + $tax, 2);
        return compact('subtotal', 'shipping', 'tax', 'total');
    }

    private function computeTotal(array $items): float {
        return self::totalsFor($items)['total'];
    }
}
```

- [ ] **Step 4: Replace the intent test with the real one**

Replace the `OrderTest.php` intent test body (remove the `.skip`):

```php
it('creates a payment intent with a server-computed amount', function () {
    // subtotal = 2*100 = 200 -> shipping 0 (>=199), tax 16.00, total 216.00 => 21600 cents
    $this->mock(StripeService::class, function ($m) {
        $m->shouldReceive('createIntent')->once()
          ->with(21600, \Mockery::any())->andReturn(['id' => 'pi_test', 'client_secret' => 'cs_test']);
    });
    $user = User::factory()->create();
    $p = seedProduct(['price' => 100]);
    postJson('/api/payments/intent', ['items' => [['productId' => $p->id, 'qty' => 2]]], authHeader($user))
        ->assertOk()->assertJson(['clientSecret' => 'cs_test', 'intentId' => 'pi_test']);
});
```

> The `createIntent` signature is `createIntent(int $amountCents, string $currency='usd')`; the mock matches `(21600, any)`.

- [ ] **Step 5: Route**

Edit `backend/routes/api.php` — inside the `auth:sanctum` group:

```php
use App\Http\Controllers\Api\PaymentController;
// inside Route::middleware('auth:sanctum')->group(...)
Route::post('/payments/intent', [PaymentController::class, 'intent']);
```

- [ ] **Step 6: Run — verify passes**

```bash
php artisan test --filter=OrderTest
```

Expected: PASS (1 test so far).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: stripe service + payment intent with server-side totals"
```

---

### Task 12: Order placement (TDD)

**Files:** Create: `backend/app/Http/Resources/OrderResource.php`, `backend/app/Http/Controllers/Api/OrderController.php`. Modify: `routes/api.php`, `backend/tests/Feature/OrderTest.php`.

- [ ] **Step 1: Add order tests**

Append to `backend/tests/Feature/OrderTest.php`:

```php
it('places a manual (non-stripe) order, snapshots items, decrements stock', function () {
    $user = User::factory()->create();
    $p = seedProduct(['price' => 50, 'stock' => 10]);
    $res = postJson('/api/orders', [
        'items' => [['productId' => $p->id, 'qty' => 2]],
        'paymentMethod' => 'Bank Transfer',
    ], authHeader($user));
    $res->assertCreated()->assertJsonPath('data.status', 'Pending');
    expect($res->json('data.id'))->toStartWith('TF-');
    expect($p->fresh()->stock)->toBe(8);
    expect($res->json('data.items'))->toHaveCount(1);
    // subtotal 100 -> shipping 14.99, tax 8.00, total 122.99
    expect($res->json('data.total'))->toBe(122.99);
});

it('rejects a stripe order whose intent did not succeed', function () {
    $this->mock(StripeService::class, function ($m) {
        $m->shouldReceive('intentSucceeded')->once()->with('pi_bad')->andReturn(false);
    });
    $user = User::factory()->create();
    $p = seedProduct();
    postJson('/api/orders', [
        'items' => [['productId' => $p->id, 'qty' => 1]],
        'paymentMethod' => 'Credit / Debit Card',
        'stripePaymentIntentId' => 'pi_bad',
    ], authHeader($user))->assertStatus(422);
});

it('accepts a stripe order whose intent succeeded', function () {
    $this->mock(StripeService::class, function ($m) {
        $m->shouldReceive('intentSucceeded')->once()->with('pi_ok')->andReturn(true);
    });
    $user = User::factory()->create();
    $p = seedProduct();
    postJson('/api/orders', [
        'items' => [['productId' => $p->id, 'qty' => 1]],
        'paymentMethod' => 'Credit / Debit Card',
        'stripePaymentIntentId' => 'pi_ok',
    ], authHeader($user))->assertCreated();
});

it('lists only the current users orders', function () {
    $a = User::factory()->create(); $b = User::factory()->create();
    $p = seedProduct();
    postJson('/api/orders', ['items' => [['productId'=>$p->id,'qty'=>1]], 'paymentMethod'=>'Bank'], authHeader($a))->assertCreated();
    getJson('/api/orders', authHeader($b))->assertOk();
    expect(getJson('/api/orders', authHeader($b))->json('data'))->toHaveCount(0);
    expect(getJson('/api/orders', authHeader($a))->json('data'))->toHaveCount(1);
});
```

- [ ] **Step 2: Run — verify fails**

```bash
php artisan test --filter=OrderTest
```

Expected: FAIL (order routes missing).

- [ ] **Step 3: OrderResource**

Create `backend/app/Http/Resources/OrderResource.php`:

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id,
            'date' => $this->created_at?->toISOString(),
            'status' => $this->status,
            'paymentMethod' => $this->payment_method,
            'subtotal' => (float) $this->subtotal,
            'shipping' => (float) $this->shipping,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'items' => $this->items->map(fn ($i) => [
                'productId' => (int) $i->product_id,
                'name' => $i->name,
                'price' => (float) $i->price,
                'emoji' => $i->image, // React CartItem uses `emoji` for the image url
                'qty' => (int) $i->qty,
            ]),
        ];
    }
}
```

> Note: React's `CartItem` type uses `emoji` as the image-URL field; the resource maps `image`→`emoji` so the frontend type is unchanged.

- [ ] **Step 4: OrderController**

Create `backend/app/Http/Controllers/Api/OrderController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller {
    public function __construct(private StripeService $stripe) {}

    public function store(Request $request) {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'paymentMethod' => 'required|string',
            'stripePaymentIntentId' => 'nullable|string',
            'email' => 'nullable|email', 'phone' => 'nullable|string',
            'firstName' => 'nullable|string', 'lastName' => 'nullable|string',
            'address' => 'nullable|string', 'city' => 'nullable|string',
            'state' => 'nullable|string', 'zip' => 'nullable|string',
        ]);

        if (! empty($data['stripePaymentIntentId'])) {
            if (! $this->stripe->intentSucceeded($data['stripePaymentIntentId'])) {
                throw ValidationException::withMessages(['payment' => ['Payment was not completed.']]);
            }
        }

        $totals = PaymentController::totalsFor($data['items']);

        $order = DB::transaction(function () use ($data, $totals, $request) {
            $order = Order::create([
                'id' => 'TF-'.random_int(100000, 999999),
                'user_id' => $request->user()->id,
                'subtotal' => $totals['subtotal'],
                'shipping' => $totals['shipping'],
                'tax' => $totals['tax'],
                'total' => $totals['total'],
                'status' => 'Pending',
                'payment_method' => $data['paymentMethod'],
                'stripe_payment_intent_id' => $data['stripePaymentIntentId'] ?? null,
                'email' => $data['email'] ?? null, 'phone' => $data['phone'] ?? null,
                'first_name' => $data['firstName'] ?? null, 'last_name' => $data['lastName'] ?? null,
                'address' => $data['address'] ?? null, 'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null, 'zip' => $data['zip'] ?? null,
            ]);
            foreach ($data['items'] as $item) {
                $product = Product::find($item['productId']);
                if (! $product) continue;
                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'image' => $product->image,
                    'qty' => $item['qty'],
                ]);
                $product->decrement('stock', min($item['qty'], $product->stock));
            }
            return $order;
        });

        return (new OrderResource($order->load('items')))->response()->setStatusCode(201);
    }

    public function index(Request $request) {
        $orders = $request->user()->orders()->with('items')->latest()->get();
        return OrderResource::collection($orders);
    }
}
```

- [ ] **Step 5: Routes**

Edit `backend/routes/api.php` — inside the `auth:sanctum` group:

```php
use App\Http\Controllers\Api\OrderController;
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders', [OrderController::class, 'index']);
```

- [ ] **Step 6: Run — verify passes**

```bash
php artisan test --filter=OrderTest
```

Expected: PASS (all OrderTest tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: order placement with stripe verification + stock decrement"
```

---

# PHASE 6 — CMS, payment config, admin orders, customers

### Task 13: Admin orders, customers, payment methods, site content (TDD)

**Files:** Create: `backend/app/Http/Controllers/Api/PaymentMethodController.php`, `SiteContentController.php`, `CustomerController.php`, `backend/app/Http/Resources/PaymentMethodResource.php`, `PaymentMethodPublicResource.php`, `backend/tests/Feature/AdminTest.php`, `SiteContentTest.php`. Modify: `OrderController.php`, `routes/api.php`.

- [ ] **Step 1: Add admin-order methods to OrderController**

Edit `backend/app/Http/Controllers/Api/OrderController.php` — add:

```php
public function all() {
    return OrderResource::collection(Order::with('items')->latest()->get());
}

public function updateStatus(Request $request, Order $order) {
    $data = $request->validate(['status' => 'required|in:Pending,Processing,Shipped,Delivered']);
    $order->update(['status' => $data['status']]);
    return new OrderResource($order->load('items'));
}
```

- [ ] **Step 2: Payment method resources**

Create `backend/app/Http/Resources/PaymentMethodResource.php` (admin — full fields):

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentMethodResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id, 'type' => $this->type, 'name' => $this->name,
            'enabled' => (bool) $this->enabled, 'mode' => $this->mode,
            'publicKey' => $this->public_key, 'secretKey' => $this->secret_key,
            'clientId' => $this->client_id, 'clientSecret' => $this->client_secret,
            'walletAddress' => $this->wallet_address, 'network' => $this->network,
            'instructions' => $this->instructions,
        ];
    }
}
```

Create `backend/app/Http/Resources/PaymentMethodPublicResource.php` (storefront — secrets stripped):

```php
<?php
namespace App\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentMethodPublicResource extends JsonResource {
    public function toArray($request): array {
        return [
            'id' => $this->id, 'type' => $this->type, 'name' => $this->name,
            'enabled' => (bool) $this->enabled, 'mode' => $this->mode,
            'publicKey' => $this->public_key,
            'walletAddress' => $this->wallet_address, 'network' => $this->network,
            'instructions' => $this->instructions,
        ];
    }
}
```

- [ ] **Step 3: PaymentMethodController**

Create `backend/app/Http/Controllers/Api/PaymentMethodController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentMethodPublicResource;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller {
    // Public: enabled only, secrets stripped
    public function public() {
        return PaymentMethodPublicResource::collection(PaymentMethod::where('enabled', true)->get());
    }
    // Admin: all, full fields
    public function index() {
        return PaymentMethodResource::collection(PaymentMethod::all());
    }

    private function rules(bool $create): array {
        $req = $create ? 'required' : 'sometimes';
        return [
            'type' => "$req|in:stripe,paypal,crypto,bank,custom",
            'name' => "$req|string",
            'enabled' => 'boolean', 'mode' => 'in:test,live',
            'publicKey' => 'nullable|string', 'secretKey' => 'nullable|string',
            'clientId' => 'nullable|string', 'clientSecret' => 'nullable|string',
            'walletAddress' => 'nullable|string', 'network' => 'nullable|string',
            'instructions' => 'nullable|string',
        ];
    }
    private function dbData(array $v): array {
        $map = ['publicKey'=>'public_key','secretKey'=>'secret_key','clientId'=>'client_id',
                'clientSecret'=>'client_secret','walletAddress'=>'wallet_address'];
        $out = []; foreach ($v as $k=>$val) { $out[$map[$k] ?? $k] = $val; } return $out;
    }

    public function store(Request $request) {
        $v = $request->validate($this->rules(true));
        $data = $this->dbData($v);
        $data['id'] = ($v['type']).'-'.time();
        $method = PaymentMethod::create($data);
        return (new PaymentMethodResource($method))->response()->setStatusCode(201);
    }
    public function update(Request $request, PaymentMethod $paymentMethod) {
        $v = $request->validate($this->rules(false));
        $paymentMethod->update($this->dbData($v));
        return new PaymentMethodResource($paymentMethod->fresh());
    }
    public function destroy(PaymentMethod $paymentMethod) {
        $paymentMethod->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
```

- [ ] **Step 4: SiteContentController**

Create `backend/app/Http/Controllers/Api/SiteContentController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;

class SiteContentController extends Controller {
    public function show() {
        $row = SiteContent::first();
        return response()->json(['data' => $row?->content ?? []]);
    }
    public function update(Request $request) {
        $content = $request->all();
        $row = SiteContent::first();
        if ($row) $row->update(['content' => $content]);
        else $row = SiteContent::create(['content' => $content]);
        return response()->json(['data' => $row->content]);
    }
}
```

- [ ] **Step 5: CustomerController**

Create `backend/app/Http/Controllers/Api/CustomerController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;

class CustomerController extends Controller {
    public function index() {
        $users = User::withCount('orders')->get()->map(fn ($u) => [
            'id' => $u->id, 'name' => $u->name, 'email' => $u->email,
            'role' => $u->role, 'orders' => $u->orders_count,
            'joined' => $u->created_at?->toDateString(),
        ]);
        return response()->json(['data' => $users]);
    }
}
```

- [ ] **Step 6: Routes**

Edit `backend/routes/api.php` — add public + admin entries:

```php
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\SiteContentController;
use App\Http\Controllers\Api\CustomerController;

Route::get('/payment-methods', [PaymentMethodController::class, 'public']);
Route::get('/site-content', [SiteContentController::class, 'show']);

Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::get('/orders/all', [OrderController::class, 'all']);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::get('/admin/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::put('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
    Route::put('/site-content', [SiteContentController::class, 'update']);
    Route::get('/customers', [CustomerController::class, 'index']);
});
```

- [ ] **Step 7: AdminTest + SiteContentTest**

Create `backend/tests/Feature/AdminTest.php`:

```php
<?php
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\User;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function adminHeader(): array {
    $admin = User::factory()->create(['role' => 'admin']);
    return ['Authorization' => 'Bearer '.$admin->createToken('t')->plainTextToken];
}

it('lists all orders for admins', function () {
    $u = User::factory()->create();
    Order::create(['id'=>'TF-1','user_id'=>$u->id,'subtotal'=>10,'total'=>10,'status'=>'Pending','payment_method'=>'Bank']);
    getJson('/api/orders/all', adminHeader())->assertOk()->assertJsonCount(1, 'data');
});

it('updates order status', function () {
    $u = User::factory()->create();
    Order::create(['id'=>'TF-2','user_id'=>$u->id,'subtotal'=>10,'total'=>10,'status'=>'Pending','payment_method'=>'Bank']);
    putJson('/api/orders/TF-2/status', ['status' => 'Shipped'], adminHeader())
        ->assertOk()->assertJsonPath('data.status', 'Shipped');
});

it('public payment methods strip secret keys', function () {
    PaymentMethod::create(['id'=>'s1','type'=>'stripe','name'=>'Card','enabled'=>true,'mode'=>'test','secret_key'=>'sk_test_secret','public_key'=>'pk_test']);
    $res = getJson('/api/payment-methods')->assertOk();
    expect($res->json('data.0'))->not->toHaveKey('secretKey');
    expect($res->json('data.0.publicKey'))->toBe('pk_test');
});

it('admin can create a payment method', function () {
    postJson('/api/payment-methods', ['type'=>'crypto','name'=>'Bitcoin','enabled'=>true,'network'=>'BTC'], adminHeader())
        ->assertCreated()->assertJsonPath('data.network', 'BTC');
});

it('lists customers for admins', function () {
    User::factory()->count(2)->create();
    getJson('/api/customers', adminHeader())->assertOk();
});
```

Create `backend/tests/Feature/SiteContentTest.php`:

```php
<?php
use App\Models\SiteContent;
use App\Models\User;
use function Pest\Laravel\getJson;
use function Pest\Laravel\putJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns site content publicly', function () {
    SiteContent::create(['content' => ['brandName' => 'TOOL', 'brandAccent' => 'RACK']]);
    getJson('/api/site-content')->assertOk()->assertJsonPath('data.brandName', 'TOOL');
});

it('lets admins update site content', function () {
    SiteContent::create(['content' => ['brandName' => 'TOOL']]);
    $admin = User::factory()->create(['role' => 'admin']);
    putJson('/api/site-content', ['brandName' => 'MEGA', 'brandAccent' => 'TOOLS'],
        ['Authorization' => 'Bearer '.$admin->createToken('t')->plainTextToken])
        ->assertOk()->assertJsonPath('data.brandName', 'MEGA');
});

it('forbids customers from updating site content', function () {
    $user = User::factory()->create(['role' => 'customer']);
    putJson('/api/site-content', ['brandName' => 'X'],
        ['Authorization' => 'Bearer '.$user->createToken('t')->plainTextToken])->assertStatus(403);
});
```

- [ ] **Step 8: Run — verify passes**

```bash
php artisan test
```

Expected: PASS (all feature tests across suites).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: admin orders, payment-method config, site content CMS, customers"
```

---

### Task 14: Wishlist API (TDD)

**Files:** Create: `backend/app/Http/Controllers/Api/WishlistController.php`, append tests to a new `backend/tests/Feature/WishlistTest.php`. Modify: `routes/api.php`.

- [ ] **Step 1: Write failing wishlist tests**

Create `backend/tests/Feature/WishlistTest.php`:

```php
<?php
use App\Models\User;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\deleteJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('adds, lists and removes wishlist items', function () {
    $user = User::factory()->create();
    $h = ['Authorization' => 'Bearer '.$user->createToken('t')->plainTextToken];
    postJson('/api/wishlist', ['product_id' => 5], $h)->assertCreated();
    expect(getJson('/api/wishlist', $h)->json('data'))->toBe([5]);
    deleteJson('/api/wishlist/5', [], $h)->assertOk();
    expect(getJson('/api/wishlist', $h)->json('data'))->toBe([]);
});

it('does not duplicate wishlist entries', function () {
    $user = User::factory()->create();
    $h = ['Authorization' => 'Bearer '.$user->createToken('t')->plainTextToken];
    postJson('/api/wishlist', ['product_id' => 5], $h);
    postJson('/api/wishlist', ['product_id' => 5], $h);
    expect(getJson('/api/wishlist', $h)->json('data'))->toBe([5]);
});
```

- [ ] **Step 2: Run — verify fails**

```bash
php artisan test --filter=WishlistTest
```

Expected: FAIL.

- [ ] **Step 3: WishlistController**

Create `backend/app/Http/Controllers/Api/WishlistController.php`:

```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController extends Controller {
    public function index(Request $request) {
        return response()->json(['data' => $request->user()->wishlistItems()->pluck('product_id')->map(fn($i)=>(int)$i)]);
    }
    public function store(Request $request) {
        $data = $request->validate(['product_id' => 'required|integer']);
        WishlistItem::firstOrCreate(['user_id' => $request->user()->id, 'product_id' => $data['product_id']]);
        return response()->json(['message' => 'Added'], 201);
    }
    public function destroy(Request $request, int $productId) {
        $request->user()->wishlistItems()->where('product_id', $productId)->delete();
        return response()->json(['message' => 'Removed']);
    }
}
```

- [ ] **Step 4: Routes**

Edit `backend/routes/api.php` — inside `auth:sanctum` group:

```php
use App\Http\Controllers\Api\WishlistController;
Route::get('/wishlist', [WishlistController::class, 'index']);
Route::post('/wishlist', [WishlistController::class, 'store']);
Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
```

- [ ] **Step 5: Run — verify passes**

```bash
php artisan test --filter=WishlistTest
```

Expected: PASS (2 tests).

- [ ] **Step 6: Full backend test run + commit**

```bash
php artisan test
git add -A
git commit -m "feat: wishlist API"
```

Expected: entire backend suite PASS.

---

# PHASE 7 — React rewire

> From here, commands run at the **repo root** unless noted. Verify after each task with `npx tsc --noEmit` and `npm run build`.

### Task 15: Frontend env + API client

**Files:** Create: `.env.local`, `src/api/types.ts`, `src/api/client.ts`.

- [ ] **Step 1: Env file**

Create `.env.local` at repo root:

```
VITE_API_URL=http://localhost:8000/api
```

- [ ] **Step 2: Shared API types**

Create `src/api/types.ts` — re-export the domain types already defined in the app so api modules can import from one place:

```ts
export type { Product, Category } from "../data/products";
export type {
  CartItem, User, Order, PaymentMethod, SiteContent,
} from "../context/StoreContext";
```

- [ ] **Step 3: Fetch wrapper**

Create `src/api/client.ts`:

```ts
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "toolrack-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: Record<string, string[]>) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? "Request failed", data.errors);
  }
  return data as T;
}
```

- [ ] **Step 4: Verify typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(web): API client + env config"
```

---

### Task 16: API resource modules

**Files:** Create: `src/api/auth.ts`, `products.ts`, `categories.ts`, `orders.ts`, `wishlist.ts`, `paymentMethods.ts`, `siteContent.ts`, `payments.ts`.

- [ ] **Step 1: auth + products + categories**

Create `src/api/auth.ts`:

```ts
import { api, setToken } from "./client";
import type { User } from "./types";

type AuthResponse = { token: string; user: User };

export async function login(email: string, password: string): Promise<User> {
  const r = await api<AuthResponse>("/login", { method: "POST", body: JSON.stringify({ email, password }) });
  setToken(r.token);
  return r.user;
}
export async function register(name: string, email: string, password: string): Promise<User> {
  const r = await api<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation: password }),
  });
  setToken(r.token);
  return r.user;
}
export async function logout(): Promise<void> {
  try { await api("/logout", { method: "POST" }); } finally { setToken(null); }
}
export async function me(): Promise<User | null> {
  try { return await api<User>("/user"); } catch { setToken(null); return null; }
}
```

Create `src/api/products.ts`:

```ts
import { api } from "./client";
import type { Product } from "./types";

type Paginated<T> = { data: T[]; meta: { current_page: number; last_page: number; total: number } };

export async function listProducts(params: Record<string, string | number> = {}): Promise<Paginated<Product>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)]),
  ).toString();
  return api<Paginated<Product>>(`/products${qs ? `?${qs}` : ""}`);
}
export async function getProduct(slug: string): Promise<Product> {
  return (await api<{ data: Product }>(`/products/${slug}`)).data;
}
export async function createProduct(p: Partial<Product>): Promise<Product> {
  return (await api<{ data: Product }>("/products", { method: "POST", body: JSON.stringify(p) })).data;
}
export async function updateProduct(id: number, p: Partial<Product>): Promise<Product> {
  return (await api<{ data: Product }>(`/products/${id}`, { method: "PUT", body: JSON.stringify(p) })).data;
}
export async function deleteProduct(id: number): Promise<void> {
  await api(`/products/${id}`, { method: "DELETE" });
}
```

Create `src/api/categories.ts`:

```ts
import { api } from "./client";
import type { Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  return (await api<{ data: Category[] }>("/categories")).data;
}
export async function createCategory(name: string): Promise<Category> {
  return (await api<{ data: Category }>("/categories", { method: "POST", body: JSON.stringify({ name }) })).data;
}
export async function updateCategory(id: string, name: string): Promise<Category> {
  return (await api<{ data: Category }>(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) })).data;
}
export async function deleteCategory(id: string): Promise<void> {
  await api(`/categories/${id}`, { method: "DELETE" });
}
```

- [ ] **Step 2: orders + wishlist + payments**

Create `src/api/orders.ts`:

```ts
import { api } from "./client";
import type { CartItem, Order } from "./types";

type CheckoutPayload = {
  items: { productId: number; qty: number }[];
  paymentMethod: string;
  stripePaymentIntentId?: string;
  email?: string; phone?: string; firstName?: string; lastName?: string;
  address?: string; city?: string; state?: string; zip?: string;
};

export async function listOrders(): Promise<Order[]> {
  return (await api<{ data: Order[] }>("/orders")).data;
}
export async function listAllOrders(): Promise<Order[]> {
  return (await api<{ data: Order[] }>("/orders/all")).data;
}
export async function placeOrder(payload: CheckoutPayload): Promise<Order> {
  return (await api<{ data: Order }>("/orders", { method: "POST", body: JSON.stringify(payload) })).data;
}
export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  return (await api<{ data: Order }>(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) })).data;
}
export function cartToItems(cart: CartItem[]) {
  return cart.map((i) => ({ productId: i.productId, qty: i.qty }));
}
```

Create `src/api/wishlist.ts`:

```ts
import { api } from "./client";

export async function listWishlist(): Promise<number[]> {
  return (await api<{ data: number[] }>("/wishlist")).data;
}
export async function addWishlist(productId: number): Promise<void> {
  await api("/wishlist", { method: "POST", body: JSON.stringify({ product_id: productId }) });
}
export async function removeWishlist(productId: number): Promise<void> {
  await api(`/wishlist/${productId}`, { method: "DELETE" });
}
```

Create `src/api/payments.ts`:

```ts
import { api } from "./client";

export async function createPaymentIntent(items: { productId: number; qty: number }[]) {
  return api<{ clientSecret: string; intentId: string; amount: number }>(
    "/payments/intent", { method: "POST", body: JSON.stringify({ items }) },
  );
}
```

- [ ] **Step 3: paymentMethods + siteContent**

Create `src/api/paymentMethods.ts`:

```ts
import { api } from "./client";
import type { PaymentMethod } from "./types";

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  return (await api<{ data: PaymentMethod[] }>("/payment-methods")).data;
}
export async function listAdminPaymentMethods(): Promise<PaymentMethod[]> {
  return (await api<{ data: PaymentMethod[] }>("/admin/payment-methods")).data;
}
export async function createPaymentMethod(m: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
  return (await api<{ data: PaymentMethod }>("/payment-methods", { method: "POST", body: JSON.stringify(m) })).data;
}
export async function updatePaymentMethod(m: PaymentMethod): Promise<PaymentMethod> {
  return (await api<{ data: PaymentMethod }>(`/payment-methods/${m.id}`, { method: "PUT", body: JSON.stringify(m) })).data;
}
export async function deletePaymentMethod(id: string): Promise<void> {
  await api(`/payment-methods/${id}`, { method: "DELETE" });
}
```

Create `src/api/siteContent.ts`:

```ts
import { api } from "./client";
import type { SiteContent } from "./types";

export async function getSiteContent(): Promise<SiteContent> {
  return (await api<{ data: SiteContent }>("/site-content")).data;
}
export async function updateSiteContent(content: SiteContent): Promise<SiteContent> {
  return (await api<{ data: SiteContent }>("/site-content", { method: "PUT", body: JSON.stringify(content) })).data;
}
```

- [ ] **Step 4: Verify typecheck + commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat(web): API resource modules"
```

Expected: no type errors.

---

### Task 17: Rewire StoreContext to the API

**Files:** Modify: `src/context/StoreContext.tsx`.

This is the central change. The reducer/action shapes stay; their **trigger functions** now call the API and dispatch on success. Server data is **loaded on mount** (and on login) instead of seeded from local files. Cart + toast stay local.

- [ ] **Step 1: Add bootstrap state + loaders**

In `src/context/StoreContext.tsx`:

1. Add to `State`: `loading: boolean`. Initialize `loading: true`, and set `products`, `categories`, `paymentMethods`, `orders`, `wishlist` to empty initial values; keep `siteContent: seedSiteContent` as the fallback until fetched.
2. Add action types: `{ type: "BOOTSTRAP"; payload: Partial<State> }` and `{ type: "SET_LOADING"; loading: boolean }`. Handle them in the reducer (BOOTSTRAP merges payload into state; SET_LOADING sets the flag).
3. Remove the `localStorage` seed-loading initializer **for server data**; keep a small `localStorage` only for **cart** (key `toolrack-cart`).

Replace the `useReducer` initializer and the persistence `useEffect`:

```tsx
const [state, dispatch] = useReducer(reducer, initialState, (init) => {
  try {
    const savedCart = localStorage.getItem("toolrack-cart");
    return savedCart ? { ...init, cart: JSON.parse(savedCart) } : init;
  } catch { return init; }
});

// persist cart only
useEffect(() => {
  localStorage.setItem("toolrack-cart", JSON.stringify(state.cart));
}, [state.cart]);
```

- [ ] **Step 2: Load server data on mount**

Add an effect that restores session + loads public data:

```tsx
useEffect(() => {
  let cancelled = false;
  (async () => {
    const [products, categories, paymentMethods, siteContent, user] = await Promise.all([
      productsApi.listProducts({ per_page: 200 }).then((r) => r.data).catch(() => []),
      categoriesApi.listCategories().catch(() => []),
      paymentMethodsApi.listPaymentMethods().catch(() => []),
      siteContentApi.getSiteContent().catch(() => seedSiteContent),
      authApi.me(),
    ]);
    if (cancelled) return;
    dispatch({ type: "BOOTSTRAP", payload: {
      products, categories, paymentMethods,
      siteContent: { ...seedSiteContent, ...siteContent },
      user: user ?? null,
    }});
    if (user) {
      const [orders, wishlist] = await Promise.all([
        ordersApi.listOrders().catch(() => []),
        wishlistApi.listWishlist().catch(() => []),
      ]);
      if (!cancelled) dispatch({ type: "BOOTSTRAP", payload: { orders, wishlist } });
    }
    if (!cancelled) dispatch({ type: "SET_LOADING", loading: false });
  })();
  return () => { cancelled = true; };
}, []);
```

Add the imports at the top:

```tsx
import * as authApi from "../api/auth";
import * as productsApi from "../api/products";
import * as categoriesApi from "../api/categories";
import * as ordersApi from "../api/orders";
import * as wishlistApi from "../api/wishlist";
import * as paymentMethodsApi from "../api/paymentMethods";
import * as siteContentApi from "../api/siteContent";
```

- [ ] **Step 3: Make mutators call the API**

Rewrite each mutator in the `value` object to call the API then dispatch (or refetch). Replace the bodies:

```tsx
login: async (email: string, password: string) => {
  const user = await authApi.login(email, password);
  dispatch({ type: "LOGIN", user });
  const [orders, wishlist] = await Promise.all([
    ordersApi.listOrders().catch(() => []),
    wishlistApi.listWishlist().catch(() => []),
  ]);
  dispatch({ type: "BOOTSTRAP", payload: { orders, wishlist } });
  return user;
},
register: async (name: string, email: string, password: string) => {
  const user = await authApi.register(name, email, password);
  dispatch({ type: "LOGIN", user });
  return user;
},
logout: async () => { await authApi.logout(); dispatch({ type: "LOGOUT" }); dispatch({ type: "BOOTSTRAP", payload: { orders: [], wishlist: [] } }); },

toggleWishlist: async (productId: number) => {
  const has = state.wishlist.includes(productId);
  dispatch({ type: "TOGGLE_WISHLIST", productId }); // optimistic
  try { has ? await wishlistApi.removeWishlist(productId) : await wishlistApi.addWishlist(productId); }
  catch { dispatch({ type: "TOGGLE_WISHLIST", productId }); } // revert
},

placeOrder: async (payload) => {
  const order = await ordersApi.placeOrder(payload);
  dispatch({ type: "PLACE_ORDER_RESULT", order });
  return order;
},
updateOrderStatus: async (orderId, status) => {
  const order = await ordersApi.updateOrderStatus(orderId, status);
  dispatch({ type: "UPDATE_ORDER_RESULT", order });
},

addProduct: async (input) => { const p = await productsApi.createProduct(input); dispatch({ type: "ADD_PRODUCT", product: p }); return p; },
updateProduct: async (p) => { const up = await productsApi.updateProduct(p.id, p); dispatch({ type: "UPDATE_PRODUCT", product: up }); },
deleteProduct: async (id) => { await productsApi.deleteProduct(id); dispatch({ type: "DELETE_PRODUCT", productId: id }); },

addCategory: async (name) => { const c = await categoriesApi.createCategory(name); dispatch({ type: "ADD_CATEGORY", category: c }); return c; },
updateCategory: async (c) => { const uc = await categoriesApi.updateCategory(c.id, c.name); dispatch({ type: "UPDATE_CATEGORY", category: uc }); },
deleteCategory: async (id) => { await categoriesApi.deleteCategory(id); dispatch({ type: "DELETE_CATEGORY", categoryId: id }); },

addPaymentMethod: async (m) => { const pm = await paymentMethodsApi.createPaymentMethod(m); dispatch({ type: "ADD_PAYMENT_METHOD", method: pm }); return pm; },
updatePaymentMethod: async (m) => { const pm = await paymentMethodsApi.updatePaymentMethod(m); dispatch({ type: "UPDATE_PAYMENT_METHOD", method: pm }); },
deletePaymentMethod: async (id) => { await paymentMethodsApi.deletePaymentMethod(id); dispatch({ type: "DELETE_PAYMENT_METHOD", methodId: id }); },
togglePaymentMethod: async (id) => {
  const m = state.paymentMethods.find((x) => x.id === id); if (!m) return;
  const pm = await paymentMethodsApi.updatePaymentMethod({ ...m, enabled: !m.enabled });
  dispatch({ type: "UPDATE_PAYMENT_METHOD", method: pm });
},
updateSiteContent: async (sc) => { const saved = await siteContentApi.updateSiteContent(sc); dispatch({ type: "UPDATE_SITE_CONTENT", siteContent: { ...seedSiteContent, ...saved } }); },
```

Add reducer cases `PLACE_ORDER_RESULT` (prepend order, clear cart) and `UPDATE_ORDER_RESULT` (replace matching order). Update the `StoreContextValue` type signatures to the new async forms and add `register` + `loading`.

> The `PLACE_ORDER` and `UPDATE_ORDER_STATUS` local action types are replaced by `PLACE_ORDER_RESULT` / `UPDATE_ORDER_RESULT` which take a server `order`. Remove the old client-side id/date generation.

- [ ] **Step 4: Typecheck (expect errors in pages — fixed in Task 18)**

```bash
npx tsc --noEmit
```

Expected: errors only in page components that call the changed signatures (Login, Account, Checkout, Admin, ProductCard). These are fixed next.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(web): rewire StoreContext to API (auth, catalog, orders, wishlist, cms)"
```

---

### Task 18: Update pages for async signatures + loading

**Files:** Modify: `src/pages/Login.tsx`, `Account.tsx`, `Admin.tsx`, `Shop.tsx`, `Home.tsx`, `ProductDetail.tsx`, `src/components/ProductCard.tsx`, `Header.tsx`.

- [ ] **Step 1: Login/register**

In `src/pages/Login.tsx`, make `submit` async and call `login(email, password)` / `register(name, email, password)`; navigate based on the returned `user.role`. Show an error message on `ApiError`. Remove the email-string role logic.

```tsx
async function submit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  try {
    const user = mode === "login"
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password);
    nav(user.role === "customer" ? "/account" : "/admin");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  }
}
```

Add `const [error, setError] = useState<string | null>(null);` and render it. Pull `register` from `useStore()`.

- [ ] **Step 2: Logout call sites**

`Account.tsx` calls `logout()` — now async; change the handler to `onClick={() => { logout(); }}` (fire-and-forget is fine) or `async`. No nav change needed.

- [ ] **Step 3: Async mutations in Admin**

In `src/pages/Admin.tsx`, the calls to `addProduct/updateProduct/deleteProduct/addCategory/updateCategory/deleteCategory/addPaymentMethod/updatePaymentMethod/deletePaymentMethod/togglePaymentMethod/updateOrderStatus/updateSiteContent` are now async and return Promises. Wrap submit handlers in `async`/`await` and `try/catch` showing the existing toast on error. The dispatch-driven UI already reacts to state, so most JSX is unchanged — only the handler functions become `async`.

Example for the product form submit:

```tsx
async function handleProductSubmit(e: React.FormEvent) {
  e.preventDefault();
  try {
    if (editingId) await updateProduct(buildProductFromForm());
    else await addProduct(buildProductFromForm());
    resetForm();
  } catch (err) {
    toast(err instanceof Error ? err.message : "Save failed");
  }
}
```

Apply the same async/try-catch wrapping to every admin mutation handler.

- [ ] **Step 4: Loading + empty states for fetched lists**

Add a loading guard using `state.loading`:
- `Home.tsx`, `Shop.tsx`: while `state.loading && state.products.length === 0`, render a simple centered "Loading…" block instead of empty grids.
- `ProductDetail.tsx`: products come from `state.products`; if `state.loading` and not found yet, show "Loading…" rather than a not-found message. Only show not-found once `!state.loading`.

Example guard (Shop.tsx, near top of render):

```tsx
if (state.loading && state.products.length === 0) {
  return <div className="max-w-7xl mx-auto px-4 py-24 text-center text-neutral-500">Loading products…</div>;
}
```

- [ ] **Step 5: toggleWishlist call sites**

`ProductCard.tsx`, `ProductDetail.tsx`, `Wishlist.tsx` call `toggleWishlist(id)` — now async but fire-and-forget; no change needed beyond it returning a Promise (ignore it). Confirm no `await` is required at these call sites.

- [ ] **Step 6: Typecheck + build**

```bash
npx tsc --noEmit
npm run build
```

Expected: no type errors; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(web): update pages for async store + loading states"
```

---

### Task 19: Real Stripe Elements at checkout

**Files:** Modify: `src/pages/Checkout.tsx`, `package.json`. Create: `src/components/StripeCardForm.tsx`.

- [ ] **Step 1: Install Stripe libs**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

- [ ] **Step 2: StripeCardForm component**

Create `src/components/StripeCardForm.tsx`:

```tsx
import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function StripeCardForm({ onConfirmed }: { onConfirmed: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true); setError(null);
    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message ?? "Card error"); setBusy(false); return; }
    const { error: confirmErr } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    setBusy(false);
    if (confirmErr) { setError(confirmErr.message ?? "Payment failed"); return; }
    onConfirmed();
  }

  return (
    <div className="space-y-3">
      <PaymentElement />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button type="button" disabled={busy} onClick={pay}
        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold uppercase rounded-sm">
        {busy ? "Processing…" : "Pay now"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Wire Checkout to PaymentIntent + Elements**

In `src/pages/Checkout.tsx`:
1. Import `loadStripe`, `Elements`, `createPaymentIntent`, `cartToItems`, `StripeCardForm`, `placeOrder`.
2. When the user reaches step 3 **and** the selected method is `stripe`, call `createPaymentIntent(cartToItems(state.cart))`, store `clientSecret`, and render `<Elements stripe={stripePromise} options={{ clientSecret }}>` wrapping `<StripeCardForm onConfirmed={completeOrder} />`.
3. `stripePromise = loadStripe(method.publicKey!)` (from the selected payment method).
4. `completeOrder()` calls `placeOrder({ items: cartToItems(state.cart), paymentMethod: method.name, stripePaymentIntentId: intentId, ...shippingFields })` then `nav("/order-success")`.
5. For non-stripe methods, the existing manual flow calls `placeOrder({ ...no intent })` on submit.

Concrete additions:

```tsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCardForm from "../components/StripeCardForm";
import { createPaymentIntent } from "../api/payments";
import { cartToItems } from "../api/orders";

// inside component:
const { placeOrder } = useStore();
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [intentId, setIntentId] = useState<string | null>(null);
const selected = enabledMethods.find((m) => m.id === selectedMethodId);
const stripePromise = useMemo(
  () => (selected?.type === "stripe" && selected.publicKey ? loadStripe(selected.publicKey) : null),
  [selected?.id],
);

useEffect(() => {
  if (step === 3 && selected?.type === "stripe" && !clientSecret) {
    createPaymentIntent(cartToItems(state.cart))
      .then((r) => { setClientSecret(r.clientSecret); setIntentId(r.intentId); })
      .catch(() => {});
  }
}, [step, selected?.id]);

async function completeOrder() {
  await placeOrder({
    items: cartToItems(state.cart),
    paymentMethod: selected?.name ?? "Manual Payment",
    stripePaymentIntentId: intentId ?? undefined,
    email: form.email, phone: form.phone, firstName: form.firstName, lastName: form.lastName,
    address: form.address, city: form.city, state: form.state, zip: form.zip,
  });
  nav("/order-success");
}
```

Replace the stripe branch of the step-3 JSX (the demo card inputs) with:

```tsx
{selected?.type === "stripe" ? (
  clientSecret && stripePromise ? (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCardForm onConfirmed={completeOrder} />
    </Elements>
  ) : <div className="text-xs text-neutral-500">Preparing secure payment…</div>
) : ( /* existing manual instructions block */ )}
```

For non-stripe methods, change the final "Place Order" submit to call `completeOrder()` (no intent id) instead of the old local `placeOrder`.

- [ ] **Step 4: Typecheck + build**

```bash
npx tsc --noEmit
npm run build
```

Expected: no type errors; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(web): real Stripe Elements checkout via PaymentIntent"
```

---

### Task 20: End-to-end manual verification

**Files:** none (verification only).

- [ ] **Step 1: Start both servers**

```bash
# Terminal A
cd backend && php artisan serve
# Terminal B (repo root)
npm run dev
```

- [ ] **Step 2: Seed if needed + set Stripe test keys**

Put real Stripe **test** keys in `backend/.env` (`STRIPE_KEY`, `STRIPE_SECRET`), then:

```bash
cd backend && php artisan migrate:fresh --seed
```

Also set the seeded Stripe payment method's `public_key` to your `pk_test_...` (via Admin → Payments, or it picks up `STRIPE_KEY` from the seeder).

- [ ] **Step 3: Verify flows in the browser** (`http://localhost:5173`)

Confirm each:
- Home/Shop load products from the API (Network tab shows `/api/products`).
- Register a new account → lands on Account.
- Log in as `admin@toolrack.com` / `SEED_PASSWORD` → Admin panel loads; create/edit/delete a product persists across refresh.
- Add to cart → checkout → choose card → Stripe Elements appears → pay with test card `4242 4242 4242 4242` → order success; order appears under Account and Admin → Orders.
- Wishlist toggle persists across refresh while logged in.
- Edit a Content field in Admin → reflected on the storefront after refresh.

- [ ] **Step 4: Final commit (docs/readme)**

Create `backend/README-DEV.md` documenting: env vars, `migrate:fresh --seed`, seeded accounts + `SEED_PASSWORD`, how to run both servers, Stripe test keys.

```bash
git add -A
git commit -m "docs: dev setup notes for backend + frontend"
```

---

## Self-review notes (addressed)

- **Spec coverage:** auth (T7), roles (T8), products+filters+admin CRUD (T9), categories (T10), Stripe intent w/ server totals (T11), orders+stock+verification (T12), admin orders/payment-config/CMS/customers (T13), wishlist (T14), React api layer (T15–16), StoreContext rewire (T17), pages/async/loading (T18), Stripe Elements (T19), e2e verification (T20). Seeders port catalog + content (T5–6).
- **camelCase contract:** ProductResource/OrderResource/PaymentMethod resources emit the exact key names the React types already use (`oldPrice`, `shortDesc`, `emoji` for image), so no frontend type changes are needed.
- **Totals are computed server-side** in `PaymentController::totalsFor()` and reused by both intent creation and order placement — single source of truth, matches the frontend's shipping(≥199 free / else 14.99) + 8% tax rule.
