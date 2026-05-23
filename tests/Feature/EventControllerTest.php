<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EventControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $event;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->event = Event::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_index_returns_paginated_events(): void
    {
        Event::factory(5)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/events');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'start_date', 'is_attending'],
                ],
                'current_page',
                'last_page',
            ]);
    }

    public function test_store_creates_event(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/events', [
                'title' => 'Tech Meetup',
                'description' => 'A gathering for tech enthusiasts',
                'location' => 'Downtown',
                'start_date' => now()->addDays(7)->format('Y-m-d'),
                'end_date' => now()->addDays(8)->format('Y-m-d'),
                'category' => 'Technology',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'title', 'user_id']);

        $this->assertDatabaseHas('events', [
            'title' => 'Tech Meetup',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/events', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'start_date']);
    }

    public function test_store_validates_end_date_after_start_date(): void
    {
        $tomorrow = now()->addDays(1)->format('Y-m-d');
        $today = now()->format('Y-m-d');

        $this->actingAs($this->user)
            ->postJson('/api/events', [
                'title' => 'Event',
                'start_date' => $tomorrow,
                'end_date' => $today,
            ])->assertStatus(422)
            ->assertJsonValidationErrors('end_date');
    }

    public function test_update_own_event(): void
    {
        $response = $this->actingAs($this->user)
            ->patchJson("/api/events/{$this->event->id}", [
                'title' => 'Updated Title',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJson(['title' => 'Updated Title']);

        $this->assertDatabaseHas('events', [
            'id' => $this->event->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_update_other_users_event_fails(): void
    {
        $otherUser = User::factory()->create();
        $otherEvent = Event::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->patchJson("/api/events/{$otherEvent->id}", [
                'title' => 'Hacked',
            ])->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized']);
    }

    public function test_destroy_own_event(): void
    {
        $eventId = $this->event->id;

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/events/{$eventId}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Event deleted.']);

        $this->assertDatabaseMissing('events', ['id' => $eventId]);
    }

    public function test_destroy_other_users_event_fails(): void
    {
        $otherUser = User::factory()->create();
        $otherEvent = Event::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->deleteJson("/api/events/{$otherEvent->id}")
            ->assertStatus(403);
    }

    public function test_rsvp_adds_user_as_attendee(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/events/{$this->event->id}/rsvp");

        $response->assertStatus(200)
            ->assertJson(['is_attending' => true, 'message' => 'RSVP confirmed.']);

        $this->assertTrue(
            $this->event->attendees()->where('user_id', $this->user->id)->exists()
        );
    }

    public function test_rsvp_removes_user_from_attendees(): void
    {
        $this->event->attendees()->attach($this->user->id);
        $this->event->increment('attendees_count');

        $response = $this->actingAs($this->user)
            ->postJson("/api/events/{$this->event->id}/rsvp");

        $response->assertStatus(200)
            ->assertJson(['is_attending' => false, 'message' => 'RSVP cancelled.']);

        $this->assertFalse(
            $this->event->attendees()->where('user_id', $this->user->id)->exists()
        );
    }

    public function test_unauthenticated_user_cannot_create_event(): void
    {
        $this->postJson('/api/events', ['title' => 'Event'])
            ->assertStatus(401);
    }
}
