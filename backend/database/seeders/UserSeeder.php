<?php
namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder {
    public function run(): void {
        $password = Hash::make(env('SEED_PASSWORD', 'password123'));
        $users = [
            ['name' => 'Super Admin', 'email' => 'super@toolrack.com', 'role' => 'super_admin'],
            ['name' => 'Store Admin', 'email' => 'admin@toolrack.com', 'role' => 'admin'],
            ['name' => 'Demo Customer', 'email' => 'customer@toolrack.com', 'role' => 'customer'],
        ];
        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], [
                'name' => $u['name'],
                'password' => $password,
                'role' => $u['role'],
                'avatar' => strtoupper($u['name'][0]),
            ]);
        }
    }
}
