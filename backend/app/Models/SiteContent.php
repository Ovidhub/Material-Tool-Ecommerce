<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model {
    protected $table = 'site_content';
    protected $fillable = ['content'];
    protected $casts = ['content' => 'array'];
}
