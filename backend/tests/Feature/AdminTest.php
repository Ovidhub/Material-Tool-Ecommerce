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
