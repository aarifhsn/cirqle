<?php

namespace App\Http\Controllers;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['username'] = explode('@', $validated['email'])[0];
        $user = User::create($validated);

        $authToken = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'user' => $this->formatUser($user),
            'authToken' => $authToken,
            'refreshToken' => $refreshToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete();

        $authToken = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'user' => $this->formatUser($user),
            'authToken' => $authToken,
            'refreshToken' => $refreshToken,
        ]);
    }

    public function refreshToken(Request $request)
    {
        $request->validate(['refreshToken' => 'required|string']);

        $record = RefreshToken::where('token', $request->refreshToken)
            ->where('expires_at', '>', now())
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired refresh token'], 401);
        }

        $user = $record->user;
        $user->tokens()->delete();
        $record->delete();

        $authToken = $user->createToken('auth_token')->plainTextToken;
        $newRefresh = $this->createRefreshToken($user);

        return response()->json([
            'token' => $authToken,
            'refreshToken' => $newRefresh,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        RefreshToken::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Logged out']);
    }

    private function createRefreshToken(User $user): string
    {
        RefreshToken::where('user_id', $user->id)->delete();

        $token = Str::random(64);
        RefreshToken::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addDays(30),
        ]);

        return $token;
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'firstName' => $user->firstName,
            'lastName' => $user->lastName,
            'username' => $user->username,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
        ];
    }
}