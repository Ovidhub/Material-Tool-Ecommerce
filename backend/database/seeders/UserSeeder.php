<?php
namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder {
    public function run(): void {
        $password = Hash::make(env('SEED_PASSWORD', 'password123'));
        $users = [
            ['name' => 'Super Admin', 'email' => 'super@hechimaterial.online', 'role' => 'super_admin'],
            ['name' => 'Store Admin', 'email' => 'admin@hechimaterial.online', 'role' => 'admin'],
            ['name' => 'Demo Customer', 'email' => 'customer@hechimaterial.online', 'role' => 'customer'],
        ];
        foreach ($users as $u) {
            // firstOrCreate: never overwrites an existing account's password on re-seed.
            User::firstOrCreate(['email' => $u['email']], [
                'name' => $u['name'],
                'password' => $password,
                'role' => $u['role'],
                'avatar' => strtoupper($u['name'][0]),
            ]);
        }
    }
}
