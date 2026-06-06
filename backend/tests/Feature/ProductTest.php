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
