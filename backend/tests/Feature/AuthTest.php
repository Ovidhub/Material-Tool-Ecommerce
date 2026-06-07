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

it('lets an authenticated user change their password with the correct current password', function () {
    $user = User::factory()->create(['password' => bcrypt('oldpass123')]);
    $token = $user->createToken('t')->plainTextToken;
    postJson('/api/user/password', [
        'current_password' => 'oldpass123',
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ], ['Authorization' => "Bearer $token"])->assertOk();
    expect(\Illuminate\Support\Facades\Hash::check('newpass123', $user->fresh()->password))->toBeTrue();
});

it('rejects a password change when the current password is wrong', function () {
    $user = User::factory()->create(['password' => bcrypt('oldpass123')]);
    $token = $user->createToken('t')->plainTextToken;
    postJson('/api/user/password', [
        'current_password' => 'wrongpass',
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ], ['Authorization' => "Bearer $token"])->assertStatus(422);
    expect(\Illuminate\Support\Facades\Hash::check('oldpass123', $user->fresh()->password))->toBeTrue();
});

it('requires authentication to change a password', function () {
    postJson('/api/user/password', [
        'current_password' => 'x', 'password' => 'newpass123', 'password_confirmation' => 'newpass123',
    ])->assertStatus(401);
});
