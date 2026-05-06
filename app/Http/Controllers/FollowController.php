<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggle(Request $request, $userId)
    {
        $targetUser = User::findOrFail($userId);

        if ($targetUser->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot follow yourself'], 400);
        }

        $existing = Follow::where('follower_id', $request->user()->id)
            ->where('following_id', $userId)
            ->first();

        if ($existing) {
            $existing->delete();
            $isFollowing = false;
            $message = 'Unfollowed successfully';
        } else {
            Follow::create([
                'follower_id' => $request->user()->id,
                'following_id' => $userId,
            ]);
            $isFollowing = true;
            $message = 'Followed successfully';
        }

        return response()->json([
            'isFollowing' => $isFollowing,
            'message' => $message,
            'followersCount' => $targetUser->followers()->count(),
            'followingCount' => $targetUser->following()->count(),
        ]);
    }

    public function followers(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $followers = $user->followers()
            ->with('follower')
            ->get()
            ->map(fn($follow) => [
                'id' => $follow->follower->id,
                'firstName' => $follow->follower->firstName,
                'lastName' => $follow->follower->lastName,
                'avatar' => $follow->follower->avatar,
                'isFollowing' => $request->user()->isFollowing($follow->follower->id),
            ]);

        return response()->json($followers);
    }

    public function following(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $following = $user->following()
            ->with('following')
            ->get()
            ->map(fn($follow) => [
                'id' => $follow->following->id,
                'firstName' => $follow->following->firstName,
                'lastName' => $follow->following->lastName,
                'avatar' => $follow->following->avatar,
                'isFollowing' => $request->user()->isFollowing($follow->following->id),
            ]);

        return response()->json($following);
    }
}