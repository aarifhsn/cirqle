<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Always return success — prevents email enumeration attacks
        if (!$user) {
            return response()->json([
                'message' => 'If that email exists, a reset link has been sent.'
            ]);
        }

        // Delete any existing token for this email
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Generate a secure token
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),   // store hashed
            'created_at' => now(),
        ]);

        $resetUrl = config('app.frontend_url')
            . '/reset-password?token=' . $token
            . '&email=' . urlencode($request->email);

        Mail::to($user->email)->send(
            new ResetPasswordMail($resetUrl, $user->name)
        );

        return response()->json([
            'message' => 'If that email exists, a reset link has been sent.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:8|confirmed',  // needs password_confirmation field
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Token not found
        if (!$record) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        // Token expired (15 min)
        if (now()->diffInMinutes($record->created_at) > 15) {
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();
            return response()->json(['message' => 'Reset link has expired. Please request a new one.'], 422);
        }

        // Token hash mismatch
        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        // All good — update password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Clean up the token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Optionally revoke all existing auth tokens (security best practice)
        // $user->tokens()->delete(); // uncomment if using Sanctum

        return response()->json(['message' => 'Password reset successfully. You can now log in.']);
    }
}