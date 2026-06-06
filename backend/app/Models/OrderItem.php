<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model {
    protected $fillable = ['order_id','product_id','name','price','image','qty'];
    protected $casts = ['price' => 'float', 'qty' => 'int', 'product_id' => 'int'];
}
