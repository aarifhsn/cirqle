<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')
            ->stateless()
            ->user();

        $user = User::updateOrCreate(
            ['email' => $googleUser->email],
            [
                'firstName' => $googleUser->user['given_name'] ?? '',
                'lastName' => $googleUser->user['family_name'] ?? '',
                'password' => bcrypt(Str::random(24)),
                'avatar' => $googleUser->avatar,
                'email_verified_at' => now(),
            ]
        );

        $user->tokens()->delete(); // clean old tokens

        $authToken = $user->createToken('auth_token')->plainTextToken;

        // create refresh token same as AuthController
        \App\Models\RefreshToken::where('user_id', $user->id)->delete();
        $refreshToken = Str::random(64);
        \App\Models\RefreshToken::create([
            'user_id' => $user->id,
            'token' => $refreshToken,
            'expires_at' => now()->addDays(30),
        ]);

        // encode full user data into redirect
        $userData = base64_encode(json_encode([
            'id' => $user->id,
            'firstName' => $user->firstName,
            'lastName' => $user->lastName,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'username' => $user->username,
            'bio' => $user->bio,
        ]));

        $frontendUrl = config('app.frontend_url');

        return redirect(
            "{$frontendUrl}/google-success?token={$authToken}&refreshToken={$refreshToken}&user={$userData}"
        );
    }
}