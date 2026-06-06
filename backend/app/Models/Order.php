<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'id','user_id','subtotal','shipping','tax','total','status','payment_method',
        'stripe_payment_intent_id','email','phone','first_name','last_name',
        'address','city','state','zip',
    ];
    protected $casts = ['subtotal'=>'float','shipping'=>'float','tax'=>'float','total'=>'float'];
    public function items() { return $this->hasMany(OrderItem::class); }
    public function user() { return $this->belongsTo(User::class); }
}
