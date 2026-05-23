<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = Carbon::instance(fake()->dateTimeBetween('+1 day', '+3 months'));
        $endDate = $startDate->copy()->addDays(fake()->numberBetween(1, 7));

        return [
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'location' => fake()->city(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'cover_image' => null,
            'category' => fake()->word(),
            'user_id' => User::factory(),
            'attendees_count' => 0,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];
    }
}
