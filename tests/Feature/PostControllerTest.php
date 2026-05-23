<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $post;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->post = Post::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_save_post_toggles_saved_state(): void
    {
        $this->actingAs($this->user)
            ->postJson("/api/posts/{$this->post->id}/save")
            ->assertStatus(200)
            ->assertJson(['is_saved' => true]);

        $this->assertTrue($this->user->savedPosts()->where('post_id', $this->post->id)->exists());
    }

    public function test_unsave_post_removes_from_saved(): void
    {
        $this->user->savedPosts()->attach($this->post->id);

        $this->actingAs($this->user)
            ->postJson("/api/posts/{$this->post->id}/save")
            ->assertStatus(200)
            ->assertJson(['is_saved' => false]);

        $this->assertFalse($this->user->savedPosts()->where('post_id', $this->post->id)->exists());
    }

    public function test_save_post_returns_success_message(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/posts/{$this->post->id}/save");

        $response->assertJson(['message' => 'Post saved!']);
    }

    public function test_unsave_post_returns_unsaved_message(): void
    {
        $this->user->savedPosts()->attach($this->post->id);

        $response = $this->actingAs($this->user)
            ->postJson("/api/posts/{$this->post->id}/save");

        $response->assertJson(['message' => 'Post unsaved.']);
    }

    public function test_delete_own_post_succeeds(): void
    {
        $postId = $this->post->id;

        $this->actingAs($this->user)
            ->deleteJson("/api/posts/{$postId}")
            ->assertStatus(200)
            ->assertJson(['message' => 'Post deleted']);

        $this->assertDatabaseMissing('posts', ['id' => $postId]);
    }

    public function test_delete_other_users_post_fails(): void
    {
        $otherUser = User::factory()->create();
        $postId = $this->post->id;

        $this->actingAs($otherUser)
            ->deleteJson("/api/posts/{$postId}")
            ->assertStatus(403)
            ->assertJson(['message' => 'Unauthorized']);

        $this->assertDatabaseHas('posts', ['id' => $postId]);
    }

    public function test_delete_post_removes_images_from_storage(): void
    {
        Storage::fake('public');

        $post = Post::factory()->create(['user_id' => $this->user->id]);
        $post->images()->create(['image' => 'posts/test1.jpg', 'order' => 0]);
        $post->images()->create(['image' => 'posts/test2.jpg', 'order' => 1]);

        $this->actingAs($this->user)
            ->deleteJson("/api/posts/{$post->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
        Storage::disk('public')->assertMissing('posts/test1.jpg');
        Storage::disk('public')->assertMissing('posts/test2.jpg');
    }

    public function test_delete_nonexistent_post_returns_404(): void
    {
        $this->actingAs($this->user)
            ->deleteJson('/api/posts/99999')
            ->assertStatus(404);
    }

    public function test_save_nonexistent_post_returns_404(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/posts/99999/save')
            ->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_save_post(): void
    {
        $this->postJson("/api/posts/{$this->post->id}/save")
            ->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_delete_post(): void
    {
        $this->deleteJson("/api/posts/{$this->post->id}")
            ->assertStatus(401);
    }
}
