<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FollowControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    public function test_toggle_follow_creates_follow(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/users/{$this->otherUser->id}/follow");

        $response->assertStatus(200)
            ->assertJson(['isFollowing' => true, 'message' => 'Followed successfully']);

        $this->assertTrue(
            Follow::where('follower_id', $this->user->id)
                ->where('following_id', $this->otherUser->id)
                ->exists()
        );
    }

    public function test_toggle_follow_removes_existing_follow(): void
    {
        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/users/{$this->otherUser->id}/follow");

        $response->assertStatus(200)
            ->assertJson(['isFollowing' => false, 'message' => 'Unfollowed successfully']);

        $this->assertFalse(
            Follow::where('follower_id', $this->user->id)
                ->where('following_id', $this->otherUser->id)
                ->exists()
        );
    }

    public function test_cannot_follow_self(): void
    {
        $this->actingAs($this->user)
            ->postJson("/api/users/{$this->user->id}/follow")
            ->assertStatus(400)
            ->assertJson(['message' => 'You cannot follow yourself']);
    }

    public function test_toggle_returns_follower_count(): void
    {
        $follower = User::factory()->create();
        Follow::create([
            'follower_id' => $follower->id,
            'following_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/users/{$this->otherUser->id}/follow");

        $response->assertJsonStructure(['followersCount', 'followingCount']);
    }

    public function test_get_followers_by_id(): void
    {
        Follow::create([
            'follower_id' => User::factory()->create()->id,
            'following_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/{$this->otherUser->id}/followers");

        $response->assertStatus(200)
            ->assertJsonIsArray()
            ->assertJsonCount(1)
            ->assertJsonStructure([
                '*' => ['id', 'firstName', 'lastName', 'email', 'username', 'isFollowing'],
            ]);
    }

    public function test_get_followers_by_username(): void
    {
        Follow::create([
            'follower_id' => User::factory()->create()->id,
            'following_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/{$this->otherUser->username}/followers");

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_get_following_by_id(): void
    {
        Follow::create([
            'follower_id' => $this->otherUser->id,
            'following_id' => User::factory()->create()->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/{$this->otherUser->id}/following");

        $response->assertStatus(200)
            ->assertJsonIsArray()
            ->assertJsonCount(1)
            ->assertJsonStructure([
                '*' => ['id', 'firstName', 'lastName', 'email', 'username', 'isFollowing'],
            ]);
    }

    public function test_get_following_by_username(): void
    {
        Follow::create([
            'follower_id' => $this->otherUser->id,
            'following_id' => User::factory()->create()->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/{$this->otherUser->username}/following");

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_followers_returns_empty_when_no_followers(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/{$this->otherUser->id}/followers");

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_following_returns_empty_when_not_following_anyone(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/{$this->otherUser->id}/following");

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_toggle_follow_nonexistent_user(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/users/99999/follow')
            ->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_follow(): void
    {
        $this->postJson("/api/users/{$this->otherUser->id}/follow")
            ->assertStatus(401);
    }
}
