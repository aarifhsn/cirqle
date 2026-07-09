<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use App\Models\PostLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $authUser = $request->user();

        $savedIds = $authUser->savedPosts()->pluck('post_id')->toArray();
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
            if (!$authUser->latitude || !$authUser->longitude) {
                $query->where('privacy', 'public');
            } else {
                // PHP haversine — works on both SQLite and MySQL
                $lat = $authUser->latitude;
                $lng = $authUser->longitude;
                $radius = 50; // km

                $nearbyUserIds = \App\Models\User::whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->where('id', '!=', $authUser->id)
                    ->get()
                    ->filter(function ($u) use ($lat, $lng, $radius) {
                        $dLat = deg2rad($u->latitude - $lat);
                        $dLon = deg2rad($u->longitude - $lng);
                        $a = sin($dLat / 2) * sin($dLat / 2)
                            + cos(deg2rad($lat)) * cos(deg2rad($u->latitude))
                            * sin($dLon / 2) * sin($dLon / 2);
                        $distance = 6371 * 2 * atan2(sqrt($a), sqrt(1 - $a));
                        return $distance <= $radius;
                    })
                    ->pluck('id');

                $query->whereIn('user_id', $nearbyUserIds)
                    ->where('privacy', 'public');
            }
        } else if ($filter === 'circles') {
            // get circle IDs the user is a member of
            $userCircleIds = $authUser->circles()->pluck('circles.id');

            $query->where('privacy', 'circles')
                ->whereIn('circle_id', $userCircleIds);

        } else {
            $userCircleIds = $authUser->circles()->pluck('circles.id');

            $query->where(function ($q) use ($authUser, $followingIds, $userCircleIds) {
                $q->where('privacy', 'public')
                    ->orWhere('user_id', $authUser->id)
                    ->orWhere(function ($q2) use ($followingIds) {
                        $q2->where('privacy', 'followers')
                            ->whereIn('user_id', $followingIds);
                    })
                    ->orWhere(function ($q3) use ($userCircleIds) {
                        $q3->where('privacy', 'circles')
                            ->whereIn('circle_id', $userCircleIds);
                    });
            });
        }

        $paginated = $query->paginate(10);

        return response()->json([
            'data' => collect($paginated->items())->map(fn($post) => $this->formatPost($post, $authUser, $savedIds)),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'has_more' => $paginated->hasMorePages(),
        ]);
    }

    public function show($id)
    {
        $authUser = auth()->user();

        $post = Post::with([
            'author',
            'comments.author',
            'comments.replies.author',
            'images',
            'likes',
        ])->findOrFail($id);

        $savedIds = $authUser->savedPosts()->pluck('post_id')->toArray();

        return response()->json($this->formatPost($post, $authUser, $savedIds));
    }

    public function store(Request $request)
    {

        $request->validate([
            'content' => 'nullable|string',
            'type' => 'nullable|in:text,photo,poll,mood',
            'poll_options' => 'nullable|array|min:2',
            'poll_options.*' => 'string',
            'poll_duration' => 'nullable|integer',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:4096',
            'privacy' => 'nullable|in:public,followers,circles,only_me',
            'circle_id' => 'nullable|exists:circles,id',
        ]);

        // 👇 block a genuinely empty post — no text, no image, no poll
        if (
            !$request->filled('content') &&
            !$request->hasFile('images') &&
            !$request->filled('poll_options')
        ) {
            return response()->json([
                'message' => 'Post must include text, an image, or poll options.',
                'errors' => [
                    'content' => ['Please add some text, an image, or create a poll.'],
                ],
            ], 422);
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
            'privacy' => $request->input('privacy'),
            'circle_id' => $request->input('circle_id'),
            'type' => $request->input('type', 'text'),
            'poll_options' => $request->input('poll_options'),
            'poll_duration' => $request->input('poll_duration'),

        ]);

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

        if ($post->user_id != $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'nullable|string',
            'type' => 'nullable|in:text,photo,poll,mood',
            'poll_options' => 'nullable|array|min:2',
            'poll_options.*' => 'string',
            'poll_duration' => 'nullable|integer',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:4096',
            'privacy' => 'required|in:public,followers,circles,only_me',
            'removed_images' => 'nullable|array',
            'removed_images.*' => 'integer',
        ]);

        // how many images will this post actually have once this update applies?
        $remainingImages = $post->images()->count()
            - count($request->input('removed_images', []))
            + count($request->file('images', []));

        if (!$request->filled('content') && $remainingImages <= 0 && !$post->poll_options) {
            return response()->json([
                'message' => 'Post must include text, an image, or poll options.',
                'errors' => [
                    'content' => ['Please add some text, an image, or create a poll.'],
                ],
            ], 422);
        }

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

        if ($post->user_id != $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
                'auth_id' => $request->user()?->id,
                'post_user_id' => $post->user_id,
            ], 403);
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
                'username' => $c->author->username,
            ],
            'replies' => $c->replies->map(fn($r) => [
                'id' => $r->id,
                'comment' => $r->comment,
                'createdAt' => $r->created_at,
                'author' => [
                    'id' => $r->author->id,
                    'name' => $r->author->firstName . ' ' . $r->author->lastName,
                    'avatar' => $r->author->avatar,
                    'username' => $r->author->username,
                ],
                'replies' => [], // one level deep only
            ])->values()->toArray(),
        ];
    }

    public function formatPost(Post $post, $authUser = null, array $savedIds = []): array
    {
        $authUser = $authUser ?? auth()->user();
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
            'is_saved' => in_array($post->id, $savedIds),
            'type' => $post->type,
            'poll_options' => $post->poll_options,
            'poll_duration' => $post->poll_duration,
            'votes' => DB::table('poll_votes')
                ->where('post_id', $post->id)
                ->selectRaw('option_index, count(*) as count')
                ->groupBy('option_index')
                ->pluck('count', 'option_index')
                ->map(fn($c) => (int) $c),
            'user_vote' => $authUser ? DB::table('poll_votes')
                ->where('post_id', $post->id)
                ->where('user_id', $authUser->id)
                ->value('option_index') : null,
        ];
    }

    public function save(Request $request, Post $post)
    {
        $user = $request->user();
        $isSaved = $user->savedPosts()->where('post_id', $post->id)->exists();

        if ($isSaved) {
            $user->savedPosts()->detach($post->id);
        } else {
            $user->savedPosts()->attach($post->id);
        }

        return response()->json([
            'is_saved' => !$isSaved,
            'message' => $isSaved ? 'Post unsaved.' : 'Post saved!',
        ]);
    }

    public function saved(Request $request)
    {
        $posts = $request->user()
            ->savedPosts()
            ->with(['author', 'likes', 'comments.author', 'comments.replies.author', 'images'])
            ->latest('saved_posts.created_at')
            ->get();

        $savedIds = $posts->pluck('id')->toArray();

        return response()->json([
            'data' => $posts->map(fn($post) => $this->formatPost($post, $request->user(), $savedIds)),
        ]);



    }

    public function vote(Request $request, Post $post)
    {
        $request->validate([
            'option_index' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        $options = $post->poll_options;
        $index = $request->option_index;

        if (!isset($options[$index])) {
            return response()->json(['message' => 'Invalid option.'], 422);
        }

        // store votes in a separate table or as json — check your migration
        // if you have a poll_votes table:
        $existing = DB::table('poll_votes')
            ->where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            // update vote
            DB::table('poll_votes')
                ->where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->update(['option_index' => $index]);
        } else {
            DB::table('poll_votes')->insert([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'option_index' => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // return vote counts per option
        $votes = DB::table('poll_votes')
            ->where('post_id', $post->id)
            ->selectRaw('option_index, count(*) as count')
            ->groupBy('option_index')
            ->pluck('count', 'option_index');

        return response()->json([
            'votes' => $votes,
            'user_vote' => $index,
        ]);
    }
}