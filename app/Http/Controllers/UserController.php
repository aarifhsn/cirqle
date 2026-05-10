<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Circle;
use App\Models\Event;
use App\Models\Listing;
use App\Models\Job;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * PATCH /users/location
     */
    public function updateLocation(Request $request)
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();

        $user->update([
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'location' => $data['location'] ?? $user->location,
        ]);

        return response()->json([
            'message' => 'Location updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * GET /users/nearby?radius=10
     */
    public function nearby(Request $request)
    {
        $auth = $request->user();

        if (!$auth->latitude || !$auth->longitude) {
            return response()->json([
                'message' => 'Please set your location first.',
            ], 422);
        }

        $radius = $request->input('radius', 10);

        $users = User::where('id', '!=', $auth->id)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("
                *,
                (6371 * acos(
                    cos(radians(?))
                    * cos(radians(latitude))
                    * cos(radians(longitude) - radians(?))
                    + sin(radians(?))
                    * sin(radians(latitude))
                )) AS distance
            ", [$auth->latitude, $auth->longitude, $auth->latitude])
            ->having('distance', '<=', $radius)
            ->orderBy('distance')
            ->limit(30)
            ->get();

        return response()->json($users);
    }
}