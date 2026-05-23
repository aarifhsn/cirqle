<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'content' => fake()->paragraph(),
            'privacy' => fake()->randomElement(['public', 'followers', 'circles', 'only_me']),
            'type' => 'text',
            'circle_id' => null,
            'poll_options' => null,
            'poll_duration' => null,
        ];
    }

    public function public(): self
    {
        return $this->state(fn(array $attributes) => [
            'privacy' => 'public',
        ]);
    }

    public function private(): self
    {
        return $this->state(fn(array $attributes) => [
            'privacy' => 'only_me',
        ]);
    }
}
