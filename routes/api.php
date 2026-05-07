<?php

use App\Http\Controllers\Auth\PasswordResetController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\GoogleAuthController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1'); // 10 attempts per minute
Route::post('/auth/refresh-token', [AuthController::class, 'refreshToken']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store'])->middleware('throttle:10,1');
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::patch('/posts/{id}', [PostController::class, 'update']);
    Route::patch('/posts/{id}/like', [PostController::class, 'like']);
    Route::patch('/posts/{id}/comment', [PostController::class, 'comment']);

    Route::get('/profile/{identifier}', [ProfileController::class, 'show']);
    Route::patch('/profile/{identifier}', [ProfileController::class, 'update']);
    Route::post('/profile/{identifier}/avatar', [ProfileController::class, 'updateAvatar']);
    Route::get('/profile/{identifier}/photos', [ProfileController::class, 'photos']);

    Route::get('/users/search', [ProfileController::class, 'search']);
    Route::get('/users/{identifier}', [ProfileController::class, 'showUser']);

    Route::post('/users/{identifier}/follow', [FollowController::class, 'toggle']);
    Route::get('/users/{identifier}/followers', [FollowController::class, 'followers']);
    Route::get('/users/{identifier}/following', [FollowController::class, 'following']);
    Route::post('/profile/{identifier}/cover', [ProfileController::class, 'updateCoverPhoto']);
});



Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);