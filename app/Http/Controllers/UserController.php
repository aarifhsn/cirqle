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
            'location_name' => $data['location'] ?? $user->location_name,
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
            return response()->json([]);
        }

        $users = User::where('id', '!=', $auth->id)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->map(function ($u) use ($auth) {
                $u->distance = $this->haversine(
                    $auth->latitude,
                    $auth->longitude,
                    $u->latitude,
                    $u->longitude
                );
                return $u;
            })
            ->sortBy('distance')  // closest first
            ->take(50)            // max 50 results
            ->values();

        return response()->json(
            $users->map(fn($u) => [
                'id' => $u->id,
                'firstName' => $u->firstName,
                'lastName' => $u->lastName,
                'username' => $u->username,
                'avatar' => $u->avatar,
                'location_name' => $u->location_name,
                'distance' => round($u->distance, 1),
                'isFollowing' => $auth->following()
                    ->where('following_id', $u->id)
                    ->exists(),
            ])
        );
    }

    private function haversine($lat1, $lon1, $lat2, $lon2): float
    {
        $R = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLon / 2) * sin($dLon / 2);
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}