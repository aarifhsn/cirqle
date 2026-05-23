<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;

class JobControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $job;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->job = Job::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_index_returns_paginated_jobs(): void
    {
        Job::factory(5)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/jobs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'company', 'user_id'],
                ],
                'current_page',
                'last_page',
            ]);
    }

    public function test_store_creates_job(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/jobs', [
                'title' => 'Senior Developer',
                'description' => 'Looking for a senior developer',
                'company' => 'Tech Corp',
                'type' => 'full-time',
                'location' => 'New York',
                'salary' => '100k - 150k',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'title', 'company', 'user_id']);

        $this->assertDatabaseHas('job_postings', [
            'title' => 'Senior Developer',
            'company' => 'Tech Corp',
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/jobs', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description', 'company', 'type']);
    }

    public function test_store_validates_job_type(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/jobs', [
                'title' => 'Developer',
                'description' => 'A job',
                'company' => 'Company',
                'type' => 'invalid-type',
            ])->assertStatus(422)
            ->assertJsonValidationErrors('type');
    }

    public function test_show_returns_job_with_poster(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/jobs/{$this->job->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'title', 'company', 'poster']);
    }

    public function test_show_returns_404_for_nonexistent_job(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/jobs/99999')
            ->assertStatus(404);
    }

    public function test_destroy_own_job(): void
    {
        $jobId = $this->job->id;

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/jobs/{$jobId}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Job deleted.']);

        $this->assertDatabaseMissing('jobs', ['id' => $jobId]);
    }

    public function test_destroy_other_users_job_fails(): void
    {
        $otherUser = User::factory()->create();
        $otherJob = Job::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->deleteJson("/api/jobs/{$otherJob->id}")
            ->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized']);
    }

    public function test_destroy_nonexistent_job_returns_404(): void
    {
        $this->actingAs($this->user)
            ->deleteJson('/api/jobs/99999')
            ->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_create_job(): void
    {
        $this->postJson('/api/jobs', ['title' => 'Job'])
            ->assertStatus(401);
    }
}
