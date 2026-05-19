<?php

namespace App\Http\Controllers;

use App\Models\Circle;
use Illuminate\Http\Request;
use App\Http\Controllers\PostController;

class CircleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $circles = Circle::withCount(['users', 'posts'])->latest()->get()->map(fn($c) => [
            ...$c->toArray(),
            'is_member' => $c->users()->where('user_id', $user->id)->exists(),
        ]);

        return response()->json($circles);
    }

    public function show(Request $request, Circle $circle)
    {
        $user = $request->user();

        $circle->loadCount(['users', 'posts']);
        $circle->load('users:id,firstName,lastName,avatar,username');

        $posts = $circle->posts()
            ->with(['author', 'likes', 'comments.author', 'comments.replies.author', 'images'])
            ->latest()
            ->get()
            ->map(fn($post) => app(PostController::class)->formatPost($post, $user));

        return response()->json([
            ...$circle->toArray(),
            'is_member' => $circle->users()->where('user_id', $user->id)->exists(),
            'members' => $circle->users->map(fn($u) => [
                'id' => $u->id,
                'firstName' => $u->firstName,
                'lastName' => $u->lastName,
                'username' => $u->username,
                'avatar' => $u->avatar,
                'role' => $u->pivot->role,
            ]),
            'posts' => $posts,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:circles',
            'description' => 'nullable|string',
            'emoji' => 'nullable|string|max:10',
            'location' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'category' => 'nullable|string|max:100',
        ]);

        $circle = Circle::create([
            ...$data,
            'members_count' => 1,
        ]);

        $circle->users()->attach($request->user()->id, [
            'role' => 'admin'
        ]);

        return response()->json([
            ...$circle->toArray(),
            'is_member' => true,
        ], 201);
    }

    public function join(Request $request, Circle $circle)
    {
        $userId = $request->user()->id;
        $isMember = $circle->users()->where('user_id', $userId)->exists();

        if ($isMember) {
            $circle->users()->detach($userId);
            $isMember = false;
        } else {
            $circle->users()->attach($userId, ['role' => 'member']);
            $isMember = true;
        }

        return response()->json([
            'message' => $isMember ? 'Joined circle.' : 'Left circle.',
            'is_member' => $isMember,
        ]);
    }

    public function leave(Request $request, Circle $circle)
    {
        $circle->users()->detach($request->user()->id);
        if ($circle->members_count > 0) {
            $circle->decrement('members_count');
        }

        return response()->json([
            'message' => 'Left circle.'
        ]);
    }
}