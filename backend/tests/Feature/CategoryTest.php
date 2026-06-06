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
