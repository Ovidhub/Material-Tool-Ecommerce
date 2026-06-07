<?php
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use function Pest\Laravel\postJson;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('emails a reset link to a customer', function () {
    Notification::fake();
    $user = User::factory()->create(['role' => 'customer']);
    postJson('/api/forgot-password', ['email' => $user->email])->assertOk();
    Notification::assertSentTo($user, ResetPassword::class);
});

it('does NOT email a reset link to an admin (customers only) but still returns 200', function () {
    Notification::fake();
    $admin = User::factory()->create(['role' => 'admin']);
    postJson('/api/forgot-password', ['email' => $admin->email])->assertOk();
    Notification::assertNothingSent();
});

it('returns a generic 200 for an unknown email (no enumeration)', function () {
    Notification::fake();
    postJson('/api/forgot-password', ['email' => 'nobody@example.com'])->assertOk();
    Notification::assertNothingSent();
});

it('resets a customer password with a valid token', function () {
    $user = User::factory()->create(['role' => 'customer', 'password' => bcrypt('oldpass123')]);
    $token = Password::createToken($user);
    postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => $token,
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ])->assertOk();
    expect(Hash::check('newpass123', $user->fresh()->password))->toBeTrue();
});

it('rejects an invalid token', function () {
    $user = User::factory()->create(['role' => 'customer', 'password' => bcrypt('oldpass123')]);
    postJson('/api/reset-password', [
        'email' => $user->email,
        'token' => 'totally-wrong-token',
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ])->assertStatus(422);
    expect(Hash::check('oldpass123', $user->fresh()->password))->toBeTrue();
});

it('does NOT reset an admin password via the email flow', function () {
    $admin = User::factory()->create(['role' => 'admin', 'password' => bcrypt('oldpass123')]);
    $token = Password::createToken($admin);
    postJson('/api/reset-password', [
        'email' => $admin->email,
        'token' => $token,
        'password' => 'newpass123',
        'password_confirmation' => 'newpass123',
    ])->assertStatus(422);
    expect(Hash::check('oldpass123', $admin->fresh()->password))->toBeTrue();
});
