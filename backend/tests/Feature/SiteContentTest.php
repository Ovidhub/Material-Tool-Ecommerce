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
