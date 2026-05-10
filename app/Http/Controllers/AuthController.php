<?php

namespace App\Http\Controllers;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
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
        $validated['username'] = $this->generateUniqueUsername(
            explode('@', $validated['email'])[0]
        );
        $user = User::create($validated);

        $user->sendEmailVerificationNotification();

        $authToken = $user->createToken('auth_token')->plainTextToken;
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'user' => $this->formatUser($user),
            'authToken' => $authToken,
            'refreshToken' => $refreshToken,
            'message' => 'Registration successful. Please verify your email.',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // ── Check rate limit BEFORE touching the DB ──────────────
        $key = str($request->input('email'))->lower()->value()
            . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts('login:' . $key, 5)) {
            $seconds = RateLimiter::availableIn('login:' . $key);

            return response()->json([
                'message' => 'Too many login attempts. Please try again in '
                    . ceil($seconds / 60) . ' minutes.',
                'retry_after' => $seconds,
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Increment the counter on failure
            RateLimiter::hit('login:' . $key, 15 * 60);

            $attempts = RateLimiter::attempts('login:' . $key);
            $remaining = 5 - $attempts;

            return response()->json([
                'message' => $remaining > 0
                    ? "Invalid email or password. {$remaining} attempt(s) remaining."
                    : 'Too many login attempts. Please try again in 15 minutes.',
                'remaining' => max(0, $remaining),
            ], 401);
        }

        // ── Success — clear the rate limit counter ────────────────
        RateLimiter::clear('login:' . $key);

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

    private function generateUniqueUsername($base)
    {
        do {
            $username = Str::slug($base, '') . rand(100, 999);
        } while (User::where('username', $username)->exists());

        return $username;
    }
}