<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model {
    protected $fillable = ['user_id', 'product_id'];
    protected $casts = ['product_id' => 'int'];
}
