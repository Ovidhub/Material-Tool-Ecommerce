<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('product_id');
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('type');
            $table->string('name');
            $table->boolean('enabled')->default(true);
            $table->string('mode')->default('test');
            $table->string('public_key')->nullable();
            $table->string('secret_key')->nullable();
            $table->string('client_id')->nullable();
            $table->string('client_secret')->nullable();
            $table->string('wallet_address')->nullable();
            $table->string('network')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamps();
        });
        Schema::create('site_content', function (Blueprint $table) {
            $table->id();
            $table->json('content');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('site_content');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('wishlist_items');
    }
};
