<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'firstName' => 'John',
            'lastName' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'firstName', 'lastName', 'email', 'username'],
                'authToken',
                'refreshToken',
                'message',
            ]);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    public function test_register_validates_required_fields(): void
    {
        $this->postJson('/api/auth/register', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['firstName', 'email', 'password']);
    }

    public function test_register_validates_duplicate_email(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $this->postJson('/api/auth/register', [
            'firstName' => 'Jane',
            'lastName' => 'Smith',
            'email' => 'test@example.com',
            'password' => 'password123',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_register_validates_password_min_length(): void
    {
        $this->postJson('/api/auth/register', [
            'firstName' => 'John',
            'lastName' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'short',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    public function test_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user',
                'authToken',
                'refreshToken',
            ]);
    }

    public function test_login_rejects_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(401)
            ->assertJson(['message' => 'Invalid email or password. 4 attempt(s) remaining.']);
    }

    public function test_login_rejects_nonexistent_user(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ])->assertStatus(401);
    }

    public function test_login_rate_limiting(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);
        }

        $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ])->assertStatus(429)
            ->assertJsonStructure(['message', 'retry_after']);
    }

    public function test_logout_deletes_tokens(): void
    {
        $user = User::factory()->create();
        $user->createToken('test_token');

        $this->actingAs($user)
            ->postJson('/api/auth/logout')
            ->assertStatus(200);

        $this->assertDatabaseMissing('personal_access_tokens', ['user_id' => $user->id]);
    }

    public function test_refresh_token_with_valid_token(): void
    {
        $user = User::factory()->create();
        $refreshToken = \App\Models\RefreshToken::create([
            'user_id' => $user->id,
            'token' => 'test_token_123',
            'expires_at' => now()->addDays(30),
        ])->token;

        $response = $this->postJson('/api/auth/refresh-token', [
            'refreshToken' => $refreshToken,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'refreshToken']);
    }

    public function test_refresh_token_rejects_expired_token(): void
    {
        $user = User::factory()->create();
        \App\Models\RefreshToken::create([
            'user_id' => $user->id,
            'token' => 'expired_token',
            'expires_at' => now()->subDays(1),
        ]);

        $this->postJson('/api/auth/refresh-token', [
            'refreshToken' => 'expired_token',
        ])->assertStatus(401);
    }
}
