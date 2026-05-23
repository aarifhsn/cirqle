<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Database\Factories\CircleFactory;

class Circle extends Model
{
    /** @use HasFactory<CircleFactory> */
    use HasFactory;
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
