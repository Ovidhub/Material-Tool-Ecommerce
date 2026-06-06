<?php
namespace Database\Seeders;
use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder {
    public function run(): void {
        PaymentMethod::updateOrCreate(['id' => 'stripe-default'], [
            'type' => 'stripe',
            'name' => 'Credit / Debit Card',
            'enabled' => true,
            'mode' => 'test',
            'public_key' => env('STRIPE_KEY', 'pk_test_demo'),
            'secret_key' => env('STRIPE_SECRET'),
            'instructions' => 'Cards are processed securely through Stripe.',
        ]);
    }
}
