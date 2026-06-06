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
