<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Fixtures\TestNotification;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_index_returns_paginated_notifications(): void
    {
        $this->user->notify(new TestNotification());

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'unread_count',
                'has_more',
            ]);
    }

    public function test_index_includes_unread_count(): void
    {
        $notifiable = User::factory()->create();
        $notifiable->notify(new \Tests\Fixtures\TestNotification());

        $this->actingAs($this->user)
            ->getJson('/api/notifications')
            ->assertJsonStructure(['unread_count']);
    }

    public function test_mark_all_read_marks_all_notifications_as_read(): void
    {
        $this->user->notify(new \Tests\Fixtures\TestNotification());
        $this->user->notify(new \Tests\Fixtures\TestNotification());

        $this->actingAs($this->user)
            ->postJson('/api/notifications/mark-all-read')
            ->assertStatus(200)
            ->assertJson(['message' => 'All marked as read']);

        $this->assertEquals(0, $this->user->unreadNotifications()->count());
    }

    public function test_mark_read_marks_single_notification_as_read(): void
    {
        $this->user->notify(new \Tests\Fixtures\TestNotification());
        $notification = $this->user->notifications()->first();

        $response = $this->actingAs($this->user)
            ->postJson("/api/notifications/{$notification->id}/mark-read");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Marked as read']);

        $this->assertTrue($this->user->notifications()->first()->read_at !== null);
    }

    public function test_mark_read_nonexistent_notification_returns_404(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/notifications/99999/mark-read')
            ->assertStatus(404);
    }

    public function test_unread_count_returns_accurate_count(): void
    {
        $this->user->notify(new \Tests\Fixtures\TestNotification());
        $this->user->notify(new \Tests\Fixtures\TestNotification());

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJson(['count' => 2]);
    }

    public function test_unread_count_returns_zero_when_all_read(): void
    {
        $this->user->notify(new \Tests\Fixtures\TestNotification());
        $this->user->unreadNotifications->markAsRead();

        $response = $this->actingAs($this->user)
            ->getJson('/api/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJson(['count' => 0]);
    }

    public function test_unauthenticated_user_cannot_access_notifications(): void
    {
        $this->getJson('/api/notifications')
            ->assertStatus(401);
    }
}
