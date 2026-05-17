<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Circle extends Model
{
    protected $table = 'circles';

    protected $fillable = [
        'name',
        'description',
        'emoji',
        'location',
        'latitude',
        'longitude',
        'category',
        'members_count',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
