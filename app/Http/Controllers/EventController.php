<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $events = Event::latest()->paginate(10)->through(function ($event) use ($userId) {
            $event->is_attending = $event->attendees()->where('user_id', $userId)->exists();
            return $event;
        });

        return response()->json($events);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'category' => 'nullable|string',
        ]);

        $data['user_id'] = $request->user()->id;

        return response()->json(
            Event::create($data),
            201
        );
    }

    public function update(Request $request, Event $event)
    {
        // Only owner can edit
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'category' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',

        ]);

        $event->update($data);

        return response()->json($event);
    }

    public function destroy(Request $request, Event $event)
    {
        if ($event->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }

    public function rsvp(Request $request, Event $event)
    {
        $user = $request->user();
        $isAttending = $event->attendees()->where('user_id', $user->id)->exists();

        if ($isAttending) {
            $event->attendees()->detach($user->id);
            $event->decrement('attendees_count');
            $attending = false;
        } else {
            $event->attendees()->syncWithoutDetaching([$user->id]);
            $event->increment('attendees_count');
            $attending = true;
        }

        return response()->json([
            'message' => $attending ? 'RSVP confirmed.' : 'RSVP cancelled.',
            'is_attending' => $attending,
            'attendees_count' => $event->fresh()->attendees_count,
        ]);
    }
}