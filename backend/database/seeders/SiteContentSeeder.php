<?php
namespace Database\Seeders;
use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder {
    public function run(): void {
        $content = require database_path('data/site_content_seed.php');
        $row = SiteContent::first();
        if ($row) { $row->update(['content' => $content]); }
        else { SiteContent::create(['content' => $content]); }
    }
}
