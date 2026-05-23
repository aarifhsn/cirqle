<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Circle;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CircleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $circle;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->circle = Circle::factory()->create();
    }

    public function test_index_returns_all_circles_with_membership_status(): void
    {
        $this->circle->users()->attach($this->user->id, ['role' => 'member']);

        $response = $this->actingAs($this->user)->getJson('/api/circles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'name', 'is_member', 'users_count', 'posts_count'],
            ]);
    }

    public function test_index_returns_empty_when_no_circles(): void
    {
        Circle::truncate();

        $response = $this->actingAs($this->user)->getJson('/api/circles');

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_store_creates_circle_with_auth_user_as_admin(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/circles', [
                'name' => 'Tech Lovers',
                'description' => 'A circle for tech enthusiasts',
                'emoji' => '🚀',
                'location' => 'Online',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'name', 'is_member']);

        $circle = Circle::where('name', 'Tech Lovers')->first();
        $this->assertTrue($circle->users()->where('user_id', $this->user->id)->exists());
        $this->assertEquals('admin', $circle->users()->find($this->user->id)->pivot->role);
    }

    public function test_store_validates_required_name(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/circles', [
                'description' => 'Missing name',
            ])->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_store_validates_duplicate_circle_name(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/circles', [
                'name' => $this->circle->name,
            ])->assertStatus(422)
            ->assertJsonValidationErrors('name');
    }

    public function test_show_returns_circle_with_members_and_posts(): void
    {
        $this->circle->users()->attach($this->user->id, ['role' => 'member']);

        $response = $this->actingAs($this->user)
            ->getJson("/api/circles/{$this->circle->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'is_member',
                'members',
                'posts',
            ]);
    }

    public function test_show_returns_404_for_nonexistent_circle(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/circles/99999')
            ->assertStatus(404);
    }

    public function test_join_circle_adds_user_as_member(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/circles/{$this->circle->id}/join");

        $response->assertStatus(200)
            ->assertJson(['is_member' => true, 'message' => 'Joined circle.']);

        $this->assertTrue(
            $this->circle->users()->where('user_id', $this->user->id)->exists()
        );
    }

    public function test_leave_circle_removes_user(): void
    {
        $this->circle->users()->attach($this->user->id, ['role' => 'member']);

        $response = $this->actingAs($this->user)
            ->postJson("/api/circles/{$this->circle->id}/join");

        $response->assertStatus(200)
            ->assertJson(['is_member' => false, 'message' => 'Left circle.']);

        $this->assertFalse(
            $this->circle->users()->where('user_id', $this->user->id)->exists()
        );
    }

    public function test_join_nonexistent_circle_returns_404(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/circles/99999/join')
            ->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_circles(): void
    {
        $this->getJson('/api/circles')->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_create_circle(): void
    {
        $this->postJson('/api/circles', ['name' => 'Test Circle'])
            ->assertStatus(401);
    }
}
