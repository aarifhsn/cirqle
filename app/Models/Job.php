<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $table = 'job_postings';

    protected $fillable = [
        'title',
        'description',
        'company',
        'location',
        'latitude',
        'longitude',
        'category',
        'type',
        'salary',
        'tags',
        'user_id',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'job_applications')
            ->withTimestamps();
    }

    public function poster()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
