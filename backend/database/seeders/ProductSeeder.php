<?php
namespace Database\Seeders;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder {
    public function run(): void {
        $data = require database_path('data/products_seed.php');
        foreach ($data['products'] as $p) {
            Product::updateOrCreate(['id' => $p['id']], $p);
        }
    }
}
