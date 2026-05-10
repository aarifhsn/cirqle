<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Event::latest()->paginate(10)
        );
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

    public function rsvp(Request $request, Event $event)
    {
        $event->attendees()->syncWithoutDetaching([
            $request->user()->id
        ]);

        $event->increment('attendees_count');

        return response()->json([
            'message' => 'RSVP confirmed.'
        ]);
    }
}