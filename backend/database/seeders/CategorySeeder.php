<?php
namespace Database\Seeders;
use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder {
    public function run(): void {
        $data = require database_path('data/products_seed.php');
        foreach ($data['categories'] as $c) {
            Category::updateOrCreate(['id' => $c['id']], $c);
        }
    }
}
