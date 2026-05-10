<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{

    protected $fillable = [
        'title',
        'description',
        'company',
        'location',
        'latitude',
        'longitude',
        'category',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'job_applications')
            ->withTimestamps();
    }
}
