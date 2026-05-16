<?php

use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\CircleController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureEmailIsVerified;
use Illuminate\Http\Request;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1'); // 10 attempts per minute
Route::post('/auth/refresh-token', [AuthController::class, 'refreshToken']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    // Check verification status
    Route::get('/auth/email/status', function (Request $request) {
        return response()->json([
            'verified' => $request->user()->hasVerifiedEmail(),
        ]);
    });

    // Resend verification email
    Route::post('/auth/email/resend', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Already verified'], 400);
        }
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification email sent']);
    })->middleware('throttle:3,1');

    Route::middleware(EnsureEmailIsVerified::class)->group(function () {
        Route::post('/posts', [PostController::class, 'store'])->middleware('throttle:10,1');
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
        Route::patch('/posts/{id}', [PostController::class, 'update']);
        Route::patch('/posts/{id}/like', [PostController::class, 'like']);
        Route::patch('/posts/{id}/comment', [PostController::class, 'comment']);

        Route::patch('/profile/{identifier}', [ProfileController::class, 'update']);
        Route::post('/profile/{identifier}/avatar', [ProfileController::class, 'updateAvatar']);
        Route::post('/profile/{identifier}/cover', [ProfileController::class, 'updateCoverPhoto']);

        Route::post('/users/{identifier}/follow', [FollowController::class, 'toggle']);

        Route::post('/circles/{circle}/join', [CircleController::class, 'join']);
        Route::post('/circles', [CircleController::class, 'store']);
        // Events
        Route::get('/events', [EventController::class, 'index']);
        Route::post('/events/{event}/rsvp', [EventController::class, 'rsvp']);
        Route::post('/events', [EventController::class, 'store']);
        Route::patch('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        Route::post('/listings', [ListingController::class, 'store']);
        Route::post('/jobs', [JobController::class, 'store']);

    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/posts', [PostController::class, 'index']);

    Route::get('/profile/{identifier}', [ProfileController::class, 'show']);
    Route::get('/profile/{identifier}/photos', [ProfileController::class, 'photos']);

    // ✅ FIX — specific routes first, wildcard last
    Route::get('/users/search', [ProfileController::class, 'search']);
    Route::get('/users/nearby', [UserController::class, 'nearby']);        // ← moved up
    Route::patch('/users/location', [UserController::class, 'updateLocation']); // ← moved up
    Route::get('/users/{identifier}', [ProfileController::class, 'showUser']); // ← wildcard last

    Route::get('/{identifier}/followers', [FollowController::class, 'followers']);
    Route::get('/{identifier}/following', [FollowController::class, 'following']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead']);

    // Circles
    Route::get('/circles', [CircleController::class, 'index']);
    Route::get('/circles/{circle}', [CircleController::class, 'show']);
    Route::post('/circles/{circle}/leave', [CircleController::class, 'leave']);



    // Marketplace
    Route::get('/listings', [ListingController::class, 'index']);

    // jobs
    Route::get('/jobs', [JobController::class, 'index']);

    Route::post('/posts/{post}/poll/vote', [PostController::class, 'vote']);
});

// Verify email via signed URL — no sanctum needed, uses id+hash
Route::get('/auth/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = \App\Models\User::findOrFail($id);

    if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
        return response()->json(['message' => 'Invalid verification link'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return redirect(config('app.frontend_url') . '/email-verified?already=true');
    }

    $user->markEmailAsVerified();

    return redirect(config('app.frontend_url') . '/email-verified?verified=true');
})->name('verification.verify');

Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);