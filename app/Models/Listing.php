<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Override;

class Listing extends Model
{
    protected $fillable = [
        'title',
        'description',
        'price',
        'category',
        'images',
        'location',
        'latitude',
        'longitude',
        'user_id',
        'status',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'listing_applications')
            ->withTimestamps();
    }
}
