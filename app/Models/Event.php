<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $table = 'events';

    protected $fillable = [
        'title',
        'description',
        'emoji',
        'location',
        'latitude',
        'longitude',
        'cover_image',
        'category',
        'user_id',
        'attendees_count',
        'start_date',
        'end_date',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'event_rsvps')
            ->withTimestamps();
    }
    public function attendees()
    {
        return $this->belongsToMany(User::class, 'event_user');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
