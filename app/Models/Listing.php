<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    protected $fillable = [
        'title',
        'price',
        'description',
        'location',
        'latitude',
        'longitude',
        'category',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'listing_applications')
            ->withTimestamps();
    }
}
