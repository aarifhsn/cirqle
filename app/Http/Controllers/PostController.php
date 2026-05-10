<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use App\Models\PostLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $authUser = $request->user();
        $filter = $request->query('filter', 'public');

        $followingIds = $authUser->following()->pluck('following_id');

        $query = Post::with(['author', 'likes', 'comments.author', 'comments.replies.author', 'images'])->latest();

        if ($filter === 'following') {
            // only posts from people I follow + my own, respecting privacy
            $query->whereIn('user_id', $followingIds)
                ->where(function ($q) use ($authUser, $followingIds) {
                    $q->where('privacy', 'public')
                        ->orWhere('privacy', 'followers');
                });
        } else if ($filter === 'nearby') {
            // only posts from people I follow + my own, respecting privacy
            // but only if they are nearby (for simplicity, let's say within 50km)
            $query->whereIn('user_id', $followingIds)
                ->where(function ($q) use ($authUser, $followingIds) {
                    $q->where('privacy', 'public')
                        ->orWhere('privacy', 'followers');
                })
                ->whereHas('author', function ($q) use ($authUser) {
                    $q->whereRaw('ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) <= ?', [
                        $authUser->longitude,
                        $authUser->latitude,
                        50000 // 50km in meters
                    ]);
                });
        } else if ($filter === 'circles') {
            // only posts from people I follow + my own, respecting privacy
            // but only if they are in a circle (for simplicity, let's say within 50km)
            $query->whereIn('user_id', $followingIds)
                ->where(function ($q) use ($authUser, $followingIds) {
                    $q->where('privacy', 'public')
                        ->orWhere('privacy', 'followers');
                });
        } else {
            // public feed — all public posts + followers-only from people I follow + my own
            $query->where(function ($q) use ($authUser, $followingIds) {
                $q->where('privacy', 'public')
                    ->orWhere('user_id', $authUser->id)
                    ->orWhere(function ($q2) use ($followingIds) {
                        $q2->where('privacy', 'followers')
                            ->whereIn('user_id', $followingIds);
                    });
            });
        }

        $paginated = $query->paginate(10);

        return response()->json([
            'data' => collect($paginated->items())->map(fn($post) => $this->formatPost($post)),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'has_more' => $paginated->hasMorePages(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:4096',
            'privacy' => 'required|in:public,followers,only_me',
        ]);

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
            'privacy' => $request->input('privacy'),
        ]);

        // 👇 this block was missing in your store method
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('posts', 'public');
                $post->images()->create(['image' => $path, 'order' => $index]);
            }
        }

        $post->load(['author', 'likes', 'comments.author', 'comments.replies.author', 'images']);

        return response()->json($this->formatPost($post));
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:4096',
            'privacy' => 'required|in:public,followers,only_me',
            'removed_images' => 'nullable|array',
            'removed_images.*' => 'integer',
        ]);

        // remove deleted images
        if ($request->has('removed_images')) {
            $toRemove = $post->images()->whereIn('id', $request->removed_images)->get();
            foreach ($toRemove as $img) {
                Storage::disk('public')->delete($img->image);
                $img->delete();
            }
        }

        // add new images
        if ($request->hasFile('images')) {
            $currentCount = $post->images()->count();
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('posts', 'public');
                $post->images()->create(['image' => $path, 'order' => $currentCount + $index]);
            }
        }

        $post->content = $request->content;
        $post->privacy = $request->input('privacy');
        $post->save();
        $post->load(['author', 'likes', 'comments.author', 'comments.replies.author', 'images']);

        return response()->json($this->formatPost($post));
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // delete all associated images from storage
        foreach ($post->images as $img) {
            Storage::disk('public')->delete($img->image);
        }

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted', 'id' => $id]);
    }

    public function like(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $userId = $request->user()->id;
        $request->validate(['reaction_type' => 'in:like,love,haha,sad,angry']);

        $existing = PostLike::where('post_id', $id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            PostLike::create([
                'post_id' => $id,
                'user_id' => $userId,
                'reaction_type' => $request->reaction_type
            ]);

            // notify post owner (not self)
            if ($post->user_id !== $userId) {
                $post->author->notify(
                    new \App\Notifications\PostLikedNotification($request->user(), $post)
                );
            }
        }

        $post->load('likes');

        return response()->json([
            'likes' => $post->likes->pluck('user_id'),
        ]);
    }

    public function comment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $post = Post::findOrFail($id);

        Comment::create([
            'post_id' => $id,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
            'parent_id' => $request->input('parent_id', null),
        ]);

        // notify post owner (not self)
        if ($post->user_id !== $request->user()->id) {
            $post->author->notify(
                new \App\Notifications\PostCommentedNotification(
                    $request->user(),
                    $post,
                    $request->comment
                )
            );
        }

        $post->load('comments.author', 'comments.replies.author');

        // only return top-level comments with replies nested inside
        $comments = $post->comments
            ->whereNull('parent_id')
            ->values()
            ->map(fn($c) => $this->formatComment($c));

        return response()->json(['comments' => $comments]);
    }

    private function formatComment($c): array
    {
        return [
            'id' => $c->id,
            'comment' => $c->comment,
            'createdAt' => $c->created_at,
            'author' => [
                'id' => $c->author->id,
                'name' => $c->author->firstName . ' ' . $c->author->lastName,
                'avatar' => $c->author->avatar,
            ],
            'replies' => $c->replies->map(fn($r) => [
                'id' => $r->id,
                'comment' => $r->comment,
                'createdAt' => $r->created_at,
                'author' => [
                    'id' => $r->author->id,
                    'name' => $r->author->firstName . ' ' . $r->author->lastName,
                    'avatar' => $r->author->avatar,
                ],
                'replies' => [], // one level deep only
            ])->values()->toArray(),
        ];
    }

    public function formatPost(Post $post): array
    {
        return [
            'id' => $post->id,
            'content' => $post->content,
            'privacy' => $post->privacy,
            'image' => $post->image,
            'images' => $post->images->map(fn($img) => [
                'id' => $img->id,
                'image' => $img->image,
                'order' => $img->order,
            ]),
            'createAt' => $post->created_at,
            'author' => [
                'id' => $post->author->id,
                'name' => $post->author->firstName . ' ' . $post->author->lastName,
                'avatar' => $post->author->avatar,
                'username' => $post->author->username,
            ],
            'likes' => $post->likes->pluck('user_id'),
            'comments' => $post->comments
                ->whereNull('parent_id')
                ->values()
                ->map(fn($c) => $this->formatComment($c)),
        ];
    }
}