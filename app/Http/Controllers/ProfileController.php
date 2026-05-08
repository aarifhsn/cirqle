<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // shared user format
    private function formatUser(User $user, User $authUser): array
    {
        return [
            'id' => $user->id,
            'firstName' => $user->firstName,
            'lastName' => $user->lastName,
            'email' => $user->email,
            'username' => $user->username,
            'avatar' => $user->avatar,
            'cover_photo' => $user->cover_photo,
            'bio' => $user->bio,
            'followersCount' => $user->followers()->count(),
            'followingCount' => $user->following()->count(),
            'isFollowing' => $authUser->isFollowing($user->id),
        ];
    }

    // shared post format
    private function formatPosts(User $user): array
    {
        return $user->posts()->latest()->get()
            ->map(fn($post) => (new PostController)->formatPost($post))
            ->toArray();
    }
    public function show(Request $request, string $identifier)
    {
        // resolve by username or numeric ID
        $user = is_numeric($identifier)
            ? User::with(['posts.author', 'posts.likes', 'posts.comments.author'])->findOrFail($identifier)
            : User::with(['posts.author', 'posts.likes', 'posts.comments.author'])
                ->where('username', $identifier)->firstOrFail();

        $authUser = $request->user();

        return response()->json([
            'user' => $this->formatUser($user, $authUser),
            'posts' => $this->formatPosts($user),
        ]);
    }

    // /users/{userId} — other user's profile
    public function showUser(Request $request, $userId)
    {
        $user = User::with(['posts.author', 'posts.likes', 'posts.comments.author'])
            ->findOrFail($userId);
        $authUser = $request->user();

        return response()->json([
            'user' => $this->formatUser($user, $authUser),
            'posts' => $this->formatPosts($user),
        ]);
    }

    // update bio + name
    public function update(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if ($user->id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'bio' => 'nullable|string|max:500',
        ]);

        $user->update([
            'firstName' => $request->firstName,
            'lastName' => $request->lastName,
            'bio' => $request->bio,
        ]);

        return response()->json($this->formatUser($user, $request->user()));
    }

    // update avatar
    public function updateAvatar(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if ($user->id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['avatar' => 'required|image|max:4096']);

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json(['avatar' => $path]);
    }

    // update cover photo
    public function updateCoverPhoto(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if ($user->id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['cover_photo' => 'required|image|max:8192']);

        if ($user->cover_photo) {
            Storage::disk('public')->delete($user->cover_photo);
        }

        $path = $request->file('cover_photo')->store('covers', 'public');
        $user->update(['cover_photo' => $path]);

        return response()->json(['cover_photo' => $path]);
    }

    // search users
    public function search(Request $request)
    {
        $query = $request->query('q');

        $users = User::where('firstName', 'like', "%{$query}%")
            ->orWhere('lastName', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(5)
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'firstName' => $user->firstName,
                'lastName' => $user->lastName,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'username' => $user->username,
                // 'cover_photo' => $user->cover_photo,
                // 'bio' => $user->bio,
            ]);

        return response()->json($users);
    }

    public function photos(Request $request, $identifier)
    {
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        // get images from post_images table (new multiple)
        $postImages = $user->posts()
            ->with('images')
            ->get()
            ->flatMap(fn($post) => $post->images)
            ->map(fn($img) => [
                'id' => $img->id,
                'image' => $img->image,
            ]);

        // get old single images (backward compat)
        $singleImages = $user->posts()
            ->whereNotNull('image')
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'image' => $post->image,
            ]);

        $photos = $postImages->merge($singleImages)->values();

        return response()->json($photos);
    }

    private function resolveUser($identifier)
    {
        return is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();
    }

    public function updateUsername(Request $request, $userId)
    {
        $request->validate(['username' => 'required|string|alpha_dash|min:3|max:30|unique:users,username,' . $userId]);
        $user = User::findOrFail($userId);
        if ($user->id !== $request->user()->id)
            return response()->json(['message' => 'Unauthorized'], 403);
        $user->update(['username' => $request->username]);
        return response()->json(['username' => $user->username]);
    }
}