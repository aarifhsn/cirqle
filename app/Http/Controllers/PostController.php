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

        $query = Post::with(['author', 'likes', 'comments.author'])->latest();

        if ($filter === 'following') {
            // only posts from people I follow + my own, respecting privacy
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

        $posts = $query->get()->map(fn($post) => $this->formatPost($post));

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'photo' => 'nullable|image|max:4096',
            'privacy' => 'required|in:public,followers,only_me',
        ]);

        $imagePath = null;
        if ($request->hasFile('photo')) {
            $imagePath = $request->file('photo')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
            'image' => $imagePath,
            'privacy' => $request->input('privacy'),
        ]);

        $post->load(['author', 'likes', 'comments.author']);

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
            'photo' => 'nullable|image|max:4096',
            'privacy' => 'required|in:public,followers,only_me',
        ]);

        if ($request->hasFile('photo')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $post->image = $request->file('photo')->store('posts', 'public');
        }

        $post->content = $request->content;
        $post->privacy = $request->input('privacy');
        $post->save();
        $post->load(['author', 'likes', 'comments.author']);

        return response()->json($this->formatPost($post));
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
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
        }

        $post->load('likes');

        return response()->json([
            'likes' => $post->likes->pluck('user_id'),
        ]);
    }

    public function comment(Request $request, $id)
    {
        $request->validate(['comment' => 'required|string']);

        $post = Post::findOrFail($id);

        Comment::create([
            'post_id' => $id,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
            'parent_id' => $request->input('parent_id'),
        ]);

        $post->load('comments.author');

        return response()->json([
            'comments' => $post->comments->map(fn($c) => [
                'id' => $c->id,
                'comment' => $c->comment,
                'createdAt' => $c->created_at,
                'author' => [
                    'id' => $c->author->id,
                    'name' => $c->author->firstName . ' ' . $c->author->lastName,
                    'avatar' => $c->author->avatar,
                    'username' => $c->author->username,
                ],
            ]),
        ]);
    }

    public function formatPost(Post $post): array
    {
        return [
            'id' => $post->id,
            'content' => $post->content,
            'privacy' => $post->privacy,
            'image' => $post->image,
            'createAt' => $post->created_at,
            'author' => [
                'id' => $post->author->id,
                'name' => $post->author->firstName . ' ' . $post->author->lastName,
                'avatar' => $post->author->avatar,
                'username' => $post->author->username,
            ],
            'likes' => $post->likes->pluck('user_id'),
            'comments' => $post->comments->map(fn($c) => [
                'id' => $c->id,
                'comment' => $c->comment,
                'createdAt' => $c->created_at,
                'author' => [
                    'id' => $c->author->id,
                    'name' => $c->author->firstName . ' ' . $c->author->lastName,
                    'avatar' => $c->author->avatar,
                    'username' => $c->author->username,
                ],
            ]),
        ];
    }
}