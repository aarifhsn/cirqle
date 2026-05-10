<?php

namespace App\Http\Controllers;

use App\Models\Circle;
use Illuminate\Http\Request;

class CircleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $radius = $request->input('radius', 10);

        $query = Circle::query();

        if ($request->get('nearby') && $user->latitude && $user->longitude) {
            $query->selectRaw("
                *,
                (6371 * acos(
                    cos(radians(?))
                    * cos(radians(latitude))
                    * cos(radians(longitude) - radians(?))
                    + sin(radians(?))
                    * sin(radians(latitude))
                )) AS distance
            ", [$user->latitude, $user->longitude, $user->latitude])
                ->having('distance', '<=', $radius)
                ->orderBy('distance');
        }

        return response()->json(
            $query->latest()->paginate(10)
        );
    }

    public function show(Circle $circle)
    {
        return response()->json(
            $circle->load('users:id,firstName,lastName,avatar')
        );
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
        $circle->users()->syncWithoutDetaching([
            $request->user()->id => ['role' => 'member']
        ]);

        $circle->increment('members_count');

        return response()->json([
            'message' => 'Joined circle.'
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