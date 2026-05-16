<?php

namespace App\Http\Controllers;

use App\Models\Circle;
use Illuminate\Http\Request;

class CircleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $circles = Circle::latest()->get()->map(fn($c) => [
            ...$c->toArray(),
            'is_member' => $c->users()->where('user_id', $user->id)->exists(),
        ]);

        return response()->json($circles);
    }

    public function show(Request $request, Circle $circle)
    {
        $user = $request->user();
        $circle->load('users:id,firstName,lastName,avatar,username');

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

        $circle = Circle::create($data);

        $circle->users()->attach($request->user()->id, [
            'role' => 'admin'
        ]);

        return response()->json($circle, 201);
    }

    public function join(Request $request, Circle $circle)
    {
        $userId = $request->user()->id;
        $isMember = $circle->users()->where('user_id', $userId)->exists();

        if ($isMember) {
            $circle->users()->detach($userId);
            $circle->decrement('members_count');
            $isMember = false;
        } else {
            $circle->users()->attach($userId, ['role' => 'member']);
            $circle->increment('members_count');
            $isMember = true;
        }

        return response()->json([
            'message' => $isMember ? 'Joined circle.' : 'Left circle.',
            'is_member' => $isMember,
            'members_count' => $circle->fresh()->members_count,
        ]);
    }

    public function leave(Request $request, Circle $circle)
    {
        $circle->users()->detach($request->user()->id);
        $circle->decrement('members_count');

        return response()->json([
            'message' => 'Left circle.'
        ]);
    }
}