<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Product extends Model {
    protected $fillable = [
        'name','slug','category','subcategory','price','old_price','rating',
        'reviews','stock','sku','brand','badge','short_desc','description',
        'features','specs','image',
    ];
    protected $casts = [
        'features' => 'array', 'specs' => 'array',
        'price' => 'float', 'old_price' => 'float', 'rating' => 'float',
    ];
}
