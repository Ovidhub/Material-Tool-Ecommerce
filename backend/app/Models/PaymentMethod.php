<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model {
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'id','type','name','enabled','mode','public_key','secret_key',
        'client_id','client_secret','wallet_address','network','instructions',
    ];
    protected $casts = ['enabled' => 'boolean'];
}
