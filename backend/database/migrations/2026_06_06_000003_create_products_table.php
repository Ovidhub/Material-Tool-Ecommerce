<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category');
            $table->string('subcategory')->default('');
            $table->decimal('price', 10, 2);
            $table->decimal('old_price', 10, 2)->nullable();
            $table->float('rating')->default(5);
            $table->integer('reviews')->default(0);
            $table->integer('stock')->default(0);
            $table->string('sku')->default('');
            $table->string('brand')->default('');
            $table->string('badge')->nullable();
            $table->text('short_desc')->default('');
            $table->text('description')->default('');
            $table->json('features');
            $table->json('specs');
            $table->text('image')->default('');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('products'); }
};
