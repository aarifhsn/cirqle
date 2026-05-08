<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\User;
use App\Models\PostLike;
use App\Models\Comment;
use App\Models\PostImage;

class Post extends Model
{
    protected $fillable = ['user_id', 'content', 'image', 'privacy'];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function likes()
    {
        return $this->hasMany(PostLike::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class)->with('author');
    }

    public function images()
    {
        return $this->hasMany(PostImage::class)->orderBy('order');
    }
}
