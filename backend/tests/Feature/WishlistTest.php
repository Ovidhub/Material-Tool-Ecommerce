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
