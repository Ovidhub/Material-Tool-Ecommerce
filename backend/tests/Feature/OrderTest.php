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

it('rejects an order that exceeds available stock and writes nothing', function () {
    $user = User::factory()->create();
    $p = seedProduct(['stock' => 3]);
    postJson('/api/orders', [
        'items' => [['productId' => $p->id, 'qty' => 5]],
        'paymentMethod' => 'Bank Transfer',
    ], authHeader($user))->assertStatus(422);
    expect(App\Models\Order::count())->toBe(0);
    expect($p->fresh()->stock)->toBe(3);
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
