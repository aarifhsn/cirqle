<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Job>
 */
class JobFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraph(),
            'company' => fake()->company(),
            'location' => fake()->city(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'type' => fake()->randomElement(['full-time', 'part-time', 'remote', 'internship', 'freelance']),
            'salary' => fake()->numberBetween(30000, 150000),
            'tags' => [fake()->word(), fake()->word()],
            'user_id' => User::factory(),
        ];
    }
}
