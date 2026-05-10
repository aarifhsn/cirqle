<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $table = 'events';

    protected $fillable = [
        'name',
        'description',
        'emoji',
        'location',
        'latitude',
        'longitude',
        'category',
        'attendees_count',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'event_rsvps')
            ->withTimestamps();
    }
}
