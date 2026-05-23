<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ]);
    }

    public function test_update_location_with_valid_coordinates(): void
    {
        $response = $this->actingAs($this->user)
            ->patchJson('/api/users/location', [
                'latitude' => 34.0522,
                'longitude' => -118.2437,
                'location' => 'Los Angeles',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Location updated successfully.']);

        $this->user->refresh();
        $this->assertEquals(34.0522, $this->user->latitude);
        $this->assertEquals(-118.2437, $this->user->longitude);
        $this->assertEquals('Los Angeles', $this->user->location_name);
    }

    public function test_update_location_validates_latitude_range(): void
    {
        $this->actingAs($this->user)
            ->patchJson('/api/users/location', [
                'latitude' => 91,
                'longitude' => 0,
            ])->assertStatus(422)
            ->assertJsonValidationErrors('latitude');
    }

    public function test_update_location_validates_longitude_range(): void
    {
        $this->actingAs($this->user)
            ->patchJson('/api/users/location', [
                'latitude' => 0,
                'longitude' => 181,
            ])->assertStatus(422)
            ->assertJsonValidationErrors('longitude');
    }

    public function test_update_location_requires_coordinates(): void
    {
        $this->actingAs($this->user)
            ->patchJson('/api/users/location', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    public function test_nearby_returns_users_within_radius(): void
    {
        User::factory()->create([
            'latitude' => 40.7500,
            'longitude' => -73.9900,
        ]);

        User::factory()->create([
            'latitude' => 50.0,
            'longitude' => -100.0,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/users/nearby');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => ['id', 'firstName', 'distance', 'isFollowing'],
            ]);
    }

    public function test_nearby_returns_empty_when_user_has_no_location(): void
    {
        $userNoLocation = User::factory()->create([
            'latitude' => null,
            'longitude' => null,
        ]);

        $response = $this->actingAs($userNoLocation)
            ->getJson('/api/users/nearby');

        $response->assertStatus(200)
            ->assertJsonCount(0);
    }

    public function test_nearby_excludes_current_user(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/users/nearby');

        $response->assertStatus(200);

        foreach ($response->json() as $user) {
            $this->assertNotEquals($this->user->id, $user['id']);
        }
    }

    public function test_nearby_returns_users_with_following_status(): void
    {
        $nearbyUser = User::factory()->create([
            'latitude' => 40.7500,
            'longitude' => -73.9900,
        ]);

        Follow::create([
            'follower_id' => $this->user->id,
            'following_id' => $nearbyUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/users/nearby');

        $response->assertStatus(200);
        $userData = $response->json()[0];
        $this->assertTrue($userData['isFollowing']);
    }

    public function test_nearby_returns_distance_in_km(): void
    {
        User::factory()->create([
            'latitude' => 40.7500,
            'longitude' => -73.9900,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/users/nearby');

        $response->assertStatus(200);
        $this->assertIsNumeric($response->json()[0]['distance']);
    }

    public function test_unauthenticated_user_cannot_update_location(): void
    {
        $this->patchJson('/api/users/location', [
            'latitude' => 0,
            'longitude' => 0,
        ])->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_get_nearby(): void
    {
        $this->getJson('/api/users/nearby')
            ->assertStatus(401);
    }
}
